---
sidebar_position: 1
title: "Core: @realitycollective/webxr-interactions"
description: What lives in the engine-free core, when to depend on it directly, and how it is tested.
---

# Core: @realitycollective/webxr-interactions

The engine-free package every adapter re-exports. Most apps never install it directly; they install one adapter instead, and get this package along with it.

## What lives in it

Behaviours (`press`, `pulse`, `hinge`, `dial`, `slide`, `grab`, `tossScore`) as pure state machines; the runtime and binder, which handles targeting, near pointers, press and grab transitions with hysteresis, gaze gating and dwell, eye gaze, capability negotiation, events and feedback intents; the physics contract; the release-velocity rule; the shared conformance suites; and the shared input contracts, re-exported from `@realitycollective/webxr-input`. It also re-exports the `PointerArbiter` and `PointerDisplay` types the runtime uses.

## When to depend on it directly

Two cases. Writing a new engine adapter: you need `TransformPort`, `HitTester`, `InputProvider` and the runtime, with none of a specific engine's types pulled in. Writing headless tests for your own behaviours or descriptors, where a three.js or Babylon dependency would buy nothing.

```sh
npm install @realitycollective/webxr-interactions
```

Everyone else installs one adapter instead; each adapter re-exports the whole of this package, so an app depends on exactly one package.

## The two ports every adapter implements

`HitTester` and `TransformPort`, both in `ports.ts`, are the space queries and transform writes the core cannot perform itself. `HitTester` answers a ray or proximity query with the nearest interactable, its distance and the hit point, or `null`. `TransformPort` is the read/write surface of one interactable's object: `getWorldPose()` is the live pose, where the object is now, including a write made by anything else; `getRestWorldPose()` is the pose captured at registration, and offsets and rotations behaviours write are measured from it, not from the live pose. The hinge, slide and dial behaviours read `getRestWorldPose()`; grab and toss-score scoring read `getWorldPose()`. Every tuple a port returns is a fresh value the caller owns, and a tuple passed in is read during the call and not kept.

From 0.1.1, `TransformPort` has two optional members for an object with a physics body: `beginHold()` suspends physics, and `endHold(release: HoldRelease)` resumes it with `release.linearVelocity` and `release.angularVelocity`, world space, in metres and radians per second. While held, `setWorldPose` follows exactly and leaves velocities alone; while not held, it teleports and clears them. The `poseOnly` grab calls both, taking the release velocity from the grabbing source's tracked velocity, or zero when the grab ended because the source was lost, the target was unregistered or the runtime was disposed. `InteractionRuntime.dispose()` now ends a grab still in progress, so a held object never stays suspended.

From 0.1.1, four shared suites ship as data next to `inputProviderContractCases()`, so a new port proves conformance the same way a new `InputProvider` does. `hitTesterContractCases()` has 17 cases. `transformPortContractCases()` has 14, three of them held, released and reset, which run where the subject has a physics driver and skip where it has none. `nearPointerContractCases()` has 9 and `physicsFacilityContractCases()` has 10. The hit-tester suite holds every platform to IWSDK's hit-test semantics: `hitProximity` reports the distance to the target's surface, clamped at zero, with the nearest surface point as its hit point; it misses a target whose surface is farther than the query radius; a ray that passes a target farther than its radius misses it; a target registered with no radius is a 0.1 m sphere; and only visible objects are targets, whatever the engine's own raycaster does with a hidden one. Five of the 17 cover `hitCone` and check it only when a tester has one. See [Provider conformance](/webxr/docs/input/basics/provider-conformance) for the shape a case takes, and [Conformance suites](/webxr/docs/concepts/conformance-suites) for the full list across every family.

## The grab lifecycle and the throw

A hand's `select` is the runtime's binary pinch and its `squeeze` is 0, so a hand grabs with its pinch: the 0.7 and 0.3 thresholds start the grab on the pinch and end it on the frame the pinch ends. `holderPoint(holder)` is the point a dial, slide or hinge tracks while held: the grip first, then the fingertip, then the ray origin. The grip comes first because IWSDK moves a held object with its grab pointer, which is built on the grip space.

`ReleaseVelocityTracker` records the poses a grab writes and `release()` returns a `HoldRelease`. The velocity is the held object's, over the most recent frames that span `RELEASE_WINDOW_SECONDS`, 1/60 of a second, with the angular part taken from the orientation change over the same window. It returns zeros with fewer than two poses. `GrabBehaviour` hands `endHold` zeros when the release is synthesised, and `InteractorInfo.synthesized` marks one.

## The physics facility

