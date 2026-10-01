---
sidebar_position: 5
title: "Google XR Blocks: @realitycollective/xrblocks-interactions"
description: The experimental XR Blocks adapter, matched structurally to xrblocks 0.21.1 with no upstream dependency, with haptics, an engine-owned grab and a RAPIER held pose.
---

# Google XR Blocks: @realitycollective/xrblocks-interactions

:::warning
Experimental. The XR Blocks pipeline is young and its API still moves. Pin your versions.
:::

## What it binds

| Layer | Detail |
| --- | --- |
| Input | `Input.getFrame()` ray sources and direct touches, XR Blocks' own select events, the real grip pose from `inputSource.gripSpace` through an optional `xr` context, and haptics through the controller's WebXR Gamepad `hapticActuators` |
| Hit-testing | Shared with the three.js adapter, since XR Blocks Scripts are ordinary three.js `Object3D`s |
| Movement | `XRBlocksTransformPort`, the three.js port plus the held pose over a RAPIER rigid body |
| Physics | The Rapier that XR Blocks bundles, through the shared `RapierPhysicsFacility` |
| Pointer drawing | The three.js `ThreePointerVisuals` draws the ray stub and cursor disc into a scene |
| Grab | XR Blocks' `ManipulationManager` grab, forwarded as an engine-owned grab through `onObjectGrabStart` and `onObjectGrabEnd` with the `nativeGrab` option |

## Install

```sh
npm install @realitycollective/xrblocks-interactions three
```

Peer dependency: `three >= 0.170.0`. xrblocks itself declares a peer of `three@^0.184`, while Meta's IWSDK mandates the `super-three@0.181` fork. A bundler resolves a single `three` per bundle, so this works in practice, but npm's own peer check cannot express it, which is why the Reality Collective workspaces set `legacy-peer-deps=true`. The adapter is structurally typed against xrblocks 0.21.1 and imports nothing from it.

## Setup

```ts
import { connectXRBlocksInteractions } from "@realitycollective/xrblocks-interactions";
import { RigidBodyType } from "@dimforge/rapier3d";

const rigidBodyTypes = { kinematicPositionBased: RigidBodyType.KinematicPositionBased, dynamic: RigidBodyType.Dynamic };

class MyScript extends xb.Script {
  init() {
    this.ix = connectXRBlocksInteractions({
      input: xb.input,
      camera: xb.camera,
      xr: xb.core.renderer.xr,   // grip poses, angular velocity and the visibility gate
      nativeGrab: true,          // only if the app uses XR Blocks' ManipulationManager grab
      rigidBodyTypes,            // RAPIER's own values for the two body types, for the held pose
    });
    this.ix.register({ id: "button", behaviours: [{ kind: "press" }] }, buttonMesh);
    this.ix.register({ id: "ball", behaviours: [{ kind: "grab" }] }, ballMesh, { rigidBody: ballBody });
  }
  update() {
    this.ix.update(xb.getDeltaTime());
  }
  onObjectGrabStart(event) { this.ix.onObjectGrabStart(event); }
  onObjectGrabEnd(event) { this.ix.onObjectGrabEnd(event); }
}
```

Pass `xr` so the provider reads each controller's real grip pose from `inputSource.gripSpace`, falling back to `targetRaySpace`, and gates sampling on the session's visibility. Without it the grip pose is the ray origin with an identity orientation, so every rotation read is zero, angular velocity is meaningless, and sampling is never gated; that is the pre-0.21 behaviour, kept only as a fallback. `register` takes an optional `targetRadius`, 0.1 m by default for an object with no geometry of its own, and an optional `rigidBody`.

## What it adds over the core

Beyond the three.js hit-testing it reuses, its own code translates XR Blocks' pooled per-frame structs into the shared input snapshot, copying every value out immediately since XR Blocks reuses those objects. From 0.1.1 it follows the IWSDK reference where xrblocks 0.20.0 could not and 0.21.1 can:

