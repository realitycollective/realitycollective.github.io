---
sidebar_position: 6
title: "Native: @realitycollective/native-interactions"
description: The native host adapter, reading the input and interactions slices of globalThis.__rcHost with no engine dependency.
---

# Native: @realitycollective/native-interactions

From 0.1.1 (preview).

## What it binds

| Layer | Detail |
| --- | --- |
| Input | `__rcHost.input` - the same members as `InputProvider`: capabilities, source sampling, optional head pose, hints, haptics and presence |
| Hit-testing | `__rcHost.interactions.hitRay` / `hitProximity` - the native app owns the scene and physics, so targeting is entirely its answer |
| Movement | `__rcHost.interactions`, keyed by the target id chosen when the object was registered with the native scene |

No engine dependency: only numbers, strings, booleans and tuples cross the boundary, and assets and rendering stay in the native app.

## Install

```sh
npm install @realitycollective/native-interactions
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
interactions.runtime.onEvent((event) => console.log(event.type));
```

The native app owns the scene, so an interactable is registered by id alone; the app answers hit queries and pose reads for that id through the `interactions` slice. Without `attachToHost`, call `interactions.update(dtSeconds)` from your own loop. `dispose()` detaches from the frame callback and disposes the runtime.

Options: `input` and `interactions` pass the slices directly instead of reading `globalThis.__rcHost`, `dwellDefaults` sets gaze-dwell defaults, `attachToHost` drives the loop from the host's own frame callback, and `frames` supplies the frame source when it is not `__rcHost` itself.

## NativeInputProvider, NativeHitTester, NativeTransformPort

The provider, hit tester and transform port are exported too, as on every adapter, for an app that composes the runtime itself rather than using `createNativeInteractions`:

```ts
const provider = new NativeInputProvider({ input: myInputSlice });
const hitTester = new NativeHitTester({ interactions: myInteractionSlice });
const port = new NativeTransformPort("button", { interactions: myInteractionSlice });
```

`NativeHitTester` renames the host's `NativeHit.targetId` to the core's `interactableId` on the way through: the native host names the thing it hit, the core names the thing it manages. `NativeTransformPort` binds one `targetId` onto the shared `interactions` slice, the same idea as an engine adapter's port binding to one scene node, because the native host is one object serving every registered interactable rather than one port per object.

## The slice shapes

`NativeInputHost` mirrors `InputProvider` member for member, and `NativeInteractionHost` is `HitTester` plus `TransformPort` from `webxr-interactions/ports`, with a `targetId` added to every `TransformPort` member:

```ts
interface NativeInteractionHost {
  hitRay(ray: RayTuple): NativeHit | null;
  hitProximity(point: Vec3Tuple, radius: number): NativeHit | null;
  getWorldPose(targetId: string): PoseTuple;       // live: where the object is now
  getRestWorldPose(targetId: string): PoseTuple;   // captured at registration
  getLocalOffset(targetId: string): Vec3Tuple;
  setLocalOffset(targetId: string, offset: Vec3Tuple): void;
  setLocalRotation(targetId: string, quaternion: QuatTuple): void;
  setWorldPose?(targetId: string, pose: PoseTuple): void;
  setEffect?(targetId: string, effect: unknown): void;
}
```

See [Native as a platform](/webxr/docs/concepts/native-platform) for the full host contract and how this slice relates to the others.

## Copies, not references

Every snapshot `sample()` returns, and every tuple inside it, is copied before it leaves `NativeInputProvider`, so a host that reuses its own sample buffers cannot change a snapshot the app is still holding. The same applies to hit results and to poses read through `NativeTransformPort`: every tuple a port returns is a fresh value the caller owns, and a tuple passed in is read during the call and not kept.

## Optional members

`getHeadPose`, `sampleHints`, `pulse`, `setPresenceVisible` and `setPresenceModality` on `NativeInputProvider`, and `setWorldPose` / `setEffect` on `NativeTransformPort`, are only ever present when the host slice itself carries the matching member. A host that cannot pulse leaves the provider without a `pulse` method at all, rather than one that silently returns false.

## Live pose and rest pose

`getWorldPose(targetId)` is the live pose: where the object is now, after every write, including one made by the native app's own physics. `getRestWorldPose(targetId)` is the pose captured at registration, and stays put while offsets and rotations are measured from it. The hinge, slide and dial behaviours read the rest pose; grab and toss-score scoring read the live pose. See [Core](./01-core.md) for how every platform implements this split.

## `attachToHost`

With `attachToHost: true`, `NativeInteractions` subscribes to `frames.onFrame` (`globalThis.__rcHost.onFrame` unless `frames` is supplied) and calls `update(dt)` with the reported delta, clamped to 0.1 seconds so a long frame does not make a behaviour jump. `dispose()` unsubscribes from it.

## Testing it

Covered headlessly by an in-memory fake of both slices, including the shared `inputProviderContractCases()`, `hitTesterContractCases()` and `transformPortContractCases()` suites, at 100% coverage. A device run against the real `__rcHost` is the native team's step.

:::warning
This adapter is tested headless only, against in-memory fakes of the `input` and `interactions` slices. It has not run against a real native host on Quest 3 or the visionOS Simulator; a device run is the native team's step.
:::

## More information

- [Core: the engine-free package](./01-core.md)
- [Native as a platform](/webxr/docs/concepts/native-platform)
- [Conformance suites](/webxr/docs/concepts/conformance-suites)
- [Roadmap](../basics/07-roadmap.md)
- [API reference](pathname:///webxr/api/interactions/)
