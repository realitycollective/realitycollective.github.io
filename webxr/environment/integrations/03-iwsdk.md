---
sidebar_position: 3
title: "Meta IWSDK: @realitycollective/iwsdk-environment"
description: The IWSDK adapter for WebXR Environment, what it drives natively, and where IWSDK itself has gaps.
---

# Meta IWSDK: @realitycollective/iwsdk-environment

The IWSDK adapter drives Meta's Immersive Web SDK's own environment, lighting and audio machinery, rather than reaching past it to three.js.

## What it binds

`DomeGradient` and `DomeTexture` on the level root, `AmbientLightComponent` and `DirectionalLightComponent` on transform entities, `IBLGradient` / `IBLTexture` for image-based lighting, `DepthSensingSystem` and per-entity `DepthOccludable` for occlusion, `AudioSource` with one entity per voice, and the entities IWSDK's own `SceneUnderstandingSystem` already creates for planes, meshes and anchors. Fog is the one exception: IWSDK has no fog component, so it is set on `world.scene` directly.

## Install

```bash
npm install @realitycollective/iwsdk-environment@preview
```

Peer dependencies are `@iwsdk/core >= 0.5.0 < 0.6.0`, developed and tested against 0.5.3, and `three >= 0.170.0`, which every IWSDK application already carries. The adapter imports three.js classes from `three` directly rather than through `@iwsdk/core`'s star re-export, so it prebundles even when an app excludes `three` from Vite's dependency optimiser to transform its own source.

## Setup

Setup is one call, which also registers the system that ticks both directors:

```ts
import { registerEnvironment, STOCK_PRESETS, VOID } from "@realitycollective/iwsdk-environment";

const env = registerEnvironment(world, {
  presets: STOCK_PRESETS,
  initial: VOID,
  audio: { cues: [{ id: "hum", src: "/audio/hum.mp3", bus: "ambience", loop: true }] },
});

env.environment.transition("dusk", { durationMs: 8000 });
```

Because the tick is an IWSDK system, the environment stops advancing when the session loses focus, exactly like the rest of the app. IWSDK hands a system its delta in seconds; that conversion to the milliseconds the directors take happens once, inside the system. Push passthrough in from whatever already tracks capabilities, rather than expecting the adapter to find it:

```ts
adapter.onCapabilitiesChange((c) => env.environment.setPassthrough(c.passthrough));
```

## What it adds over the core

A gradient sky's equator is derived from the same ramp the three.js adapter uses, so the two engines agree at the horizon. IWSDK's `EnvironmentSystem` already hides authored backgrounds in an AR session, which the adapter inherits rather than fights. `kind: "room"` image-based lighting is native here, using IWSDK's own built-in probe string, the one kind three.js has to approximate. Occlusion opts entities in one at a time by patching their materials, so `scope: "all"` needs an `occludables` option naming which entities the real world may hide; whatever the port adds it remembers, so turning occlusion off never strips a component the app added itself. Audio uses one entity per voice with `playbackMode` pinned to `Overlap`, because the core has already applied the cue's own retrigger policy and letting IWSDK apply its own on top would make `restart` mean two different things on two engines. For the room, `IWSDKWorldSensingPort` queries the entities `SceneUnderstandingSystem` already made, so planes, meshes and anchors come with IWSDK's own measurements; a hit test becomes an entity carrying `EnvironmentRaycastTarget`.

## What it cannot do on this host, and why

IWSDK 0.5.3 has no WebXR light estimation at all, so the port reports `unsupported` with that sentence rather than going quiet; this is filed upstream, see the [Roadmap](../basics/06-roadmap.md). Hit tests carry no distance on IWSDK, because IWSDK moves a target entity to the hit and keeps the ray to itself, and reporting a guess from the head would be a different number wearing the same name. Without an `occludables` option, `scope: "all"` occlusion reports `unavailable` rather than walking the scene graph for content it does not own.

## Testing it

`npm test` at the repository root runs this adapter's port tests, the shared import-surface test, and `prebundle.test.ts`, which runs the dependency optimiser of every supported bundler (Vite 7 and Vite 8) over the adapter next to `@iwsdk/core`, both with defaults and with every re-exported package excluded, to exercise the consumer path on every run.

## Live demo

Not applicable; the shipped [Environment playground](../examples/01-environment-playground.md) is built on the three.js adapter. See the [three.js and raw WebXR adapter](./02-threejs.md) page for the live demo URL.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Sensing](../features/01-sensing.md)
- [Core: @realitycollective/webxr-environment](./01-core.md)
- [API reference](pathname:///webxr/api/environment/)
