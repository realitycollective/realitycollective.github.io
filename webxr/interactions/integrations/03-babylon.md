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

Mesh-accurate targeting through `setPickWithRay`, and two Babylon-specific corrections it applies for you: Babylon's left-handed +Z forward, flipped automatically from `scene.useRightHandedSystem`, and writing rotations in place into a node's existing `Quaternion` rather than replacing it, which Babylon's own dirty-checking requires. From 0.1.1-preview.2 it follows the IWSDK reference where Babylon has no opinion: a controller's `indexTip` is its ray origin, so a controller pokes as a fingertip does; `sample()` reports no sources while a live session is not visible; and the `pulse` effect lights the target as well as scaling it, by scaling `material.emissiveColor` about its captured base on a `StandardMaterial` or a `PBRMaterial`, and adding to `emissiveIntensity` on a `PBRMaterial`, the same additive rule three.js follows.

## Held pose

From 0.1.1-preview.1. A node with a Physics V2 `physicsBody`, registered with Babylon's own motion types, grows `beginHold` and `endHold`:

```ts
import { PhysicsMotionType } from "@babylonjs/core";

interactions.register({ id: "ball", behaviours: [{ kind: "grab" }] }, ballMesh, {
  physicsMotionTypes: { animated: PhysicsMotionType.ANIMATED, dynamic: PhysicsMotionType.DYNAMIC },
});
```

While held the body is `ANIMATED` and follows the hand; on release it goes back to `DYNAMIC` with the hand's velocity; a `setWorldPose` while not held teleports and clears velocity. A node without a `physicsBody`, or registered without `physicsMotionTypes`, behaves exactly as before. The package does not depend on Babylon, so this is written from the Physics V2 documentation and tested against structural fakes; confirm it in a live scene before relying on it.

## What it cannot do on this host, and why

It cannot offer a hands and controllers modality switch: Babylon itself decides which visual belongs to which input source, so `setPresenceModality` always returns false. It has no engine-owned grab to report as a hint: Babylon's near interaction turns into pointer selects and its drag behaviours move a mesh by pose, so every grab here is pose-only. A node whose `rotationQuaternion` is still null, Euler-driven, which is Babylon's default, needs `createQuaternion` supplied at registration, or the first rotation write fails.

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
