---
sidebar_position: 2
title: "three.js and raw WebXR: @realitycollective/threejs-interactions"
description: The default, standalone adapter, reading raw WebXR input with three.js hit-testing, transform writes and a desktop mouse fallback.
---

# three.js and raw WebXR: @realitycollective/threejs-interactions

The default, standalone adapter. It reads raw WebXR directly, so no other framework is needed beyond three.js itself.

## What it binds

| Layer | Detail |
| --- | --- |
| Input | Raw WebXR: `XRSession` input sources, hand joints, trigger and grip pressure through select and squeeze, gamepad analog values where present, haptic pulses |
| Hit-testing | A three.js `Raycaster` over registered objects, accelerated with `three-mesh-bvh` when the app installs it |
| Movement | Moves, rotates and scales three.js `Object3D`s for grab, hinge, dial, slide and the pulse effect |
| Physics | Rapier, through `RapierPhysicsFacility`, when the app hands over the initialised module |
| Pointer drawing | `ThreePointerVisuals` draws the ray stub and cursor disc into a scene |
| Desktop | A mouse ray cast from the camera through the cursor when no immersive session is live |

## Install

```sh
npm install @realitycollective/threejs-interactions three
```

Peer dependency: `three >= 0.170.0`. Optional peer: `three-mesh-bvh >= 0.9.14`, for accelerated raycasting against detailed meshes.

## Setup

```ts
import { createThreeInteractions } from "@realitycollective/threejs-interactions";

const interactions = createThreeInteractions({
  xr: renderer.xr,
  camera,
  domElement: renderer.domElement,
  desktopGripDistance: 0.95,
});

interactions.register({ id: "button", behaviours: [{ kind: "press" }] }, buttonMesh);
```

## What it adds over the core

It is the only adapter with no framework requirement beyond three.js itself, and the only one with a `registerVisual` presence API, because a standalone three.js app builds its own hand and controller models. From 0.1.1 it follows the IWSDK reference where three.js itself has no opinion: a controller's `indexTip` is its ray origin, so a controller pokes buttons as a fingertip does; `sample()` reports no sources while a live session is not visible; `ThreeHitTester.register(id, object, targetRadius?)` gives a bare `Group` a 0.1 m proximity radius by default, the radius IWSDK gives a bare target, while a mesh keeps its own bounding sphere; and a hit on an object hidden with `visible = false`, or under a hidden ancestor, is dropped, because three.js's own `Raycaster` ignores `visible` by design.

## Physics

three.js has no physics engine, so the adapter names Rapier as its default and imports none. Initialise the module, `@dimforge/rapier3d-compat`, and hand it over:

```ts
import RAPIER from "@dimforge/rapier3d-compat";
await RAPIER.init();

const interactions = createThreeInteractions({
  xr: renderer.xr,
  camera,
  domElement: renderer.domElement,
  physics: { rapier: RAPIER },
});

interactions.register({ id: "ball", behaviours: [{ kind: "grab" }] }, ballMesh, {
  body: { state: "dynamic" },
  shape: { kind: "sphere", dimensions: [0.05, 0, 0] },
});
```

`physics` takes `{ rapier }`, which builds a `RapierPhysicsFacility`, or any `PhysicsFacility` of your own. `register` takes `body` and `shape` specs and gives the object a body at its current world pose. The defaults are IWSDK's, and the specs are described in [the physics facility](./01-core.md#the-physics-facility). A shape of `"auto"` is the object's world bounding box. A hold switches the Rapier body to kinematic so its collider still blocks, and a release restores its own type with the release velocity. After each step the facility writes every dynamic body's pose back to its object. `update(dt)` steps the facility, and `stepPhysics: false` leaves that to the app. `interactions.physics` is the facility, or null when the setup has none.

An object registered with no body, or on a setup with no `physics`, has a transform port without `beginHold` and `endHold`, as the core contract allows, and rests where it is released. A `register` call that names a `body` or `shape` on a setup with no `physics` throws.

## Pointer drawing

`pointerVisuals: { scene }` draws IWSDK's look from the core's per-source `PointerDrawing`. The ray is IWSDK's shader on a thin cylinder, a 1 mm white stub from 3 cm in front of the hand to the nearer of 0.3 m and the hit, blue while selecting. The cursor is a disc at the hit, facing the surface. The pointer display settings and the shared `pointers` arbiter work as on every adapter, and `nearPointer` tunes the touch and grab distances. See [Targeting, gaze and capabilities](../basics/04-targeting-gaze-and-capabilities.md). Without `pointerVisuals` the adapter draws nothing, and an app that draws its own reads `runtime.onPointerDrawing`.

## Eye gaze

`WebXRInputProvider` finds the input source whose `targetRayMode` is `"gaze"`, poses it against the reference space and applies the shared eye-gaze rule. `ThreeHitTester.hitCone` tries the raycast first and then the cone over the registered roots' bounding spheres. The setup's `eyeGaze` option tunes the provider.

## What it cannot do on this host, and why

It cannot show or hide a hand or controller visual until the app hands one over with `registerVisual`; there is nothing built in to hide, and `setPresenceModality` always returns false, because the app owns one visual root per side and there is no hands-or-controllers family to switch. It has no engine-owned grab to report as a hint either, so every grab is pose-only. It also cannot resolve a detailed mesh's raycast quickly without `three-mesh-bvh` installed; without it, register a low-poly collider proxy instead of the visible mesh.

## Presence and haptics

`registerVisual(handedness, root)` and `unregisterVisual(handedness)` register or remove the app's own models; `capabilities.presence` is false until the first one is registered. Haptics fire through the browser's actuator API on sources that report `hapticsAvailable`; hands have none, so a pulse aimed at a hand source no-ops.

## Testing it

The adapter's suite runs against a fake `XRSession` and `WebXRManager`, so its targeting and transform-write logic is exercised without a real headset or a WebGL context.

## Live demo

<DemoLink demo="interactions" />, mouse-capable on desktop, with a VR button for headsets.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Velocity and presence](../features/01-velocity-and-presence.md)
- [Interaction playground example](../examples/01-interaction-playground.md)
- [API reference](pathname:///webxr/api/interactions/)
