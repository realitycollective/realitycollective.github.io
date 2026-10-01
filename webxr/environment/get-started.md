---
sidebar_position: 1
sidebar_label: Welcome to WebXR Environment
title: Welcome to WebXR Environment
description: Sky, fog, lighting, image-based lighting and audio for a WebXR scene, described as data and applied by one engine adapter.
---

# Welcome to WebXR Environment

WebXR Environment describes the world around the player, sky, fog, light and sound, as plain data, and applies that description through a thin adapter for whichever engine hosts your app.

## Overview

Every slot in an environment is a platform facility: something the host engine exposes, and exposes differently. Three.js has `scene.background` and `Fog`; Meta's Immersive Web SDK has `DomeGradient` and `AmbientLightComponent`. The engine-free core, `@realitycollective/webxr-environment`, holds the environment and audio logic as plain data with no dependencies at all; an adapter is the only place an engine name appears, translating that data onto three.js, IWSDK, Google XR Blocks or, from 0.1.1, a native app. From 0.1.1 it also manages scenes inside one session: a scene list, single and additive loads, preloading and persistent nodes, with the active scene driving the environment. Content is never here: meshes, prefabs and placement stay with the app, and the scene manager loads a scene without reading it. Sensor-backed features, occlusion, light estimation, planes, meshes, anchors and hit tests, report `unsupported`, `unavailable`, `pending` or `active` rather than failing silently.

Start with the [introduction](./basics/01-introduction.md) for the concepts, or jump to the [quickstart](#quickstart) below.

## Requirements

- Node 20 or newer for tooling; the packages themselves run in any modern browser.
- Any modern browser with WebXR for headsets; a passthrough or hit-test feature also needs a session that requests it.
- TypeScript is recommended but not required; the packages ship type declarations.

Current release: `0.1.1` on npm, resolved by a bare `npm install`.

### Packages

Every package ships at `0.1.1`.

| Package | What it is | Peers |
| --- | --- | --- |
| `@realitycollective/webxr-environment` | Engine-free core: the `EnvironmentDirector`, `WorldSensingDirector`, `AudioDirector` and `SceneManager`, and the ports an adapter implements, with no dependencies at all | none |
| `@realitycollective/threejs-environment` | Adapter for plain three.js and raw WebXR | `three >=0.170.0` |
| `@realitycollective/iwsdk-environment` | Adapter for Meta IWSDK, the reference implementation, driving IWSDK's own environment, lighting and audio machinery | `@iwsdk/core >=1.0.0 <2.0.0`, `three >=0.170.0` |
| `@realitycollective/xrblocks-environment` | Experimental adapter for Google XR Blocks, builds on the three.js adapter | `three >=0.170.0`, an XR Blocks build to hand in |
| `@realitycollective/native-environment` | Adapter for a native app on OpenXR or visionOS that embeds a JavaScript engine such as Hermes | none |

If you are upgrading from `0.1.0`, the IWSDK adapter now peers on IWSDK 1.0 instead of `>=0.5.0 <0.6.0`. Scene management and the native adapter are new.

Install exactly one adapter; each one re-exports the core, so you never install the core yourself:

```sh
# Plain three.js and raw WebXR apps
npm install @realitycollective/threejs-environment three

# Meta IWSDK apps
npm install @realitycollective/iwsdk-environment

# Google XR Blocks apps, experimental
npm install @realitycollective/xrblocks-environment three

# Native apps on OpenXR or visionOS
npm install @realitycollective/native-environment
```

## Use cases

- a day-to-night or weather system that eases the sky, fog and both lights together on one curve
- passthrough that suppresses the sky and fog while the real world is showing, and restores them unchanged afterwards
- letting the host's own light estimation take over ambient, key and reflections while it is measuring
- a music, ambience and UI sound mix with per-bus and master gain, muted independently of level
- spawning content onto a real surface once world sensing reports a new plane
- moving between levels or stages inside one session, with a HUD that survives the change and the next level preloaded behind a fade

## Quickstart

Three steps on the three.js adapter: create the director, apply or ease to a preset, then tick it from the render loop.

### 1. Create the director

```ts
import { createThreeEnvironment, STOCK_PRESETS } from "@realitycollective/threejs-environment";

const { director } = createThreeEnvironment(scene, {
  presets: STOCK_PRESETS,
  initial: STOCK_PRESETS.noon,
  defaultTransition: { durationMs: 4000, easing: "easeInOut" },
});
```

`STOCK_PRESETS` ships six example environments, `void`, `dawn`, `noon`, `dusk`, `night` and `overcast`, to copy and edit rather than build on forever.

### 2. Apply or transition a preset

```ts
director.apply("noon");
director.transition("dusk", { durationMs: 8000, easing: "easeInOut" });
```

Starting a new transition while one is running eases from where the environment is now, so interrupting a dusk halfway never jumps.

### 3. Tick it from the render loop

```ts
renderer.setAnimationLoop(() => {
  director.update(clock.getDelta() * 1000);
  renderer.render(scene, camera);
});
```

The director owns no loop of its own; [getting started](./basics/02-getting-started.md) covers audio, and what changes on the IWSDK and XR Blocks adapters.

## Examples and runnable apps

| App | What it shows | Live |
| --- | --- | --- |
| Environment playground | Preset transitions, a passthrough toggle, live bus and master sliders, and the sensing report panel | <DemoLink demo="environment" /> |

```sh
npm run dev:playground     # from the workspace root -> http://localhost:8083, VR button for headsets
```

No audio file ships with the repository; the demo points at `public/audio/hum.mp3` and logs one warning if it is absent.

## What this stack is and is not

The Reality Collective WebXR packages aim at one outcome: an app's environment and sound should not care which engine hosts them. The core ships with no dependencies at all, and the three.js, IWSDK, XR Blocks and native adapters are thin translations of the same directors, with the IWSDK adapter as the reference every other one is held to by the shared conformance suites. When an app still has to reach into the host directly, either a contract is missing, which is a bug to report, or the app is overreaching.

Content is never built here. Meshes, prefabs, placement and floors belong to the app, and the stock presets are examples to copy in a project's first five minutes, not a view on how any world should look. Portable world-building beyond this family's own slots is not a current promise, and a shared content descriptor is only worth considering once a second host is actually targeted for that kind of portability.

## Feedback

Questions and problems go to the [issue tracker](https://github.com/realitycollective/WebXR-Environment/issues).

## Documentation

- [Basics: Introduction](./basics/01-introduction.md), and the rest of the [Basics](/webxr/docs/environment/basics) section, one page per topic
- [Features: Sensing](./features/01-sensing.md) and [Design and decisions](./features/02-the-boundary.md), in [Features](/webxr/docs/environment/features)
- [Host integrations: Core](./integrations/01-core.md), one page per npm package, including [Native](./integrations/05-native.md), in [Host integrations](/webxr/docs/environment/integrations)
- [Examples: Environment playground](./examples/01-environment-playground.md), in [Examples](/webxr/docs/environment/examples)
- [WebXR Environment overview](/webxr/environment)
