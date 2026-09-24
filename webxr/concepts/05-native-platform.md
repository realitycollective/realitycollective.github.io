---
sidebar_position: 5
title: Native as a platform
description: The one __rcHost object a native app installs, the slice each family reads from it, and what runs where.
---

# Native as a platform

Native is a fifth platform in every family, beside three.js, Babylon.js, Meta IWSDK and Google XR Blocks. A native XR app, over OpenXR on Quest or CompositorServices on visionOS, embeds a JavaScript engine such as Hermes and runs the same client code that runs in a browser. The engine is the app's choice, made when it is built: JavaScriptCore or V8 serve as well, provided the engine supplies the host globals the [service framework's native page](https://serviceframework.realitycollective.net/docs/web/integrations/native) lists. No adapter reads a scene graph here, as the engine adapters do. Instead the app installs one host object, and each family's native package reads its own slice of it.

It arrives in the next preview of each family that has a native package: service framework 1.0.2, and Interactions, UI Extensions and Environment 0.1.1.

## The one host object

A native app installs `globalThis.__rcHost` before it evaluates the app bundle. Every native package reads its slice from this single object, or accepts the slice by injection for tests, and falls back to the global when none is given. Services, interactions, UI and environment code do not change between web and native: only the adapter underneath is different.

## The slices

| Slice | Family | Package | What it carries |
| --- | --- | --- | --- |
| (root) | Service Framework | `service-framework-native` | `onFrame`, session info and the session lifecycle. Every other family's package plugs into this same object |
| `io` | Service Framework | `service-framework-native` | Byte transport: `fetchBytes` and `gunzip`, read through the core's `HostIO` |
| `input` | Interactions | `native-interactions` | The input provider slice: capabilities, per-frame sampling, optional head pose, haptics and presence |
| `interactions` | Interactions | `native-interactions` | Hit testing and transform writes, keyed by the target id the app chose when it registered the object |
| `ui` | UI Extensions | `native-uiextensions` | Panels and windows: element trees, property writes, element events, and window and region state |
| `environment` | Environment | `native-environment` | Sky, fog, ambient light, key light and image-based lighting |
| `audio` | Environment | `native-environment` | Cue playback: start, stop, gain and voice-ended reporting |
| `sensing` | Environment | `native-environment` | World sensing: planes, meshes, anchors and hit tests. Every member on this slice is optional |

Every slice except the root is optional. A native package given a host with its slice missing throws one clear error at construction that names the missing slice, rather than failing on the first call that needed it. `sensing` is the one exception: a host with no `sensing` slice is a supported shape, and the Environment family reports each sensing feature as `unsupported` instead of throwing.

## Plain values only

Values that cross the boundary are plain: numbers, strings, booleans, arrays, plain objects and `Uint8Array`. No engine object crosses in either direction. The only functions that cross are listener callbacks passed to an `on*` method, and each `on*` method returns an unsubscribe function. Vectors are tuples, exactly as `@realitycollective/webxr-input` defines them: `Vec3Tuple` `[x, y, z]` in metres and `QuatTuple` `[x, y, z, w]`, world space, right-handed and y-up, as WebXR already is. Ids are strings chosen by whoever creates the thing.

## The golden rule and the platform rule

Clients only ever talk to a family's core. The core states what it needs as a contract, and every platform, native included, implements that contract; no platform adds a call of its own. A native package's public surface is the same kind every other platform adapter has: the core re-exported, the classes that implement the core's interfaces, one setup entry point, its options, and the structural types of its own slice. Slice reading and tuple copying stay internal, and each native package has a test that fails if its public surface grows beyond that shape.

## Assets are transparent

A `src` string, such as a sky texture, an environment map, an audio cue or a panel config path, means the same thing on web and native: a URL or a path relative to the app's content root. On native, the app resolves and decodes it with its own loaders. The JavaScript side never decodes an image, an audio file or a model; the framework ships byte transport helpers, such as `HostIO`, and never a decoder.

## What runs where

The native app owns rendering, physics and assets. It renders the scene, resolves hit tests and physics against its own scene graph, and answers pose reads and writes for whatever the app registered. The JavaScript side owns the same engine-free logic it runs everywhere else: behaviours, the window manager, the environment document and the audio director. The native packages copy every tuple they read from a slice or hand to one. A host may therefore reuse its own buffers without reaching an object the app is still holding.

## Status

:::warning
Every native binding is tested headless against in-memory fakes of `__rcHost`. Only the root slice, the service framework, has run on real hardware: Quest 3 and the visionOS Simulator. Treat every other slice as a preview until it has run on a device.
:::

## More information

- [Conformance suites](./06-conformance-suites.md)
- [The layering rule](./01-layering-rule.md)
- [Engines and adapters](./02-engines.md)
- [Input: Implementations](/webxr/docs/input/integrations/implementations)
- [Interactions: Native](/webxr/docs/interactions/integrations/native)
- [UI Extensions: Native](/webxr/docs/uiextensions/integrations/native)
- [Environment: Native](/webxr/docs/environment/integrations/native)
- [Service Framework: Native](https://serviceframework.realitycollective.net/docs/web/integrations/native)
