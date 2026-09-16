---
sidebar_label: 'Reality Toolkit (WebXR) quick start'
sidebar_position: 6
title: Reality Toolkit WebXR quick start
description: Set up a Meta IWSDK project that uses every Reality Toolkit WebXR family and the Service Framework, and run it on a headset.
---

# Reality Toolkit WebXR quick start

This is the WebXR counterpart of the [Unity quick start](./get-started.md). It takes an empty folder to a scene on a Meta Quest headset that uses every framework in the Reality Toolkit WebXR estate: a window, a pressable sphere, a sky and a sound, and, as an optional last step, all of it hosted as services.

| Framework | Package installed | What it contributes here |
| --- | --- | --- |
| UI Extensions | `@realitycollective/iwsdk-uiextensions` | The draggable window |
| Interactions | `@realitycollective/iwsdk-interactions` | Makes the sphere pressable |
| Environment | `@realitycollective/iwsdk-environment` | The sky, the light and the click sound |
| Input | re-exported by every adapter above, no install of its own | The pointer, hand and controller data every adapter reads |
| Service Framework | `@realitycollective/service-framework` and `@realitycollective/service-framework-iwsdk` | Hosts the press-to-sound wiring as a service (optional) |

## Before you start

You need:

- Node.js 20 or newer.
- A Meta Quest headset with the Meta Quest Browser installed.
- The headset and your PC on the same Wi-Fi network, or a USB cable so you can use `adb reverse` instead.
- Optionally, once you have installed the UI Extensions adapter in step 2, run `npx uix-dev doctor` to check your environment for the headset routes later in this page.

## Step 1: Create the IWSDK project

Scaffold a new app with the Meta IWSDK project generator:

```bash
npm create @iwsdk@latest
```

Give the project a name when asked, for example `my-first-scene`, and accept the defaults for the rest of the prompts. Then install and start it:

```bash
cd my-first-scene
npm install
npm run dev
```

Open the local URL the dev server prints in a desktop browser. You should see the generator's starter scene with mouse-and-keyboard controls, no headset required yet.

:::note
The generator puts the app entry point in `src/index.ts` (its README says so, and that is where `World.create` is called). The steps below add to that file.
:::

## Step 2: Install the UI Extensions adapter

`@realitycollective/iwsdk-uiextensions` is the Meta IWSDK adapter for WebXR UI Extensions, currently a `0.1.0` preview on npm:

```bash
npm install @realitycollective/iwsdk-uiextensions@preview
```

This one package is everything you need. It re-exports the engine-free core, `@realitycollective/webxr-uiextensions`, in full, along with the input contracts it depends on, so no separate core install is required. It peers on `@iwsdk/core >=0.5.0 <0.6.0` and `three >=0.170.0`, both of which the generated project already has. See [Getting started](/webxr/docs/uiextensions/basics/getting-started) for the full walkthrough of this adapter on its own.

The core never imports an engine: window lifecycle, dock state and drag maths are plain TypeScript. `@realitycollective/iwsdk-uiextensions` is the only place `@iwsdk/core` and `three` appear, translating those decisions onto IWSDK's entity component system.

## Step 3: Add the panel markup

WebXR UI Extensions panels are written in UIKitML, an HTML and CSS-like markup language for spatial panels. On IWSDK 0.5 a panel's `config` is fetched and parsed at runtime, with no build step, so the file goes straight into `public/ui/`.

Create `public/ui/window.uikitml`:

```html
<style>
  .uix-window {
    display: flex;
    flex-direction: column;
    width: 300;
    background-color: rgba(16, 26, 38, 0.92);
    border-radius: 12.5;
    border-color: #2e4a66;
    border-width: 0.75;
  }
  .uix-titlebar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8;
    background-color: #1b2c40;
    border-top-left-radius: 12.5;
    border-top-right-radius: 12.5;
    cursor: pointer;
  }
  .uix-title { flex-shrink: 1; font-size: 12; font-weight: bold; color: #dce9f7; }
  .uix-titlebar-buttons { display: flex; flex-direction: row; flex-shrink: 0; }
  .uix-titlebar-button {
    width: 34;
    height: 20;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin-left: 4;
    font-size: 9;
    color: #9fb8d4;
    background-color: #223850;
    border-radius: 6;
    cursor: pointer;
  }
  .uix-titlebar-button:hover { background-color: #33547a; color: #ffffff; }
  .uix-content { display: flex; flex-direction: column; width: 100%; padding: 10; }
  .body-text { font-size: 11; color: #c4d6ea; }
</style>
<div id="uix-window" class="uix-window">
  <div id="uix-titlebar" class="uix-titlebar">
    <span id="uix-title" class="uix-title">.</span>
    <div class="uix-titlebar-buttons">
      <div id="uix-pin" class="uix-titlebar-button">PIN</div>
      <div id="uix-dock" class="uix-titlebar-button">DOCK</div>
      <div id="uix-minimize" class="uix-titlebar-button">MIN</div>
      <div id="uix-close" class="uix-titlebar-button">X</div>
    </div>
  </div>
  <div id="uix-content" class="uix-content">
    <span class="body-text">Hello from your first Reality Toolkit WebXR window.</span>
  </div>
</div>
```

