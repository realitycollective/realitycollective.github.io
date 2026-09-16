---
sidebar_position: 2
title: Engines and adapters
description: What three.js, Babylon.js, Meta IWSDK and Google XR Blocks give each family, and the peer dependency ranges each adapter expects.
---

# Engines and adapters

Every section below answers the same four questions for one engine: what it is, which families have an adapter for it, what is experimental or untested, and what desktop testing looks like without a headset.

## three.js

three.js is a general-purpose 3D library for the browser. Paired with the browser's own WebXR session it needs no other framework, which is why it is the default adapter wherever a family offers one.

- **Interactions** - `threejs-interactions` reads raw WebXR directly: controllers, hand joints, trigger and grip pressure, and haptic pulses. It also adds three.js hit-testing and object movement, and it is the only Interactions adapter with a desktop mouse fallback. The mouse source reports `handedness: "none"` and puts its grip on the camera ray, so throw and flick mechanics should be gated on `handedness !== "none"`.
- **UI Extensions** - there is no standalone three.js package. `xrblocks-uiextensions` hosts the core "in any three.js WebXR scene, including XR Blocks Scripts", so a plain three.js app installs the same experimental adapter as an XR Blocks app.
- **Environment** - `threejs-environment` builds the sky as a two-pixel-wide equirectangular gradient, mutates `Fog` / `FogExp2` in place across a transition, and plays audio through `Audio` / `PositionalAudio`.

Every three.js-facing adapter declares the same peer dependency, `three: >=0.170.0`. A peer dependency is a package the adapter expects your app to install itself, at a version in the stated range; npm does not pull it in for you, and the range is a compatibility contract rather than a bundled copy. The Interactions three.js adapter also takes an optional peer on `three-mesh-bvh: >=0.9.14` for accelerated hit-testing.

## Babylon.js

Babylon.js is a separate 3D engine with its own WebXR integration, `WebXRDefaultExperience`. Only WebXR-Interactions has an adapter for it today.

- **Interactions** - `babylon-interactions` reads a `WebXRDefaultExperience`: controllers, motion controller trigger and grip, and hand-tracking joints, with the scene's own pointer as a desktop fallback. It is written against the documented Babylon API and covered by structural fakes, and its README states plainly that it has "not yet been exercised against a real Babylon runtime."
- **UI Extensions and Environment** - neither family has a Babylon adapter yet. WebXR-Environment's README records a Babylon shim as pending, waiting on a review across all five packages in the estate rather than being started on its own.

`babylon-interactions` declares no peer dependency on `@babylonjs/core` at all. It matches the shape of the Babylon API in TypeScript without importing the real package, the same structural-typing approach the XR Blocks adapters use. Structural typing is how TypeScript decides compatibility: a value satisfies a type when it has the required members, with no `implements` declaration and no import of the type's home package, so the adapter can describe the shape of the Babylon objects it reads without depending on Babylon.

## Meta IWSDK

Meta's Immersive Web SDK (`@iwsdk/core`) is an ECS runtime built for Quest, with its own player rig, scene understanding and UIKitML panel markup. All three extension families have an IWSDK adapter, and each one is a reference implementation for its family.

- **Interactions** - `iwsdk-interactions` uses IWSDK's own player rig and controller state, and passes native grabs straight through when the app has IWSDK physics turned on. Setup is one call: `registerInteractions(world)`.
- **UI Extensions** - `iwsdk-uiextensions` binds the core onto IWSDK's ECS, UIKitML and interaction systems, and its Examples folder ships inside the npm tarball.
- **Environment** - `iwsdk-environment` drives IWSDK's own `DomeGradient`, light components and `AudioSource` machinery. IWSDK 0.5.3 has no light estimation, and the adapter reports that rather than staying silent about it.

Every IWSDK adapter declares the same peer dependency, `@iwsdk/core: >=0.5.0 <0.6.0`, and `iwsdk-interactions` also peers on `@iwsdk/xr-input: >=0.5.0 <0.6.0`. IWSDK has no desktop fallback of its own: it takes the view pose from the headset and has no desktop camera, which is why the UI Extensions showcase boots straight into IWSDK on Quest instead of offering a desktop choice there.

## Google XR Blocks

Google's XR Blocks is an Android XR framework, and every adapter for it in this stack is marked experimental, with the API expected to change.

- **Interactions** - `xrblocks-interactions` matches the shape of the XR Blocks API without depending on the `xrblocks` package, and reuses `threejs-interactions` for hit-testing rather than reimplementing it. XR Blocks has no haptics and no way to hide its own hand and controller visuals, so haptic requests go unfulfilled and there is no presence control.
- **UI Extensions** - `xrblocks-uiextensions` is the same package that hosts plain three.js, so an Android XR app and a desktop three.js app install the same experimental adapter.
- **Environment** - `xrblocks-environment` builds directly on `threejs-environment` and adds two sensors: depth occlusion through XR Blocks' `Depth` manager, and light estimation through its `Lighting` manager. Both are configured during XR Blocks' own init, so anything the adapter arrives too late to change is named in its report rather than dropped silently.

None of the XR Blocks adapters declare a peer dependency on the `xrblocks` package itself; they are structurally typed against its shape, the way `babylon-interactions` is typed against Babylon's. `xrblocks-environment` keeps `xrblocks: ^0.21.1` as a devDependency for its own tests only. Where they peer on an engine at all, it is three.js, at the same `three: >=0.170.0` range as the plain three.js adapters. None of the three families offers a desktop fallback specific to XR Blocks; WebXR-UIExtensions' own platform detection instead falls back to plain three.js for anything that is neither Quest nor Android XR.

## More information

- [The layering rule](./01-layering-rule.md)
- [What this stack is and is not](./03-what-this-stack-is-not.md)
- [Interactions adapters](/webxr/docs/interactions/integrations)
- [Environment adapters](/webxr/docs/environment/integrations)
