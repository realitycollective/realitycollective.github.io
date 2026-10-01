---
sidebar_position: 3
title: Design and decisions
sidebar_label: "Design and decisions"
description: Why the core stays engine-free, how adapters and contracts are shared, and what a new adapter must prove to conform.
---

# Design and decisions

## Summary

WebXR UI Extensions keeps windowing, docking and controls in one engine-free core and lets each adapter be a thin, provable translation of it. The core owns every user-experience decision; an adapter owns only what an engine forces it to own, and an architecture test and a shared conformance suite keep that split enforced rather than merely documented.

## Key decisions

### 1. Engine-free core, enforced by a test

The core, `@realitycollective/webxr-uiextensions`, carries exactly one runtime dependency, `@realitycollective/webxr-input`, and no 3D engine import of any kind.

**Why:** `test/architecture.test.ts` fails the build the moment `three`, `@iwsdk/*`, `@pmndrs/*`, `xrblocks`, or any dependency beyond that one, appears under `src/`, which keeps the core portable to a future engine rather than merely intended to be.

### 2. Contracts shared through webxr-input

`HeadPoseSource` and `HandPoseSource` describe poses as plain tuples defined in `@realitycollective/webxr-input`, the contracts package this family shares with Interactions.

**Why:** a hand or head pose is the same shape wherever it is read from, so both families read it through one contract instead of each defining their own.

### 3. Adapters re-export the whole core

`@realitycollective/iwsdk-uiextensions`, `@realitycollective/threejs-uiextensions`, `@realitycollective/xrblocks-uiextensions` and `@realitycollective/native-uiextensions` each re-export the entire core surface, so an app installs one package.

**Why:** an app targeting one engine should not also have to track a second package's version for the logic it depends on.

### 4. Capabilities report rather than fail silently

`WindowHost.supportsStandalonePanels` states outright whether a bare panel can exist on a host; `createPanel` throws where it cannot, rather than returning a panel with nowhere to live.

**Why:** a window library that stayed quiet about what a host cannot do would leave an app guessing at run time instead of finding out at the call site.

### 5. The conformance suite ships as data, not hidden tests

`windowHostContractCases()`, `sceneTargetContractCases()` and `uixElementContractCases()` return their conformance suites as lists of named cases with a `run(setup)` function, rather than as a fixed test file.

**Why:** a new adapter runs the same cases in whatever test runner it already has, so a failing case is a real behavioural difference, not a difference in test style. This is what let a third adapter, `native-uiextensions`, join the estate and prove conformance with no access to this repository's own `test/` folder; the suite found a real defect in it (see [Native panels carry attributes too](../basics/06-controls-and-markup.md#native-panels-carry-attributes-too)).

### 6. Structural interfaces over one engine's element type

Control upgraders work against `UixElement`, a small structural interface (`userData`, `children`, `addEventListener`, `setProperties`), not against uikit's or three.js's own element classes.

**Why:** the same upgrader code then runs against either adapter's element tree with no engine-specific branch.

### 7. Developer tooling is a separate package the runtime never imports

`@realitycollective/uix-devtools` is its own npm package; the runtime library never imports it, and the edit gate it installs is itself guarded by a build-time flag and an exact token match.

**Why:** three independent layers, packaging, build and runtime, keep live-edit tooling out of a player's hands, rather than trusting one of them alone.

### 8. Content and world-building stay with the app

`SceneDescriptor` makes this family's own windows and regions portable data, but it describes no meshes, prefabs or placement.

**Why:** a shared content descriptor across families is only worth considering once a second host is actually targeted for that kind of portability; the app already owns scene content, and Meta's `iwsdk.scene.v1` format is an acceptable authoring interchange until then.

### 9. Families never reference each other

UI Extensions sits above the WebXR-Input contracts and beside the Interactions family, never inside either.

**Why:** see [the layering rule](/webxr/docs/concepts/layering-rule) for how this applies across the whole stack.

### 10. Every host tears down the same way

`WindowHost.dispose()` is a required member, from 0.1.1: close every window the host opened, release every subscription, safe to call twice.

**Why:** no host could be torn down before this, so an app that rebuilt its UI leaked listeners and scene objects on every platform; a required method, checked by the conformance suite, is what keeps a fourth or fifth adapter from repeating that gap.

## Package breakdown

### `@realitycollective/webxr-uiextensions`

The engine-free core. Windows (`WindowManager`, `WindowRecord`, `WindowChrome`), docking (`DockMode`, `planTransition`, `togglePinned`), layout regions (`RegionRegistry`, `slotOffset`, `captureDrop`), drag maths (`beginDrag`, `dragPosition`, `HoldToDrag`), hand menus (`evaluateHandMenu`, `handMenuPose`), near touch (`TouchPress`), the control models (`StepperModel`, `ToggleModel`, `ExpandableModel`, `LogModel`, `upgradePanel`), portable scenes (`SceneDescriptor`, `applyScene`, `validateScene`), the follow, placement, hover, scroll and text-entry rules, panel pointer offers for the shared pointer arbiter, and the adapter contract itself (`PanelHost`, `WindowHost`, `HeadPoseSource`, `HandPoseSource`, `windowHostContractCases()`).

