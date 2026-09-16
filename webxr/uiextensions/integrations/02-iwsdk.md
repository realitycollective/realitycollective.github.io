---
sidebar_position: 2
title: 'Meta IWSDK: @realitycollective/iwsdk-uiextensions'
description: The reference adapter binding the core onto Meta's Immersive Web SDK, with the full feature set.
---

# Meta IWSDK: @realitycollective/iwsdk-uiextensions

## What it binds

This is the reference adapter for [Meta's Immersive Web SDK](https://iwsdk.dev) (`@iwsdk/core`), and the most complete of the two shipped adapters. It binds the engine-free core to IWSDK's own ECS (entity-component-system): window entities carry IWSDK's `PanelUI` component alongside this package's `UIWindow`, and its systems add or remove IWSDK's `Follower`, `ScreenSpace`, `RayInteractable` and `PokeInteractable` components to realise what the core decides.

## Install

```bash
npm install @realitycollective/iwsdk-uiextensions@preview
# peers: @iwsdk/core >=0.5.0 <0.6.0 and three >=0.170.0 (every IWSDK app already has both)
```

This package re-exports the whole core, so an IWSDK app depends on this one package only.

## Setup

```ts
import { World } from '@iwsdk/core';
import { registerUIExtensions, createDockRegion, createUIWindow, DockMode } from '@realitycollective/iwsdk-uiextensions';

const world = await World.create(container, { features: { spatialUI: true } });
const windows = registerUIExtensions(world);

createDockRegion(world, { id: 'wall', flow: 'column', position: [1.5, 1.8, -1.5] });
createUIWindow(world, {
  id: 'status',
  title: 'Player Status',
  config: './ui/status.uikitml',
  dockMode: DockMode.BodyFollow,
  pinnable: true,
});
```

`registerUIExtensions` registers every system this adapter needs and returns the `WindowManager`. Pass `{ drag: false }`, `{ nearDrag: false }`, `{ regions: false }`, `{ controls: false }` or `{ touchGuard: false }` to disable a piece of it.

## What it adds over the core

IWSDK already ships a spatial UI stack: UIKitML markup, `@pmndrs/uikit` rendering, `Follower`/`ScreenSpace` anchoring and grab, ray and poke interaction. This adapter adds the layer above it: title-bar chrome with focus and z-ordering, hide and show, a per-world `WindowManager`, hand menus, layout regions, title-bar drag by ray and by near grab, a controller squeeze or a hand pinch on the title bar, and the control set.

## What it cannot do on this host, and why

`supportsStandalonePanels` is `false`: the ECS owns panel lifecycles here, so `createPanel()` throws rather than returning a panel with nowhere to live. Spawn a window with `createUIWindow` or `host.createWindow` instead.

## Input and pointer handling

Drag: the ray, or the mouse on desktop, grabs the title bar; a press only becomes a drag after `dragDelay` seconds, 0.3 by default, so a short press stays a click. Near grab: a controller squeeze, or a hand pinch while the hand is on the title bar, drags at once with no hold delay. This works without `features.grabbing`: `UIDragSystem` enables IWSDK's near `grab` pointer itself, lists every movable title bar as a target each frame, and forwards a pinch to it only while the hand is on a title bar, leaving a pinch anywhere else to whatever the app already decided. Poke: `UITouchGuardSystem` drives IWSDK's two touch pointers from the core's `TouchPress` state machine instead of IWSDK's own unsigned-distance press and release, so a finger pushed through a panel and pulled back fires one click, not two, and a finger arriving from behind never presses.

## Testing it

```bash
npm test   # vitest, including packages/iwsdk-uiextensions/test/window-system.test.ts against a headless World
```

`new World()` constructs headlessly, with no renderer or XR session, so the factories, the scene host and the ECS systems in `window-system.test.ts` run for real in a Node test, covering close in both directions, hide and show, chrome gating, regions and the grab-list registration.

## Live demo

- Showcase: <DemoLink demo="uiShowcase" />
- Multiplatform lab: <DemoLink demo="uiLab" /> (IWSDK pipeline)

## More information

- [Getting started](../basics/02-getting-started.md)
- [The adapter contract](../basics/06-adapter-contract.md)
- [Showcase example](../examples/01-showcase.md)
- npm: [@realitycollective/iwsdk-uiextensions](https://www.npmjs.com/package/@realitycollective/iwsdk-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
