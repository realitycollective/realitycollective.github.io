---
sidebar_position: 2
title: Getting started
description: Install an adapter, describe a window with a SceneDescriptor, register it and drive it from code.
---

# Getting started

This page installs one adapter and gets a single window on screen, using the reference Meta IWSDK adapter first.

## Install

```bash
npm install @realitycollective/iwsdk-uiextensions
```

Peer dependencies, the packages your app installs alongside the adapter: `@iwsdk/core >=0.5.0 <0.6.0` and `three >=0.170.0`, which every IWSDK app already has.

## Describe a window

A window is described by options that extend `WindowOptionsBase`: a title, a dock mode, a position, and which title-bar buttons are enabled. Every title-bar button, pin, dock, minimise and close, is off unless the window asks for it.

```ts
import { World } from '@iwsdk/core';
import { registerUIExtensions, createSceneHost, DockMode } from '@realitycollective/iwsdk-uiextensions';

const world = await World.create(container, { features: { spatialUI: true } });

const windows = registerUIExtensions(world);
const host = createSceneHost(world);

const status = host.createWindow({
  id: 'status',
  title: 'Player Status',
  config: './ui/status.uikitml',
  dockMode: DockMode.BodyFollow,
  pinnable: true,
});
```

`World` is IWSDK's entity component system container, the object every IWSDK app already creates; the adapter registers its systems into it.

## Register the adapter

`registerUIExtensions(world)` registers every system the adapter needs, window, dock, drag, regions, controls and the touch guard, and returns the `WindowManager`, the one API app code uses to change a window afterwards.

## Wire onPanelReady

Panels load asynchronously on every adapter, so never assume a panel exists immediately after creating its window. `onReady` on the handle, or `onPanelReady` on the host, fires once the panel is wireable, and replays for a panel that was already live when you subscribed.

```ts
status.onReady((panel) => {
  panel.getElementById('uix-title');
});
```

## Drive the window from code

```ts
windows.hide('status');
windows.togglePin('status');
windows.setChrome('status', { close: true });
windows.close('status');
```

## What changes on the XR Blocks and three.js adapter

The same options and the same `WindowManager` calls work on `@realitycollective/xrblocks-uiextensions`, the experimental Google XR Blocks and plain three.js adapter. Two differences: `createWindow` there returns a handle whose panel is ready immediately, because uikitml interprets the markup synchronously, and the host reports `supportsStandalonePanels: true`, so `createPanel` also works for an unmanaged panel with no window chrome. See [the XR Blocks and three.js adapter](../integrations/03-xrblocks-threejs.md) for the full feature matrix against IWSDK.

## More information

- [Windows and the window manager](./03-windows-and-the-window-manager.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [Showcase example](../examples/01-showcase.md)
- [API reference](pathname:///webxr/api/uiextensions/)
