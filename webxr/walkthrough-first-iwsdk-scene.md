---
sidebar_position: 3
sidebar_label: "Walkthrough: first IWSDK scene"
title: "Walkthrough: your first scene on Meta IWSDK"
description: Build a scene on Meta's Immersive Web SDK with a WebXR UI Extensions window and a sphere, then run it on a Quest headset.
---

# Walkthrough: your first scene on Meta IWSDK

This walkthrough takes an empty folder to a running scene on a Meta Quest headset: a window you can drag and a sphere you can walk around. Every step says what to type, what file to create, and what you should see. Nothing is assumed beyond JavaScript, npm and a browser.

## Before you start

You need:

- Node.js 20 or newer.
- A Meta Quest headset with the Meta Quest Browser installed.
- The headset and your PC on the same Wi-Fi network, or a USB cable so you can use `adb reverse` instead.
- Optionally, once you have installed the UI Extensions adapter in step 2, run `npx uix-dev doctor` to check your environment for the headset routes in step 6.

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

`@realitycollective/iwsdk-uiextensions` is the Meta IWSDK adapter for WebXR UI Extensions, released as `0.1.0` on npm:

```bash
npm install @realitycollective/iwsdk-uiextensions
```

This one package is everything you need. It re-exports the engine-free core, `@realitycollective/webxr-uiextensions`, in full, along with the input contracts it depends on, so no separate core install is required. It peers on `@iwsdk/core >=0.5.0 <0.6.0` and `three >=0.170.0`, both of which the generated project already has.

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

Add a plain three.js sphere alongside the window, lit so a `MeshStandardMaterial` actually shades. Add this to the same function, after `createSceneHost`:

```ts
import { AmbientLight, DirectionalLight, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';

world.scene.add(new AmbientLight(0xffffff, 0.9));
const sun = new DirectionalLight(0xffffff, 1.2);
sun.position.set(2, 4, 1);
world.scene.add(sun);

const sphere = new Mesh(
  new SphereGeometry(0.15, 32, 16),
  new MeshStandardMaterial({ color: 0x4a8fd0 }),
);
sphere.position.set(0, 1.5, -1);
world.createTransformEntity(sphere);
```

`world.createTransformEntity(sphere)` is how IWSDK adds a three.js object to the scene as an entity, the same call the IWSDK generator's own starter code uses for a mesh. The position, 1.5 metres up and 1 metre in front, puts the sphere at roughly eye height, an arm's reach away. On the desktop preview you should see a shaded blue sphere floating in front of the camera, next to the window from step 4.

## Step 6: Run on the headset

Both routes below come from the UI Extensions developer cycle and use the `uix-dev` CLI. Install it as a dev dependency first:

```bash
npm install --save-dev @realitycollective/uix-devtools
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

Click Enter VR. You should see the "Hello Window" panel and the blue sphere in front of you. Drag the window by its title bar to move it, click PIN to plant it in place, and walk around the sphere to see it from every side.

## What you built

You scaffolded an IWSDK project, added the UI Extensions adapter and opened a draggable window from a UIKitML panel. You placed a lit three.js sphere in the same scene using the world's own entity API. You ran both on a desktop browser and on a Quest headset, over a quick tunnel or a USB connection.

## Where next

- [UI Extensions: Welcome](./uiextensions/get-started.md) for the rest of the windowing, docking and control surface.
- [Interactions: Welcome](./interactions/get-started.md); making the sphere itself pressable or grabbable is an Interactions concern, layered on top of what you built here.
- [Environment: Welcome](./environment/get-started.md) for a sky and lighting setup instead of the two lights added by hand in step 5.
- [Start here](/webxr/docs) for the rest of the WebXR documentation.
