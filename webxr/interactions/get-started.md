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

Current release: `0.1.1` on npm, resolved by a bare `npm install`. Every package in the family ships at that version and depends on `@realitycollective/webxr-input` `^0.1.8`.

### Packages

| Package | What it is | Peers |
| --- | --- | --- |
| `@realitycollective/webxr-input` | The shared, engine-free input contracts this whole family is built on | None |
| `@realitycollective/webxr-interactions` | The core: behaviours, targeting, gaze, near pointers, physics contract, capability checks, events and feedback, with no engine code | Depends on `@realitycollective/webxr-input` `^0.1.8` |
| `@realitycollective/threejs-interactions` | Adapter for plain three.js and raw WebXR; the default, standalone choice | `three >= 0.170.0`; optional `three-mesh-bvh >= 0.9.14` |
| `@realitycollective/babylon-interactions` | Adapter for Babylon.js, matched structurally to the API | None |
| `@realitycollective/iwsdk-interactions` | Adapter for Meta's Immersive Web SDK, the reference implementation | `@iwsdk/core >=1.0.0 <2.0.0`, `@iwsdk/xr-input >=1.0.0 <2.0.0`, `three >=0.170.0` |
| `@realitycollective/xrblocks-interactions` | Adapter for Google's XR Blocks, matched structurally to xrblocks 0.21.1 | `three >= 0.170.0` |
| `@realitycollective/native-interactions` | Adapter for a native OpenXR or visionOS app that embeds a JavaScript engine such as Hermes | None |

The IWSDK adapter is built and tested against IWSDK 1.0.0. The XR Blocks adapter fires haptics, reports XR Blocks' own grab and holds a RAPIER body during a grab. The native adapter reads the host object a native app installs and needs no engine package.

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

# Native apps on OpenXR or visionOS, from 0.1.1
npm install @realitycollective/native-interactions
```

Writing a new adapter, or headless tests against your own interaction logic? Install the core directly instead:

```sh
npm install @realitycollective/webxr-interactions
```

## Tested on a headset

A native app built with `@realitycollective/native-interactions` passed on a Meta Quest 3 on 1 October 2026. A person played it through the collective's own native pipeline, and the host conformance kit checked it. One known issue remains on native: grab does not yet work as it should. Pinch works as expected. The [native adapter page](./integrations/06-native.md) has the detail.

## Use cases

- a button, lever, dial or slider that should behave the same way whether the app runs on three.js, Babylon.js, IWSDK or XR Blocks
- a grabbable object, with the carry mode negotiated automatically from what the current headset can actually do
- a look-to-activate control for accessibility, with no hands needed, or a gaze-and-pinch control on a headset with eye tracking
- a fingertip poke on a button, one pointer per hand across objects and UI panels, and the ray and cursor drawn the same way on every platform
- a throw or toss-scoring mechanic that leaves the hand with the held object's velocity
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
| Interaction playground | The full station set, levers, a dial, a pulley, a gaze-dwell button and a grab-and-score toy, built from one portable descriptor on IWSDK, three.js, Babylon.js and XR Blocks | <DemoLink demo="interactions" /> |

```sh
npm ci
npm run dev:playground     # http://localhost:8082
```

## What this stack is and is not

The Reality Collective WebXR packages aim at one outcome: an app's logic, input handling, interactions and UI should not care which engine hosts them. Each family ships an engine-free core and one adapter per platform, here for Meta IWSDK, plain three.js and WebXR, Babylon.js, Google XR Blocks and native XR apps. The IWSDK adapter is the reference: every rule it applies is stated in the core and every other adapter is held to it by the shared conformance suites, so the same descriptor behaves the same way on every platform. When an app still has to reach into the host, either a contract is missing, which is a bug to report, or the app is overreaching. The physics simulation stays with the platform's engine, which every adapter reaches through one `PhysicsFacility` contract: a `grab` behaviour suspends an object's physics body while it is held and hands the engine the release velocity. An object registered with no body rests where it is released, and its flight after that is the app's own code. Scene content stays with the app, and loading and switching scenes is the Environment family's scene manager.

## Feedback

Questions and problems go to the [Reality Collective Discord](https://discord.gg/YjHAQD2XT8) or the [issue tracker](https://github.com/realitycollective/WebXR-Interactions/issues).

## Documentation

- [Basics](./basics/01-introduction.md): the concepts, one page per topic
- [Features](./features/01-velocity-and-presence.md): velocity, presence, and design and decisions
- [Host integrations](./integrations/01-core.md): one page per npm package
- [Examples](./examples/01-interaction-playground.md): the interaction playground, station by station
- [Interactions overview](/webxr/interactions)
