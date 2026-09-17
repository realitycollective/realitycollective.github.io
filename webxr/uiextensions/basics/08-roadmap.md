---
sidebar_position: 8
title: Roadmap
description: What is in place, what is experimental, the known in-headset verification gap, and what is not currently planned.
---

# Roadmap

This page states what is built, what is experimental, and what is deliberately not promised, drawn only from the README, the changelog and the developer-cycle notes.

## In place

Windowing, docking, layout regions, hand menus, the control set and the developer tooling are implemented and tested on the reference IWSDK adapter, with headless coverage on the pure core at 100 percent. The IWSDK adapter has the full feature set: title-bar drag by ray and by near grab, drop-to-dock, a guarded poke (near-touch) pointer, and system keyboard text input.

## Experimental: the XR Blocks adapter

`@realitycollective/xrblocks-uiextensions` is marked experimental in its own README. It matches most of the IWSDK adapter's windowing features, chrome, the window manager, hand menus, regions, follow mode, desktop mouse input and locomotion, but it has no title-bar drag of its own yet: `movable` is accepted on a window's options but not acted on, so ray drag, near grab and drop-to-dock are all still roadmap items there. It also has no guarded near-touch pointer yet, though the core's `TouchPress` state machine is ready for one, and system keyboard text input on Android XR is untested. Its desktop path is verified in a real browser; it has had no on-device pass on Android XR hardware, so treat that path as unverified.

## Known in-headset verification gap

Everything headless is tested in continuous integration, including the IWSDK systems against a headless `World`. In-headset behaviours still need a manual pass on device: title-bar drag by ray, near grab by squeeze and by hand pinch, the hand menu's palm gate and anchors on real hands and controllers, the poke guard's press and release distances, and system keyboard on Quest.

## What is not planned

Portable world-building is not a current promise: scene content such as meshes, prefabs and placement is built by the app, ideally behind a factory interface it owns. A shared content descriptor, in the shape of this family's `SceneDescriptor`, will only be considered once a second host is actually targeted for that kind of portability; Meta's `iwsdk.scene.v1` format is an acceptable authoring interchange in the meantime.

## More information

- [Introduction](./01-introduction.md)
- [XR Blocks and three.js adapter](../integrations/03-xrblocks-threejs.md)
- Repository: [WebXR-UIExtensions](https://github.com/realitycollective/WebXR-UIExtensions)
- [API reference](pathname:///webxr/api/uiextensions/)
