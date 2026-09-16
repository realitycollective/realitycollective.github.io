---
sidebar_position: 2
title: Design and decisions
sidebar_label: "Design and decisions"
description: Why the core stays engine-free, its key decisions, the package breakdown, and what is deliberately not built.
---

# Design and decisions

## Summary

- `@realitycollective/webxr-interactions` stays the single engine-free core; every adapter is a thin, engine-specific binding over it
- behaviours are plain state machines with no engine reference
- the runtime is the one place targeting, gaze, capability negotiation and event dispatch happen, shared by every adapter
- events are the only outbound pathway; the core never calls into app code
- physics and ballistics stay with the app, always

## Key decisions

### 1. Engine-free core, enforced by an architecture test

No `three`, `@iwsdk/*`, Babylon or XR Blocks type appears anywhere inside the core's source.

**Why:** the workspace runs an architecture test that fails the build the moment an engine import lands inside the core, so this stays true because nothing else compiles, not because of a style guideline.

### 2. One adapter, and the adapter re-exports the core

`app → ONE adapter → core (webxr-interactions) → contracts (webxr-input)`. Arrows only point down, and an app depends on exactly one adapter package.

**Why:** keeps an app's install to one package, and means the core's public surface, and the shared input contracts, are never a second thing to track separately.

### 3. Input is shared through `webxr-input`, not reinvented

The core's `InputSourceSnapshot`, `InputCapabilities` and `InputProvider` types are re-exported straight from `@realitycollective/webxr-input`.

**Why:** the same contracts package also serves the UI Extensions family, so one adapter written for an engine can feed both families from the same input stream once UI Extensions completes its own adoption.

### 4. Capabilities that report, rather than silently doing nothing

When live capabilities cannot satisfy a behaviour's declared requirements, the behaviour disables itself and the runtime emits `behaviourDisabled` with a `reason` string.

**Why:** a headset that cannot deliver what a behaviour needs should be visible to the app, not a control that quietly never responds.

### 5. Provider hints win over the core's own targeting

Target resolution tries a provider hint first, then a proximity touch, then a pointing ray; a provider hint for `"press"` or `"grab"` overrides resolution entirely.

**Why:** an engine that already knows what is being touched, such as Meta IWSDK's own tag system, is trusted over the core re-deriving the same answer.

### 6. Grab fulfilment is negotiated, never set in a descriptor

A `grab` behaviour has no options of its own; whether it runs as `poseOnly` or `native` comes from the provider's capabilities.

**Why:** matches what the engine actually offers, rather than asking an app author to guess or hard-code a mode per platform.

### 7. Events out, never callbacks in

The core has no reference to an app's scene objects or gameplay state; it only ever emits `InteractionEvent`s and `FeedbackIntent`s.

**Why:** a listener can unsubscribe safely from inside its own callback, and the core stays testable with no renderer or browser involved.

### 8. Feedback is a request, not a side effect

The core asks for a haptic pulse or a sound through a `FeedbackIntent`; it never plays either itself.

**Why:** playing feedback is host- and app-specific, so two opt-in helpers, `routeHapticsToProvider` and `routeAudioToSink`, wire it up rather than the core assuming an implementation.

### 9. Physics and ballistics stay with the app, permanently

`grab` only ever reports a pickup and a release; what happens to an object afterwards, such as a thrown ball's flight, is the app's own code.

**Why:** ballistics is a property of the object, not the interaction layer, and keeping the boundary there is deliberate, not a gap to close later.

### 10. Families never reference each other directly

The interaction core and its adapters share input contracts with UI Extensions through `@realitycollective/webxr-input`, and nothing else.

**Why:** keeps each family independently installable and versioned, with the input contracts as the only shared seam between them.

## Package breakdown

### `@realitycollective/webxr-interactions`

Behaviours (`press`, `pulse`, `hinge`, `dial`, `slide`, `grab`, `tossScore`) as pure state machines; the runtime and binder, handling targeting, press and grab transitions with hysteresis, gaze gating and dwell, capability negotiation, events and feedback intents; and the shared input contracts, re-exported from `@realitycollective/webxr-input`.

### `@realitycollective/threejs-interactions`

The default, standalone adapter. Reads raw WebXR directly: controllers, hand joints, trigger and grip pressure, haptic pulses. Hit-testing through a three.js `Raycaster`, optionally accelerated with `three-mesh-bvh`. The only adapter with a `registerVisual` presence API, and a desktop mouse fallback.

### `@realitycollective/babylon-interactions`

Matches the Babylon API shape in TypeScript without depending on `@babylonjs/core`, so an upstream Babylon release cannot break the install. Reads a `WebXRDefaultExperience`. Not yet exercised against a real Babylon runtime; covered by structural fakes only.

### `@realitycollective/iwsdk-interactions`

Connects to Meta's Immersive Web SDK, passing through IWSDK's own `Pressed` and `Grabbed` tags as pre-resolved targeting hints, and IWSDK's own grab when the app has grabbing or physics enabled.

### `@realitycollective/xrblocks-interactions`

Matches the XR Blocks API shape in TypeScript, reusing the three.js adapter's hit-testing since XR Blocks Scripts are ordinary three.js `Object3D`s. Marked experimental; the upstream API may still move.

## Code layout

```text
WebXR-Interactions/
├── packages/
│   ├── webxr-interactions/       the core
│   ├── threejs-interactions/     three.js adapter
│   ├── babylon-interactions/     Babylon.js adapter
│   ├── iwsdk-interactions/       Meta IWSDK adapter
│   └── xrblocks-interactions/    Google XR Blocks adapter
├── demos/
│   └── playground/               the standalone three.js/WebXR interaction playground
├── scripts/                      shared release tooling (set-version, verify-pack)
└── .github/workflows/            ci.yml + publish-npm.yml
```

## What is deliberately not built

- No engine code inside the core, ever, enforced by the architecture test rather than left as a guideline.
- No physics or ballistics. A `grab` behaviour reports a pickup and a release; what happens next is the app's own code.
- No portable scene or content descriptor beyond `InteractionDescriptor`. Meshes, prefabs and placement remain the app's job.
- No callback surface into app code. Events are the only outbound pathway, by design.

## More information

- [Introduction](../basics/01-introduction.md)
- [Core: the engine-free package](../integrations/01-core.md)
- [Interaction playground example](../examples/01-interaction-playground.md)
- [API reference](pathname:///webxr/api/interactions/)
