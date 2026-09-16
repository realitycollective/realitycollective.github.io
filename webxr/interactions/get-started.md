---
sidebar_position: 1
sidebar_label: Welcome to WebXR Interactions
title: Welcome to WebXR Interactions
description: Buttons, levers, dials and grabbable objects that behave the same way across three.js, Babylon.js, IWSDK and XR Blocks.
---

# Welcome to WebXR Interactions

WebXR Interactions adds interactive objects to a WebXR scene: buttons, levers, dials and things you can pick up. An **interactable** is one of those objects; an **interactor** is what interacts with it, a hand, a controller, a pointing ray or a desktop mouse. The interaction logic carries no 3D engine code; you install one adapter for the engine you already use, and that adapter feeds the shared logic.

## Overview

The core package, `@realitycollective/webxr-interactions`, holds every piece of interaction logic: behaviours, targeting, gaze, capability checks, events and feedback intents. It never imports an engine. An **adapter** is the only place an engine name is allowed to appear. It reads the engine's raw input, resolves what a ray or a touch hits in the scene, and writes the position and rotation changes back onto the engine's own objects.

Start with the [introduction](./basics/01-introduction.md) for the concepts, or jump to the [quickstart](#quickstart) below.

## Requirements

- Node 20 or newer for tooling. The packages themselves run in any modern browser with WebXR; the three.js and XR Blocks adapters also run on desktop through a mouse fallback.
- A bundler or framework of your choice.
- TypeScript is recommended but not required; the packages ship type declarations.

Current release: `0.1.0`, a preview installed under the `preview` dist-tag.

### Packages

| Package | What it is | Peers |
| --- | --- | --- |
| `@realitycollective/webxr-input` | The shared, engine-free input contracts this whole family is built on | None |
| `@realitycollective/webxr-interactions` | The core: behaviours, targeting, gaze, capability checks, events and feedback, with no engine code | Depends on `@realitycollective/webxr-input` |
| `@realitycollective/threejs-interactions` | Adapter for plain three.js and raw WebXR; the default, standalone choice | `three >= 0.170.0`; optional `three-mesh-bvh >= 0.9.14` |
| `@realitycollective/babylon-interactions` | Adapter for Babylon.js, matched structurally to the API | None |
| `@realitycollective/iwsdk-interactions` | Adapter for Meta's Immersive Web SDK | `@iwsdk/core >=0.5.0 <0.6.0`, `@iwsdk/xr-input >=0.5.0 <0.6.0`, `three >=0.170.0` |
| `@realitycollective/xrblocks-interactions` | Adapter for Google's XR Blocks, matched structurally to the API | `three >= 0.170.0` |

Every adapter declares its core, and `@realitycollective/webxr-input`, as an npm dependency, so installing the adapter installs both, and the adapter re-exports their symbols in full.

```sh
# three.js, the default and standalone choice
npm install @realitycollective/threejs-interactions@preview three

# Babylon.js
npm install @realitycollective/babylon-interactions@preview

# Meta IWSDK
npm install @realitycollective/iwsdk-interactions@preview @iwsdk/core

# Google XR Blocks
npm install @realitycollective/xrblocks-interactions@preview three
```

Writing a new adapter, or headless tests against your own interaction logic? Install the core directly instead:

```sh
npm install @realitycollective/webxr-interactions@preview
```

## Use cases

- a button, lever, dial or slider that should behave the same way whether the app runs on three.js, Babylon.js, IWSDK or XR Blocks
- a grabbable object, with the carry mode negotiated automatically from what the current headset can actually do
- a look-to-activate control for accessibility, with no hands needed
- a throw or toss-scoring mechanic driven from measured grip velocity
- headless tests of your own interaction logic, with no renderer or browser involved

## Quickstart

Three steps, using the three.js adapter, the default and standalone choice.

### 1. Install the adapter and create the runtime

```ts
import { createThreeInteractions } from "@realitycollective/threejs-interactions";

const interactions = createThreeInteractions({
  xr: renderer.xr,
  camera,
  domElement: renderer.domElement,
});
```

### 2. Describe an interactable and subscribe to events

```ts
interactions.register(
  { id: "button", behaviours: [{ kind: "press" }] },
  buttonMesh,
);

interactions.runtime.onEvent((event) => {
  if (event.type === "actuated") console.log("pressed");
});
```

### 3. Run the frame loop

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

IWSDK drives its own render loop, so its setup skips this step. [Getting started](./basics/02-getting-started.md) covers every adapter's setup in full, including the desktop mouse fallback.

## Examples and runnable apps

| App | What it shows | Live |
| --- | --- | --- |
| Interaction playground | The full station set, levers, a dial, a pulley, a gaze-dwell button and a grab-and-score toy, built from one portable descriptor | <DemoLink demo="interactions" /> |

```sh
npm ci
npm run dev:playground     # http://localhost:8082
```

## What this stack is and is not

The Reality Collective WebXR packages aim at one outcome: an app's logic, input handling, interactions and UI should not care which engine hosts them. Each family ships an engine-free core and thin adapters, here for Meta IWSDK, plain three.js and WebXR, Babylon.js and Google XR Blocks. When an app still has to reach into the host, either a contract is missing, which is a bug to report, or the app is overreaching. Physics and ballistics stay with the app: a `grab` behaviour only ever reports a pickup and a release, never a thrown object's flight afterwards. Portable scene and content building beyond the shared `InteractionDescriptor` is not a current promise.

## Feedback

Questions and problems go to the [Reality Collective Discord](https://discord.gg/YjHAQD2XT8) or the [issue tracker](https://github.com/realitycollective/WebXR-Interactions/issues).

## Documentation

- [Basics](./basics/01-introduction.md): the concepts, one page per topic
- [Features](./features/01-velocity-and-presence.md): velocity, presence, and design and decisions
- [Host integrations](./integrations/01-core.md): one page per npm package
- [Examples](./examples/01-interaction-playground.md): the interaction playground, station by station
- [Interactions overview](/webxr/interactions)
