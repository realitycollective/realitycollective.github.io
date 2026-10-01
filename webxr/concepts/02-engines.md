---
sidebar_position: 2
title: Engines and adapters
description: What three.js, Babylon.js, Meta IWSDK, Google XR Blocks and a native host give each family, and the peer dependency ranges each adapter expects.
---

# Engines and adapters

Every section below answers the same four questions for one engine: what it is, which families have an adapter for it, what is experimental or untested, and what desktop testing looks like without a headset.

## three.js

three.js is a general-purpose 3D library for the browser. Paired with the browser's own WebXR session it needs no other framework, which is why it is the default adapter wherever a family offers one.

- **Interactions** - `threejs-interactions` reads raw WebXR directly: controllers, hand joints, trigger and grip pressure, and haptic pulses. It also adds three.js hit-testing and object movement, and it is the only Interactions adapter with a desktop mouse fallback. The mouse source reports `handedness: "none"` and puts its grip on the camera ray, so throw and flick mechanics should be gated on `handedness !== "none"`.
- **UI Extensions** - `threejs-uiextensions`, from 0.1.1, is the plain three.js and WebXR binding: `UixWindowHost` over `@pmndrs/uikit`, a pointer bridge that turns a hit-tested ray, a proximity-tested grab or a fingertip touch into the same press, click, hover and drag events every platform raises, and `connectWebXrPointerInput` over `renderer.xr` with no SDK beyond three.js. Its panels join the [shared pointer arbiter](/webxr/docs/input/features/pointer-arbiter-and-display), so the cursor sits where the owning pointer meets a panel. It was carved out of `xrblocks-uiextensions`, which is now a thin subclass of it. Before 0.1.1, a plain three.js app installed the XR Blocks package.
- **Environment** - `threejs-environment` builds the sky as a two-pixel-wide equirectangular gradient, mutates `Fog` / `FogExp2` in place across a transition, and plays audio through `Audio` / `PositionalAudio`.

Every three.js-facing adapter declares the same peer dependency, `three: >=0.170.0`. A peer dependency is a package the adapter expects your app to install itself, at a version in the stated range; npm does not pull it in for you, and the range is a compatibility contract rather than a bundled copy. The Interactions three.js adapter also takes an optional peer on `three-mesh-bvh: >=0.9.14` for accelerated hit-testing.

## Babylon.js

Babylon.js is a separate 3D engine with its own WebXR integration, `WebXRDefaultExperience`. Only WebXR-Interactions has an adapter for it today.

- **Interactions** - `babylon-interactions` reads a `WebXRDefaultExperience`: controllers, motion controller trigger and grip, and hand-tracking joints, with the scene's own pointer as a desktop fallback. It is written against the documented Babylon API and covered by structural fakes, and its README states plainly that it has "not yet been exercised against a real Babylon runtime."
- **UI Extensions and Environment** - neither family has a Babylon adapter yet, and both were deferred to a later round on 28 September 2026 with a stated reason. UI Extensions renders its panels with `@pmndrs/uikit`, which draws only into three.js, so a Babylon binding needs a second panel renderer, such as Babylon GUI. Environment has no such obstacle: Babylon.js 9 exposes everything its ports need, so that binding is work outstanding rather than a platform limit.

`babylon-interactions` declares no peer dependency on `@babylonjs/core` at all. It matches the shape of the Babylon API in TypeScript without importing the real package, the same structural-typing approach the XR Blocks adapters use. Structural typing is how TypeScript decides compatibility: a value satisfies a type when it has the required members, with no `implements` declaration and no import of the type's home package, so the adapter can describe the shape of the Babylon objects it reads without depending on Babylon.

## Meta IWSDK

Meta's Immersive Web SDK (`@iwsdk/core`) is an ECS runtime built for Quest, with its own player rig, scene understanding and UIKitML panel markup. All three extension families have an IWSDK adapter, and each one is the reference implementation for its family: every other platform behaves as the IWSDK adapter does, and a rule the IWSDK adapter applies through its engine is restated in the family's core as pure logic and proved equal to it. IWSDK 1.0.0, released on 24 September 2026, is the reference from 0.1.1 on.

- **Interactions** - `iwsdk-interactions` uses IWSDK's own player rig and controller state, and passes native grabs straight through when the app has IWSDK physics turned on. Setup is one call: `registerInteractions(world)`.
- **UI Extensions** - `iwsdk-uiextensions` binds the core onto IWSDK's ECS, UIKitML and interaction systems, and its Examples folder ships inside the npm tarball.
- **Environment** - `iwsdk-environment` drives IWSDK's own `DomeGradient`, light components and `AudioSource` machinery. IWSDK 1.0 has no light estimation and measures no reflections, exactly as 0.5.3 did, and the adapter reports both rather than staying silent about them.

