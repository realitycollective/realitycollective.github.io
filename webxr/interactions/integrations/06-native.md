---
sidebar_position: 6
title: "Native: @realitycollective/native-interactions"
description: The native host adapter, reading the input, interactions and physics slices of globalThis.__rcHost with no engine dependency, deriving and deciding what the IWSDK adapter derives and decides.
---

# Native: @realitycollective/native-interactions

From 0.1.1. A native app, OpenXR on Quest or CompositorServices on visionOS, embeds a JavaScript engine such as Hermes and runs the same interaction logic as the web. The binding runs every rule the IWSDK adapter runs and hands the host results. A host written against an earlier preview has changes to absorb, listed [below](#migrating-a-host-from-an-earlier-preview).

## Tested on a headset

A native app built with this package passed on a Meta Quest 3 on 1 October 2026. A person played it and the host conformance kit checked it. Known issue on native: grab does not yet work as it should. Pinch works as expected.

## What it binds

| Layer | Detail |
| --- | --- |
| Input | `__rcHost.input` - the host reports facts (`immersive`, `focused`, `handTracking`, `eyeTracking`), samples sources, and optionally reports a head pose, an eye-gaze pose and hints, plays a pulse, applies presence and draws what it is told. The provider derives every capability and decides presence, as the IWSDK provider does |
| Hit-testing | `__rcHost.interactions.hitRay`, `hitProximity` and the optional `hitCone` - the native app owns the scene, so targeting is entirely its answer, against the radius the binding assigns each target |
| Movement | `__rcHost.interactions`, keyed by the target id chosen when the object was registered with the native scene, including the held pose |
| Physics | `__rcHost.physics` - the host's engine, Jolt on Quest and Android and RealityKit on visionOS, behind the core `PhysicsFacility` contract through `NativePhysicsFacility` |
| Pointer drawing | The host is handed the resolved ray and cursor drawing every frame, and the app's display settings on every change |

No engine dependency: only numbers, strings, booleans and tuples cross the boundary, and assets and rendering stay in the native app. The binding is as thick as the IWSDK reference, and the host is handed results: it renders, measures and reports facts, and never derives a capability, picks a modality, decides a press or chooses what to draw.

## Install

```sh
npm install @realitycollective/native-interactions
```

It re-exports everything from `@realitycollective/webxr-interactions`, so this is the only interaction package a native app needs.

## Setup

One call, the same shape as `createBabylonInteractions` and `createThreeInteractions`:

```ts
import { createNativeInteractions } from "@realitycollective/native-interactions";

// Reads globalThis.__rcHost.input / .interactions / .physics when no slice is passed in,
// and drives update(dt) from the app's own frame callback, __rcHost.onFrame.
const interactions = createNativeInteractions({ attachToHost: true });

interactions.register({ id: "button", behaviours: [{ kind: "press" }] });
interactions.register({ id: "ball", behaviours: [{ kind: "grab" }] }, { targetRadius: 0.05, shape: { kind: "sphere", dimensions: [0.05, 0, 0] } });
interactions.runtime.onEvent((event) => console.log(event.type));
```

The native app owns the scene, so an interactable is registered by id alone; the app answers hit queries and pose reads for that id through the `interactions` slice. `register` sends the host `setTargetRadius(targetId, radius)` with the given `targetRadius` or 0.1 m, the radius IWSDK gives a bare target, so a target is never excluded from hit testing for want of one. A `body` or `shape` option adds a body for the target in the `physics` slice at its current world pose, and a target whose body the host already holds needs neither. Without `attachToHost`, call `interactions.update(dtSeconds)` from your own loop. `dispose()` detaches from the frame callback, disposes the provider and the runtime, and ends a grab still in progress.

Options:

- `input`, `interactions` and `physics` pass the slices directly instead of reading `globalThis.__rcHost`. A slice that is neither passed nor installed throws one error naming it at construction. Without a `physics` slice `interactions.physics` is null and no target can carry a body.
- `nativeGrab` says the host fulfils grabs itself, as the IWSDK provider's option does.
- `attachToHost` drives the loop from the host's own frame callback, and `frames` supplies the frame source when it is not `__rcHost` itself.
- `dwellDefaults` sets gaze-dwell defaults, and `nearPointer` tunes the touch and grab distances.
- `pointers` shares a `PointerArbiter` with the UI Extensions native binding, so one decision per source covers panels and interactables. `pointerDisplay` sets the app's ray and cursor settings.
- `eyeGaze` tunes the provider's eye-gaze filter and grace, and `frameSeconds`, 1/60 by default, is the step the filter integrates over when `update` has not yet reported a real one.
- `physics` and `stepPhysics`: the facility steps from `update(dt)` unless `stepPhysics` is false, for a host that steps its engine itself.

## NativeInputProvider, NativeHitTester, NativeTransformPort

The provider, hit tester and transform port are exported too, as on every adapter, for an app that composes the runtime itself rather than using `createNativeInteractions`:

```ts
const provider = new NativeInputProvider({ input: myInputSlice });
const hitTester = new NativeHitTester({ interactions: myInteractionSlice });
const port = new NativeTransformPort("button", { interactions: myInteractionSlice });
```

`NativeHitTester` renames the host's `NativeHit.targetId` to the core's `interactableId` on the way through: the native host names the thing it hit, the core names the thing it manages. `NativeTransformPort` binds one `targetId` onto the shared `interactions` slice, the same idea as an engine adapter's port binding to one scene node, because the native host is one object serving every registered interactable rather than one port per object.

## The slice shapes

Every member of every slice carries a comment in the package stating its units, sign, defaults, when it is called and the IWSDK member it stands in for.

```ts
interface NativeInputHost {
  getFacts(): { immersive: boolean; focused: boolean; handTracking: boolean; eyeTracking: boolean };
  onFactsChanged(listener: () => void): Unsubscribe;
  onSourcesChanged(listener: () => void): Unsubscribe;
  sample(): readonly InputSourceSnapshot[];          // gripPose in the WebXR grip frame, indexTip at a controller's ray origin
  getHeadPose?(): HeadPose;
  getEyeGazePose?(): PoseTuple | null;               // required when eyeTracking can be true; null when no valid pose this frame
  sampleHints?(): readonly InputHitHint[];
  pulse?(sourceId: string, intensity: number, durationMs: number): boolean;   // intensity already clamped to 0..1
  applyPresence?(side: "left" | "right", shown: { hand: boolean; controller: boolean }): void;
  applyPointerVisuals?(sourceId: string, visuals: NativePointerVisuals): void;   // draw exactly this, every frame
  applyPointerDisplay?(config: PointerDisplayConfig): void;                      // the settings, informational
}

interface NativeInteractionHost {
  hitRay(ray: RayTuple): NativeHit | null;                          // distance is the ray parameter; a ray farther than the radius misses
  hitProximity(point: Vec3Tuple, radius: number): NativeHit | null;  // distance is to the SURFACE, clamped at zero; point is the nearest surface point
  hitCone?(ray: RayTuple, halfAngle: number, maxLength: number): NativeHit | null;   // eye gaze; optional
  setTargetRadius(targetId: string, radius: number): void;          // from register(); 0.1 m when the descriptor gives none
  getWorldPose(targetId: string): PoseTuple;        // live: where the object is now
  getRestWorldPose(targetId: string): PoseTuple;    // captured at registration
  getLocalOffset(targetId: string): Vec3Tuple;
  setLocalOffset(targetId: string, offset: Vec3Tuple): void;
  setLocalRotation(targetId: string, quaternion: QuatTuple): void;
  setWorldPose?(targetId: string, pose: PoseTuple): void;           // follow exactly while held; teleport and clear velocity while not
  setEffect?(targetId: string, effect: { scale?: number; emissive?: number }): void;
  beginHold(targetId: string): void;                                // required: suspend physics for this target
  endHold(targetId: string, release: HoldRelease): void;            // required: resume it with the release velocity
}
```

The `physics` slice is described [below](#the-physics-slice). See [Native as a platform](/webxr/docs/concepts/native-platform) for the full host contract and how this slice relates to the others.

## What a host reports for a hand and a controller

What a source reports for `select` and `squeeze` is fixed per kind, so the core's grab lifecycle sees on a host what it sees on the web on the same headset.

- A **controller**: `select` is the trigger's analog value, OpenXR `/input/trigger/value`, and `squeeze` the grip's, `/input/squeeze/value`. Both rest at 0.
- A **hand**: `select` is binary, 1 while the runtime reports the hand's pinch gesture and 0 otherwise, never the analog pinch strength. The source on Quest is the pinching bit of `XR_FB_hand_tracking_aim`, and on a runtime without it the `pinch_ext` actions of `XR_EXT_hand_interaction`. `squeeze` is 0 always, because a hand has no squeeze on the web and its grab is its pinch. OpenXR's `grasp_ext` is not a hand's squeeze: a relaxed hand keeps it above the release threshold, so a grab would never end. A relaxed, open hand reads `select` 0 and `squeeze` 0.

The binding forces a hand's `squeeze` to 0 whatever the host says, and the kit checks that a hand's `select` is 0 or 1. A source's `kind` is `"hand"` while hand joints are tracked and `"controller"` otherwise. Every hit query considers registered interactables only, never scenery, and a proximity hit's point is the surface point nearest the query.

## What the host is handed to draw

The binding decides the ray and the cursor for each source. The pointer arbiter picks the pointer that owns the source across interactables and UI panels, and the app's pointer display settings resolve what is drawn. The host is handed the result through `applyPointerVisuals(sourceId, visuals)` for every sampled source, every frame, as fresh objects it may keep, and draws exactly that.

`NativePointerVisuals` is the resolved drawing plus the decision behind it:

- `ray` says whether to draw the stub. It runs from `rayFrom` to `rayTo` metres along the source's ray, fully visible to `raySolidTo` and fading after, with `rayRadius` and `rayColor`.
- `cursor` says whether to draw a disc at `cursorPoint`, in world metres, with `cursorRadius`, `cursorOpacity` and a `cursorOffset` off the surface along its normal. A cursor on a UI panel arrives through the same member.
- `activePointer`, `targetKind`, `targetId` and `hitDistance` say which pointer owns the source and what the cursor sits on.

A host draws nothing for a source it was not told about. It never draws a cursor at every ray hit on its own, never applies a display mode of its own and never decides whether a panel gets a cursor. `applyPointerDisplay(config)` carries the settings at construction and on every change, so a host can size its meshes or log them. It is informational, because every per-frame decision already arrives resolved. See [the pointer arbiter and display](/webxr/docs/input/features/pointer-arbiter-and-display) for the arbiter and the settings.

## Eye gaze

A host that tracks the eyes reports `eyeTracking` in its facts: an eye-gaze source is present, OpenXR `XR_EXT_eye_gaze_interaction` bound and active. visionOS never reports one, because gaze reaches an app only at the moment of a pinch. `getEyeGazePose()` returns this frame's gaze target-ray pose in world space, with `-Z` along the gaze, or null when the runtime has no valid pose this frame, such as a blink or an uncalibrated headset. The pose is raw. The binding filters it, as IWSDK's `GazePointer` filters its eye pose.

While `eyeTracking` is true the binding applies the shared eye-gaze rule: `capabilities.eyeGaze` is true, far rays are dropped, the pinch selects what is gazed at, and the selector pose is built from the hand's ray. The host reports and draws none of it. The optional `hitCone(ray, halfAngle, maxLength)` on the `interactions` slice is the host's answer over its own scene, forwarded by `NativeHitTester`. Without it the binding targets eye gaze with `hitRay` alone, so a glance that misses a small target by a degree finds nothing. The rule is described in [Targeting, gaze and capabilities](../basics/04-targeting-gaze-and-capabilities.md#eye-gaze-and-pinch).

## The physics slice

`__rcHost.physics` is the host's engine behind the core `PhysicsFacility` contract, one body per string id, the ids the app registers interactables with. The host runs the platform's default engine, Jolt on Quest and Android and RealityKit on visionOS, and applies IWSDK 1.0.0's defaults exactly: gravity `[0, -9.81, 0]`, 60 steps per second with interpolation, a dynamic body with no damping and gravity factor 1, and an auto shape with density 1, restitution 0 and friction 0.5.

`NativePhysicsHost` has an `engine` name and the facility members: gravity, `addBody`, `removeBody`, `hasBody`, body state and pose, `setBodyPose` as a teleport that clears velocity, velocities, `suspend` and `resume(id, release)` for a hold, `isSuspended`, `step` and `dispose`. Units are metres, seconds and radians, and poses are world space. The binding copies every tuple it hands over and reads, so a host may reuse its buffers. An app may install its own `PhysicsFacility` in place of the host's. When a target has a body in this slice, its port holds and releases through the slice, and the `interactions` slice's own `beginHold` and `endHold` are not called for it.

## What the binding derives

`NativeInputProvider` derives every capability as `IWSDKInputProvider.refreshCapabilities` does, from the facts and the live sources: `rays`, `pokes` and pose-only `grabs` from immersion (a controller pokes with its ray origin, so `pokes` does not wait for hand tracking), `handJoints` and `pinch` from the hand-tracking fact or a tracked hand, `buttonsAxes` from a controller source, `haptics` from a source with an actuator on a host that can pulse, `gaze` and `headPose` from a reported head pose, `eyeGaze` from the eye-tracking fact, and `presence` from whether the host has `applyPresence`. It re-derives and fires `onCapabilitiesChanged` on every facts or source change. Capabilities `"native"` for grabs follows the `nativeGrab` option, as on IWSDK.

It samples no sources while the session lacks focus, as the IWSDK provider samples none unless its visibility state is visible, and clamps a pulse's intensity to 0..1.

## Presence

`setPresenceVisible` and `setPresenceModality` are the provider's, not the host's. The provider decides per side what to show, as `IWSDKInputProvider.applyPresence` does: `"auto"` shows hands while hand joints are live and controllers otherwise, and a side hidden through `setPresenceVisible` beats the modality. It calls the host's `applyPresence(side, { hand, controller })` with the result, only when a side's answer changed. Presence hides the models only, per side. It never hides the ray or the cursors, which `applyPointerVisuals` owns.

## Held pose

`beginHold(targetId)` and `endHold(targetId, release)` are required members of the `interactions` slice, and `NativeTransformPort` throws at construction without them, because a host without them silently dropped every release velocity. While held, the object follows `setWorldPose` exactly and gravity and collisions leave it alone. On release, physics resumes with the release velocities so a throw carries. A `setWorldPose` while not held teleports and clears velocity. A target with no physics body rests where released, as on IWSDK. The core's `poseOnly` grab calls both. The release velocity is the held object's velocity over the last 1/60 of a second, which the binding measures, so the host receives it in `release` and decides nothing. A native app that fulfils grabs itself, through its own engine with `nativeGrab`, must show the same three behaviours on its own. `beginHold` and `endHold` are never called for a grab the engine already owns.

## The grip frame

`gripPose` is the WebXR grip space, as the Input contract states: for a hand, the runtime's grip pose, OpenXR `/input/grip/pose`, and not a hand joint. Its frame has `-Z` toward the thumb and `+Y` up the arm, where an OpenXR joint such as `XR_HAND_JOINT_PALM_EXT` has `-Y` out of the palm, so a host that reports a palm joint as the grip pose rotates every hand menu and grab built on it. OpenXR 1.1's grip surface and `XR_EXT_palm_pose` give the right frame, or the host converts. A controller's `indexTip` is its ray origin, as IWSDK's input rig makes it. A dial, slide or hinge follows the grip first, so the grip pose must be accurate.

## Copies, not references

Every snapshot `sample()` returns, and every tuple inside it, is copied before it leaves `NativeInputProvider`, so a host that reuses its own sample buffers cannot change a snapshot the app is still holding. The same applies to hit results and to poses read through `NativeTransformPort`: every tuple a port returns is a fresh value the caller owns, and a tuple passed in is read during the call and not kept.

## Optional members

`getHeadPose`, `getEyeGazePose`, `sampleHints`, `pulse`, `applyPresence`, `applyPointerVisuals` and `applyPointerDisplay` on the `input` slice, and `hitCone`, `setWorldPose` and `setEffect` on the `interactions` slice, are optional. `pulse`, `setWorldPose` and `setEffect` are only ever present on the provider or port when the host slice itself carries the matching member. A host that cannot pulse leaves the provider without a `pulse` method at all, rather than one that silently returns false, and a host without `applyPresence` reports `capabilities.presence` false. A host without `applyPointerVisuals` cannot hide the ray while a hand touches something, and the kit fails it.

## Live pose and rest pose

`getWorldPose(targetId)` is the live pose: where the object is now, after every write, including one made by the native app's own physics. `getRestWorldPose(targetId)` is the pose captured at registration, and stays put while offsets and rotations are measured from it. The hinge, slide and dial behaviours read the rest pose; grab and toss-score scoring read the live pose. See [Core](./01-core.md) for how every platform implements this split.

## `attachToHost`

With `attachToHost: true`, `NativeInteractions` subscribes to `frames.onFrame` (`globalThis.__rcHost.onFrame` unless `frames` is supplied) and calls `update(dt)` with the reported delta, clamped to 0.1 seconds so a long frame does not make a behaviour jump. `dispose()` unsubscribes from it.

## Migrating a host from an earlier preview

A host written against an earlier preview absorbs these changes:

- The `input` slice reports `getFacts()` and `onFactsChanged(cb)` in place of `getCapabilities()` and `onCapabilitiesChanged(cb)`, and adds `onSourcesChanged(cb)`. A host no longer hard-codes capabilities.
- `setPresenceVisible` and `setPresenceModality` are no longer host members. Implement `applyPresence(side, { hand, controller })` and show exactly that.
- `beginHold(targetId)` and `endHold(targetId, release)` are required on the `interactions` slice, as is `getRestWorldPose(targetId)`.
- Implement `setTargetRadius(targetId, radius)` on the `interactions` slice and use it in `hitProximity` and `hitRay`.
- Report proximity distance to the target's surface, clamped at zero, with the nearest surface point as the hit point, and report a hand's `gripPose` in the WebXR grip frame.
- Report a hand's `select` as the binary pinch and its `squeeze` as 0, and answer queries for registered interactables only, never scenery.
- Draw the ray and cursor exactly as `applyPointerVisuals` says. The earlier rule that the host draws a cursor at every ray hit is withdrawn, and so is any display mode a shell applied by a hook of its own.
- Install a `physics` slice, with the host's engine, so every native platform names one.
- Report `eyeTracking` in the facts and implement `getEyeGazePose` when the device tracks the eyes.

## Testing it

The package is covered headlessly by an in-memory fake of the slices that behaves as a correct host would. That includes the shared `inputProviderContractCases()`, `hitTesterContractCases()`, `transformPortContractCases()`, `nearPointerContractCases()` and `physicsFacilityContractCases()` suites, and a binding-rules suite that holds the provider to each IWSDK rule by name. The package holds 100% coverage.

`nativeInteractionsHostConformanceCases()` is the host conformance kit, exported from this package. It is runner-free data, 49 cases, that a native app runs on its device against its real slices:

- 29 `interactions/` cases. These are the core's whole `hitTesterContractCases()` (17) and `nearPointerContractCases()` (9), run against the host's own queries. The other three check that queries never answer with scenery enclosing the hand, that a registered target with no radius is a 10 cm sphere, and that `endHold` hands the host the release velocity.
- 11 `physics/` cases. These are the core's whole `physicsFacilityContractCases()` (10) run against the host's engine, and one case that a target registered with a shape is held and released through the `physics` slice.
- 9 `input/` cases. A hand's `select` is 0 or 1 and its `squeeze` 0. Capabilities in a live session report rays, pokes and pose-only grabs. Presence hides the models only and per side, `"auto"` shows the family the live session uses, and presence never hides the cursors. The pointer display is the app's and the host draws what it is handed. The ray and cursor are drawn exactly as told. Two eye-gaze cases check that a host reporting eye tracking poses the gaze and that a cone query never answers with a hidden target.

```ts
for (const hostCase of nativeInteractionsHostConformanceCases()) {
  await hostCase.run({ input: __rcHost.input, interactions: __rcHost.interactions, physics: __rcHost.physics, testHost: __rcShell.testHost });
}
```

The host provides the readbacks of the `NativeInteractionsTestHost` type in a test build: `placeTarget`, `placeScenery`, `clearTargets`, `presenceShown`, `lastRelease` and `cursors`, and optionally `pointerVisuals`, `pointerDisplay` and `setTargetVisible`. The kit is shown to fail a host that measures proximity to a target's centre, ignores the radius it is handed, loses a release velocity or draws the wrong presence. Its cases also fail a host that draws a ray or cursor of its own, or answers a query with scenery.

The repository's native harness, built through the collective's own native pipeline, runs these suites and the playground's stations on the device. Continuous integration compiles the harness and never runs it.

## More information

- [Core: the engine-free package](./01-core.md)
- [Native as a platform](/webxr/docs/concepts/native-platform)
- [Conformance suites](/webxr/docs/concepts/conformance-suites)
- [Roadmap](../basics/07-roadmap.md)
- [API reference](pathname:///webxr/api/interactions/)
