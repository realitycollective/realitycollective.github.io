---
sidebar_position: 5
title: "Google XR Blocks: @realitycollective/xrblocks-interactions"
description: The experimental XR Blocks adapter, matched structurally to xrblocks v0.20.0 with no upstream dependency.
---

# Google XR Blocks: @realitycollective/xrblocks-interactions

:::warning
Experimental. The XR Blocks pipeline is young and its API still moves. Treat this adapter as a preview and pin your versions.
:::

## What it binds

| Layer | Detail |
| --- | --- |
| Input | `Input.getFrame()` ray sources and direct touches, plus XR Blocks' own select events |
| Hit-testing and movement | Shared with the three.js adapter, since XR Blocks Scripts are ordinary three.js `Object3D`s |

## Install

```sh
npm install @realitycollective/xrblocks-interactions three
```

Peer dependency: `three >= 0.170.0`. xrblocks itself declares a peer of `three@^0.184`, while Meta's IWSDK mandates the `super-three@0.181` fork. A bundler resolves a single `three` per bundle, so this works in practice, but npm's own peer check cannot express it, which is why the Reality Collective workspaces set `legacy-peer-deps=true`.

## Setup

```ts
import { connectXRBlocksInteractions } from "@realitycollective/xrblocks-interactions";

class MyScript extends xb.Script {
  init() {
    this.ix = connectXRBlocksInteractions({ input: xb.input, camera: xb.camera });
    this.ix.register({ id: "button", behaviours: [{ kind: "press" }] }, buttonMesh);
  }
  update() {
    this.ix.update(xb.getDeltaTime());
  }
}
```

## What it adds over the core

Nothing beyond the three.js hit-testing and transform machinery it reuses; its own code is limited to translating XR Blocks' pooled per-frame structs into the shared input snapshot, copying every value out immediately since XR Blocks reuses those objects.

## What it cannot do on this host, and why

It cannot fire haptics: xrblocks v0.20.0 has no haptics API, so `capabilities.haptics` is always false and a haptic request is reported but never played. It cannot offer presence either: XR Blocks owns its controller and hand visuals and exposes no way to hide them.

## Presence and haptics

Both are unavailable on this host, for the reasons above. `capabilities.presence` and `capabilities.haptics` are always false.

## Testing it

Covered against a structural fake of the `Input.getFrame()` shape, so the provider's parsing is exercised without the `xrblocks` package installed.

## Live demo

<DemoLink demo="interactions" />, the full station set, mouse-capable on desktop, with a VR button for headsets.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Roadmap](../basics/07-roadmap.md)
- [three.js adapter](./02-threejs.md)
- [API reference](pathname:///webxr/api/interactions/)
