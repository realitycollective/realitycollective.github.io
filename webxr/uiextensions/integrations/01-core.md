---
sidebar_position: 1
title: 'Core: @realitycollective/webxr-uiextensions'
description: The engine-free core - window manager, dock state, region maths, drag maths, control models and the adapter contract.
---

# Core: @realitycollective/webxr-uiextensions

## What it binds

Nothing. The core imports no 3D engine; it is the contract that `iwsdk-uiextensions`, `xrblocks-uiextensions` and any future adapter implement against.

## Install

```bash
npm install @realitycollective/webxr-uiextensions@preview
```

Install this package directly only when writing headless logic, tests, developer tooling, or a new engine adapter. An app targeting IWSDK or XR Blocks installs the matching adapter instead; both re-export this package in full.

## Setup

There is no setup of its own to run: the core exposes classes and pure functions, `WindowManager`, `RegionRegistry`, `HoldToDrag`, `TouchPress` and the control models, that an adapter constructs and drives from its own frame loop.

## What it provides

- Windows: `WindowManager`, `WindowRecord`, `WindowChrome`, `pinLabelFor`, `minimizeLabelFor`.
- Docking: `DockMode`, `planTransition`, `togglePinned`.
- Layout regions: `RegionRegistry`, `slotOffset`, `captureDrop`.
- Drag maths: `beginDrag`, `dragPosition`, `faceViewerYaw`, `HoldToDrag`.
- Hand menus: `evaluateHandMenu`, `handMenuPose`, `pickHand`, `palmFacing`, `HAND_MENU_SNIPPET`.
- Near touch: `TouchPress`, `resolveTouchPress`.
- Controls: `StepperModel`, `ToggleModel`, `ExpandableModel`, `LogModel`, and the `upgradePanel` markup upgraders.
- Portable scenes: `SceneDescriptor`, `applyScene`, `validateScene`.
- The adapter contract itself: `PanelHost`, `WindowHost`, `HeadPoseSource`, `HandPoseSource`, `PointerInputSource`, and `windowHostContractCases()`.

## What it cannot do on this host, and why

Nothing here touches a renderer, a scene graph or an input device: the core knows only opaque window ids, plain `[x, y, z]` tuples and quaternions, and decisions an adapter turns into engine changes. That is enforced, not just documented: `test/architecture.test.ts` fails the moment an engine import appears under `src/`.

## Input and pointer handling

The core does not read a controller or a hand itself. `PointerInputSource` is the shape an adapter delivers press, move and release into; `HoldToDrag` turns a held press into a drag after a delay, and `TouchPress` turns a signed near-touch distance into a press, hold and release sequence with no double-fire. Both are pure state machines: feed them a sample each frame and read back what changed.

## Testing it

```bash
npm test   # from the workspace root - vitest, 100% coverage thresholds on src/core
```

## Live demo

The core has no demo of its own; every live demo runs through an adapter. See [the showcase](../examples/01-showcase.md), which runs the same scene through this core on two different engines.

## More information

- [Introduction](../basics/01-introduction.md)
- [The adapter contract](../basics/06-adapter-contract.md)
- [Meta IWSDK adapter](./02-iwsdk.md)
- npm: [@realitycollective/webxr-uiextensions](https://www.npmjs.com/package/@realitycollective/webxr-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