`PhysicsFacility` is one platform's physics world behind one contract, with bodies keyed by the ids interactables use. `PHYSICS_DEFAULTS` holds IWSDK 1.0.0's values: gravity `[0, -9.81, 0]`, 60 steps per second with interpolation, a dynamic body with no damping and gravity factor 1, and an auto shape with density 1, restitution 0 and friction 0.5. `PhysicsBodySpec` and `PhysicsShapeSpec` describe a body and its collider, and `resolvePhysicsBody` and `resolvePhysicsShape` fill in the defaults.

A facility adds, removes and states bodies (`dynamic`, `static` or `kinematic`), reads and sets poses and velocities, and steps the world. A teleport, `setBodyPose`, clears velocity. `suspend(id)` begins a hold, and `resume(id, release)` ends it with the release velocity as the body's velocity. `MemoryPhysicsFacility` is the engine-free reference that passes the shared suite. Each adapter names a default engine and takes an app's own facility in its place, as its page describes.

## Pointers, near pointers and eye gaze

The runtime takes `nearPointer`, `pointers`, `pointerDisplay` and `eyeGaze` options. They are described in [Targeting, gaze and capabilities](../basics/04-targeting-gaze-and-capabilities.md): the near-pointer distances in `NEAR_POINTER_DEFAULTS`, the shared `PointerArbiter` and the target set `INTERACTIONS_POINTER_SET`, the `PointerDisplay` settings and the per-source `PointerDrawing`, and the gaze cone, `GazeConsensus` and `EYE_GAZE_DEFAULTS`. `TouchPointerState` is the touch machine, a hover with hysteresis and a press armed only from outside. `POINTER_PRIORITY`, `pickActivePointer`, `PointerCandidate` and `pointerVisualsFor` live in `@realitycollective/webxr-input` and are re-exported unchanged. The arbiter and display are described in [the pointer arbiter and display](/webxr/docs/input/features/pointer-arbiter-and-display).

## Recorded traces

A trace is a real session recorded frame by frame on the reference platform: each frame's input snapshots and head pose, and the reference's own outcome, which is the events it raised, the values its behaviours published, the poses its objects took and the velocity a throw left with. The format is plain JSON, `rc-trace.v1`.

`TraceRecorder` records a session. `replayTrace` feeds a trace's input through a binding's own runtime, hit tester and transform port, through a `TraceInputProvider`. `compareOutcomes` compares the replay with the reference, and `traceParityCases(traces)` is that comparison as a runner-free suite. The tolerances are `TRACE_TOLERANCES`: press and grab events within 1 frame, values within 0.02, positions within 0.01 m, and a release speed within 10 percent or 0.1 m/s, whichever is larger. `synthesizeTrace` scripts the playground's mechanics through the core, so the pipeline can be proved on every platform before a person records on a headset. A synthetic trace proves the pipeline runs, not that a platform matches the web. The playground's Record button downloads a trace of a real session.

`MemoryHitTester` and `MemoryTransformPort` are the engine-free reference ports. They pass both shared suites and are what a headless test of your own logic can use.

## One behaviour on every platform

The IWSDK adapter is the reference, and the rules it applies through its engine are stated once, in the core, and held on every other platform by the suites above and by a test of the same name in each adapter. A controller's `indexTip` is its ray origin, so a controller pokes as a fingertip does. No sources are sampled while a live session is not visible and focused. A pulse's intensity is clamped to 0..1. Velocity a provider supplies is used as it is, and the core's tracker fills in only what a snapshot lacks. Haptics reach a provider's `pulse` only through the client's own opt-in, `routeHapticsToProvider`, on every platform. `setEffect` scales about the rest scale and adds to the base emissive intensity, and the last write wins. Where a platform genuinely cannot follow a rule, its page says so with the reason; see [Engines and adapters](/webxr/docs/concepts/engines).

## The architecture test

The design rule "no engine imports" is enforced, not just documented. The workspace runs an architecture test that fails the build the moment an engine import lands inside this package's source, so behaviours, the runtime, gaze and the interaction math stay engine-free because nothing else is possible.

## Headless testing

Behaviours are plain classes implementing the `Behaviour` interface, and the runtime speaks only tuples and interactable ids. Both are unit-testable with vitest against a mock `BehaviourContext` and a fake `InputProvider`, with no renderer or browser required. See [Patterns](../basics/06-patterns.md) for the shape of such a test.

## More information

- [Introduction](../basics/01-introduction.md)
- [Behaviours](../basics/03-behaviours.md)
- [Patterns](../basics/06-patterns.md)
- [Native adapter](./06-native.md)
- [API reference](pathname:///webxr/api/interactions/)
