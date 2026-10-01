---
sidebar_position: 1
title: 'Core: @realitycollective/webxr-uiextensions'
description: The engine-free core - window manager, dock state, region maths, drag maths, control models and the adapter contract.
---

# Core: @realitycollective/webxr-uiextensions

## What it binds

Nothing. The core imports no 3D engine; it is the contract that `iwsdk-uiextensions`, `threejs-uiextensions`, `xrblocks-uiextensions`, `native-uiextensions` and any future adapter implement against, and from 0.1.1 it also holds every rule those adapters apply, so the IWSDK reference and every other platform run the same function.

## Install

```bash
npm install @realitycollective/webxr-uiextensions
```

Install this package directly only when writing headless logic, tests, developer tooling, or a new engine adapter. An app targeting IWSDK, three.js, XR Blocks or a native host installs the matching adapter instead; all four re-export this package in full.

## Setup

There is no setup of its own to run: the core exposes classes and pure functions, `WindowManager`, `RegionRegistry`, `stepFollow`, `TitlebarDragController`, `EdgePress`, `TouchPress` and the control models, that an adapter constructs and drives from its own frame loop.

## What it provides

- Windows: `WindowManager`, `WindowRecord`, `WindowChrome`, `pinLabelFor`, `minimizeLabelFor`.
- Docking: `DockMode`, `planTransition`, `togglePinned`.
- Layout regions: `RegionRegistry`, `slotOffset`, `captureDrop`.
- Drag maths: `beginDrag`, `dragPosition`, `intersectRayPlane`, `faceViewerYaw`, `HoldToDrag`, and from 0.1.1 `TitlebarDragController`, hold-to-drag timing, drag math, billboard-while-dragging and drop capture as one class a binding drives per window.
- Follow, from 0.1.1: `stepFollow`, `enterFollow`, `followOffsetFromPose`, `resolveFollow`, the yaw helpers (`yawOf`, `yawQuaternion`, `rotateByYaw`, `yawToward`, `strictFollowTarget`), and `DEFAULT_WINDOW_FOLLOW` and `DEFAULT_REGION_FOLLOW`, IWSDK's own follow rule and defaults as pure logic. `WindowManager.setFollow` and the `follow` window option change a window's follow offset and tuning after spawn.
- Placement, from 0.1.1: `focusBiasAmount`, `applyFocusBias`, `regionSlotPose`, and the defaults `DEFAULT_REGION`, `DEFAULT_FOCUS_BIAS` (0.02 m), `DEFAULT_DRAG_DELAY` (0.3 s) and `DEFAULT_BILLBOARD_WHILE_DRAGGING`.
- Pointer events, from 0.1.1: `EdgePress`, the press, release and click state machine for a ray or grab pointer, and `dispatchTouchUpdate`, which turns a `TouchPress` update into the same events.
- Panel pointer offers, from 0.1.1: `PanelPointerOffers`, `PanelPointerCandidate`, `PresentedPointer`, `UIX_POINTER_SET` and `PANEL_GRAB_RADIUS` (0.07 m). Panels join the shared pointer arbiter as a `panel` target set, so one pointer per source spans panels and objects.
- Hover, scroll and text entry, from 0.1.1: `HoverTracker`, `ScrollState` with `SCROLL_DEFAULTS`, and `TextEntry` over a `TextInputFacility`.
- Element vocabulary, from 0.1.1: `UIX_CONTROL_TAGS`, `UIX_ROLE_TAGS` and `UIX_ELEMENT_TAGS`, the `uix-*` names a panel loader must accept.
- Cursor, from 0.1.1: `cursorPlacement` and `DEFAULT_CURSOR_OFFSET` (0.004 m), where a cursor disc sits on the surface a ray hits.
- Hand menus: `evaluateHandMenu`, `handMenuPose`, `pickHand`, `palmFacing`, `HAND_MENU_SNIPPET`.
- Near touch: `TouchPress`, `resolveTouchPress`.
- Controls: `StepperModel`, `ToggleModel`, `ExpandableModel`, `LogModel`, the `upgradePanel` markup upgraders, and `dataAttributeKey`, the one rule for where a `data-*` attribute lands in `userData`.
- Portable scenes: `SceneDescriptor`, `applyScene`, `validateScene`.
- The adapter contract itself: `PanelHost`, `WindowHost`, `SceneTarget`, `HeadPoseSource`, `HandPoseSource`, `PointerInputSource`, `windowHostContractCases()` (7 cases), `sceneTargetContractCases()` (5 cases) and `uixElementContractCases()` (6 cases), plus `MemoryWindowHost` and `createMemoryWindowHostSetup()`, the family's own in-memory mock and contract setup. All four adapters, IWSDK, three.js, XR Blocks and native, run all three suites.

## What it cannot do on this host, and why

Nothing here touches a renderer, a scene graph or an input device: the core knows only opaque window ids, plain `[x, y, z]` tuples and quaternions, and decisions an adapter turns into engine changes. That is enforced, not just documented: `test/architecture.test.ts` fails the moment an engine import appears under `src/`.

## Input and pointer handling

The core does not read a controller or a hand itself. `PointerInputSource` is the shape an adapter delivers press, move and release into; `HoldToDrag` turns a held press into a drag after a delay, and `TouchPress` turns a signed near-touch distance into a press, hold and release sequence with no double-fire. From 0.1.1 `EdgePress` and `dispatchTouchUpdate` turn what a pointer measures into `pointerdown`, `pointerup` and `click`, with a click on release for a ray as IWSDK fires it, and `TitlebarDragController` turns a press on a title bar into a drag. All are pure state machines: feed them a sample each frame and read back what changed. They were extracted from the native binding, the first to run them outside an engine, and the three.js, XR Blocks and native bindings now drive the same code.

## Testing it

```bash
npm test   # from the workspace root - vitest, 100% coverage thresholds on src/core
```

## Live demo

The core has no demo of its own; every live demo runs through an adapter. See [the showcase](../examples/01-showcase.md), which runs the same scene through this core on two different engines.

## More information

- [Introduction](../basics/01-introduction.md)
- [The adapter contract](../basics/07-adapter-contract.md)
- [Meta IWSDK adapter](./02-iwsdk.md)
- [Native adapter](./05-native.md)
- npm: [@realitycollective/webxr-uiextensions](https://www.npmjs.com/package/@realitycollective/webxr-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
