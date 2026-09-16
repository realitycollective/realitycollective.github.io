---
sidebar_position: 2
title: Getting started
description: Install one adapter, create a runtime, describe a button and subscribe to its events, with a desktop mouse fallback.
---

# Getting started

This walkthrough uses the three.js adapter, the default and standalone choice: no other framework is required, and it runs equally well in a browser tab as in a headset.

## Install an adapter

```sh
npm install @realitycollective/threejs-interactions@preview three
```

The adapter re-exports the core package wholesale, so this is the only interaction package the app depends on. Every preview family, including this one, installs from the `@preview` dist-tag.

## Create the runtime

```ts
import { createThreeInteractions } from "@realitycollective/threejs-interactions";

const interactions = createThreeInteractions({
  xr: renderer.xr,
  camera,
  domElement: renderer.domElement,
});
```

## Describe a button

An interactable is described as data: an id and the behaviours it carries. `press` is the simplest behaviour, a mechanical button.

```ts
interactions.register(
  { id: "button", behaviours: [{ kind: "press" }] },
  buttonMesh,
);
```

## Subscribe to events

The core never calls into your code. It emits events, and the app subscribes.

```ts
interactions.runtime.onEvent((event) => {
  if (event.type === "actuated") console.log("pressed");
});
```

## Run the frame loop

```ts
let last = performance.now();
renderer.setAnimationLoop(() => {
  const now = performance.now();
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  interactions.update(dt);
  renderer.render(scene, camera);
});
```

## Run on desktop with the mouse fallback

When no immersive session is live, the three.js adapter falls back to a mouse ray cast from the camera through the cursor, so the same scene is testable without a headset. A mouse has no grip position of its own, so the adapter synthesises one along the ray, at `desktopGripDistance` metres out (1 metre by default). Set this near the distance of the things you are manipulating. The mouse source reports `handedness: "none"`, which is not a real hand: gate any hand-driven mechanics, such as a throw, on `handedness !== "none"`.

## What changes for the other adapters

Every adapter follows the same shape: a one-call setup function, a `register(descriptor, object)` method, and events through `interactions.runtime.onEvent`. Babylon takes a `scene` and an `xr` experience instead of a renderer. IWSDK drives its own render loop, so there is no `update(dt)` call to make. XR Blocks is set up inside a Script's `init()` rather than at module scope.

## More information

- [Behaviours](./03-behaviours.md)
- [three.js adapter](../integrations/02-threejs.md)
- [Babylon.js adapter](../integrations/03-babylon.md)
- [Meta IWSDK adapter](../integrations/04-iwsdk.md)
- [Google XR Blocks adapter](../integrations/05-xrblocks.md)
