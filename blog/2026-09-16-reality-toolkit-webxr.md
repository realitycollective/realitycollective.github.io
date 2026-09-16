---
slug: webxr
title: "Reality Toolkit WebXR: four families for the web"
authors: [simon]
tags: [webxr, reality, toolkit]
image: /img/webxr-social-card.png
---

![Reality Toolkit WebXR](/img/webxr-social-card.png)

Reality Toolkit WebXR is the Collective's stack for the immersive web: four TypeScript families that give an app input, interactions, spatial UI and an environment without tying it to one engine.

<!-- truncate -->

Each family ships an engine-free core that holds the logic and the tests, and thin adapters for three.js and raw WebXR, Babylon.js, Meta IWSDK and Google XR Blocks. An app installs one adapter per family. The adapter re-exports the core, so nothing else needs installing, and the core never imports an engine. A test in every core fails the build the moment one does.

The four families:

- **Input** describes XR input in plain TypeScript types: where a hand or controller points, what it touches, what the device can do. It has zero dependencies and every other family reads it.
- **Interactions** adds interactable objects to a scene: press, pulse, hinge, dial, slide, grab and toss-scoring behaviours, gaze dwell, and capability checks that switch a behaviour off and say why.
- **UI Extensions** gives you movable, dockable windows, layout regions, hand menus and controls, written in UIKitML.
- **Environment** describes the world around the player as one document: sky, fog, light, image-based lighting, passthrough, occlusion, world sensing, and the sound in it.

The documentation lives on this site, with a Start here page, the concepts that hold the families together, and for each family an overview, a Basics section, a page per adapter, and the shipped demos broken down piece by piece. The API reference is generated from the source on every build.

[Start with the overview](/webxr), or put one of the playgrounds on a headset first: the <DemoLink demo="interactions">interaction playground</DemoLink>, the <DemoLink demo="environment">environment playground</DemoLink>, the <DemoLink demo="uiShowcase">UI Extensions showcase</DemoLink> and the <DemoLink demo="uiLab">multiplatform lab</DemoLink>.

WebXR-Input is released on npm. The other three families are pre-release by design while their APIs settle; install them with the `@preview` tag and tell us what you find on the [Reality Collective Discord](https://discord.gg/YjHAQD2XT8).