The chrome, the window's title bar and its buttons, is found by well-known element ids: `uix-window` for the panel root, `uix-titlebar` for the drag surface, `uix-title` for the label, and `uix-pin`, `uix-dock`, `uix-minimize`, `uix-close` for the four title-bar buttons. Only the ids are contractual, so the styling above is yours to change. Every title-bar button is off until code enables it, which step 4 does with `pinnable`. Chrome buttons are `<div>` elements rather than `<button>` elements, because a registered component kit's `<button>` resolves to a full component that fights compact title-bar sizing.

## Step 4: Register the adapter and open the window

Open the file that creates your world (the one calling `World.create`) and replace its world setup with the following, which turns on spatial UI, registers the adapter's systems, and opens the window:

```ts
import { World } from '@iwsdk/core';
import {
  registerUIExtensions,
  createSceneHost,
  DockMode,
} from '@realitycollective/iwsdk-uiextensions';

export async function start(container: HTMLDivElement) {
  const world = await World.create(container, {
    features: { spatialUI: true },
  });

  registerUIExtensions(world);
  const host = createSceneHost(world);

  host.createWindow({
    id: 'hello',
    title: 'Hello Window',
    config: './ui/window.uikitml',
    dockMode: DockMode.BodyFollow,
    pinnable: true,
  });
}
```

`registerUIExtensions(world)` registers every ECS system the adapter needs, window, dock, drag, regions and controls, onto the `World` your app already created. `createSceneHost(world)` returns a host whose `createWindow` spawns the window and resolves the config path against `public/`, so `./ui/window.uikitml` finds the file from step 3.

`DockMode.BodyFollow` makes the window follow you at a short offset until you pin or drag it; `pinnable: true` turns the PIN button on so you can plant it in place. In the desktop preview, drag the title bar with the mouse to move the window, and click PIN to stop it following you.

## Step 5: Add the sphere

Add a plain three.js sphere alongside the window. Add this to the same function, after `createSceneHost`:

```ts
import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

const sphere = new Mesh(
  new SphereGeometry(0.15, 32, 16),
  new MeshStandardMaterial({ color: 0x4a8fd0 }),
);
sphere.position.set(0, 1.5, -1);
const sphereEntity = world.createTransformEntity(sphere);
```

`world.createTransformEntity(sphere)` is how IWSDK adds a three.js object to the scene as an entity, the same call the IWSDK generator's own starter code uses for a mesh. Capture the return value in `sphereEntity`; the Interactions step needs it. The position, 1.5 metres up and 1 metre in front, puts the sphere at roughly eye height, an arm's reach away. The sphere has no light on it yet: step 7 adds a sky and light through the Environment family, so leave it unlit for now and it will be shaded once that step runs.

## Step 6: Make the sphere pressable

`@realitycollective/iwsdk-interactions` is the Meta IWSDK adapter for the Reality Collective Interaction Extensions. It re-exports its engine-free core, so this one package is everything you need:

```bash
npm install @realitycollective/iwsdk-interactions@preview
```

`registerInteractions(world)` is a one-call setup, idempotent per world, that registers the bridge system for you. `register` describes an interactable as data, an id and the behaviours it carries; `press` is a mechanical button that fires an `actuated` event on press and a `released` event on release, described on the core's [Behaviours](/webxr/docs/interactions/basics/behaviours) page.

```ts
import { registerInteractions } from '@realitycollective/iwsdk-interactions';

const interactions = registerInteractions(world);

interactions.register({ id: 'sphere', behaviours: [{ kind: 'press' }] }, sphereEntity);
```

Because the sphere's behaviour is `press`, the adapter adds IWSDK's own `PokeInteractable` and `RayInteractable` components to `sphereEntity` for you, so a controller ray, a hand poke or the desktop mouse fallback can all trigger it. IWSDK already knows what is being pressed, through its own `Pressed` tag; the adapter forwards that answer instead of re-deriving it. IWSDK drives the render loop, so there is no `update` call to make.

