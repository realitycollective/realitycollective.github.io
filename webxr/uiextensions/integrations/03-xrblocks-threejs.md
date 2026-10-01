---
sidebar_position: 3
title: 'three.js and Google XR Blocks: @realitycollective/threejs-uiextensions and xrblocks-uiextensions'
description: The plain three.js and WebXR adapter, and the experimental XR Blocks adapter built on it, both running the same core rules as the IWSDK reference.
---

# three.js and Google XR Blocks: @realitycollective/threejs-uiextensions and xrblocks-uiextensions

From 0.1.1 these are two packages. `@realitycollective/threejs-uiextensions` is the binding for plain three.js and a raw WebXR session. `@realitycollective/xrblocks-uiextensions` is the experimental binding for [Google XR Blocks](https://github.com/google/xrblocks), a thin subclass of the three.js one that supplies XR Blocks' own input callbacks. In the 0.1.0 release there was one package, `xrblocks-uiextensions`, and a plain three.js app installed it; its window host had no XR-Blocks-specific code in it, so that host moved unchanged into the new package and every old import path still resolves through a re-export.

## What they bind

The three.js binding is `UixWindowHost` over `@pmndrs/uikit` and uikitml, in any three.js scene: it takes a `scene` (any `Object3D`) and a `camera`, and imports nothing from `xrblocks`. `ScenePointerBridge` resolves a hit-tested ray, a proximity-tested grab or a fingertip touch into the same `pointerdown`, `pointerup`, `click`, `pointerenter` and `pointerleave` events and `TouchPress` samples every platform raises. `connectWebXrPointerInput` wires that bridge to a live WebXR session through `renderer.xr`: `selectstart`, `selectend`, `squeezestart` and `squeezeend` on three's own controller objects for ray and near grab, and a per-frame `index-finger-tip` joint poll for touch, with no engine SDK beyond three.js itself. `CursorVisual` draws a disc at each ray's current hit on a panel, oriented to the surface, shown only by whether the ray hits something. `webxrRayInputAccess` reads a title-bar ray drag's live ray from three's controller objects, so a drag rides the ray at a fixed grab distance, the same laser-distance math IWSDK and native use.

The XR Blocks binding subclasses that host and passes `XrBlocksPointerBridge` through the host's `pointerBridgeFactory` option. It reads XR Blocks' own callbacks instead of the WebXR session: `onObjectTouching` and `onObjectTouchEnd` for a poke or a controller tip, `onSelectEnd` for a ray click, and `onSelectStart` on a title bar for a drag. XR Blocks' select and grab callbacks are already edge-triggered, so it needs no press state machine of its own. Hover is not read from XR Blocks' `onHoverEnter` and `onHoverExit`, which are not per pointer and ignore the shared arbiter. Each frame the bridge raycasts the wired panels along every ray source from `xb.input.getFrame()`, offers the nearest hit as that source's ray candidate and raises `pointerenter` and `pointerleave` for what each source's ray owns. That call exists from XR Blocks 0.20.0, so the host refuses the input of an older XR Blocks once, at construction, naming the version it needs.

## Install

```bash
# plain three.js and WebXR
npm install @realitycollective/threejs-uiextensions three

# Google XR Blocks
npm install @realitycollective/xrblocks-uiextensions three
```

Both peer on `three >=0.170.0` and depend on `@pmndrs/uikit` `^1.0.76`, `@pmndrs/uikitml` `^0.1.12` and `@realitycollective/webxr-input` `^0.1.8`. The workspace pins `three` so XR Blocks and these adapters resolve to a single copy; see the package README's note on the `super-three` fork if versions drift apart.

## Setup on plain three.js

Apply the renderer settings uikit needs once, then connect a host and tick it from the render loop:

```ts
import { DockMode, connectUIExtensions, configureRendererForUikit } from '@realitycollective/threejs-uiextensions';

configureRendererForUikit(renderer);
const uix = connectUIExtensions({ scene, camera, renderer });

uix.createWindow({ id: 'status', title: 'Status', config: './ui/status.uikitml', dockMode: DockMode.BodyFollow });

renderer.setAnimationLoop(() => {
  uix.update(clock.getDelta());
  renderer.render(scene, camera);
});
```

`connectUIExtensions` takes `scene`, `camera` and an optional `renderer`. With `renderer` it reads the session's hands for hand menus, the controllers' rays for title-bar drag, and wires the WebXR pointer input and a cursor per controller; without it the host serves a desktop page through `@pmndrs/pointer-events` only. `controllerCount` (default 2), `touchDistance`, `grabDistance` and `cursor` tune the pointer input, and `kit` picks the uikitml component kit. The result is the host itself plus `update(deltaSeconds)` and `disconnect()`.

## Setup on XR Blocks

```ts
import * as xb from 'xrblocks';
import { DockMode, connectUIExtensions, configureRendererForUikit } from '@realitycollective/xrblocks-uiextensions';

class MyScript extends xb.Script {
  async init() {
    configureRendererForUikit(xb.core.renderer);
    this.uix = connectUIExtensions({ scene: this, camera: xb.camera, xr: xb.core.renderer.xr, input: xb.input });
    this.uix.createWindow({ id: 'status', title: 'Status', config: './ui/status.uikitml', dockMode: DockMode.BodyFollow });
  }
  update() {
    this.uix.update(xb.getDeltaTime());
  }
}
```

`xr` gives the host the session's tracked hands for hand menus. `input: xb.input` gives it each controller's live ray, so a title-bar ray drag rides the ray at the grab distance; without it a ray drag falls back to the controller's own position delta, which is correct but not laser-distance, and the host says nothing about it, so wire it.

`configureRendererForUikit` is required on both, not optional: uikit draws panel backgrounds, borders and text glyphs as transparent meshes stacked by `renderOrder`, and three.js's default transparent sort orders by camera distance, which can make a panel's own text vanish at grazing angles.

## What they add over the core

The three.js half of the same surface as the IWSDK adapter: UIKitML panel hosting, window chrome with opt-in buttons, the `WindowManager`, portable scene descriptors, `onPanelReady`, follow mode, hand menus from a `HandPoseSource`, dock regions, title-bar drag by ray and by grab, touch press, and desktop mouse input through `@pmndrs/pointer-events`. Desktop locomotion through `DesktopControls` (WASD, jump, crouch, sprint) ships in the XR Blocks package. Unlike IWSDK, `supportsStandalonePanels` is `true` here, so `createPanel(config)` works directly for an unmanaged panel with no window chrome.

## One pointer decision with the Interactions family

An app that also uses interactables passes the shared `PointerArbiter` as `pointers`, to `connectUIExtensions` and to `connectWebXrPointerInput` on three.js, and to `connectUIExtensions` and `XrBlocksPointerBridge` on XR Blocks. The host then offers each source's nearest panel before it hovers, presses, squeezes or touches. On three.js that is each ray's hit, each fingertip's panel and each grip's panel, the grip within `PANEL_GRAB_RADIUS` (0.07 m). On XR Blocks it is the touch, grab and ray candidates. A pointer acts on a panel only while it owns its source, so one pointer per hand covers panels and objects, as on IWSDK.

With a shared arbiter the Interactions binding draws every cursor, panel cursors included, and the window host draws none. Without `pointers`, in an app with windows alone, the host owns every source and draws its own cursors. See [the pointer arbiter and display](/webxr/docs/input/features/pointer-arbiter-and-display).

## Held to the reference

Both bindings run the core's rules rather than their own, so they behave as the IWSDK adapter does. If you used the XR Blocks host in `0.1.0`, note what changed: it used to ease its follow with an exponential approach, had no angle limit or snap, did not move a `head-locked` window at all, clicked a ray on intersection, and had no title-bar drag.

| Rule | How it is applied here |
| --- | --- |
| `body-follow` and `head-locked` | the core `stepFollow`: a snap on entering the mode, a 0.35 m dead zone with a 30 degree limit, a lerp of `dt * speed` at speed 3, and the offset height honoured as IWSDK 1.0 does |
| a following region | IWSDK's `Follower` defaults: speed 1, tolerance 0.4 m, offset `[0, -0.2, -1.4]` |
| touch press | the core `TouchPress`: press at 2 cm, release at 3 cm, never from behind, one press per front entry, from a fingertip or a controller tip |
| ray click | on release over the pressed element, never on intersection |
| hover | the core `HoverTracker`: `pointerenter` and `pointerleave` once per change for each pointer, with an element's hover style held while any pointer is over it |
| title-bar drag | a ray waits out the window's `dragDelay` (0.3 s); a grab on the title bar drags at once; both billboard while dragging by default, and a drop within a region's snap radius docks the window into it |
| focus bias | the focused window is drawn 0.02 m nearer per window behind it, every frame, including a docked window |
| title, controls and defaults | a window with no title is titled with its id, every panel's `data-uix` controls are upgraded (`controls: false` opts out), and the region and hand-menu defaults are the core's |
| a hand menu with no tracked hand | hidden, as on IWSDK and native |

## What they cannot do on this host, and why

| Feature | IWSDK | three.js | XR Blocks |
| --- | --- | --- | --- |
| A cursor disc at every ray hit | yes | yes, `CursorVisual` | XR Blocks draws its own reticle at every controller ray hit inside its `Controller` and `InteractionManager`, and offers no seam to observe it, so nothing here can prove one |
| System keyboard text input | yes | untested | untested on Android XR |
| On-device pass | yes | none yet | none yet on Android XR hardware |

The desktop path of both is verified in a real browser.

## Testing it

```bash
npm test
```

Both packages run the shared `windowHostContractCases()`, `sceneTargetContractCases()` and `uixElementContractCases()`, a core-parity suite (follow equals `stepFollow`, region and hand-menu defaults, the title default, control upgrades), and a rule-by-rule pointer suite for touch press, controller poke, ray click on release, hover, hold-to-drag with a per-window `dragDelay`, near drag, laser-distance ray drag, billboard while dragging, drop capture and focus bias. The XR Blocks suite runs against structural fakes of the XR Blocks callbacks; the three.js suite against a fake WebXR session.

## Live demo

<DemoLink demo="uiLab" /> - the multiplatform lab's XR Blocks pipeline (Android XR, or `?uix-engine=xrblocks` anywhere, including the XR Blocks desktop simulator). The showcase's desktop build runs the XR Blocks package, which is the three.js binding underneath.

## More information

- [Roadmap](../basics/08-roadmap.md)
- [The adapter contract](../basics/07-adapter-contract.md)
- [Multiplatform lab example](../examples/02-multiplatform-lab.md)
- npm: [@realitycollective/threejs-uiextensions](https://www.npmjs.com/package/@realitycollective/threejs-uiextensions) and [@realitycollective/xrblocks-uiextensions](https://www.npmjs.com/package/@realitycollective/xrblocks-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
