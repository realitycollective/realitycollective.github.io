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
| Grab | Where the app has IWSDK grabbing enabled, IWSDK performs the grab itself. On a `poseOnly` grab of an entity with `PhysicsBody` and `PhysicsShape` in a world running `PhysicsSystem`, from 0.1.1-preview.1, the port holds the body: `beginHold` removes `PhysicsBody` so the entity follows the hand, `endHold` restores it at its previous state and applies the release velocity through `PhysicsManipulation`, and a not-held `setWorldPose` teleports through `PhysicsSystem.setBodyTransform`. The body is recreated one physics tick after release |

## Install

```sh
npm install @realitycollective/iwsdk-interactions @iwsdk/core
```

Peer dependencies: `@iwsdk/core >=0.5.0 <0.6.0`, `@iwsdk/xr-input >=0.5.0 <0.6.0` and `three >=0.170.0`. Every IWSDK application already carries all three.

:::note Preview
From `0.1.1-preview.2` the peer ranges are `@iwsdk/core >=1.0.0 <2.0.0` and `@iwsdk/xr-input >=1.0.0 <2.0.0`, built and tested against IWSDK 1.0.0.
:::

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

## What it cannot do on this host, and why

Nothing is withheld deliberately; the adapter passes through everything IWSDK itself exposes, and presence is full because IWSDK builds the hand and controller models it shows and hides.

## Presence and haptics

`setPresenceVisible(target, visible)` shows or hides either side; `setPresenceModality("hands" | "controllers" | "auto")` forces the family shown, overriding IWSDK's automatic choice. Haptics fire through IWSDK's own gamepad actuators.

## Testing it

Covered against a structural fake `World`, with no `@iwsdk/core` module mocking needed since the package imports headlessly in Node. A parity suite runs the same shared contract cases against all four adapters' providers, this one included.

## Live demo

<DemoLink demo="interactions" />, the full station set, mouse-capable on desktop, with a VR button for headsets.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Velocity and presence](../features/01-velocity-and-presence.md)
- [Interaction playground example](../examples/01-interaction-playground.md)
- [API reference](pathname:///webxr/api/interactions/)