Every IWSDK adapter declares the same peer dependency, `@iwsdk/core: >=1.0.0 <2.0.0`, built and tested against 1.0.0, and `iwsdk-interactions` also peers on `@iwsdk/xr-input: >=1.0.0 <2.0.0`. The 0.1.0 adapters peered on IWSDK `>=0.5.0 <0.6.0`. Moving the reference changed one rule everywhere: IWSDK 1.0's follow system honours the height of the follow offset, where 0.5 set a following window at head height, so from UI Extensions 0.1.1 a body-follow window sits 0.15 m below eye level on every platform. IWSDK has no desktop fallback of its own: it takes the view pose from the headset and has no desktop camera, which is why the UI Extensions showcase boots straight into IWSDK on Quest instead of offering a desktop choice there.

## Google XR Blocks

Google's XR Blocks is an Android XR framework, and every adapter for it in this stack is marked experimental, with the API expected to change.

- **Interactions** - `xrblocks-interactions` matches the shape of the XR Blocks API without depending on the `xrblocks` package, and reuses `threejs-interactions` for hit-testing rather than reimplementing it. XR Blocks 0.21.1 has WebXR Gamepad haptics, a `ManipulationManager` grab and bundled RAPIER physics, so from 0.1.1 the adapter fires haptic pulses, reports an engine-owned grab as IWSDK does, and holds a RAPIER body during a grab. It still has no way to hide XR Blocks' own hand and controller visuals, so there is no presence control.
- **UI Extensions** - `xrblocks-uiextensions` is, from 0.1.1, a thin subclass of `threejs-uiextensions` that supplies XR Blocks' own select, touch and hover callbacks in place of the WebXR pointer bridge. It follows the core rules the IWSDK adapter follows: the lazy follow, touch press, click on release, title-bar drag by ray and by grab, drop capture and focus bias. Pass `input: xb.input` so a ray drag rides the controller's ray; without it the drag falls back to the controller's own position.
- **Environment** - `xrblocks-environment` builds directly on `threejs-environment` and adds two sensors: depth occlusion through XR Blocks' `Depth` manager, and light estimation through its `Lighting` manager. Both are configured during XR Blocks' own init, so anything the adapter arrives too late to change is named in its report rather than dropped silently.

None of the XR Blocks adapters declare a peer dependency on the `xrblocks` package itself; they are structurally typed against the shape of xrblocks 0.21.1, the way `babylon-interactions` is typed against Babylon's. `xrblocks-environment` keeps `xrblocks: ^0.21.1` as a devDependency for its own tests only. Where they peer on an engine at all, it is three.js, at the same `three: >=0.170.0` range as the plain three.js adapters. None of the three families offers a desktop fallback specific to XR Blocks; WebXR-UIExtensions' own platform detection instead falls back to plain three.js for anything that is neither Quest nor Android XR.

## Native

Native is not a 3D engine. It is a platform binding onto a native app, over OpenXR on Quest or CompositorServices on visionOS, that embeds a JavaScript engine such as Hermes. Rather than reading an engine's scene graph, each native package reads its own slice of one host object, `globalThis.__rcHost`, that the app installs.

- **Interactions** - `native-interactions` reads the `input` and `interactions` slices. The host reports facts, whether the session is immersive and focused and whether hand tracking is on, samples sources, answers hit tests and pose reads keyed by the target id the app chose at registration, and holds and releases a physics body on `beginHold` and `endHold`. The binding derives every capability and decides presence exactly as the IWSDK provider does, and hands the host the result. No engine dependency at all; only tuples and target ids cross the boundary.
- **UI Extensions** - `native-uiextensions` reads the `ui` slice and runs every rule IWSDK's UI systems run: chrome, title and labels, the follow rule, hand menus, regions, title-bar drag, touch press, click on release and focus bias. The host is handed a pose and a depth order per window and a property write per element, draws them, and reports what each pointer measures. The JavaScript side keeps the real `WindowManager` and controls, and sees each panel as a tree of proxy elements.
- **Environment** - `native-environment` reads the `environment`, `audio`, `sensing` and `scenes` slices, all of which are already plain data, so the native app applies each spec and builds each scene with its own loaders rather than decoding anything itself.

Every native binding is tested headless against an in-memory fake of its slice, and holds 100% coverage doing it. Each native package also exports a host conformance kit, runner-free cases a native app runs on its device against its real slice, with a small readback type the host provides in a test build; see [Native as a platform](./05-native-platform.md#host-conformance-kits). Every native binding has run on a Quest 3, through the Reality Collective's own native host: each passed its conformance kit and a person's play-through. Interactions and UI Extensions each have one known issue there; see [Native as a platform](./05-native-platform.md#tested-on-a-headset). The service framework's slice has also run in the visionOS Simulator. The native bindings ship in UI Extensions, Interactions and Environment `0.1.1` and the service framework `1.0.2`.

Native has no desktop fallback and needs none: a native app already runs on its target device or simulator, so there is no browser session to fall back to. See [Native as a platform](./05-native-platform.md) for the one host object and the rules every slice follows.

## More information

- [The layering rule](./01-layering-rule.md)
- [What this stack is and is not](./03-what-this-stack-is-not.md)
- [Native as a platform](./05-native-platform.md)
- [Interactions adapters](/webxr/docs/interactions/integrations)
- [Environment adapters](/webxr/docs/environment/integrations)
