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
| Grab | Where the app has IWSDK grabbing or physics enabled, IWSDK performs the grab itself |

## Install

```sh
npm install @realitycollective/iwsdk-interactions@preview @iwsdk/core
```

Peer dependencies: `@iwsdk/core >=0.5.0 <0.6.0`, `@iwsdk/xr-input >=0.5.0 <0.6.0` and `three >=0.170.0`. Every IWSDK application already carries all three.

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
