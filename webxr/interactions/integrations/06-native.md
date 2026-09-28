---
sidebar_position: 6
title: "Native: @realitycollective/native-interactions"
description: The native host adapter, reading the input and interactions slices of globalThis.__rcHost with no engine dependency, deriving and deciding what the IWSDK adapter derives and decides.
---

# Native: @realitycollective/native-interactions

From 0.1.1 (preview). The shape on this page is the one from 0.1.1-preview.2, the platform synchronisation of 28 September 2026; a host written against an earlier preview has changes to absorb, listed [below](#migrating-a-host-from-an-earlier-preview).

## What it binds

| Layer | Detail |
| --- | --- |
| Input | `__rcHost.input` - the host reports facts (`immersive`, `focused`, `handTracking`), samples sources, and optionally reports a head pose and hints, plays a pulse and applies presence; the provider derives every capability and decides presence, as the IWSDK provider does |
| Hit-testing | `__rcHost.interactions.hitRay` / `hitProximity` - the native app owns the scene and physics, so targeting is entirely its answer, against the radius the binding assigns each target |
| Movement | `__rcHost.interactions`, keyed by the target id chosen when the object was registered with the native scene, including the held pose |

No engine dependency: only numbers, strings, booleans and tuples cross the boundary, and assets and rendering stay in the native app. The binding is as thick as the IWSDK reference, and the host is handed results: it renders, measures and reports facts, and never derives a capability or picks a modality.

## Install

```sh
npm install @realitycollective/native-interactions@preview
```

It re-exports everything from `@realitycollective/webxr-interactions`, so this is the only interaction package a native app needs.

## Setup

One call, the same shape as `createBabylonInteractions` and `createThreeInteractions`:

```ts
import { createNativeInteractions } from "@realitycollective/native-interactions";

// Reads globalThis.__rcHost.input / .interactions when no slice is passed in,
// and drives update(dt) from the app's own frame callback, __rcHost.onFrame.
const interactions = createNativeInteractions({ attachToHost: true });

interactions.register({ id: "button", behaviours: [{ kind: "press" }] });
interactions.register({ id: "ball", behaviours: [{ kind: "grab" }] }, { targetRadius: 0.05 });
interactions.runtime.onEvent((event) => console.log(event.type));
```

The native app owns the scene, so an interactable is registered by id alone; the app answers hit queries and pose reads for that id through the `interactions` slice. `register` sends the host `setTargetRadius(targetId, radius)` with the given `targetRadius` or 0.1 m, the radius IWSDK gives a bare target, so a target is never excluded from hit testing for want of one. Without `attachToHost`, call `interactions.update(dtSeconds)` from your own loop. `dispose()` detaches from the frame callback, disposes the provider and the runtime, and ends a grab still in progress.

Options: `input` and `interactions` pass the slices directly instead of reading `globalThis.__rcHost`, `nativeGrab` says the host fulfils grabs itself, as the IWSDK provider's option does, `dwellDefaults` sets gaze-dwell defaults, `attachToHost` drives the loop from the host's own frame callback, and `frames` supplies the frame source when it is not `__rcHost` itself.

## NativeInputProvider, NativeHitTester, NativeTransformPort

The provider, hit tester and transform port are exported too, as on every adapter, for an app that composes the runtime itself rather than using `createNativeInteractions`:

```ts
const provider = new NativeInputProvider({ input: myInputSlice });
const hitTester = new NativeHitTester({ interactions: myInteractionSlice });
const port = new NativeTransformPort("button", { interactions: myInteractionSlice });
```

`NativeHitTester` renames the host's `NativeHit.targetId` to the core's `interactableId` on the way through: the native host names the thing it hit, the core names the thing it manages. `NativeTransformPort` binds one `targetId` onto the shared `interactions` slice, the same idea as an engine adapter's port binding to one scene node, because the native host is one object serving every registered interactable rather than one port per object.

## The slice shapes

Every member of both slices carries a comment in the package stating its units, sign, defaults, when it is called and the IWSDK member it stands in for.

```ts
interface NativeInputHost {
  getFacts(): { immersive: boolean; focused: boolean; handTracking: boolean };
  onFactsChanged(listener: () => void): Unsubscribe;
  onSourcesChanged(listener: () => void): Unsubscribe;
  sample(): readonly InputSourceSnapshot[];          // gripPose in the WebXR grip frame, indexTip at a controller's ray origin
  getHeadPose?(): HeadPose;
  sampleHints?(): readonly InputHitHint[];
  pulse?(sourceId: string, intensity: number, durationMs: number): boolean;   // intensity already clamped to 0..1
  applyPresence?(side: "left" | "right", shown: { hand: boolean; controller: boolean }): void;
}

interface NativeInteractionHost {
  hitRay(ray: RayTuple): NativeHit | null;                          // distance is the ray parameter; a ray farther than the radius misses
  hitProximity(point: Vec3Tuple, radius: number): NativeHit | null;  // distance is to the SURFACE, clamped at zero
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

See [Native as a platform](/webxr/docs/concepts/native-platform) for the full host contract and how this slice relates to the others.

## What the binding derives

`NativeInputProvider` derives every capability as `IWSDKInputProvider.refreshCapabilities` does, from the facts and the live sources: `rays`, `pokes` and pose-only `grabs` from immersion (a controller pokes with its ray origin, so `pokes` does not wait for hand tracking), `handJoints` and `pinch` from the hand-tracking fact or a tracked hand, `buttonsAxes` from a controller source, `haptics` from a source with an actuator on a host that can pulse, `gaze` and `headPose` from a reported head pose, and `presence` from whether the host has `applyPresence`. It re-derives and fires `onCapabilitiesChanged` on every facts or source change. Capabilities `"native"` for grabs follows the `nativeGrab` option, as on IWSDK.

It samples no sources while the session lacks focus, as the IWSDK provider samples none unless its visibility state is visible, and clamps a pulse's intensity to 0..1.

## Presence

`setPresenceVisible` and `setPresenceModality` are the provider's, not the host's. The provider decides per side what to show, as `IWSDKInputProvider.applyPresence` does: `"auto"` shows hands while hand joints are live and controllers otherwise, and a side hidden through `setPresenceVisible` beats the modality. It calls the host's `applyPresence(side, { hand, controller })` with the result, only when a side's answer changed. Presence hides the models only, per side; it never hides the cursors.

## Held pose

`beginHold(targetId)` and `endHold(targetId, release)` are required members of the `interactions` slice, and `NativeTransformPort` throws at construction without them, because a host without them silently dropped every release velocity. While held, the object follows `setWorldPose` exactly and gravity and collisions leave it alone; on release, physics resumes with the release velocities so a throw carries; a `setWorldPose` while not held teleports and clears velocity. A target with no physics body rests where released, as on IWSDK. The core's `poseOnly` grab calls both. A native app that fulfils grabs itself, through its own engine with `nativeGrab`, must show the same three behaviours on its own; `beginHold` and `endHold` are never called for a grab the engine already owns.

## The grip frame

`gripPose` is the WebXR grip space, as the Input contract states from 0.1.6: for a hand, the runtime's grip pose, OpenXR `/input/grip/pose`, and not a hand joint. Its frame has `-Z` toward the thumb and `+Y` up the arm, where an OpenXR joint such as `XR_HAND_JOINT_PALM_EXT` has `-Y` out of the palm, so a host that reports a palm joint as the grip pose rotates every hand menu and grab built on it. OpenXR 1.1's grip surface and `XR_EXT_palm_pose` give the right frame, or the host converts. A controller's `indexTip` is its ray origin, as IWSDK's input rig makes it.

## Copies, not references

Every snapshot `sample()` returns, and every tuple inside it, is copied before it leaves `NativeInputProvider`, so a host that reuses its own sample buffers cannot change a snapshot the app is still holding. The same applies to hit results and to poses read through `NativeTransformPort`: every tuple a port returns is a fresh value the caller owns, and a tuple passed in is read during the call and not kept.

## Optional members

`getHeadPose`, `sampleHints`, `pulse` and `applyPresence` on the `input` slice, and `setWorldPose` and `setEffect` on the `interactions` slice, are only ever present on the provider or port when the host slice itself carries the matching member. A host that cannot pulse leaves the provider without a `pulse` method at all, rather than one that silently returns false, and a host without `applyPresence` reports `capabilities.presence` false.

## Live pose and rest pose

`getWorldPose(targetId)` is the live pose: where the object is now, after every write, including one made by the native app's own physics. `getRestWorldPose(targetId)` is the pose captured at registration, and stays put while offsets and rotations are measured from it. The hinge, slide and dial behaviours read the rest pose; grab and toss-score scoring read the live pose. See [Core](./01-core.md) for how every platform implements this split.

## `attachToHost`

With `attachToHost: true`, `NativeInteractions` subscribes to `frames.onFrame` (`globalThis.__rcHost.onFrame` unless `frames` is supplied) and calls `update(dt)` with the reported delta, clamped to 0.1 seconds so a long frame does not make a behaviour jump. `dispose()` unsubscribes from it.

## Migrating a host from an earlier preview

A host written against 0.1.1-preview.0 or preview.1 absorbs these changes:

- The `input` slice reports `getFacts()` and `onFactsChanged(cb)` in place of `getCapabilities()` and `onCapabilitiesChanged(cb)`, and adds `onSourcesChanged(cb)`. A host no longer hard-codes capabilities.
- `setPresenceVisible` and `setPresenceModality` are no longer host members. Implement `applyPresence(side, { hand, controller })` and show exactly that.
- `beginHold(targetId)` and `endHold(targetId, release)` are required on the `interactions` slice, as is `getRestWorldPose(targetId)`.
- Implement `setTargetRadius(targetId, radius)` on the `interactions` slice and use it in `hitProximity` and `hitRay`.
- Report proximity distance to the target's surface, clamped at zero, and report a hand's `gripPose` in the WebXR grip frame.

## Testing it

Covered headlessly by an in-memory fake of both slices that behaves as a correct host would, including the shared `inputProviderContractCases()`, `hitTesterContractCases()` and `transformPortContractCases()` suites, and a binding-rules suite that holds the provider to each IWSDK rule by name: capabilities derived from the facts and re-derived on every change, nothing sampled while unfocused, presence decided per side, the 0.1 m default radius sent to the host, and haptics reported only for a source with an actuator on a host that can pulse. The package holds 100% coverage.

`nativeInteractionsHostConformanceCases()` is the host conformance kit, exported from this package: the core's whole `hitTesterContractCases()` run against the host itself, plus host cases named `input/<rule>` and `interactions/<rule>`, all runner-free, that a native app runs on its device against its real slices. They check that a registered target with no radius is a 10 cm sphere, that `endHold` receives the release velocity, that capabilities in a live session report rays, pokes and pose-only grabs, that presence hides the models only and per side, that `"auto"` follows the live modality, and that presence never hides the cursors. The host provides the readbacks of the `NativeInteractionsTestHost` type in a test build: `placeTarget`, `clearTargets`, `presenceShown`, `lastRelease` and `cursors`. The kit is shown to fail a host that measures proximity to a target's centre, ignores the radius it is handed, loses a release velocity or draws the wrong presence.

:::warning
This adapter is tested headless only, against in-memory fakes of the `input` and `interactions` slices. It has not run against a real native host on Quest 3 or the visionOS Simulator; a device run of the host conformance kit is the native team's step.
:::

## More information

- [Core: the engine-free package](./01-core.md)
- [Native as a platform](/webxr/docs/concepts/native-platform)
- [Conformance suites](/webxr/docs/concepts/conformance-suites)
- [Roadmap](../basics/07-roadmap.md)
- [API reference](pathname:///webxr/api/interactions/)