Both this adapter and the UI Extensions adapter from step 2 implement the same engine-free input contracts from `@realitycollective/webxr-input` and re-export them, so handedness, capabilities and pointer data are already available through either package with no separate install. See [Welcome to WebXR Input](/webxr/docs/input/get-started) for what those contracts cover.

## Step 7: Set the sky and add a sound

`@realitycollective/iwsdk-environment` is the Meta IWSDK adapter for WebXR Environment. It drives IWSDK's own sky, light and audio machinery rather than reaching past it to three.js:

```bash
npm install @realitycollective/iwsdk-environment@preview
```

`registerEnvironment(world, options)` is a one-call setup that also registers the system ticking both the sky and the audio. `STOCK_PRESETS` and `VOID` are example environments shipped for a new project's first five minutes; `transition` eases from the current sky to another over a duration. Passing `audio.cues` registers a sound the app can play by id later. There is no audio file in the package, so put any short `.mp3` you have at `public/audio/click.mp3`, the way the <DemoLink demo="environment">Environment playground</DemoLink> demo does:

```ts
import { registerEnvironment, STOCK_PRESETS, VOID } from '@realitycollective/iwsdk-environment';

const env = registerEnvironment(world, {
  presets: STOCK_PRESETS,
  initial: VOID,
  audio: {
    cues: [{ id: 'click', src: '/audio/click.mp3', bus: 'ui', gain: 0.8 }],
  },
});

env.environment.transition('dusk', { durationMs: 8000 });
```

The environment now supplies the sphere's light as well as the sky, through IWSDK's own `AmbientLightComponent` and `DirectionalLightComponent`, so the sphere from step 5 is lit once this step runs. Because the tick is an IWSDK system, the sky and the audio both stop advancing when the session loses focus, exactly like the rest of the app.

## Step 8: Wire press to sound

Interactions and Environment do not know about each other. Neither package imports the other, and neither ever will: the core of each family has an architecture test that fails the build the moment a sibling package's name appears in it. What crosses that boundary crosses it as a subscription the app makes, at the one place both halves are already in scope:

```ts
interactions.runtime.onEvent((event) => {
  if (event.interactableId === 'sphere' && event.type === 'actuated') {
    env.audio?.play('click');
  }
});
```

`interactions.runtime.onEvent` is the only outbound pathway from the interaction core; every `actuated`, `released` and other event listed on the [Behaviours](/webxr/docs/interactions/basics/behaviours) page comes through it. `env.audio` is the `AudioDirector` step 7 created, and `play(cueId)` is its entire inbound surface: nothing in the library decides on its own that a sound should happen. If this line is deleted, both packages carry on working exactly as before; they simply stop talking to each other.

## Step 9: Run on the headset

Both routes below come from the UI Extensions developer cycle and use the `uix-dev` CLI. Install it as a dev dependency first:

```bash
npm install --save-dev @realitycollective/uix-devtools@preview
```

### Route A: quick tunnel (wireless)

```bash
npx uix-dev tunnel
```

This starts your dev server, opens a Cloudflare quick tunnel, and prints two QR codes in the terminal: a plain runtime URL and an edit-mode URL. On the Quest, open the browser and scan the plain QR code. The tunnel gives you a real HTTPS origin, which WebXR requires, with no certificates to install.

### Route B: USB (`adb reverse`)

With the Quest connected by USB and developer mode on:

```bash
npm run dev
adb reverse tcp:5173 tcp:5173
```

Use the port your `npm run dev` printed in step 1 on both sides of `adb reverse` if it differs from 5173. Open `http://localhost:5173` (adjust the port to match) in the Quest browser.

### In the headset

Click Enter VR. You should see the sky ease from nothing to dusk, the "Hello Window" panel, and the lit sphere in front of you. Drag the window by its title bar to move it, click PIN to plant it in place, and press the sphere with a controller ray, a hand poke, or a grip trigger to hear the click.

## Step 10 (optional): Host it in the Service Framework

The pieces above already work on their own. This step hosts the same press-to-sound wiring from step 8 as a service instead, using the Service Framework's IWSDK integration, so it starts, pauses and tears down alongside every other service an app registers this way. Install both packages:

```bash
npm install @realitycollective/service-framework @realitycollective/service-framework-iwsdk
```

A service extends `BaseService`. It needs no constructor of its own: `start()` and `destroy()` are enough, and they can close over the `interactions` and `env` variables from the steps above, because both are already in scope in the same file.

