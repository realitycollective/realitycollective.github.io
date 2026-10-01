---
sidebar_position: 2
title: 'Meta IWSDK: @realitycollective/iwsdk-uiextensions'
description: The reference adapter binding the core onto Meta's Immersive Web SDK, with the full feature set.
---

# Meta IWSDK: @realitycollective/iwsdk-uiextensions

## What it binds

This is the reference adapter for [Meta's Immersive Web SDK](https://iwsdk.dev) (`@iwsdk/core`), the one every other adapter in the family behaves as. It binds the engine-free core to IWSDK's own ECS (entity-component-system): window entities carry IWSDK's `PanelUI` component alongside this package's `UIWindow`, and its systems add or remove IWSDK's `Follower`, `ScreenSpace`, `RayInteractable` and `PokeInteractable` components to realise what the core decides.

## Install

```bash
npm install @realitycollective/iwsdk-uiextensions
# peers: @iwsdk/core >=1.0.0 <2.0.0 and three >=0.170.0 (every IWSDK app already has both)
```

This package re-exports the whole core, so an IWSDK app depends on this one package only. It is built and tested against IWSDK 1.0.0. Release `0.1.0` peered on `@iwsdk/core >=0.5.0 <0.6.0`, so an app upgrading from it moves to IWSDK 1.0 as well.

## The reference

Every rule this adapter applies through IWSDK's systems is stated in the core and run by every other adapter: the `UIWindow` and `UIDockRegion` component defaults and the `createUIWindow` and `createDockRegion` factory defaults read the core constants, so there is one set of defaults, in the core, for every platform, and `follow-reference.test.ts` drives IWSDK 1.0's own `FollowSystem` beside the core's `stepFollow` over the same head motion and requires the same position and facing every frame. Moving the reference to IWSDK 1.0 changed one rule: 1.0's `FollowSystem` honours the height of the follow offset, where 0.5 set a following window at head height, so a body-follow or head-locked window now sits 0.15 m below eye level by default and a following region 0.2 m below, on every platform.

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

`registerUIExtensions` registers every system this adapter needs and returns the `WindowManager`. Pass `{ drag: false }`, `{ nearDrag: false }`, `{ regions: false }`, `{ controls: false }` or `{ touchGuard: false }` to disable a piece of it. Pass `{ pointers }` with the shared pointer arbiter to take part in the one pointer decision per hand, described below.

A panel that uses the `<uix-*>` controls needs the parser told about them: replace `spatialUI: true` with `spatialUI: { kit: 'horizon', componentSets: [uixComponentSet] }`, with `uixComponentSet` imported from this package. See [Controls and markup](../basics/06-controls-and-markup.md).

## Reaching a panel

`host.createWindow` returns an `IwsdkWindowHandle`: the portable `WindowHandle` (`id`, `panel`, `onReady`) plus the ECS `entity`. `onReady` fires once the document has attached, and immediately if it already has. For an entity you already hold, from `createUIWindow` or an ECS query, `getPanelHandle(entity)` returns its panel, or `undefined` while IWSDK is still loading the document; do not poll it on a timer, because a poll that gives up early leaves a window that draws and responds to nothing, with no error. `host.onPanelReady` announces every panel as it attaches: a managed window with `kind: 'window'`, and a bare `PanelUI` entity with no `UIWindow`, or a factory window created without an `id`, with `kind: 'panel'` and its config path as the id. A listener that only wants managed windows checks `kind`.

## What it adds over the core

IWSDK already ships a spatial UI stack: UIKitML markup, `@pmndrs/uikit` rendering, `Follower`/`ScreenSpace` anchoring and grab, ray and poke interaction. This adapter adds the layer above it: title-bar chrome with focus and z-ordering, hide and show, a per-world `WindowManager`, hand menus, layout regions, title-bar drag by ray and by near grab, a controller squeeze or a hand pinch on the title bar, and the control set.

## What it cannot do on this host, and why

`supportsStandalonePanels` is `false`: the ECS owns panel lifecycles here, so `createPanel()` throws rather than returning a panel with nowhere to live. Spawn a window with `createUIWindow` or `host.createWindow` instead.

## Input and pointer handling

Drag: the ray, or the mouse on desktop, grabs the title bar; a press only becomes a drag after `dragDelay` seconds, 0.3 by default, so a short press stays a click. Near grab: a controller squeeze, or a hand pinch while the hand is on the title bar, drags at once with no hold delay. This works without `features.grabbing`: `UIDragSystem` enables IWSDK's near `grab` pointer itself, lists every movable title bar as a target each frame, and forwards a pinch to it only while the hand is on a title bar, leaving a pinch anywhere else to whatever the app already decided. Poke: `UITouchGuardSystem` drives IWSDK's two touch pointers from the core's `TouchPress` state machine instead of IWSDK's own unsigned-distance press and release, so a finger pushed through a panel and pulled back fires one click, not two, and a finger arriving from behind never presses.

## Panel pointer offers

IWSDK already arbitrates its own pointers: per hand, the first of touch, grab and ray that reaches something owns the hand. `registerUIExtensions` adds `UIPointerOfferSystem`, which runs right after IWSDK's input system has moved the pointers. Once per frame it reads what each of a hand's three pointers intersects, and offers the ones that sit on a panel to the shared `PointerArbiter` from `@realitycollective/webxr-input`. The panel's id is its window id for a managed window, else its `PanelUI` config path, the same id the scene host announces. A pointer that is pressing locks its kind.

The system gates nothing, because IWSDK has already decided. Its job is to let the shared arbiter, and the pointer visuals the Interactions runtime publishes from it, know about panels on IWSDK as they do on every platform. `pointerOffersFor(world)` returns the `PanelPointerOffers` for a world, for an app that needs to reach it. See [the pointer arbiter and display](/webxr/docs/input/features/pointer-arbiter-and-display).

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
- [The adapter contract](../basics/07-adapter-contract.md)
- [Showcase example](../examples/01-showcase.md)
- npm: [@realitycollective/iwsdk-uiextensions](https://www.npmjs.com/package/@realitycollective/iwsdk-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
