---
sidebar_position: 7
title: Roadmap
description: What ships today, what is experimental, and what is deliberately out of scope.
---

# Roadmap

## In place

The core behaviour set (`press`, including latching, `pulse`, `hinge`, `dial`, `slide`, `grab` in `poseOnly` and `native` modes, `tossScore`); gaze, both `required` gating and dwell-to-press; targeting, with provider hints beating the core's own hit-testing; capability negotiation with a visible `behaviourDisabled` outcome; events as the only outbound pathway; feedback intents with the two opt-in routing helpers; per-source velocity tracking; presence control on three.js, Babylon and IWSDK; the standalone three.js adapter, including a desktop mouse fallback and optional `three-mesh-bvh` acceleration; the Meta IWSDK adapter's one-call `registerInteractions` and native grab fulfilment; and the interaction playground demo.

## Experimental or not yet run

The Babylon adapter is written against the documented Babylon 7 API and covered by structural fakes only; it has not yet been exercised against a real Babylon runtime. The Google XR Blocks adapter is marked experimental: the upstream API may still move. It is structurally typed against xrblocks v0.20.0, and has no haptics and no presence control, because the upstream package offers neither.

## Deliberately not planned

Physics and ballistics stay with the app. A `grab` behaviour only ever reports a `poseOnly` carry or mirrors an engine's own native transitions; a throw's flight afterwards is the app's own code, demonstrated in the playground's own ballistics. Portable scene and content building beyond the shared `InteractionDescriptor` is not a current promise. Scene meshes, prefabs and placement remain the app's job, and a broader shared content descriptor is only under consideration once a second host actually needs one.

## Also worth knowing

`InteractionRuntime.onSourcesSampled` is deprecated in favour of `onSample`; the two deliver an identical stream since Input 0.1.1 added velocity fields to every snapshot. It still works and will only be removed in a later major release.

## More information

- [Introduction](./01-introduction.md)
- [Babylon.js adapter](../integrations/03-babylon.md)
- [Google XR Blocks adapter](../integrations/05-xrblocks.md)
- [Repository on GitHub](https://github.com/realitycollective/WebXR-Interactions)
