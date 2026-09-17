---
sidebar_position: 1
sidebar_label: Welcome to WebXR UI Extensions
title: Welcome to WebXR UI Extensions
description: Movable windows, dock regions, hand menus and controls for a WebXR scene, installed as one Meta IWSDK or XR Blocks adapter.
---

# Welcome to WebXR UI Extensions

WebXR UI Extensions gives a WebXR scene movable, resizable windows, dock regions, hand menus and a small set of controls, defined once and driven the same way on every supported engine.

## Overview

The engine-free core, `@realitycollective/webxr-uiextensions`, owns every user-experience decision: window lifecycle, dock state, region layout, drag maths, hold-to-drag timing, hand-menu placement and the control models. It imports no 3D engine, so those decisions apply unchanged wherever they run. An engine adapter is the only place an engine name appears: it turns UIKitML, an HTML and CSS-like markup language for spatial panels, into a live panel, delivers pointer and hand input into the core, and supplies the viewer pose. Where a host genuinely cannot do something, the adapter reports it rather than staying silent: `WindowHost.supportsStandalonePanels` says whether a bare panel is even possible on that host, and `createPanel` throws where it is not.

Start with the [introduction](./basics/01-introduction.md) for the concepts, or jump to the [quickstart](#quickstart) below.

## Requirements

- Node 20 or newer for tooling; the packages themselves run in any modern browser with WebXR.
- A bundler of your choice; the demos use Vite.
- TypeScript is recommended but not required; the packages ship type declarations.

Current release: `0.1.0` on npm, resolved by a bare `npm install`.

### Packages

| Package | What it is | Peers |
| --- | --- | --- |
| `@realitycollective/webxr-uiextensions` | Engine-free core: window manager, dock state, region layout, drag maths, control models and the adapter contract | `@realitycollective/webxr-input` |
| `@realitycollective/iwsdk-uiextensions` | Meta IWSDK adapter, the reference implementation, with the full feature set | `@iwsdk/core >=0.5.0 <0.6.0`, `three >=0.170.0` |
| `@realitycollective/xrblocks-uiextensions` | Google XR Blocks and plain three.js adapter, experimental | `three >=0.170.0` |
| `@realitycollective/uix-devtools` | Developer-only tooling: an edit-session gate, runtime UIKitML compilation and the `uix-dev` CLI | none; installed as a `devDependency` |

Each adapter re-exports the whole core, so an app installs one package:

```sh
# Meta IWSDK apps (core re-exported)
npm install @realitycollective/iwsdk-uiextensions

# Google XR Blocks / plain three.js apps (core re-exported, experimental)
npm install @realitycollective/xrblocks-uiextensions three

# Writing headless logic, tests, or a new engine adapter
npm install @realitycollective/webxr-uiextensions

# Developer tooling, dev dependency only, never shipped
npm install --save-dev @realitycollective/uix-devtools
```

## Use cases

- a status or inventory window that follows the player, or docks into a console wall
- a body-locked toolbar built from a dock region that follows the player
- a hand-locked menu that shows only while a palm faces the viewer
- a stepper, toggle or scrolling log wired into a panel with a few lines of markup
- an in-headset live-edit loop for iterating on UIKitML without a rebuild, through `uix-devtools`

## Quickstart

Three pieces on the reference Meta IWSDK adapter: register the adapter, describe a window, then drive it from code.

### 1. Register the adapter

```ts
import { World } from '@iwsdk/core';
import { registerUIExtensions, createSceneHost } from '@realitycollective/iwsdk-uiextensions';

const world = await World.create(container, { features: { spatialUI: true } });
const windows = registerUIExtensions(world);
const host = createSceneHost(world);
```

`World` is IWSDK's entity-component-system container; `registerUIExtensions` registers every system the adapter needs and returns the `WindowManager`.

### 2. Describe and create a window

```ts
import { DockMode } from '@realitycollective/iwsdk-uiextensions';

const status = host.createWindow({
  id: 'status',
  title: 'Player Status',
  config: './ui/status.uikitml',
  dockMode: DockMode.BodyFollow,
  pinnable: true,
});
```

Every title-bar button, pin, dock, minimise and close, is off unless the window options ask for it.

### 3. Drive the window from code

```ts
status.onReady((panel) => panel.getElementById('uix-title'));
windows.togglePin('status');
windows.setChrome('status', { close: true });
```

Panels load asynchronously, so wait for `onReady` before reaching into a panel's elements. [Getting started](./basics/02-getting-started.md) walks through this in detail, including what changes on the XR Blocks and three.js adapter.

## Examples and runnable apps

| App | What it shows | Live |
| --- | --- | --- |
| Showcase | Six windows and two dock regions across the whole surface, on the IWSDK and desktop three.js pipelines | <DemoLink demo="uiShowcase" /> |
| Multiplatform lab | The same playground, picking IWSDK, XR Blocks or desktop three.js from the hardware | <DemoLink demo="uiLab" /> |
| Devtools playground | The showcase scene plus the edit gate and an in-headset UX Editor | not deployed; run it locally |

```sh
npm run dev:showcase          # from the workspace root -> http://localhost:8081
npm run dev:multiplatform     # the engine-picking demo, ?uix-engine= to force one
npm run dev:playground        # the devtools playground, edit gate open in dev
```

## What this stack is and is not

The Reality Collective WebXR packages aim at one outcome: an app's windows, docking and controls should not care which engine hosts them. The core, `@realitycollective/webxr-uiextensions`, ships engine-free, and the IWSDK and XR Blocks adapters are thin translations of the same decisions. When an app still has to reach into the host directly, either a contract is missing, which is a bug to report, or the app is overreaching.

Portable world-building is not a current promise. A `SceneDescriptor` lets this family's own windows and regions be authored as portable data, but scene content, meshes, prefabs and placement, is still built by the app. A shared content descriptor across families is only worth considering once a second host is actually targeted for that kind of portability.

## Feedback

Questions and problems go to the [issue tracker](https://github.com/realitycollective/WebXR-UIExtensions/issues).

## Documentation

- [Basics: Introduction](./basics/01-introduction.md), [Hand menus](./basics/05-hand-menus.md) and the rest of the [Basics](/webxr/docs/uiextensions/basics) section, one page per topic
- [Features: Developer cycle](./features/01-developer-cycle.md), [Near touch](./features/02-near-touch.md) and [Design and decisions](./features/03-design-and-decisions.md), in [Features](/webxr/docs/uiextensions/features)
- [Host integrations: Core](./integrations/01-core.md), one page per npm package, in [Host integrations](/webxr/docs/uiextensions/integrations)
- [Examples: Showcase](./examples/01-showcase.md), and the rest of the [Examples](/webxr/docs/uiextensions/examples) section
- [WebXR UI Extensions overview](/webxr/uiextensions)
