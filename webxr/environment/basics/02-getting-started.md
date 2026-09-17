---
sidebar_position: 2
title: Getting started
description: Install an adapter, create the director, apply a preset and tick it from your render loop.
---

# Getting started

This page takes you from an empty scene to a preset applied and eased on three.js, then shows what changes on IWSDK and Google XR Blocks.

## Install one adapter

Install exactly one engine **adapter**: the package that translates the environment's plain data onto your engine. Every adapter re-exports the engine-free core, so you never install the core yourself.:

```bash
npm install @realitycollective/threejs-environment three
```

## Create the director with the three.js adapter

`createThreeEnvironment` wires an `EnvironmentDirector` to a three.js `Scene` and hands back both the director and the port it talks through:

```ts
import { createThreeEnvironment, STOCK_PRESETS } from "@realitycollective/threejs-environment";

const { director } = createThreeEnvironment(scene, {
  presets: STOCK_PRESETS,
  initial: STOCK_PRESETS.noon,
  defaultTransition: { durationMs: 4000, easing: "easeInOut" },
});
```

`STOCK_PRESETS` is a set of six example environments (`void`, `dawn`, `noon`, `dusk`, `night`, `overcast`) shipped for a new project's first five minutes. They are examples to copy, not a view on how your world should look.

## Apply a stock preset, then ease to another

`apply` snaps to a spec or a preset name; `transition` eases to one over a duration:

```ts
director.apply("noon");
director.transition("dusk", { durationMs: 8000, easing: "easeInOut" });
```

Starting a new transition while one is running eases from where the environment is now, so interrupting a dusk halfway never jumps.

## Tick `update` from the render loop

The director does not own a loop, so call `update(deltaMs)` from whatever already runs per frame:

```ts
renderer.setAnimationLoop(() => {
  const deltaMs = clock.getDelta() * 1000;
  director.update(deltaMs);
  renderer.render(scene, camera);
});
```

## Play a cue

Audio has its own director, wired to a three.js `AudioListener`:

```ts
import { createThreeAudio } from "@realitycollective/threejs-environment";

const listener = new AudioListener();
camera.add(listener);
const { director: audio, port: audioPort } = createThreeAudio(listener, {
  cues: [{ id: "hum", src: "/audio/hum.mp3", bus: "ambience", loop: true }],
});

audioButton.addEventListener("click", () => {
  void audioPort.resume();
  audio.play("hum");
});
```

Call `audioPort.resume()` from the same gesture that enters XR, because a browser refuses to start an `AudioContext` outside a user gesture and a suspended context makes every voice silently succeed. Tick the audio director too: `audio.update(deltaMs)` alongside `director.update(deltaMs)`.

## What changes on IWSDK

Setup is one call, `registerEnvironment(world)`, which also registers the system that ticks both directors for you:

```ts
import { registerEnvironment, STOCK_PRESETS, VOID } from "@realitycollective/iwsdk-environment";

const env = registerEnvironment(world, {
  presets: STOCK_PRESETS,
  initial: VOID,
  audio: { cues: [{ id: "hum", src: "/audio/hum.mp3", bus: "ambience", loop: true }] },
});

env.environment.transition("dusk", { durationMs: 8000 });
```

Because the tick is an IWSDK system, the environment stops advancing when the session loses focus, exactly like the rest of the app. IWSDK hands a system its delta in seconds; `registerEnvironment` converts that to the milliseconds the directors take, once, so you never do that conversion yourself.

## What changes on XR Blocks

`createXRBlocksEnvironment` takes the scene plus the XR Blocks depth and lighting managers, so the adapter can also drive occlusion and light estimation:

```ts
import { createXRBlocksEnvironment, STOCK_PRESETS } from "@realitycollective/xrblocks-environment";

const { director } = createXRBlocksEnvironment(
  xb.core.scene,
  { depth: xb.core.depth, lighting: xb.core.lighting },
  { presets: STOCK_PRESETS, initial: STOCK_PRESETS.noon },
);

director.update(deltaMs);   // called from the XR Blocks script's own update
```

XR Blocks configures its depth and lighting managers during its own `xb.init`, so tick the director from the script's own `update` rather than a loop you own.

## More information

- [The environment document](./03-the-environment-document.md)
- [three.js and raw WebXR adapter](../integrations/02-threejs.md)
- [Environment playground](../examples/01-environment-playground.md)
- [API reference](pathname:///webxr/api/environment/)