### `@realitycollective/iwsdk-uiextensions`

The reference adapter for Meta's Immersive Web SDK. Window entities carry IWSDK's `PanelUI` component alongside this package's `UIWindow`, and its systems add or remove IWSDK's `Follower`, `ScreenSpace`, `RayInteractable` and `PokeInteractable` components to realise what the core decides. It has the full feature set: title-bar drag by ray and by near grab, drop-to-dock, a guarded poke pointer, and system keyboard text input.

### `@realitycollective/threejs-uiextensions`

From 0.1.1, the adapter for plain three.js and WebXR: `UixWindowHost` over `@pmndrs/uikit`, a pointer bridge that resolves a hit-tested ray, a proximity-tested grab or a fingertip touch into the same events every platform raises, WebXR input over `renderer.xr` with no SDK beyond three.js, and a cursor disc at every ray hit. It runs the core's follow, placement, pointer and drag rules, so it matches the IWSDK adapter's windowing, chrome, hand menus, regions, title-bar drag, touch press and focus bias.

### `@realitycollective/xrblocks-uiextensions`

The experimental adapter for Google XR Blocks, from 0.1.1 a thin subclass of the three.js adapter that supplies XR Blocks' own select, touch and ray input in place of the WebXR pointer bridge, binding to plain three.js shapes rather than importing `xrblocks` itself. It follows the same core rules as IWSDK and three.js; XR Blocks draws its own cursor with no seam to observe it, which is the one rule this adapter cannot prove.

### `@realitycollective/native-uiextensions`

From 0.1.1, the adapter for a native app on OpenXR or visionOS that renders panels itself and installs `globalThis.__rcHost`. It owns no scene graph at all: `NativeWindowHost` builds proxy `UixElement`s over the host's `NativeElementNode` tree, so the same control upgraders run unchanged. It runs every rule IWSDK's UI systems run and hands the host a pose per window, a property write per element, hover state, scroll offsets and keyboard requests. The host draws them and reports what each pointer measures. It is tested against an in-memory fake of the `ui` slice, ships the host conformance kit a native app runs on its device, and has passed a play-through on a Meta Quest 3.

### `@realitycollective/uix-devtools`

Developer-only tooling for the IWSDK adapter: `installEditGate`, `compilePanelSource` for runtime UIKitML compilation, and the `uix-dev` CLI (`tunnel`, `doctor`, `qr`) for getting a build onto a headset in one command.

## Code layout

```text
packages/
  webxr-uiextensions/       the core
    src/core/                window/dock/region/drag logic + control models (100% coverage gated)
    src/controls/             markup upgraders (UixElement interface)
    src/chrome/                window chrome conventions (contractual ids)
    src/adapter.ts             the adapter contract (PanelHost, HeadPoseSource, ...)
    src/scene.ts                SceneDescriptor, the portable scene format
    test/                        the coverage-gated suites, including architecture.test.ts
  iwsdk-uiextensions/        Meta IWSDK adapter (reference implementation)
    src/systems/               ECS systems binding the core to @iwsdk/core
    Examples/                   basic-window, controls, dock-regions (shipped in the npm tarball)
  threejs-uiextensions/      plain three.js / WebXR adapter: UixWindowHost, ScenePointerBridge, CursorVisual
  xrblocks-uiextensions/    Google XR Blocks adapter (experimental), a subclass of the three.js host
  native-uiextensions/       native app adapter (OpenXR / visionOS)
    src/host.ts                 NativeWindowHost: WindowHost + SceneTarget
    src/element.ts               NativeUixElement: proxy UixElement over NativeElementNode
  uix-devtools/                 dev tooling (dev-only, never shipped)
    src/gate.ts                 edit-session launch gate
    src/runtime-compile.ts     live UIKitML -> panel compilation
    src/cli/                     the uix-dev CLI
demos/
  showcase/                     the feature tour
  devtools-playground/         reuses the showcase world, adds the edit gate + live UX editor
  webxr-multiplatform/         "the lab", picks a pipeline from the hardware
```

## What is deliberately not built

Scene content, meshes, prefabs and placement, is never built here; it stays with the app, ideally behind a factory interface the app owns. A shared, cross-family content descriptor is not built either, because it is only worth designing once a second host actually needs the portability `SceneDescriptor` already gives this family. The library reaches no further than the window surface: it drives no physics, owns no game state, and decides no gameplay behaviour, all of which stay the app's job. `uix-devtools` builds no production feature at all; everything it adds is compiled or gated out of a shipped bundle.

## More information

- [Introduction](../basics/01-introduction.md)
- [The adapter contract](../basics/07-adapter-contract.md)
- [Native adapter](../integrations/05-native.md)
- [Developer cycle](./01-developer-cycle.md)
- [API reference](pathname:///webxr/api/uiextensions/)
