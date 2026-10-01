---
sidebar_position: 5
title: Native as a platform
description: The one __rcHost object a native app installs, the slice each family reads from it, and what runs where.
---

# Native as a platform

Native is a fifth platform in every family, beside three.js, Babylon.js, Meta IWSDK and Google XR Blocks. A native XR app, over OpenXR on Quest or CompositorServices on visionOS, embeds a JavaScript engine such as Hermes and runs the same client code that runs in a browser. The engine is the app's choice, made when it is built: JavaScriptCore or V8 serve as well, provided the engine supplies the host globals the [service framework's native page](https://serviceframework.realitycollective.net/docs/web/integrations/native) lists. No adapter reads a scene graph here, as the engine adapters do. Instead the app installs one host object, and each family's native package reads its own slice of it.

It ships in every family that has a native package: service framework `1.0.2`, and UI Extensions, Interactions and Environment `0.1.1`. Each native binding is as thick as its IWSDK reference. A host written against one of the early previews has changes to absorb, listed on each family's native page.

## The one host object

A native app installs `globalThis.__rcHost` before it evaluates the app bundle. Every native package reads its slice from this single object, or accepts the slice by injection for tests, and falls back to the global when none is given. Services, interactions, UI and environment code do not change between web and native: only the adapter underneath is different.

## The slices

| Slice | Family | Package | What it carries |
| --- | --- | --- | --- |
| (root) | Service Framework | `service-framework-native` | `onFrame`, session info with the enabled WebXR features and the supported session modes, the session lifecycle, a session refusal and `recentre`. Every other family's package plugs into this same object |
| `io` | Service Framework | `service-framework-native` | Byte transport: `fetchBytes` and `gunzip`, read through the core's `HostIO` |
| `input` | Interactions, UI Extensions and Service Framework | `native-interactions`, `native-uiextensions`, `service-framework-native` | The input provider slice. The host reports facts, `immersive`, `focused`, `handTracking` and `eyeTracking`, per-frame sources, an optional head pose and eye-gaze pose, hints and haptics. It applies the presence the binding decides per side, and draws the ray and cursor it is handed per source through `applyPointerVisuals`. The service framework reads only its source-change signal |
| `interactions` | Interactions | `native-interactions` | Hit testing, the target radius the binding assigns, live and rest pose reads and transform writes, keyed by the target id the app chose when it registered the object, and the held pose: `beginHold` and `endHold` are required |
| `physics` | Interactions | `native-interactions` | The platform's physics engine behind the core physics facility: gravity, one body per target id, pose and velocity reads and writes, and suspend and resume for a held body. Optional: without it the binding has no physics |
| `ui` | UI Extensions | `native-uiextensions` | Panels: element trees, property writes and element events. Windows: the pose and depth order the binding computes for each window, its hidden state and dock mode. Pointers: what each ray, touch and grab measures, reported to the binding, which decides every press, click and drag |
| `environment` | Environment | `native-environment` | Sky, fog, ambient light, key light and image-based lighting |
| `audio` | Environment | `native-environment` | Cue playback: start, stop, gain and voice-ended reporting |
| `sensing` | Environment | `native-environment` | World sensing: planes, meshes, anchors and hit tests. Every member on this slice is optional |
| `scenes` | Environment | `native-environment` | Scene management, from 0.1.1: build, show, hide and destroy scenes and nodes, spawn instances and detach persistent nodes, keyed by the app's own strings. A node's key is its target id in `interactions` |

Every slice except the root is optional. A native package given a host with its slice missing throws one clear error at construction that names the missing slice, rather than failing on the first call that needed it. `sensing` is the one exception: a host with no `sensing` slice is a supported shape, and the Environment family reports each sensing feature as `unsupported` instead of throwing.

## Plain values only

Values that cross the boundary are plain: numbers, strings, booleans, arrays, plain objects and `Uint8Array`. No engine object crosses in either direction. The only functions that cross are listener callbacks passed to an `on*` method, and each `on*` method returns an unsubscribe function. Vectors are tuples, exactly as `@realitycollective/webxr-input` defines them: `Vec3Tuple` `[x, y, z]` in metres and `QuatTuple` `[x, y, z, w]`, world space, right-handed and y-up, as WebXR already is. Ids are strings chosen by whoever creates the thing.

## The golden rule and the platform rule

Clients only ever talk to a family's core. The core states what it needs as a contract, and every platform, native included, implements that contract; no platform adds a call of its own. A native package's public surface is the same kind every other platform adapter has: the core re-exported, the classes that implement the core's interfaces, one setup entry point, its options, the structural types of its own slice and, for native, its host conformance kit. Slice reading and tuple copying stay internal, and each native package has a test that fails if its public surface grows beyond that shape.

## A host is handed results, not rules

The IWSDK binding is the reference behaviour of every family, and a native binding is as thick as it: it runs every rule the IWSDK systems run and hands the host poses, element properties, presence flags, radii and capabilities. The host renders, measures and reports facts. It never places a window, decides a press, derives a capability or picks a modality. That rule came out of the platform synchronisation of 28 September 2026: the first native bindings mirrored state to the host and left the host to re-derive the rules, and a host that did so drifted from the web on chrome, dock modes, touch press, click timing and more. A contract that lets a host decide a behaviour is treated as a defect, and every host-facing member now carries a comment with its units, sign, defaults, when it is called and the IWSDK member it stands in for.

## Assets are transparent

A `src` string, such as a sky texture, an environment map, an audio cue or a panel config path, means the same thing on web and native: a URL or a path relative to the app's content root. On native, the app resolves and decodes it with its own loaders. The JavaScript side never decodes an image, an audio file or a model; the framework ships byte transport helpers, such as `HostIO`, and never a decoder.

## What runs where

The native app owns rendering, physics and assets. It builds scenes from their `src`, renders them, resolves hit tests and physics against its own scene graph, and answers pose reads and writes for whatever the app registered. The JavaScript side decides which scenes are loaded, which one is active and what survives a change of scene, tells the app when to hold a grabbed body and with what velocity to release it, computes where every window sits, decides which pointer owns each hand and how its ray and cursor are drawn, decides every press, click and drag from what the pointers measure, derives every input capability from the facts the host reports, and decides which hand and controller models each side shows. The JavaScript side owns the same engine-free logic it runs everywhere else: behaviours, the window manager and its placement rules, the environment document and the audio director. The native packages copy every tuple they read from a slice or hand to one. A host may therefore reuse its own buffers without reaching an object the app is still holding.

## Host conformance kits

The shared conformance suites prove what a binding hands its platform. A native host has a further seam, what it does with what it is handed, that no headless test can reach, so each native package exports a host conformance kit: runner-free cases in the same `{ name, run }` shape, named `<slice>/<rule>`, that a native app runs on its device against its real slices. The host provides a small set of test readbacks in a test build, the `*TestHost` type each package exports, so a case can read what the host drew, hid, measured or sounded.

| Package | Kit | Readbacks | Checks |
| --- | --- | --- | --- |
| `native-uiextensions` | `nativeUiHostConformanceCases()`, 13 cases | `NativeUiTestHost`: `windowPose`, `windowHidden`, `elementProperties`, `elementHovered`, `elementHandle`, `scrollPosition`, `keyboardShown`, `measureTouch` | The host draws a window at the pose it is handed, follows the core rule in `body-follow` and `head-locked`, hides a hand menu with no tracked hand, applies the title, chrome and labels, hides and restores, applies focus bias, styles hover and scrolls exactly as told, shows and hides its keyboard when told, and measures a fingertip's signed distance positive in front |
| `native-interactions` | `nativeInteractionsHostConformanceCases()`, 49 cases: the 17 `hitTesterContractCases()`, the 9 `nearPointerContractCases()` and the 10 `physicsFacilityContractCases()` run against the host itself, plus 13 host cases | `NativeInteractionsTestHost`: `placeTarget`, `placeScenery`, `clearTargets`, `setTargetVisible`, `presenceShown`, `lastRelease`, `cursors`, `pointerVisuals`, `pointerDisplay` | Queries answer registered targets only, never scenery, and proximity is to the surface; a target with no radius is a 0.1 m sphere; `endHold` receives the release velocity, and a registered target with a body is held and released through `physics`; the ray and cursor are drawn exactly as handed, under the app's pointer display; a hand's select is binary and its squeeze 0; capabilities follow the live session; eye gaze takes far targeting and never answers a hidden target; presence hides the models only, per side, follows the live modality on `"auto"`, and never hides the cursors |
| `native-environment` | `nativeEnvironmentHostConformanceCases()`, 16 cases: 9 environment and 7 audio | `NativeEnvironmentTestHost` and `NativeAudioTestHost`: what was drawn per slot, the sky and fog kinds, shadows, IBL, light estimation, the listener pose, each voice's distance gain, and the voices started and stopped | Every slot is drawn, every sky and fog kind as the kind it was given, passthrough suppresses sky and fog and restores them unchanged, a transition's in-between values arrive, the remembered occlusion spec is applied when passthrough starts, light estimation overlays the lit slots, a positional voice attenuates by the core defaults with the listener at the viewer's head, and the `overlap`, `restart`, `ignore`, `minIntervalMs` and stop policies sound as they should |

Every kit is shown to fail a host with the defect it exists for: one that misplaces a window, drops the sign of a distance, measures proximity to a target's centre, loses a release velocity, draws the wrong presence, flattens every sky to one kind or has no occlusion. A case a host fails on the device is host work, recorded with its reason; a case a host passes is the proof that the platform behaves as the reference does.

## Tested on a headset

Every native binding has run on a Quest 3 through the Reality Collective's own native host. Each one passed its conformance cases on the device and a person's play-through. The service framework's slice has also run in the visionOS Simulator.

Two known issues remain on native:

- **Interactions:** grab does not yet work as it should. Pinch works as expected.
- **UI Extensions:** the system keyboard for a text field opens outside the wearer's view, so text cannot be typed yet. Pressing a field focuses it and asks for the keyboard as it should.

Environment and the service framework have no known issues on native.

## More information

- [Conformance suites](./06-conformance-suites.md)
- [The layering rule](./01-layering-rule.md)
- [Engines and adapters](./02-engines.md)
- [Input: Implementations](/webxr/docs/input/integrations/implementations)
- [Interactions: Native](/webxr/docs/interactions/integrations/native)
- [UI Extensions: Native](/webxr/docs/uiextensions/integrations/native)
- [Environment: Native](/webxr/docs/environment/integrations/native)
- [Service Framework: Native](https://serviceframework.realitycollective.net/docs/web/integrations/native)
