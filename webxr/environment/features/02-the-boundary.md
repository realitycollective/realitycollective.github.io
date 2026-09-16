---
sidebar_position: 2
title: Design and decisions
sidebar_label: "Design and decisions"
description: Why the family owns what it owns, what was declined rather than deferred, and how the boundary to its siblings is kept.
---

# Design and decisions

WebXR Environment was drawn to fill exactly what the stack's other families left over, and no more.

## Summary

The design turns on one test: is this a platform facility every host exposes differently, or is it content the app should own. The core stays a leaf with no dependencies at all, an architecture test enforces it, and the family never references a sibling package, not even a type-only import.

## Key decisions

### 1. The test is "platform facility", not "an environment usually has it"

Sky, fog, ambient and key lighting, image-based lighting and audio are all platform facilities: something every host exposes, and exposes differently.

**Why:** a test tied to what a scene usually needs would grow into content ownership; a test tied to what the host itself exposes stays a leaf. See [what the family owns](#what-the-family-owns).

### 2. Declined, not deferred

A parametric ground plane, a body solved from head and hands, and reflection cube maps built from a live GL context were proposed and turned down, not postponed.

**Why:** each is either content, a floor is a mesh, or a job that belongs to a renderer, not to a description of the world. See [what is deliberately unowned](#what-is-deliberately-unowned).

### 3. No package references a sibling family

Not a runtime import, a type-only import, or a copied signature in a test, in either direction.

**Why:** designing this package's shape against another package's is coupling by another name, even with zero runtime dependency. See [no seam to sibling families](#no-seam-to-sibling-families).

### 4. Passthrough and light estimation are pushed in and layered, never a second writer

`setPassthrough` takes a boolean or blend mode as a plain argument; `setLightEstimation` layers the host's measurement over the ambient, key and IBL slots.

**Why:** the session belongs to the platform layer, and there must be exactly one writer for the sky, fog and lights. See [passthrough is pushed in](#passthrough-is-pushed-in).

### 5. Audio has no feedback intent of its own

`play(cueId, options?)` is the entire inbound audio surface; there is no feedback adapter, intent type or cue-map helper.

**Why:** any of those would be this family holding an opinion about another one. See [nothing here decides a sound should happen](#nothing-here-decides-a-sound-should-happen).

### 6. Sensor-backed features report rather than fail silently

Occlusion, light estimation, planes, meshes, anchors and hit tests each report `unsupported`, `unavailable`, `pending` or `active`, with a sentence saying why.

**Why:** a sensor-backed feature fails to a scene that looks completely normal, so an app that could not tell the difference would ship the failure. See [Sensing](./01-sensing.md) for the full report model.

The sections below set out each of these decisions in full.

## What the family owns

Sky, fog, ambient and key lighting are in scope, the same platform facilities named on the [Introduction](../basics/01-introduction.md) page, plus transitions between named presets and passthrough suppression of the sky and fog. Audio is in scope too: a cue registry, bus and master mix, retrigger policy, throttling and voice lifetime. The test behind every decision is whether something is a facility the host exposes, which differs per host, not whether an environment usually has it.

## What is deliberately unowned

Several things were proposed and turned down on that test. A parametric ground plane was removed from an earlier draft: no host exposes one, so a floor is a mesh and a material, which is content, and content is the app's. Scene composition, content descriptors and asset loading are not owned either; a shared content descriptor is only worth considering once a second host is actually targeted. Physics is not owned. A body solved from the head and hands was turned down, because no host exposes a body: the tracked poses are WebXR-Input's contract and the solver is pure trigonometry that belongs to the app. Reflection cube maps from a live GL context are not built here either, because prefiltering one is a renderer's job; the environment map instead carries `{ kind: "estimated" }` as a marker the app's renderer applies.

## No seam to sibling families

No package in this family references a sibling in any form: not a runtime import, not a type-only import, not a copied signature in a test. An earlier draft described `AudioDirector` as satisfying the WebXR-Interactions core's feedback sink, with a test that reproduced its signatures. Nothing depended on anything, so the dependency was already correct, but designing this package's shape against another package's is coupling by another name, and the test was removed. See [the layering rule](/webxr/docs/concepts/layering-rule) for how this applies across the whole stack.

## Passthrough is pushed in

Whether the real world is showing is a property of the session, and the session belongs to the platform layer, not to this family. `setPassthrough(boolean | EnvironmentBlendMode)` takes that fact as a plain argument, pushed in by whatever already tracks it. That is the whole of the relationship, and it is why the core can have no dependencies at all.

## Nothing here decides a sound should happen

`play(cueId, options?)` is the entire inbound audio surface. There is no feedback adapter, no intent type and no cue-map helper, because those would all be this family holding an opinion about another one.

## The app-owned subscription

What crosses a boundary crosses it as a subscription the app makes, at the one place where both halves are already in scope:

```ts
// The client owns this line. Both packages are inert without it.
const stop = interactions.runtime.onEvent((event) => {
  if (event.kind === "press") audio.play("click");
});
```

If a source is there, the app binds it. If it is not, nothing happens, and neither package notices.

## More information

- [Sensing](./01-sensing.md)
- [Roadmap](../basics/06-roadmap.md)
- [Layering rule](/webxr/docs/concepts/layering-rule)
- [API reference](pathname:///webxr/api/environment/)
