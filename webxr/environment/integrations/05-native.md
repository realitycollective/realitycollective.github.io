---
sidebar_position: 5
title: "Native: @realitycollective/native-environment"
description: The native host adapter for WebXR Environment, reading the environment, audio and sensing slices of globalThis.__rcHost.
---

# Native: @realitycollective/native-environment

From 0.1.1 (preview).

The native adapter drives a native app's own environment, lighting, audio and sensing, for an app that embeds a JavaScript engine such as Hermes over OpenXR or CompositorServices and installs one object, `globalThis.__rcHost`, before the bundle runs. See the [native platform concept](/webxr/docs/concepts/native-platform) for the host contract this adapter reads.

## What it binds

Three independent slices of `__rcHost`: `environment`, `audio` and `sensing`. Nothing here is engine-specific in the way three.js's `Fog` or IWSDK's `DomeGradient` is: every port forwards a spec, a request or a callback across the boundary as plain data, because the director has already resolved the interpolation, the mix and the retrigger policy by the time a port method runs. This package imports no engine at all.

## Install

```bash
npm install @realitycollective/native-environment
```

This package re-exports the whole core, so a native app installs it and nothing else.

## Setup

```ts
import { createNativeEnvironment, createNativeAudio, createNativeWorldSensing, STOCK_PRESETS } from "@realitycollective/native-environment";
import { NativeRuntimeAdapter } from "@realitycollective/service-framework-native";

// Each create* reads globalThis.__rcHost's matching slice; pass a host in directly for tests.
const { director } = createNativeEnvironment(undefined, { presets: STOCK_PRESETS, initial: STOCK_PRESETS.noon });
const { director: audio } = createNativeAudio();
const { director: sensing } = createNativeWorldSensing();

director.transition("dusk", { durationMs: 8000, easing: "easeInOut" });
audio.register({ id: "click", src: "audio/click.mp3" });

// Neither director ticks itself. Frames come from the service framework's
// native binding, as they do for every other service on this host.
const adapter = new NativeRuntimeAdapter();
adapter.onFrame((frame) => {
  director.update(frame.delta * 1000); // FrameInfo.delta is in seconds
  audio.update(frame.delta * 1000);
});
```

Every `create*` helper takes the host slice first, matching `createThreeEnvironment(scene, ...)` on the three.js adapter: the one thing that differs per host, ahead of the options every adapter shares. Leave it out and the port falls back to `globalThis.__rcHost`, which is what a real native app installs.

## The environment, audio and sensing slices

`NativeEnvironmentPort` forwards `applySky`, `applyFog`, `applyAmbient`, `applyKeyLight` and `applyIbl` straight to `__rcHost.environment`'s five required methods; there is nothing to convert, because the director has already resolved which slot changed. `NativeAudioPort` forwards `start` and `stop` to `__rcHost.audio`, and `NativeWorldSensingPort` forwards `setDetection`, `startHitTest`, `stopHitTest`, `createAnchor` and `removeAnchor` to `__rcHost.sensing` one member at a time.

`applyOcclusion` and `applyLightEstimation` on the `environment` slice are optional, as are every member of `load` and `setGain` on `audio` and all five setters on `sensing`. The port grows the matching method on itself only when the host implements it, and leaves the rest off. `EnvironmentDirector` and `WorldSensingDirector` already check whether their port has the method before calling it and report `unsupported` themselves the moment an app asks for something the port cannot do, so wiring a method here that only re-reports what the director already knows would say the same thing twice. See [The boundary](../features/02-the-boundary.md) for the director side of this rule.

## Specs pass through unchanged

A `SkySpec`, an `AudioCue`, an `OcclusionSpec`: every value crossing this boundary is already plain data, because the core resolved it before handing it to the port. A `src` string on a sky texture, an environment map or an audio cue means the same thing here as on every other host, a URL or a path relative to the app's content root, and **the native app resolves and decodes it with its own loaders**. Nothing in this package fetches, decodes or caches an image, a sound or a model.

## Voice endings stay in JavaScript

`AudioVoiceRequest.ended` is a callback the core hands to a port so the port can report a voice finishing, which is backwards from the rule that only listener callbacks passed to an `on*` method cross this boundary. `NativeAudioPort` keeps every voice's `ended` callback in a `Map` keyed by `voiceId`, sends the host a request with `ended` removed (`NativeAudioVoiceRequest`), and runs the kept callback itself once `NativeAudioHost.onVoiceEnded` names that id. `stop` removes a voice's entry from the map before telling the host, so a voice that ends and is stopped in the same tick is only ever reported once.

## Optional members and the world-sensing slice

`sensing` is the one slice this family treats as genuinely optional, unlike `environment` and `audio`. A host with no `sensing` slice at all is a normal, supported shape. `NativeWorldSensingPort` then grows none of its optional members, and `WorldSensingDirector` reports every call the app makes as `unsupported`, which is what "the port reports unsupported" in the native host contract means in practice, the reporting lives one layer up, in the director, and this port's job is only to be honestly absent. `NativeWorldSensingPort` has no `update` method: every other adapter's world-sensing port polls because its host hands back a frame's worth of state on demand, but a native host pushes changes through `onPlanes`, `onMeshes`, `onAnchors`, `onHits` and `onSensingReport` instead, so there is nothing here for a tick to do.

## What happens when a slice is missing

| Slice | Required by | Missing |
| --- | --- | --- |
| `environment` | `NativeEnvironmentPort` | Throws at construction, naming the slice |
| `audio` | `NativeAudioPort` | Throws at construction, naming the slice |
| `sensing` | `NativeWorldSensingPort` | Never throws; every call reports `unsupported` |

Every port also takes its slice directly, for tests: `new NativeEnvironmentPort(fakeHost)` never touches `globalThis`.

## Testing it

Each port runs the shared conformance suites: `environmentPortContractCases()` (6 cases), `audioPortContractCases()` (6 cases) and `worldSensingPortContractCases()` (7 cases). See [conformance suites](/webxr/docs/concepts/conformance-suites) for what each suite checks. All four platforms, three.js, IWSDK, XR Blocks and native, run all three suites, and this package holds 100% coverage.

:::warning
This adapter is tested headless only, against in-memory fakes of the `environment`, `audio` and `sensing` slices. It has not run against a real native host on Quest 3 or the visionOS Simulator; a device run is the native team's step.
:::

## More information

- [Getting started](../basics/02-getting-started.md)
- [The boundary](../features/02-the-boundary.md)
- [Sensing](../features/01-sensing.md)
- [Core: @realitycollective/webxr-environment](./01-core.md)
- [Native platform](/webxr/docs/concepts/native-platform)
- npm: [@realitycollective/native-environment](https://www.npmjs.com/package/@realitycollective/native-environment)
- [API reference](pathname:///webxr/api/environment/)