```ts
import { BaseService, createServiceProfile, createServiceToken, type ServiceProfile } from '@realitycollective/service-framework';
import { startServiceRuntime, makeServiceBridgeSystem } from '@realitycollective/service-framework-iwsdk';
import { createSystem, VisibilityState } from '@iwsdk/core';

const PRESS_TO_SOUND_TOKEN = createServiceToken<PressToSoundService>('PressToSoundService');

class PressToSoundService extends BaseService {
  private unsubscribe?: () => void;

  public override start(): void {
    this.unsubscribe = interactions.runtime.onEvent((event) => {
      if (event.interactableId === 'sphere' && event.type === 'actuated') {
        env.audio?.play('click');
      }
    });
  }

  public override destroy(): void {
    this.unsubscribe?.();
  }
}

const createProfile = () =>
  createServiceProfile('my-first-scene', [
    { token: PRESS_TO_SOUND_TOKEN, useClass: PressToSoundService },
  ]);

const { manager, adapter } = startServiceRuntime(world, createProfile);

world.registerSystem(
  makeServiceBridgeSystem({
    adapter,
    manager,
    world,
    createSystem,
    visibleState: VisibilityState.Visible,
  }),
);
```

Once this is in place, remove the plain `interactions.runtime.onEvent` subscription from step 8: the service now owns that line, so keeping both would wire the click twice. `startServiceRuntime` stands up the service manager and IWSDK's `RuntimeAdapter` from a profile factory; `makeServiceBridgeSystem` registers the one ECS system that pumps frames into every service and pauses them when the headset comes off. This is the smallest working registration; see the [Service Framework site](https://serviceframework.realitycollective.net/) for the rest of the API, including sessions and capability gating.

## What you built

The finished `src/index.ts`, without the optional Service Framework step:

```ts
import { World } from '@iwsdk/core';
import {
  registerUIExtensions,
  createSceneHost,
  DockMode,
} from '@realitycollective/iwsdk-uiextensions';
import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import { registerInteractions } from '@realitycollective/iwsdk-interactions';
import { registerEnvironment, STOCK_PRESETS, VOID } from '@realitycollective/iwsdk-environment';

export async function start(container: HTMLDivElement) {
  const world = await World.create(container, {
    features: { spatialUI: true },
  });

  registerUIExtensions(world);
  const host = createSceneHost(world);

  host.createWindow({
    id: 'hello',
    title: 'Hello Window',
    config: './ui/window.uikitml',
    dockMode: DockMode.BodyFollow,
    pinnable: true,
  });

  const sphere = new Mesh(
    new SphereGeometry(0.15, 32, 16),
    new MeshStandardMaterial({ color: 0x4a8fd0 }),
  );
  sphere.position.set(0, 1.5, -1);
  const sphereEntity = world.createTransformEntity(sphere);

  const interactions = registerInteractions(world);
  interactions.register({ id: 'sphere', behaviours: [{ kind: 'press' }] }, sphereEntity);

  const env = registerEnvironment(world, {
    presets: STOCK_PRESETS,
    initial: VOID,
    audio: {
      cues: [{ id: 'click', src: '/audio/click.mp3', bus: 'ui', gain: 0.8 }],
    },
  });
  env.environment.transition('dusk', { durationMs: 8000 });

  interactions.runtime.onEvent((event) => {
    if (event.interactableId === 'sphere' && event.type === 'actuated') {
      env.audio?.play('click');
    }
  });
}
```

`registerUIExtensions`, `createSceneHost` and `host.createWindow` are UI Extensions: the draggable window. The `Mesh` and `world.createTransformEntity` lines are plain IWSDK and three.js, the content the app owns. `registerInteractions` and `interactions.register` are Interactions: they make the sphere pressable and report `actuated`/`released` events. `registerEnvironment`, its preset options and `env.environment.transition` are Environment: the sky, the light and the registered click cue. The Input contracts from step 6 are not a separate block; they arrive already re-exported inside the Interactions and UI Extensions adapters above. The final `interactions.runtime.onEvent` call is the one line the app itself owns, the boundary where Interactions and Environment meet.

## Where next

- [UI Extensions: Welcome](/webxr/docs/uiextensions/basics/getting-started) for the rest of the windowing, docking and control surface.
- [Interactions: Welcome](/webxr/docs/interactions/get-started) for the other behaviours, targeting and feedback.
- [Environment: Welcome](/webxr/docs/environment/get-started) for presets, fog, occlusion and the room.
- [Input: Welcome](/webxr/docs/input/get-started) for the contracts every adapter above implements.
- The [Service Framework site](https://serviceframework.realitycollective.net/) for dependency injection, sessions and capabilities across every host.
- [Deploying to Cloudflare Pages](./deploying-to-cloudflare-pages.md) to put your scene online.
