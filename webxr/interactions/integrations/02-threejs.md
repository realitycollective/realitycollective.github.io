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

It is the only adapter with no framework requirement beyond three.js itself, and the only one with a `registerVisual` presence API, because a standalone three.js app builds its own hand and controller models. From 0.1.1-preview.2 it follows the IWSDK reference where three.js itself has no opinion: a controller's `indexTip` is its ray origin, so a controller pokes buttons as a fingertip does; `sample()` reports no sources while a live session is not visible; `ThreeHitTester.register(id, object, targetRadius?)` gives a bare `Group` a 0.1 m proximity radius by default, the radius IWSDK gives a bare target, while a mesh keeps its own bounding sphere; and a hit on an object hidden with `visible = false`, or under a hidden ancestor, is dropped, because three.js's own `Raycaster` ignores `visible` by design.

## What it cannot do on this host, and why

It cannot show or hide a hand or controller visual until the app hands one over with `registerVisual`; there is nothing built in to hide, and `setPresenceModality` always returns false, because the app owns one visual root per side and there is no hands-or-controllers family to switch. It cannot hold a physics body during a grab: three.js has no physics engine, so its transform port has no body to suspend and omits `beginHold` and `endHold`, as the core contract allows; a grabbed object rests where it is released. It has no engine-owned grab to report as a hint either, so every grab is pose-only. It also cannot resolve a detailed mesh's raycast quickly without `three-mesh-bvh` installed; without it, register a low-poly collider proxy instead of the visible mesh.

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
