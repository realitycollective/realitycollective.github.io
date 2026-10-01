---
sidebar_position: 1
sidebar_label: Welcome to WebXR UI Extensions
title: Welcome to WebXR UI Extensions
description: Movable windows, dock regions, hand menus and controls for a WebXR scene, installed as one Meta IWSDK, three.js, XR Blocks or native adapter.
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

Current release: `0.1.1` on npm, resolved by a bare `npm install`.

### Packages

Every package ships at `0.1.1`.

| Package | What it is | Peers and dependencies |
| --- | --- | --- |
| `@realitycollective/webxr-uiextensions` | Engine-free core: window manager, dock state, region layout, drag maths, follow and placement rules, hover, scroll and text entry rules, control models and the adapter contract | depends on `@realitycollective/webxr-input` `^0.1.8` |
| `@realitycollective/iwsdk-uiextensions` | Meta IWSDK adapter, the reference implementation, with the full feature set | `@iwsdk/core >=1.0.0 <2.0.0`, `three >=0.170.0`; depends on `@pmndrs/handle` `^6.6.16` |
| `@realitycollective/threejs-uiextensions` | Plain three.js and WebXR adapter, with the same window host, pointer rules and cursor as IWSDK over `@pmndrs/uikit` | `three >=0.170.0`; depends on `@pmndrs/uikit` `^1.0.76` and `@pmndrs/uikitml` `^0.1.12` |
| `@realitycollective/xrblocks-uiextensions` | Google XR Blocks adapter, experimental: a thin subclass of the three.js adapter that reads XR Blocks' own input callbacks | `three >=0.170.0`; depends on `@pmndrs/uikit` `^1.0.76` and `@pmndrs/uikitml` `^0.1.12` |
| `@realitycollective/native-uiextensions` | Native adapter, for an OpenXR or visionOS app that embeds a JavaScript engine such as Hermes | none |
| `@realitycollective/uix-devtools` | Developer-only tooling: an edit-session gate, runtime UIKitML compilation and the `uix-dev` CLI | none; installed as a `devDependency` |

If you are upgrading from `0.1.0`, the IWSDK adapter now peers on IWSDK 1.0 instead of `>=0.5.0 <0.6.0`, and the three.js and native adapters are new.

Each adapter re-exports the whole core, so an app installs one package:

```sh
# Meta IWSDK apps (core re-exported)
npm install @realitycollective/iwsdk-uiextensions

# Plain three.js and WebXR apps (core re-exported), from 0.1.1
npm install @realitycollective/threejs-uiextensions three

# Google XR Blocks apps (core re-exported, experimental)
npm install @realitycollective/xrblocks-uiextensions three

# Native apps on OpenXR or visionOS (core re-exported), from 0.1.1
npm install @realitycollective/native-uiextensions

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

Panels load asynchronously, so wait for `onReady` before reaching into a panel's elements. [Getting started](./basics/02-getting-started.md) walks through this in detail, including what changes on the three.js and XR Blocks adapters.

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

The Reality Collective WebXR packages aim at one outcome: an app's windows, docking and controls should not care which engine hosts them. The core, `@realitycollective/webxr-uiextensions`, ships engine-free, and the IWSDK, three.js, XR Blocks and native adapters are provable translations of the same decisions: every rule lives in the core, the IWSDK adapter is the reference, and each other adapter is held to it by the shared conformance suites. When an app still has to reach into the host directly, either a contract is missing, which is a bug to report, or the app is overreaching.

Portable world-building is not a current promise. A `SceneDescriptor` lets this family's own windows and regions be authored as portable data, but scene content, meshes, prefabs and placement, is still built by the app. A shared content descriptor across families is only worth considering once a second host is actually targeted for that kind of portability.

## Feedback

Questions and problems go to the [issue tracker](https://github.com/realitycollective/WebXR-UIExtensions/issues).

## Documentation

- [Basics: Introduction](./basics/01-introduction.md), [Hand menus](./basics/05-hand-menus.md) and the rest of the [Basics](/webxr/docs/uiextensions/basics) section, one page per topic
- [Features: Developer cycle](./features/01-developer-cycle.md), [Near touch](./features/02-near-touch.md) and [Design and decisions](./features/03-design-and-decisions.md), in [Features](/webxr/docs/uiextensions/features)
- [Host integrations: Core](./integrations/01-core.md), one page per npm package, including [Native](./integrations/05-native.md), in [Host integrations](/webxr/docs/uiextensions/integrations)
- [Examples: Showcase](./examples/01-showcase.md), and the rest of the [Examples](/webxr/docs/uiextensions/examples) section
- [WebXR UI Extensions overview](/webxr/uiextensions)
