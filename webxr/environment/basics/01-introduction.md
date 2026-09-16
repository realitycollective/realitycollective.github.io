---
sidebar_position: 1
title: Introduction
description: What WebXR Environment is, what it owns and what it leaves to the app, in plain terms.
---

# Introduction

WebXR Environment describes the world around the player, as plain data, and applies that description through a thin adapter for whichever engine is hosting your app.

## Environment and cue

An **environment** is the setting: what the sky looks like, how far you can see, what colour the light is. It covers the sky, the fog, an ambient light, a key light (the one directional light most scenes need, such as a sun or a moon) and an environment map for image-based lighting, the reflections a physically based material needs. A **cue** is a sound the app knows how to make, played by name. You register a cue once, with a file and a mix group, then play it whenever the app decides a sound should happen.

## Platform facility versus content

Every slot in an environment is a **platform facility**: something the host engine exposes, and exposes differently. Three.js has `scene.background` and `Fog`. Meta's Immersive Web SDK (IWSDK) has `DomeGradient` and `AmbientLightComponent`. A third host will have something else again, and WebXR Environment is the one description all of them can be driven from. Content is never here. Meshes, prefabs, placement and floors belong to the app, which is the thing running the title and giving it direction. If something could be built by the app out of a geometry and a material, it does not belong in this family.

## Core and adapter

The **core** package, `@realitycollective/webxr-environment`, holds the environment and audio logic as plain data, with no 3D engine code and no dependencies at all. An **adapter** translates that plain data onto one engine: three.js, IWSDK or Google XR Blocks. You install one adapter, and it re-exports the core, so you never install the core yourself.

## The layering rule

```
app → ONE adapter (threejs | iwsdk | xrblocks) → core (webxr-environment) → nothing
```

Arrows only point down, and the core's arrow points at nothing at all. Its architecture test fails the moment an engine import lands in it, or an import of the service framework, or of the input contracts, or a read of `navigator.xr`. The one exception inside this repository is the XR Blocks adapter, which builds on the three.js adapter because XR Blocks renders through three.js. Between families nothing references anything, which is the rule that matters.

## No loop of its own

A director is the object that holds the current description, eases between states over time and pushes the result through the adapter. Neither director owns a loop. `update(deltaMs)` is called by whatever already runs per frame: a three.js render callback, an IWSDK system, a test. That is what makes an eight-second dusk a five-line unit test instead of a stopwatch and a headset, and it is why a host that only ticks while the session is focused gets the pausing behaviour it expects for free.

## More information

- [Getting started](./02-getting-started.md)
- [The environment document](./03-the-environment-document.md)
- [Environment overview](/webxr/environment)
- [API reference](pathname:///webxr/api/environment/)