- **Haptics.** `pulse()` plays through the controller's WebXR Gamepad `hapticActuators` (`Controller.gamepad`), clamping intensity to 0..1 exactly as the other providers do, and reports `capabilities.haptics` and `hapticsAvailable` accordingly.
- **An engine-owned grab.** With `nativeGrab`, `capabilities.grabs` is `"native"` and the Script's `onObjectGrabStart` and `onObjectGrabEnd` hooks, driven by XR Blocks' `ManipulationManager`, raise the same `nativeGrabbing` hint the IWSDK provider raises for its own grab.
- **The held pose.** For an app that drives XR Blocks physics itself, `XRBlocksTransformPort` implements `beginHold` and `endHold` when the target's object was registered with a RAPIER rigid body, which xrblocks 0.21.1 bundles (`PhysicsOptions.RAPIER`): held switches the body kinematic and keeps it at the object's written pose, released switches it back to dynamic with the release velocity. `rigidBodyTypes` at connect time supplies RAPIER's own values for the two body types, the same idea as `physicsMotionTypes` on the Babylon adapter, because this package holds no RAPIER values, only shapes. With no body, or no `rigidBodyTypes`, the port behaves exactly like `ThreeTransformPort`. To have the adapter create and hold the body, use the physics facility below.
- **The shared rules.** A controller's `indexTip` is its ray origin, so a controller pokes as a fingertip does; `sample()` reports no sources while a live session is not visible; a bare `Group` is a 0.1 m proximity sphere; and a hit on a hidden object is dropped.

## Physics

`physics: { rapier }` takes the initialised Rapier module that XR Blocks exposes once `xb.physics` is up, and builds the same `RapierPhysicsFacility` as the three.js adapter. Pass any `PhysicsFacility` of your own instead to replace it. `register` then takes `body` and `shape` specs, with IWSDK's defaults described in [the physics facility](./01-core.md#the-physics-facility), and gives the object a body at its current world pose. `update(dt)` steps the facility, and `stepPhysics: false` leaves that to XR Blocks. `interactions.physics` is the facility, or null. A `register` call that names a `body` or `shape` with no `physics` throws. The two ways to a held pose are separate. A `rigidBody` plus `rigidBodyTypes` binds a body the app already made, and `body` or `shape` makes one through the facility.

```ts
this.ix = connectXRBlocksInteractions({ input: xb.input, camera: xb.camera, xr: xb.core.renderer.xr, physics: { rapier: RAPIER } });
this.ix.register({ id: "ball", behaviours: [{ kind: "grab" }] }, ballMesh, { body: { state: "dynamic" }, shape: { kind: "sphere", dimensions: [0.05, 0, 0] } });
```

## Pointer drawing

`pointerVisuals: { scene }` draws IWSDK's look through the three.js renderer, into the Script or any world-space root. XR Blocks draws its own controller reticle and the adapter cannot hide it, so turn that reticle off in XR Blocks' options and one cursor is drawn. The pointer display settings, the shared `pointers` arbiter and `nearPointer` work as on the three.js adapter. See [Targeting, gaze and capabilities](../basics/04-targeting-gaze-and-capabilities.md).

## What it cannot do on this host, and why

It cannot offer presence: XR Blocks 0.21.1 owns its hand and controller visuals and exposes no public hook to hide them (`disableControllers` stops input and the reticle, not the models, and the grips are private), so `capabilities.presence` is always false, and there is no modality to switch either.

## Presence and haptics

Presence is unavailable, for the reason above. Haptics are available from 0.1.1 on a controller whose Gamepad carries an actuator. In 0.1.0 `capabilities.haptics` was always false, because xrblocks 0.20.0 had no such surface.

## Testing it

Covered against structural fakes of the `Input.getFrame()` shape, the `xr` context, the Gamepad actuators and a RAPIER body, so the provider's parsing, the pulse and the held pose are exercised without the `xrblocks` package installed. `XRBlocksTransformPort` runs the shared `transformPortContractCases()`, including the three held, released and reset cases, in the shared port suite beside the other four platforms.

## Live demo

<DemoLink demo="interactions" />, the full station set, mouse-capable on desktop, with a VR button for headsets.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Roadmap](../basics/07-roadmap.md)
- [three.js adapter](./02-threejs.md)
- [API reference](pathname:///webxr/api/interactions/)
