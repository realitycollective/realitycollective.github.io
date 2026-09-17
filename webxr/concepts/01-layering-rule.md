---
sidebar_position: 1
title: The layering rule
description: How an app, one adapter, a family's core and the shared input contracts stack, and why every arrow points down.
---

# The layering rule

Every family in the Reality Toolkit WebXR stack is built from the same four layers, and the rule that holds them together is that an arrow only ever points down.

## The four layers

- **App** - your game or experience. It picks one engine and wires the family's events to whatever it wants to happen.
- **Adapter** - the only place an engine name appears. It translates one engine's API into the shape the core expects.
- **Core** - the engine-free logic for that family: interactables and behaviours for Interactions, windows and docking for UI Extensions, the sky and the mix for Environment.
- **Contracts** - `@realitycollective/webxr-input`, the shared, zero-dependency types for input that both the Interactions and UI Extensions cores are built on.

An app talks to exactly one adapter. The adapter talks to its family's core. The core, where it needs input, talks to the shared contracts. Nothing talks back up.

## Arrows only point down

WebXR-Interactions states its own layering as:

```text
app → ONE adapter (threejs | babylon | iwsdk | xrblocks) → core (webxr-interactions) → contracts (@realitycollective/webxr-input, separate repo)
```

WebXR-Environment states a shorter version, because it has no dependency on the input contracts:

```text
app → ONE adapter (threejs | iwsdk | xrblocks) → core (webxr-environment) → nothing
```

WebXR-UIExtensions follows the same shape: an app installs one adapter, the adapter re-exports the core, and the core is built on the input contracts.

## The architecture tests

Each core enforces its own bottom of the stack with a test, not just a convention. WebXR-Interactions says it plainly: "the core's architecture test fails the moment an engine import lands in it." WebXR-Environment goes further. Its architecture test fails the build on an engine import, an import of the service framework, an import of the input contracts, or a read of `navigator.xr`, which leaves the core with no runtime dependency at all. WebXR-Input's own test enforces that it has no engine imports and no runtime dependencies, which is what lets both extension families share one package for input. WebXR-UIExtensions keeps the same discipline: its core folder has no engine imports and is gated by full test coverage.

## Adapters re-export their core

You never install a family's core package yourself. Each adapter re-exports the whole of its core (its own entry point exports every symbol the core exports), so `npm install @realitycollective/iwsdk-interactions` gives you the interaction core and the IWSDK bindings together. The same holds across every family: `threejs-interactions`, `babylon-interactions` and `xrblocks-interactions` each re-export `webxr-interactions`; `iwsdk-uiextensions` and `xrblocks-uiextensions` each re-export `webxr-uiextensions`; `threejs-environment`, `iwsdk-environment` and `xrblocks-environment` each re-export `webxr-environment`.

## The one permitted composition

Between families nothing references anything, but inside one repository an adapter may build on another adapter. The XR Blocks adapters are the example, in both Interactions and Environment. `xrblocks-interactions` depends directly on `threejs-interactions`, and `xrblocks-environment` depends directly on `threejs-environment`, because XR Blocks renders through three.js and reimplementing the same slots would only let them drift apart. That is the one exception to "one adapter", and it stays inside a single repository. It never crosses a family boundary.

## Families never reference each other

No package in the estate imports, type-checks against, or tests against a sibling family, not even as a type-only import. What crosses a family boundary crosses it as a subscription the app writes, because the app is the one place both halves are already in scope. WebXR-Environment's README gives the worked example, an app wiring an Interactions event to an Environment sound:

```ts
// The client owns this line. Both packages are inert without it.
const stop = interactions.runtime.onEvent((event) => {
  if (event.kind === "press") audio.play("click");
});
```

If the app never writes that line, neither package notices, and neither one is any the worse for it.

## More information

- [Engines and adapters](./02-engines.md)
- [What this stack is and is not](./03-what-this-stack-is-not.md)
- [Interactions overview](/webxr/interactions)
- [Environment overview](/webxr/environment)
