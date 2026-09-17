---
sidebar_position: 1
title: "Core: @realitycollective/webxr-environment"
description: The engine-free core that every Environment adapter re-exports, and what it deliberately does not do.
---

# Core: @realitycollective/webxr-environment

The core is the engine-free package every adapter builds on: two directors, two ports, and no 3D engine code at all.

## What it binds

Nothing. The core never imports an engine, never imports a sibling package and never reads `navigator.xr`. Its architecture test fails the moment any of those happen. It holds `EnvironmentDirector` and `WorldSensingDirector` as plain data and logic, and defines the `EnvironmentPort`, `AudioPort` and `WorldSensingPort` interfaces an adapter implements.

## Install

You do not install this package directly. Install the adapter for your engine and it re-exports everything here:

```bash
npm install @realitycollective/threejs-environment three
```

## Setup

Not applicable to the core on its own; see [three.js](./02-threejs.md), [Meta IWSDK](./03-iwsdk.md) or [Google XR Blocks](./04-xrblocks.md) for the setup call each adapter provides.

## What it adds over the core

Not applicable; this is the core. It defines the sky, fog, ambient, key and IBL slots, the interpolation rule, the cue and bus model, and the sensing seam every adapter reports through, but applies none of it to a scene.

## What it cannot do on this host, and why

The core cannot draw anything, on any host, by design. It has no dependencies at all, so it cannot read a session, cannot know which engine is hosting it, and cannot create geometry: content is the app's, and a package with a rendering opinion could not stay a leaf in the [layering rule](../basics/01-introduction.md#the-layering-rule).

## Testing it

`npm test` at the repository root runs the architecture test that enforces the no-dependency rule above, alongside the director logic tests and both adapters, under coverage gates. `npm run typecheck` strict-typechecks every package.

## Live demo

Not applicable; the core renders nothing on its own. See the [Environment playground](../examples/01-environment-playground.md), built on the three.js adapter.

## More information

- [Introduction](../basics/01-introduction.md)
- [three.js and raw WebXR adapter](./02-threejs.md)
- [The environment document](../basics/03-the-environment-document.md)
- [API reference](pathname:///webxr/api/environment/)
