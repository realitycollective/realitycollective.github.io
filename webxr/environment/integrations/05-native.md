---
sidebar_position: 5
title: "Native: @realitycollective/native-environment"
description: The native host adapter for WebXR Environment, reading the environment, audio and sensing slices of globalThis.__rcHost.
---

# Native: @realitycollective/native-environment

From 0.1.1 (preview).

The native adapter drives a native app's own environment, lighting, audio and sensing, for an app that embeds a JavaScript engine such as Hermes over OpenXR or CompositorServices and installs one object, `globalThis.__rcHost`, before the bundle runs. See the [native platform concept](/webxr/docs/concepts/native-platform) for the host contract this adapter reads.

## What it binds

Four independent slices of `__rcHost`: `environment`, `audio`, `sensing` and, from 0.1.1-preview.1, `scenes`. Nothing here is engine-specific in the way three.js's `Fog` or IWSDK's `DomeGradient` is: every port forwards a spec, a request or a callback across the boundary as plain data, because the director has already resolved the interpolation, the mix and the retrigger policy by the time a port method runs. This package imports no engine at all.

## Install

```bash
npm install @realitycollective/native-environment@preview
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

`applyOcclusion` and `applyLightEstimation` on the `environment` slice are optional, as are every member of `load` and `setGain` on `audio` and all five setters on `sensing`. The port grows the matching method on itself only when the host implements it, and leaves the rest off. From 0.1.1-preview.2 every member of the four slices carries a comment stating its units, sign, defaults and the IWSDK member it stands in for: what `null` means for each slot, that the director has already applied suppression, the easings and the policies, the key light's direction convention (the way the light travels), linear colours in 0..1, and that a scenes host reports every node id, repeats included, because the manager fails a load whose ids repeat. A host is built from those comments, not from a guess. `EnvironmentDirector` and `WorldSensingDirector` already check whether their port has the method before calling it and report `unsupported` themselves the moment an app asks for something the port cannot do, so wiring a method here that only re-reports what the director already knows would say the same thing twice. See [The boundary](../features/02-the-boundary.md) for the director side of this rule.

## Specs pass through unchanged

A `SkySpec`, an `AudioCue`, an `OcclusionSpec`: every value crossing this boundary is already plain data, because the core resolved it before handing it to the port. A `src` string on a sky texture, an environment map or an audio cue means the same thing here as on every other host, a URL or a path relative to the app's content root, and **the native app resolves and decodes it with its own loaders**. Nothing in this package fetches, decodes or caches an image, a sound or a model.

## Voice endings stay in JavaScript

`AudioVoiceRequest.ended` is a callback the core hands to a port so the port can report a voice finishing, which is backwards from the rule that only listener callbacks passed to an `on*` method cross this boundary. `NativeAudioPort` keeps every voice's `ended` callback in a `Map` keyed by `voiceId`, sends the host a request with `ended` removed (`NativeAudioVoiceRequest`), and runs the kept callback itself once `NativeAudioHost.onVoiceEnded` names that id. `stop` removes a voice's entry from the map before telling the host, so a voice that ends and is stopped in the same tick is only ever reported once. The host is expected to report a voice that fails to start promptly through `onVoiceEnded`; from 0.1.1-preview.2 `NativeAudioPortOptions.startTimeoutMs` (default 10 000 ms) is the backstop that releases such a voice on a host that forgets, through the core's shared `AudioStartReaper`. A cue that legitimately plays longer than the timeout should declare its own `durationMs`.

## Optional members and the world-sensing slice

`sensing` is the one slice this family treats as genuinely optional, unlike `environment` and `audio`. A host with no `sensing` slice at all is a normal, supported shape. `NativeWorldSensingPort` then grows none of its optional members, and `WorldSensingDirector` reports every call the app makes as `unsupported`, which is what "the port reports unsupported" in the native host contract means in practice, the reporting lives one layer up, in the director, and this port's job is only to be honestly absent. `NativeWorldSensingPort` has no `update` method: every other adapter's world-sensing port polls because its host hands back a frame's worth of state on demand, but a native host pushes changes through `onPlanes`, `onMeshes`, `onAnchors`, `onHits` and `onSensingReport` instead, so there is nothing here for a tick to do.

## The scenes slice

`createNativeScenes(host?, options)` puts the core's `SceneManager` over `__rcHost.scenes`. The manager holds every rule; the native app only builds, shows and destroys. It builds each scene from its `src` with its own loaders, builds physics from the physics components in it, and reports poses through the Interactions family's `interactions` slice as before.

```ts
interface NativeScenesHost {
  build(def: SceneDefinition, visible: boolean): Promise<{ scene: string; nodes: { id: string; key: string }[] }>;
  setVisible(scene: string, visible: boolean): void;
  destroy(scene: string): void;
  setNodeActive(node: string, active: boolean): void;
  instantiate(asset: string, pose: WorldPose, scene: string, parent: string | null): string;
  destroyInstance(instance: string): void;
  detachNode(scene: string, node: string): void;   // persistent: out of the scene's lifetime
  destroyNode(node: string): void;
  onBuildProgress?(cb: (sceneId: string, progress: number) => void): () => void;
}
```

Scenes and nodes cross as the app's own string keys. A node's key is also its target id in the `interactions` slice, so an interaction target registered against a scene node resolves to that node; use one key space for both. Hidden, for a scene or a node, means neither rendered nor hit-testable. `test/helpers.ts` in the package ships `createFakeScenesHost`, an in-memory app that passes all 18 scene cases, to copy from. See [Scenes](../basics/06-scenes.md).

## What happens when a slice is missing

| Slice | Required by | Missing |
| --- | --- | --- |
| `environment` | `NativeEnvironmentPort` | Throws at construction, naming the slice |
| `audio` | `NativeAudioPort` | Throws at construction, naming the slice |
| `sensing` | `NativeWorldSensingPort` | Never throws; every call reports `unsupported` |
| `scenes` | `NativeScenePort` | Throws at construction, naming the slice |

Every port also takes its slice directly, for tests: `new NativeEnvironmentPort(fakeHost)` never touches `globalThis`.

## Testing it

Each port runs the shared conformance suites: `environmentPortContractCases()` (6 cases), `audioPortContractCases()` (7 cases), `worldSensingPortContractCases()` (7 cases) and `sceneManagerContractCases()` (18 cases). See [conformance suites](/webxr/docs/concepts/conformance-suites) for what each suite checks. All four platforms, three.js, IWSDK, XR Blocks and native, run all four suites, and this package holds 100% coverage. The package also carries binding cases for what a native host receives from the director: the five slots in the order sky, fog, ambient, key, ibl, only the slots that changed; `null` for sky and fog while passthrough is on and the spec back after; the remembered occlusion spec on passthrough, with the sky suppressed once the host reports occlusion `active`; a transition with no duration snapping; and each of the four easings' value halfway through.

## The host conformance kit

From 0.1.1-preview.2, `nativeEnvironmentHostConformanceCases()` is the kit a native app runs on its device against its real `environment` and `audio` slices, 14 runner-free cases named `environment/<rule>` and `audio/<rule>`. It drives the real core directors over the host and reads back what the host drew and sounded through the `NativeEnvironmentTestHost` and `NativeAudioTestHost` readbacks the app provides in a test build: what was applied per slot, the sky and fog kinds actually drawn, whether the key light's shadow is on, whether materials reflect the IBL, whether light estimation reached the host, and the voices started and stopped. The cases check that every slot is drawn; that every sky kind (solid, gradient, texture) and every fog kind (linear, exponential) is drawn as the kind it was given rather than flattened to one; that passthrough suppresses sky and fog and restores them unchanged; that a transition's in-between values reach the host; that the remembered occlusion spec is applied when passthrough starts; that a key light's `castShadow` turns the host's shadow on and off; that an ibl spec makes materials reflect it and `null` turns that back off; that light estimation, once the host measures something, overlays ambient, key and ibl; and that the `overlap`, `restart`, `ignore`, `minIntervalMs` and stop policies sound as they should. A host that reports light estimation unavailable, or implements neither optional method, is accepted as legitimate; a host with no `applyOcclusion` or no `audio` slice fails the cases that need them, so those gaps show on the device rather than in a review. Against the package's reference fake every case passes, and the kit is shown to fail a host that flattens every sky to one kind or has no occlusion.

:::warning
This adapter is tested headless only, against in-memory fakes of the `environment`, `audio`, `sensing` and `scenes` slices. It has not run against a real native host on Quest 3 or the visionOS Simulator; a device run is the native team's step.
:::

## More information

- [Getting started](../basics/02-getting-started.md)
- [The boundary](../features/02-the-boundary.md)
- [Sensing](../features/01-sensing.md)
- [Core: @realitycollective/webxr-environment](./01-core.md)
- [Native platform](/webxr/docs/concepts/native-platform)
- npm: [@realitycollective/native-environment](https://www.npmjs.com/package/@realitycollective/native-environment)
- [API reference](pathname:///webxr/api/environment/)
