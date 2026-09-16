---
sidebar_position: 3
title: 'Google XR Blocks and plain three.js: @realitycollective/xrblocks-uiextensions'
description: The experimental adapter binding the core to any three.js WebXR scene, inside an XR Blocks Script or hand-rolled.
---

# Google XR Blocks and plain three.js: @realitycollective/xrblocks-uiextensions

## What it binds

This is an experimental adapter for [Google XR Blocks](https://github.com/google/xrblocks) and for any hand-rolled three.js WebXR scene. It imports nothing from `xrblocks` itself: the glue binds to plain three.js shapes, a `scene` (any `Object3D`) and a `camera`, so the same host works inside an XR Blocks Script or in a scene built by hand.

## Install

```bash
npm install @realitycollective/xrblocks-uiextensions@preview three
```

This workspace pins `three` so XR Blocks and this adapter's own peer range resolve to a single copy; see the package README's note on the `super-three` fork if versions drift apart.

## Setup

Apply the renderer settings uikit needs once, then connect a host:

```ts
import * as xb from 'xrblocks';
import { DockMode, connectUIExtensions, configureRendererForUikit } from '@realitycollective/xrblocks-uiextensions';

class MyScript extends xb.Script {
  async init() {
    configureRendererForUikit(xb.core.renderer);
    this.uix = connectUIExtensions({ scene: this, camera: xb.camera, xr: xb.core.renderer.xr });
    const config = await fetch('./ui/status.json').then((r) => r.json());
    this.uix.createWindow({ id: 'status', title: 'Status', config, dockMode: DockMode.BodyFollow });
  }
  update() {
    this.uix.update(xb.getDeltaTime());
  }
}
```

`configureRendererForUikit` is required, not optional: uikit draws panel backgrounds, borders and text glyphs as transparent meshes stacked by `renderOrder`, and three.js's default transparent sort orders by camera distance, which can make a panel's own text vanish at grazing angles.

## What it adds over the core

The three.js half of the same surface as the IWSDK adapter: UIKitML panel hosting, window chrome with opt-in buttons, the `WindowManager`, portable scene descriptors, `onPanelReady`, follow mode, hand menus from a `HandPoseSource`, dock regions, desktop mouse input through `@pmndrs/pointer-events`, and desktop locomotion through `DesktopControls` (WASD, jump, crouch, sprint). Unlike IWSDK, `supportsStandalonePanels` is `true` here, so `createPanel(config)` works directly for an unmanaged panel with no window chrome.

## What it cannot do on this host, and why

| Feature | IWSDK | This adapter |
| --- | --- | --- |
| Title-bar ray drag | yes | roadmap; `movable` is accepted and ignored |
| Title-bar near grab | yes | roadmap; needs drag first |
| Drop-to-dock by dragging | yes | roadmap; needs drag first |
| Guarded poke (one press per touch) | yes, `UITouchGuardSystem` | no near-touch pointer yet; the core's `TouchPress` is ready for one |
| System keyboard text input | yes | untested on Android XR |

This adapter has no title-bar drag of its own yet, so everything that depends on dragging a window is still a roadmap item; a scene descriptor written for IWSDK still loads here, it simply cannot be dragged by its title bar. Its desktop path is verified in a real browser; it has had no on-device pass on Android XR hardware.

## Input and pointer handling

Desktop mouse: `@pmndrs/pointer-events` delivers hover and click straight to uikit controls, the same as a real pointer would. XR select-ray: `forwardClick(intersections)` is a minimal forwarder from an engine's own raycast hits to the correct uikit element, for a controller's select event. Hands: pass `xr: renderer.xr` to `connectUIExtensions` and `webxrHandPoseSource` reads the session's tracked hands, the grip space, or the target ray space where a runtime gives a hand none, for hand-menu placement; without it, hand-locked windows fall back to body-follow placement.

## Testing it

```bash
npm test   # scale/follow/pointer math, plus a headless host lifecycle suite
```

## Live demo

<DemoLink demo="uiLab" /> - the multiplatform lab's XR Blocks pipeline (Android XR, or `?uix-engine=xrblocks` anywhere, including the XR Blocks desktop simulator).

## More information

- [Roadmap](../basics/07-roadmap.md)
- [The adapter contract](../basics/06-adapter-contract.md)
- [Multiplatform lab example](../examples/02-multiplatform-lab.md)
- npm: [@realitycollective/xrblocks-uiextensions](https://www.npmjs.com/package/@realitycollective/xrblocks-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
