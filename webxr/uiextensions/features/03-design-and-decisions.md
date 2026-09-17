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

`@realitycollective/iwsdk-uiextensions` and `@realitycollective/xrblocks-uiextensions` each re-export the entire core surface, so an app installs one package.

**Why:** an app targeting one engine should not also have to track a second package's version for the logic it depends on.

### 4. Capabilities report rather than fail silently

`WindowHost.supportsStandalonePanels` states outright whether a bare panel can exist on a host; `createPanel` throws where it cannot, rather than returning a panel with nowhere to live.

**Why:** a window library that stayed quiet about what a host cannot do would leave an app guessing at run time instead of finding out at the call site.

### 5. The conformance suite ships as data, not hidden tests

`windowHostContractCases()` returns the `WindowHost` conformance suite as a list of named cases with a `run(setup)` function, rather than as a fixed test file.

**Why:** a new adapter runs the same cases in whatever test runner it already has, so a failing case is a real behavioural difference, not a difference in test style.

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

## Package breakdown

### `@realitycollective/webxr-uiextensions`

The engine-free core. Windows (`WindowManager`, `WindowRecord`, `WindowChrome`), docking (`DockMode`, `planTransition`, `togglePinned`), layout regions (`RegionRegistry`, `slotOffset`, `captureDrop`), drag maths (`beginDrag`, `dragPosition`, `HoldToDrag`), hand menus (`evaluateHandMenu`, `handMenuPose`), near touch (`TouchPress`), the control models (`StepperModel`, `ToggleModel`, `ExpandableModel`, `LogModel`, `upgradePanel`), portable scenes (`SceneDescriptor`, `applyScene`, `validateScene`), and the adapter contract itself (`PanelHost`, `WindowHost`, `HeadPoseSource`, `HandPoseSource`, `windowHostContractCases()`).

### `@realitycollective/iwsdk-uiextensions`

The reference adapter for Meta's Immersive Web SDK. Window entities carry IWSDK's `PanelUI` component alongside this package's `UIWindow`, and its systems add or remove IWSDK's `Follower`, `ScreenSpace`, `RayInteractable` and `PokeInteractable` components to realise what the core decides. It has the full feature set: title-bar drag by ray and by near grab, drop-to-dock, a guarded poke pointer, and system keyboard text input.

### `@realitycollective/xrblocks-uiextensions`

The experimental adapter for Google XR Blocks and any hand-rolled three.js WebXR scene, binding to plain three.js shapes rather than importing `xrblocks` itself. It matches most of the IWSDK adapter's windowing, chrome, hand menus and regions, but has no title-bar drag of its own yet, so drag, near grab and drop-to-dock are still roadmap items there.

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
  xrblocks-uiextensions/    Google XR Blocks / three.js adapter (experimental)
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
- [Developer cycle](./01-developer-cycle.md)
- [API reference](pathname:///webxr/api/uiextensions/)
