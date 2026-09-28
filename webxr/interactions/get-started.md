---
sidebar_position: 1
sidebar_label: Welcome to WebXR Interactions
title: Welcome to WebXR Interactions
description: Buttons, levers, dials and grabbable objects that behave the same way across three.js, Babylon.js, IWSDK, XR Blocks and native XR apps.
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

Current release: `0.1.0` on npm, resolved by a bare `npm install`.

:::note Preview
The native adapter, the held pose, the IWSDK 1.0 reference and the platform synchronisation of 28 September 2026 are working extensions in `0.1.1-preview.2`, installed with `@preview`. Previews show where the family is heading and are not supported.
:::

### Packages

| Package | What it is | Peers |
| --- | --- | --- |
| `@realitycollective/webxr-input` | The shared, engine-free input contracts this whole family is built on | None |
| `@realitycollective/webxr-interactions` | The core: behaviours, targeting, gaze, capability checks, events and feedback, with no engine code | Depends on `@realitycollective/webxr-input` |
| `@realitycollective/threejs-interactions` | Adapter for plain three.js and raw WebXR; the default, standalone choice | `three >= 0.170.0`; optional `three-mesh-bvh >= 0.9.14` |
| `@realitycollective/babylon-interactions` | Adapter for Babylon.js, matched structurally to the API | None |
| `@realitycollective/iwsdk-interactions` | Adapter for Meta's Immersive Web SDK, the reference implementation | `@iwsdk/core >=0.5.0 <0.6.0`, `@iwsdk/xr-input >=0.5.0 <0.6.0`, `three >=0.170.0` |
| `@realitycollective/xrblocks-interactions` | Adapter for Google's XR Blocks, matched structurally to the API | `three >= 0.170.0` |

:::note Preview
In `0.1.1-preview.2` the IWSDK adapter peers on `@iwsdk/core` and `@iwsdk/xr-input` `>=1.0.0 <2.0.0`, the XR Blocks adapter is matched to xrblocks 0.21.1 and gains haptics, an engine-owned grab and a RAPIER held pose, and `@realitycollective/native-interactions` joins, for a native OpenXR or visionOS app embedding a JavaScript engine such as Hermes, with no peers.
:::

Every adapter declares its core, and `@realitycollective/webxr-input`, as an npm dependency, so installing the adapter installs both, and the adapter re-exports their symbols in full.

```sh
# three.js, the default and standalone choice
npm install @realitycollective/threejs-interactions three

# Babylon.js
npm install @realitycollective/babylon-interactions

# Meta IWSDK
npm install @realitycollective/iwsdk-interactions @iwsdk/core

# Google XR Blocks
npm install @realitycollective/xrblocks-interactions three

# Native apps on OpenXR or visionOS, from 0.1.1 (preview)
npm install @realitycollective/native-interactions@preview
```

Writing a new adapter, or headless tests against your own interaction logic? Install the core directly instead:

```sh
npm install @realitycollective/webxr-interactions
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

The Reality Collective WebXR packages aim at one outcome: an app's logic, input handling, interactions and UI should not care which engine hosts them. Each family ships an engine-free core and one adapter per platform, here for Meta IWSDK, plain three.js and WebXR, Babylon.js, Google XR Blocks and native XR apps. The IWSDK adapter is the reference: every rule it applies is stated in the core and every other adapter is held to it by the shared conformance suites, so the same descriptor behaves the same way on every platform. When an app still has to reach into the host, either a contract is missing, which is a bug to report, or the app is overreaching. The physics simulation stays with the host engine: a `grab` behaviour suspends a physics body while it is held and hands the engine the release velocity, and on a host with no physics a thrown object's flight is the app's own code. Scene content stays with the app, and loading and switching scenes is the Environment family's scene manager.

## Feedback

Questions and problems go to the [Reality Collective Discord](https://discord.gg/YjHAQD2XT8) or the [issue tracker](https://github.com/realitycollective/WebXR-Interactions/issues).

## Documentation

- [Basics](./basics/01-introduction.md): the concepts, one page per topic
- [Features](./features/01-velocity-and-presence.md): velocity, presence, and design and decisions
- [Host integrations](./integrations/01-core.md): one page per npm package
- [Examples](./examples/01-interaction-playground.md): the interaction playground, station by station
- [Interactions overview](/webxr/interactions)
