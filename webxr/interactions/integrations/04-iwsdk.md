---
sidebar_position: 4
title: "Meta IWSDK: @realitycollective/iwsdk-interactions"
description: The Meta Immersive Web SDK adapter, using IWSDK's own targeting and grab fulfilment directly.
---

# Meta IWSDK: @realitycollective/iwsdk-interactions

## What it binds

| Layer | Detail |
| --- | --- |
| Input | IWSDK's player rig poses and stateful XR gamepads, analog trigger and squeeze, with a `getSelecting` fallback that also covers hand pinch |
| Targeting | IWSDK already knows what is being pressed or grabbed, through its own `Pressed` and `Grabbed` tags; the adapter forwards that answer as a pre-resolved hint instead of re-deriving it with rays |
| Grab | Where the app has IWSDK grabbing enabled, IWSDK performs the grab itself. On a `poseOnly` grab of an entity with `PhysicsBody` and `PhysicsShape` in a world running `PhysicsSystem`, from 0.1.1, the port holds the body: `beginHold` removes `PhysicsBody` so the entity follows the hand, `endHold` restores it at its previous state and applies the release velocity through `PhysicsManipulation`, and a not-held `setWorldPose` teleports through `PhysicsSystem.setBodyTransform`. The body is recreated one physics tick after release |
| Physics | `IWSDKPhysicsFacility`, over IWSDK's own `PhysicsBody`, `PhysicsShape`, `PhysicsManipulation` and `PhysicsSystem`, Havok underneath |
| Pointer drawing | `IWSDKPointerVisuals` applies the app's pointer display settings to IWSDK's own `RayPointer` and `CursorVisual` |
| Eye gaze | The provider reports `eyeGaze` when the session carries a gaze input source and reads IWSDK's own sampled eye pose |

## Install

```sh
npm install @realitycollective/iwsdk-interactions @iwsdk/core
```

Peer dependencies: `@iwsdk/core >=1.0.0 <2.0.0`, `@iwsdk/xr-input >=1.0.0 <2.0.0` and `three >=0.170.0`. Every IWSDK application already carries all three. The adapter is built and tested against IWSDK 1.0.0. Up to 0.1.0 the ranges were `>=0.5.0 <0.6.0`, so an app on IWSDK 0.5 stays on 0.1.0.

This adapter is the reference implementation of the family. Every rule it applies through IWSDK, the resolution order of hints, poke and ray, the 0.1 m default target radius, sampling nothing while the world is not visible, a controller's index tip at its ray origin, the presence rules and the held pose, is stated in the core and held on the three.js, Babylon.js, XR Blocks and native adapters by the shared conformance suites. A platform never decides a behaviour this adapter has not.

## Setup

```ts
import { registerInteractions } from "@realitycollective/iwsdk-interactions";

const interactions = registerInteractions(world, { nativeGrab: true });

interactions.register({ id: "handle", behaviours: [{ kind: "grab" }] }, entity);
```

`registerInteractions` is idempotent per world and registers the bridge system for you. IWSDK drives the render loop, so there is no `update(dt)` call to make.

## What it adds over the core

Provider power: IWSDK's own hit-testing and tag resolution stand in for the core's ray and proximity queries wherever IWSDK has already answered, so targeting is exact rather than approximate. `nativeGrab: true` turns on native carry-and-throw fulfilment for the `grab` behaviour, matching whatever IWSDK grabbing or physics the app already has enabled.

## Physics

`registerInteractions` builds an `IWSDKPhysicsFacility` over the world, so the platform's physics needs no setup beyond IWSDK's own `features.physics`. `interactions.physics` is that facility. Pass `physics` with a `PhysicsFacility` of your own to replace it. `register` takes a `body` and a `shape` spec, with IWSDK's defaults described in [the physics facility](./01-core.md#the-physics-facility), and adds `PhysicsBody` and `PhysicsShape` to the entity at its current world pose:

```ts
interactions.register({ id: "ball", behaviours: [{ kind: "grab" }] }, ballEntity, {
  body: { state: "dynamic" },
  shape: { kind: "sphere", dimensions: [0.05, 0, 0] },
});
```

An entity the app already gave `PhysicsBody` and `PhysicsShape` needs neither option, and its port still holds it as above. The hold never touches the `Grabbed` tag, which IWSDK's grab system owns, and never the private Havok handle. A world created with `features.physics` off works unchanged: `register` and the facility treat the unregistered components as absent.

## Pointer drawing and the shared pointer

IWSDK draws its own pointer, so `IWSDKPointerVisuals` draws nothing. It applies the app's settings to IWSDK's `RayPointer`, the display mode and the length, and to its `CursorVisual`. It also hides the ray or the cursor where the core's drawing says not to show it. It never shows what IWSDK hid. `registerInteractions({ pointers, pointerDisplay, pointerVisuals })` takes the shared `PointerArbiter`, the settings, and `pointerVisuals: false` to leave IWSDK's visuals alone. See [Targeting, gaze and capabilities](../basics/04-targeting-gaze-and-capabilities.md). The near-pointer distances are IWSDK's own, so this adapter has no `nearPointer` option.

## Eye gaze

`IWSDKInputProvider` reports `eyeGaze` when the session carries a gaze input source. It reads IWSDK's own sampled eye pose, `xrOrigin.eyeSpace`, while `gazeOrigin` is `"tracked"`, and applies the shared filter, so it hands far targeting to gaze exactly when IWSDK's `GazePointer` does. The entity hit tester answers `hitCone` over its spheres. `eyeGaze` in `registerInteractions` tunes both the provider and the runtime's cone, window and suppression.

## What it cannot do on this host, and why

Nothing is withheld deliberately; the adapter passes through everything IWSDK itself exposes, and presence is full because IWSDK builds the hand and controller models it shows and hides.

## Presence and haptics

`setPresenceVisible(target, visible)` shows or hides either side; `setPresenceModality("hands" | "controllers" | "auto")` forces the family shown, overriding IWSDK's automatic choice. Haptics fire through IWSDK's own gamepad actuators.

## Testing it

Covered against a structural fake `World`, with no `@iwsdk/core` module mocking needed since the package imports headlessly in Node. A shared suite runs the same contract cases against all five platforms' providers and ports, this one included. Tests drive IWSDK's own `FilteredEyeGaze`, `GazeConecaster` and pointer classes beside the core's rules, and replay recorded traces through this binding.

## Live demo

<DemoLink demo="interactions" />, the full station set, mouse-capable on desktop, with a VR button for headsets.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Velocity and presence](../features/01-velocity-and-presence.md)
- [Interaction playground example](../examples/01-interaction-playground.md)
- [API reference](pathname:///webxr/api/interactions/)
