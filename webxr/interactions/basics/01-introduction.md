---
sidebar_position: 1
title: Introduction
description: What an interactable and an interactor are, how the core and an adapter split responsibilities, and when to reach for this family.
---

# Introduction

WebXR Interactions adds interactive objects to a WebXR scene: buttons, levers, dials, grabbable items. The interaction logic carries no 3D engine code. You add one adapter for the engine you already use, and that adapter feeds the shared logic.

## Interactable and interactor

Two terms run through every page in this family.

An **interactable** is an object in your scene that responds to input, such as a button, a lever or a ball you can pick up. An **interactor** is the thing doing the interacting: a hand, a controller, a pointing ray or, on desktop, a mouse.

## What the core owns, what an adapter owns

The core package, `@realitycollective/webxr-interactions`, holds every piece of interaction logic: behaviours, targeting, gaze, capability checks, events and feedback intents. It never imports an engine. No `three`, no `@iwsdk/*`, no Babylon or XR Blocks types appear anywhere inside it.

An **adapter** is the only place an engine name is allowed to appear. It reads the engine's raw input, such as controllers, hand joints or a mouse, and hands the core plain data through the shared input contracts. It resolves what a ray or a touch hits in the scene, and writes the position and rotation changes the core's behaviours produce back onto the engine's own objects. Where the host cannot do something a behaviour needs, the adapter reports that through capabilities, rather than the behaviour silently doing nothing.

## The layering rule

```
app → ONE adapter (threejs | babylon | iwsdk | xrblocks) → core (webxr-interactions) → contracts (webxr-input)
```

Arrows only point down. An app depends on exactly one adapter package, and that adapter re-exports the core, so the app never installs the core itself.

## When to use this family, and when not

Reach for this family for buttons, levers, dials, sliders, grabbable objects and gaze-driven controls that need to behave the same way across engines. Do not reach for it for scene content or physics. Building meshes, prefabs and scene placement is the app's job, and a thrown object's flight after release is the app's ballistics too. The interaction layer only reports the grab and the release.

## Where this comes from

The WebXR interaction logic is a port of the Reality Toolkit's original Unity interaction framework, currently being revised in its own right.

## More information

- [Getting started](./02-getting-started.md)
- [Core: the engine-free package](../integrations/01-core.md)
- [Interactions overview](/webxr/interactions)
- [API reference](pathname:///webxr/api/interactions/)
