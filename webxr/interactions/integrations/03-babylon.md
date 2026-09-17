---
sidebar_position: 3
title: "Babylon.js: @realitycollective/babylon-interactions"
description: The Babylon.js adapter, matched structurally to the Babylon API with no @babylonjs/core dependency.
---

# Babylon.js: @realitycollective/babylon-interactions

:::warning
Not yet exercised against a real Babylon runtime. The adapter is written against the documented Babylon 7 API and covered by structural fakes. Treat it as a preview until it has run inside a Babylon app.
:::

## What it binds

| Layer | Detail |
| --- | --- |
| Input | A `WebXRDefaultExperience`: controllers, motion controller trigger and squeeze, hand-tracking joints, the session manager for what is live, with `scene.onPointerObservable` as the desktop fallback |
| Hit-testing | A sphere test over registered nodes, or the app's own `scene.pickWithRay` through the `pickWithRay` hook for mesh-accurate targeting |
| Movement | Moves, rotates and scales Babylon nodes for grab, hinge, dial and slide |

## Install

```sh
npm install @realitycollective/babylon-interactions
```

No peer dependency. Babylon is matched structurally rather than imported, so any Babylon version whose objects carry the members this adapter reads will work.

## Setup

```ts
import { createBabylonInteractions } from "@realitycollective/babylon-interactions";

const xr = await scene.createDefaultXRExperienceAsync();
const interactions = createBabylonInteractions({ scene, xr, attachToScene: true });

interactions.register({ id: "button", behaviours: [{ kind: "press" }] }, buttonMesh);
```

`attachToScene` drives the update loop from `scene.onBeforeRenderObservable`; leave it off and call `interactions.update(dt)` from your own loop.

## What it adds over the core

Mesh-accurate targeting through `setPickWithRay`, and two Babylon-specific corrections it applies for you: Babylon's left-handed +Z forward, flipped automatically from `scene.useRightHandedSystem`, and writing rotations in place into a node's existing `Quaternion` rather than replacing it, which Babylon's own dirty-checking requires.

## What it cannot do on this host, and why

It cannot offer a hands and controllers modality switch: Babylon itself decides which visual belongs to which input source, so `setPresenceModality` always returns false. A node whose `rotationQuaternion` is still null, Euler-driven, which is Babylon's default, needs `createQuaternion` supplied at registration, or the first rotation write fails.

## Presence and haptics

Presence shows and hides what Babylon already built, motion controller root meshes and hand meshes, once Babylon has built one to hide. Haptics fire through the motion controller's own `pulse`.

## Testing it

Covered entirely by structural fakes: a fake scene, `WebXRDefaultExperience` and node objects that match the shape this adapter reads, with no `@babylonjs/core` in the test dependency tree.

## Live demo

<DemoLink demo="interactions" />, the three.js build of the same station set; Babylon has no separate deployed demo yet.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Velocity and presence](../features/01-velocity-and-presence.md)
- [Roadmap](../basics/07-roadmap.md)
- [API reference](pathname:///webxr/api/interactions/)
