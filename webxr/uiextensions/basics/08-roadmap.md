---
sidebar_position: 8
title: Roadmap
description: What is in place, what is experimental, the known in-headset verification gap, which platform has no binding and why, and what is not currently planned.
---

# Roadmap

This page states what is built, what is experimental, and what is deliberately not promised, drawn only from the README, the changelog and the developer-cycle notes.

## In place

Windowing, docking, layout regions, hand menus, the control set and the developer tooling are implemented and tested on the reference IWSDK adapter, with headless coverage on the pure core at 100 percent. The IWSDK adapter has the full feature set: title-bar drag by ray and by near grab, drop-to-dock, a guarded poke (near-touch) pointer, and system keyboard text input.

From 0.1.1 the IWSDK adapter is the reference every other adapter behaves as, and the rules it applies through its engine are stated in the core as pure logic: the follow rule, placement and focus bias, the press, release and click state machine, title-bar drag and drop capture, hover, scrolling, text entry, panel pointer offers, the cursor, and one set of defaults. The IWSDK adapter proves the core equal to its own systems frame by frame, and the three.js, XR Blocks and native adapters run the same functions and pass the same shared suites. The reference is IWSDK 1.0.0.

## The three.js binding

`@realitycollective/threejs-uiextensions`, from 0.1.1, is the plain three.js and WebXR binding, carved out of the XR Blocks package. It matches the IWSDK adapter's windowing, chrome, hand menus, regions, follow, title-bar drag by ray and by grab, drop-to-dock, touch press through the core's `TouchPress`, click on release, hover, focus bias and a cursor disc at every ray hit, over a live WebXR session through `renderer.xr` with no SDK beyond three.js. Its desktop path is verified in a real browser; it has had no on-device pass.

## Experimental: the XR Blocks adapter

`@realitycollective/xrblocks-uiextensions` is marked experimental in its own README. From 0.1.1 it is a thin subclass of the three.js binding that supplies XR Blocks' own select, touch and hover callbacks, so it now follows the core rule for everything the three.js binding does: the lazy follow with its snap, dead zone and angle limit, touch press and controller poke, click on release, title-bar drag by ray and by grab, billboard while dragging, drop-to-dock and focus bias. Pass `input: xb.input` so a ray drag rides the controller's ray at the grab distance; without it the drag falls back to the controller's own position. What remains: XR Blocks draws its own reticle at every controller ray hit with no seam to observe it, so the cursor rule cannot be proved there; system keyboard text input on Android XR is untested; and there has been no on-device pass on Android XR hardware, so treat that path as unverified.

## The native adapter

`@realitycollective/native-uiextensions`, from 0.1.1, binds the core to a native app on OpenXR or visionOS that renders panels itself and installs `globalThis.__rcHost`. It runs every rule IWSDK's UI systems run and hands the host a pose per window, a property write per element, hover state, scroll offsets and keyboard requests. The host draws them and reports what each pointer measures. It runs the same three conformance suites as the other hosts, against an in-memory fake of the `ui` slice, holds the family's usual coverage gate, and ships `nativeUiHostConformanceCases()`, 13 runner-free cases a native app runs on its device against its real slice, with the `NativeUiTestHost` readbacks the app provides in a test build.

:::caution Known issue on native
A native app built with this package passed on a Meta Quest 3 on 1 October 2026, played by a person and checked by its conformance kit. The system keyboard for a text field opens outside the wearer's view on a Quest 3, so text cannot be typed yet. Pressing a field focuses it and asks for the keyboard as it should. Where Horizon OS places the keyboard is the host's to fix.
:::

## Not on Babylon.js

There is no Babylon.js binding, and it was deferred to a later round on 28 September 2026 with its reason stated: the panels render with `@pmndrs/uikit`, which draws only into three.js, so a Babylon binding needs a second panel renderer, such as Babylon GUI. It is recorded as work outstanding with no milestone set yet, not as a platform limit.

## Known in-headset verification gap

Everything headless is tested in continuous integration, including the IWSDK systems against a headless `World`. On the web adapters, in-headset behaviours still need a manual pass on device: title-bar drag by ray, near grab by squeeze and by hand pinch, the hand menu's palm gate and anchors on real hands and controllers, and the poke guard's press and release distances. The native adapter has had a headset play-through, described above.

## What comes next

The `development` branch publishes previews of the next version under the `preview` tag. Install one with `@preview` only to try work in progress. Previews are not supported, and what is in `latest` is what the family promises.

## What is not planned

Portable world-building is not a current promise: scene content such as meshes, prefabs and placement is built by the app, ideally behind a factory interface it owns. Loading and switching scenes is the Environment family's [scene manager](/webxr/docs/environment/basics/scenes), not this family's. A shared content descriptor, in the shape of this family's `SceneDescriptor`, will only be considered once a second host is actually targeted for that kind of portability; Meta's `iwsdk.scene.v1` format is an acceptable authoring interchange in the meantime.

## More information

- [Introduction](./01-introduction.md)
- [The adapter contract](./07-adapter-contract.md)
- [three.js and XR Blocks adapters](../integrations/03-xrblocks-threejs.md)
- [Native adapter](../integrations/05-native.md)
- Repository: [WebXR-UIExtensions](https://github.com/realitycollective/WebXR-UIExtensions)
- [API reference](pathname:///webxr/api/uiextensions/)
