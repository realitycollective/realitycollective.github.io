---
sidebar_position: 5
title: 'Native: @realitycollective/native-uiextensions'
description: The native app adapter binding the core to an OpenXR or visionOS host that renders panels itself and installs globalThis.__rcHost.
---

# Native: @realitycollective/native-uiextensions

From 0.1.1 (preview).

## What it binds

This is the adapter for a **native** app: an OpenXR app on Quest, a CompositorServices app on visionOS, or any other shell that embeds a JavaScript engine such as Hermes. Unlike every other adapter in this repository, it owns no scene graph and interprets no markup itself. The native app renders panels and windows; this package keeps the core's `WindowManager` and controls talking to it across the boundary described in the [native platform concept](/webxr/docs/concepts/native-platform). It reads one slice of `globalThis.__rcHost`, `ui`, given by injection for tests or read from the global at construction.

## Install

```bash
npm install @realitycollective/native-uiextensions
```

This package re-exports the whole core, so a native app depends on this one package only. It imports no engine: no three.js, no uikit.

## Setup

```ts
import { NativeWindowHost } from '@realitycollective/native-uiextensions';

// `host` is optional - omit it to read globalThis.__rcHost.ui instead,
// which is what a real native app installs before evaluating the bundle.
const uix = new NativeWindowHost();

const handle = uix.createWindow({
  id: 'status',
  title: 'Status',
  config: '/ui/status.uikitml',
  closable: true,
});

handle.onReady((panel) => {
  panel.getElementById('uix-title')?.setProperties({ text: 'Status' });
});
```

`uix.manager` is the same `WindowManager` every adapter shares, so a hand menu or app logic drives it directly (`uix.manager.hide(id)`, `.dockTo(id, region)`, and so on) and the host stays in sync.

## The ui slice

The native app installs this as `globalThis.__rcHost.ui`. Every member is required.

```ts
interface NativeUiHost {
  createPanel(panelId: string, config: unknown): NativeElementNode;    // config: compiled UIKitML JSON or a path string
  createWindow(windowId: string, config: unknown, options: unknown): void;   // options.dockMode is the manager's: world-locked when options.region is set
  onPanelReady(cb: (windowId: string, panelId: string, tree: NativeElementNode) => void): () => void;
  setProperties(panelId: string, elementHandle: string, props: Record<string, unknown>): void;
  onElementEvent(cb: (panelId: string, elementHandle: string, type: string, payload: unknown) => void): () => void;
  setTargetDimensions(panelId: string, width: number, height: number): void;
  disposePanel(panelId: string): void;
  applyWindow(record: unknown): void;   // WindowManager record changes, as plain data
  closeWindow(windowId: string): void;
  createRegion(region: SceneRegion): void;   // from applyScene; the app owns layout
  removeRegion(regionId: string): void;     // on dispose
}
interface NativeElementNode {
  handle: string;                 // host-side element handle
  id?: string;                    // markup id
  componentName?: string;         // uix-* custom element name, when there is one
  attributes?: Record<string, string>;  // every data-* attribute as the markup wrote it, e.g. { "data-uix-min": "0" }
  children: NativeElementNode[];
}
```

`onPanelReady` here is the host telling this package a window's panel has finished; this package turns it into the `onReady` and `onPanelReady` callbacks the app sees. `setTargetDimensions` and `disposePanel` follow each panel's size and lifetime.

## Panels, windows and the proxy element tree

`NativeWindowHost` implements both `WindowHost` and `SceneTarget`, as the IWSDK and XR Blocks hosts do, so `applyScene(host, descriptor)` builds the same scene on native. `createPanel` and the panel side of `createWindow` ask the `ui` slice for a `NativeElementNode` tree, and wrap each node in a proxy `UixElement`. That is the interface every control upgrader already reads (`userData`, `children`, `addEventListener`, `setProperties`), so `<uix-stepper>`, `<uix-toggle>` and the rest work unchanged.

A `NativeElementNode` carries `handle` (the host's own stable reference), an optional `id` (the markup id) and `componentName` (the declared `uix-*` tag), and `attributes`: every `data-*` attribute exactly as the markup wrote it, for example `{ "data-uix-id": "count", "data-uix-min": "0" }`. The proxy lifts `id` into `userData.id`, `componentName` into `userData.customElement.componentName`, and every `data-*` attribute into `userData` under the core's `dataAttributeKey()` rule, so `data-uix-min` lands as `userData.uixMin`. **The native app must send `attributes` on every element.** Without them, every control runs on its defaults and has no id to be found by. See [Controls and markup](../basics/06-controls-and-markup.md).

A proxy's `setProperties(props)` forwards to `host.setProperties(panelId, elementHandle, props)`; `addEventListener(type, listener)` registers locally, and the host's single `onElementEvent(panelId, elementHandle, type, payload)` callback is routed to the right element by that `(panelId, elementHandle)` pair and dispatched to every listener registered for `type`.

## Windows, regions and applyWindow

Every `WindowManager` state change mirrors to the host as one `applyWindow(record)` call carrying a plain `WindowRecord` snapshot. That covers open, focus, minimize, hide, dock, chrome and hand menu, so the native app updates its own chrome, dock and visibility without reaching back into this package. The `dockMode` in `createWindow`'s options is the one the manager applied. A window opened into a region is always `world-locked`, whatever the call asked for, because a region places its windows; see [Docking and regions](../basics/04-docking-and-regions.md). A descriptor's regions arrive at `createRegion(region)` and are removed on `dispose`; a window's `config` stays the descriptor's path, which the native app resolves against its own content root, the same as every other host.

## dispose

`dispose()` closes every window this host opened, which routes each one through the manager's normal close path (`applyWindow`/`closeWindow`, disposing its panel once attached), disposes any bare panels still live, removes the regions the host created, then releases every host and manager subscription. It is safe to call twice. `WindowHost.dispose()` is required on every adapter as of this release; see [the adapter contract](../basics/07-adapter-contract.md).

## What it cannot do on this host, and why

Nothing here is engine-specific by nature, so there is no missing capability of the kind the IWSDK and XR Blocks pages list. `supportsStandalonePanels` is `true`: `createPanel` on the `ui` slice is synchronous, so a bare panel with no window chrome works directly.

## Testing it

`test/helpers/fake-native-ui-host.ts` is an in-memory fake of the `ui` slice: `createPanel` builds a tree synchronously from a small declarative spec, `createWindow` is fire-and-forget with a `readyWindow(...)` helper to simulate the native renderer finishing, and every other call is recorded rather than acted on. `test/host.test.ts` runs the shared `windowHostContractCases()` and `sceneTargetContractCases()` against `NativeWindowHost`, alongside tests of proxy element wiring, event dispatch and mirroring `WindowManager` state to the host. `test/element-contract.test.ts` runs `uixElementContractCases()` against panels built through the real `NativeWindowHost`. See [conformance suites](/webxr/docs/concepts/conformance-suites) for what the three suites check across every adapter.

:::warning
This adapter is tested headless only, against an in-memory fake of the `ui` slice. It has not run against a real native host on Quest 3 or the visionOS Simulator; a device run is the native team's step.
:::

## More information

- [Getting started](../basics/02-getting-started.md)
- [The adapter contract](../basics/07-adapter-contract.md)
- [Docking and regions](../basics/04-docking-and-regions.md)
- [Controls and markup](../basics/06-controls-and-markup.md)
- [Native platform](/webxr/docs/concepts/native-platform)
- npm: [@realitycollective/native-uiextensions](https://www.npmjs.com/package/@realitycollective/native-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
