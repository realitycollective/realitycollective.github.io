---
sidebar_position: 4
title: "Google XR Blocks: @realitycollective/xrblocks-environment"
description: The experimental XR Blocks adapter, built on the three.js adapter, and its two extra sensors.
---

# Google XR Blocks: @realitycollective/xrblocks-environment

The XR Blocks adapter is EXPERIMENTAL and re-exports the three.js adapter, adding XR Blocks' own depth occlusion and light estimation on top.

## What it binds

Everything the three.js adapter binds, plus XR Blocks' `Depth` manager (`resumeDepth` / `pauseDepth`) for occlusion and its `Lighting` manager, which already owns the WebXR half of light estimation, for the ambient, key and IBL slots. `xrblocks` itself is not a dependency: its managers are described structurally, in the same way as the other XR Blocks adapters across this estate, so nothing here pins a version of it. Verified against `xrblocks` 0.21.1.

## Install

```bash
npm install @realitycollective/xrblocks-environment@preview three
```

The peer dependency is `three >= 0.170.0`, plus an XR Blocks build to hand in.

## Setup

```ts
import { createXRBlocksEnvironment, DEFAULT_OCCLUSION, STOCK_PRESETS } from "@realitycollective/xrblocks-environment";

const { director } = createXRBlocksEnvironment(
  xb.core.scene,
  { depth: xb.core.depth, lighting: xb.core.lighting },
  { presets: STOCK_PRESETS, initial: STOCK_PRESETS.noon },
);

director.setPassthrough(true);
director.setOcclusion(DEFAULT_OCCLUSION);   // real-world depth hides your content
director.setLightEstimation(true);          // the real room lights it

// From your XR Blocks Script's own update. Nothing here ticks itself, and on
// this host that matters more than on the others: both sensors are polled here.
director.update(deltaMs);
```

## What it adds over the core

Sky, fog, lights and image-based lighting come from the three.js adapter it extends, because XR Blocks renders through three.js and reimplementing four slots would only let them drift. Occlusion registers as a client of XR Blocks' `Depth` manager, turns its occlusion pass on, and chooses the depth-texture blur from the requested mode and softness. Light estimation reads the `Lighting` manager and turns its directional light and ambient probe into the same specs an app writes by hand, which the director then lays over the ambient, key and IBL slots. For the room, `createXRBlocksWorldSensing(xb.core.world)` reads XR Blocks' `PlaneDetector` and `MeshDetector`.

## What it cannot do on this host, and why

Anchors and hit testing report `unsupported`, because XR Blocks has `placeOnSurface` and `anchorObjectAtReticle`, which move an object for you and hand nothing back, so neither can answer where a ray would land. XR Blocks configures its depth and lighting managers during its own `xb.init`, before this adapter can act, so anything it arrives too late to change is named in the sensing report rather than silently dropped. If XR Blocks' own estimated lights (`useAmbientSH`, `useDirectionalLight`) are on at the same time as this adapter applies the same estimate, the room gets lit twice; turn the XR Blocks lights off and let the director own them, and the adapter says so in the report if it sees both.

## Testing it

`npm test` at the repository root runs this adapter's port tests and the shared import-surface test under the same coverage gates as the other packages.

## Live demo

Not applicable; the shipped [Environment playground](../examples/01-environment-playground.md) is built on the three.js adapter. See the [three.js and raw WebXR adapter](./02-threejs.md) page for the live demo URL.

## More information

- [Sensing](../features/01-sensing.md)
- [three.js and raw WebXR adapter](./02-threejs.md)
- [Roadmap](../basics/06-roadmap.md)
- [API reference](pathname:///webxr/api/environment/)
