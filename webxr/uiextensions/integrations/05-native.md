---
sidebar_position: 5
title: 'Native: @realitycollective/native-uiextensions'
description: The native app adapter binding the core to an OpenXR or visionOS host that renders panels itself and installs globalThis.__rcHost, running every UI rule and handing the host results.
---

# Native: @realitycollective/native-uiextensions

From 0.1.1. A host written against the first preview, `0.1.1-preview.0`, has changes to absorb, listed [below](#moving-a-host-from-the-first-preview).

## What it binds

This is the adapter for a **native** app: an OpenXR app on Quest, a CompositorServices app on visionOS, or any other shell that embeds a JavaScript engine such as Hermes. Unlike every other adapter in this repository, it owns no scene graph and interprets no markup itself. The native app renders panels and windows; this package keeps the core's `WindowManager` and controls talking to it across the boundary described in the [native platform concept](/webxr/docs/concepts/native-platform).

The binding is as thick as the IWSDK reference. It runs, from the core, what IWSDK's `UIWindowSystem`, `UIDockSystem`, `FollowSystem`, `UIDockRegionSystem`, `UIDragSystem`, `UITouchGuardSystem` and `UIControlsSystem` do, and hands the host results: a pose and depth order per window, a property write per element, and a hidden flag. The host draws exactly what it is handed and reports what its pointers measure. It never places a window, decides a press or times a click.

It reads three things from `globalThis.__rcHost`, each given by injection for tests or read from the global at construction: the `ui` slice, the `input` slice for the head pose and grip poses (`getHeadPose()` and `sample()`, the same slice `native-interactions` reads), and `onFrame` for frames.

## Install

```bash
npm install @realitycollective/native-uiextensions
```

This package re-exports the whole core, so a native app depends on this one package only. It imports no engine: no three.js, no uikit. It depends on `@realitycollective/webxr-input` `^0.1.8` for the shared pointer arbiter.

## Setup

```ts
import { DockMode, NativeWindowHost } from '@realitycollective/native-uiextensions';

// Reads globalThis.__rcHost.ui, .input and .onFrame; pass host, input and frames to inject them instead.
const uix = new NativeWindowHost({ attachToHost: true });

const handle = uix.createWindow({
  id: 'status',
  title: 'Status',
  config: '/ui/status.uikitml',
  dockMode: DockMode.BodyFollow,
  closable: true,
});

handle.onReady((panel) => {
  panel.getElementById('uix-title')?.setProperties({ text: 'Status' });
});
```

`uix.manager` is the same `WindowManager` every adapter shares, so a hand menu or app logic drives it directly (`uix.manager.hide(id)`, `.dockTo(id, region)`, and so on). A window's record opens when its panel attaches, as IWSDK opens it on adoption, so `manager.has(id)` is false until `onReady` fires.

`NativeWindowHostOptions`: `host`, `input` and `frames` inject the slices; `attachToHost: true` drives `update(dt)` from `__rcHost.onFrame`, otherwise call `uix.update(dtSeconds)` from your own loop; `drag`, `nearDrag`, `regions` and `controls` switch those rules off (all on by default), as `registerUIExtensions` does on IWSDK; `touchPress` sets the press and release distances, `pointers` shares a pointer arbiter with the Interactions binding, and `pointerDisplay` sets how this host draws pointers when it owns the arbiter (see [Pointers](#pointers)). `CreateWindowOptions` takes every `WindowOptionsBase` option, including `dragDelay` and `billboardWhileDragging`.

## The ui slice

The native app installs this as `globalThis.__rcHost.ui`. Every member is required, and every member carries a comment in the package stating its units, sign, defaults and the IWSDK member it stands in for.

```ts
interface NativeUiHost {
  createPanel(panelId: string, config: unknown): NativeElementNode;       // config: a path string, resolved against the app's content root
  createWindow(windowId: string, config: unknown, options: unknown): void; // options.dockMode is the manager's: world-locked when options.region is set
  onPanelReady(cb: (windowId: string, panelId: string, tree: NativeElementNode) => void): () => void;
  setProperties(panelId: string, elementHandle: string, props: Record<string, unknown>): void;
  onElementEvent(cb: (panelId: string, elementHandle: string, type: string, payload: unknown) => void): () => void;
  onPointerSample(cb: (sample: NativePointerSample) => void): () => void;  // what each pointer measures, see below
  setHover?(panelId: string, elementHandle: string, hovered: boolean): void;  // apply or remove an element's hover style
  setScroll?(panelId: string, elementHandle: string, x: number, y: number): void;  // draw an element's content at this offset
  showKeyboard?(panelId: string, elementHandle: string, request: { value: string; multiline: boolean; type: string }): void;
  hideKeyboard?(): void;
  setWindowPose(windowId: string, pose: PoseTuple, depthOrder: number): void;  // draw and hit-test the window exactly here
  setTargetDimensions(panelId: string, width: number, height: number): void;
  disposePanel(panelId: string): void;
  applyWindow(record: unknown): void;    // only `hidden` and `dockMode` are for the host to apply
  closeWindow(windowId: string): void;
}

interface NativeElementNode {
  handle: string;                       // host-side element handle
  id?: string;                          // markup id
  componentName?: string;               // uix-* custom element name, when there is one
  attributes?: Record<string, string>;  // every data-* attribute as the markup wrote it, e.g. { "data-uix-min": "0" }
  scroll?: { width: number; height: number; maxX: number; maxY: number };  // present when the element scrolls
  input?: { value: string; multiline?: boolean; type?: string };            // present when the element is a text field
  children: NativeElementNode[];
}

interface NativePointerSample {
  sourceId: string;
  pointer: 'ray' | 'touch' | 'grab';
  panelId: string | null;               // the panel under the pointer, or null
  elementHandle: string | null;         // the element under the pointer, or null
  point: Vec3Tuple | null;              // world-space hit point, or the grab point
  signedDistance?: number;              // touch: along the panel normal, positive in front
  distance?: number;                    // metres, for comparing with an interactable's candidate; derived when omitted
  ray?: RayTuple;                       // ray: the live ray
  active?: boolean;                     // ray: select down; grab: squeeze or pinch held
  localPoint?: [number, number];        // ray: the hit in a scrolling element's own pixels, x right, y down
}
```

The `input` slice the binding reads alongside it is `NativeUiInputHost`: `getHeadPose()` for the viewer pose, `sample()` for each source's `handedness` and `gripPose` in the WebXR grip frame, and the optional `applyPointerVisuals` and `applyPointerDisplay` described under [Pointers](#pointers).

## What the host is handed

- **A pose per window.** `setWindowPose(windowId, pose, depthOrder)` is where the window is, every frame it changes, and the host draws and hit-tests it exactly there. The pose already carries the follow rule, the hand-menu anchor, the region slot, a drag in progress and the focus bias, so the host never places a window itself. `depthOrder` is the focus order, nearest first.
- **Properties per element.** The title, written to `uix-title` and defaulting to the window id, each chrome button's `display`, the PIN and MIN labels naming the next action, and the minimized content all arrive through `setProperties`, as do the app's own writes.
- **Two window flags.** `applyWindow(record)` carries the plain `WindowRecord`, but only two fields are for the host to apply: `hidden`, which means not shown, whether hidden through the manager or a hand menu whose palm gate is closed, and `dockMode`. The `dockMode` in `createWindow`'s options is the one the manager applied: a window opened into a region is `world-locked`, whatever the call asked for, because a region places its windows; see [Docking and regions](../basics/04-docking-and-regions.md).

- **Hover.** The binding decides which element each pointer is over, once per change, and tells the host through `setHover(panelId, elementHandle, hovered)`. An element stays hovered while any pointer is over it. The host restyles the element and decides nothing. A `pointerenter` or `pointerleave` the host raises through `onElementEvent` is ignored. Without `setHover` the host shows no hover style.
- **Scroll offsets.** An element that scrolls arrives with `scroll` set: its size in pixels and how far its content can scroll. The binding runs the core scroll rule over the drag of each ray sample's `localPoint`, with coasting and a rubber band at either end, and hands the host the offset through `setScroll(panelId, elementHandle, x, y)`. The host draws the content at that offset. The offset may briefly lie past the range while the content springs back. A host that resizes a scrolling element reports the new extent through `onElementEvent` with type `scrollextent`. Without `setScroll` nothing scrolls.
- **Keyboard requests.** An element that is a text field arrives with `input` set. A click on it makes the binding call `showKeyboard(panelId, elementHandle, { value, multiline, type })`. The host shows the system keyboard and reports every change through `onElementEvent` with type `input` and the whole value as `{ value }`, then `keyboardclosed` when entry ends. The binding writes each value onto the field, calls its `onValueChange` and raises `valueChanged`. It calls `hideKeyboard()` when a press lands outside the field. A host that cannot see the keyboard being dismissed, such as an Android `NativeActivity`, reports `keyboardclosed` from its own `hideKeyboard` or from a key event that ends entry. It never reports it twice for one entry. Without `showKeyboard` text cannot be entered.

## What the host reports

- **Pointer samples.** Through `onPointerSample` the host reports what each pointer measures: a `ray` sample every frame, with the live ray and whether select is down; a `touch` sample while a fingertip or controller tip is near a panel, with its signed distance along the panel normal, positive in front; and a `grab` sample every frame, with the grab point and whether squeeze or pinch is held. The binding raises `pointerdown`, `pointerup` and `click` from those samples, through the core's `EdgePress`, `dispatchTouchUpdate` and `TouchPress`, so a ray clicks on release as on IWSDK, a touch presses at 2 cm and releases at 3 cm and never from behind, and a controller tip presses panels too. The host must not raise those three events itself. `onElementEvent` stays for hover, `pointerenter` and `pointerleave`, and for value changes.
- **Panels.** `onPanelReady` is the host telling this package a window's panel has finished; this package turns it into the `onReady` and `onPanelReady` callbacks the app sees.
- **Poses.** The head pose and the grip poses, from the `input` slice, for follow, regions and hand menus.

## Pointers

Panels take part in the same pointer decision as interactables. The window host registers its panels with the `PointerArbiter` from `@realitycollective/webxr-input` as a `panel` target set. Each `onPointerSample` is offered to it as that source's nearest panel candidate for the sample's pointer kind. The binding hovers, presses, touches, drags and scrolls with a pointer only while that pointer owns its source. One pointer per hand therefore covers panels and objects together, as it does on IWSDK. The [pointer arbiter and display](/webxr/docs/input/features/pointer-arbiter-and-display) page describes the arbiter itself.

Whoever owns the arbiter draws the pointers. Two cases follow.

- **With `pointers`.** Pass the arbiter that `createNativeInteractions({ pointers })` shares. The Interactions binding then draws every ray and cursor, panel cursors included, through the `input` slice's `applyPointerVisuals` with `targetKind` set to `panel` over a panel. Update this host before the Interactions binding each frame.
- **Without `pointers`.** An app with windows and no interactables lets the window host own the arbiter. Once per frame, for every source that reported a pointer sample, it calls `applyPointerVisuals(sourceId, visuals)` on the `input` slice. It calls it once more with nothing to draw when a source stops reporting. The `visuals` record says whether to draw the ray, how far, in what colour, whether to draw the cursor disc, where, and what it sits on. The host draws exactly that. `applyPointerDisplay(config)` hands over the app's display settings when the host is created and on every change. It is informational, because every frame already arrives resolved.

The settings come from the `pointerDisplay` option, either a partial settings object or a `PointerDisplay` the app keeps and changes at run time. `getPointerDisplay()` returns the one in use. The defaults match IWSDK's look: the ray shows only while it hits something, and the cursor shows on objects and on panels.

Both members are optional on the `input` slice. A host without `applyPointerVisuals` draws no pointer for an app with windows alone, so the app cannot be aimed.

A sample may carry `distance`, the metres that arbitration compares with an interactable's candidate on the same source: the ray parameter for a ray, the unsigned distance to the panel for touch and grab. When it is missing the binding derives it from the ray and point, from `signedDistance`, or takes 0 for a grab over a title bar.

## Panels, windows and the proxy element tree

`NativeWindowHost` implements both `WindowHost` and `SceneTarget`, as the IWSDK, three.js and XR Blocks hosts do, so `applyScene(host, descriptor)` builds the same scene on native. `createPanel` and the panel side of `createWindow` ask the `ui` slice for a `NativeElementNode` tree, and wrap each node in a proxy `UixElement`. That is the interface every control upgrader already reads (`userData`, `children`, `addEventListener`, `setProperties`), so `<uix-stepper>`, `<uix-toggle>` and the rest work unchanged, and every panel, window or bare, is upgraded when it is built.

A `NativeElementNode` carries `handle` (the host's own stable reference), an optional `id` (the markup id) and `componentName` (the declared `uix-*` tag), and `attributes`: every `data-*` attribute exactly as the markup wrote it, for example `{ "data-uix-id": "count", "data-uix-min": "0" }`. The proxy lifts `id` into `userData.id`, `componentName` into `userData.customElement.componentName`, and every `data-*` attribute into `userData` under the core's `dataAttributeKey()` rule, so `data-uix-min` lands as `userData.uixMin`. **The native app must send `attributes` on every element.** Without them, every control runs on its defaults and has no id to be found by. See [Controls and markup](../basics/06-controls-and-markup.md).

A proxy's `setProperties(props)` forwards to `host.setProperties(panelId, elementHandle, props)`; `addEventListener(type, listener)` registers locally, and the host's single `onElementEvent(panelId, elementHandle, type, payload)` callback is routed to the right element by that `(panelId, elementHandle)` pair and dispatched to every listener registered for `type`.

## Regions and the rules the binding runs

Regions are the binding's: a descriptor's regions live in a `RegionRegistry` inside the binding, which places each docked window at its slot pose through the core's `regionSlotPose`, follows a following region by the core's `stepFollow` with IWSDK's `Follower` defaults, and captures a dropped window into the nearest region within its snap radius. The host is never told about a region; it only receives the resulting window poses. The same goes for the rest: `body-follow` and `head-locked` by `stepFollow` with the IWSDK defaults, hand menus placed by `evaluateHandMenu` from the grip poses and hidden while the palm gate is closed or the hand untracked, hold-to-drag by ray after the window's `dragDelay` and at once by grab through `TitlebarDragController`, billboard while dragging, focus bias by `applyFocusBias` folded into the pose, `returnHome` to the spawn pose, and chrome clicks gated on the record.

## dispose

`dispose()` closes every window this host opened, which routes each one through the manager's normal close path (`applyWindow` and `closeWindow`, disposing its panel once attached), disposes any bare panels still live, then releases every host and manager subscription and detaches from the frame source. It is safe to call twice. `WindowHost.dispose()` is required on every adapter as of this release; see [the adapter contract](../basics/07-adapter-contract.md).

## Moving a host from the first preview

The `0.1.1-preview.0` binding mirrored `WindowManager` records to the host and left the host to place windows, write chrome, run the touch press and decide clicks. A host that re-derived those rules drifted from the web on chrome, dock modes, touch press, click timing and more. A host moving to 0.1.1 absorbs these changes:

- Implement `setWindowPose(windowId, pose, depthOrder)` and draw and hit-test each window exactly there. Remove any placement of your own.
- Implement `onPointerSample(cb)` and report `ray`, `touch` and `grab` samples as above. Stop raising `pointerdown`, `pointerup` and `click` yourself.
- Apply only `hidden` and `dockMode` from `applyWindow(record)`. Title, chrome button `display`, the PIN and MIN labels and the minimized content arrive through `setProperties`.
- Drop `createRegion` and `removeRegion` from the `ui` slice: regions are the binding's.
- Send `attributes` on every `NativeElementNode`.
- Give the binding the `input` slice and frames, through `globalThis.__rcHost.input` and `__rcHost.onFrame` or the `input` and `frames` options.
- Implement `setHover`, `setScroll`, `showKeyboard` and `hideKeyboard`, and `applyPointerVisuals` on the `input` slice, to restyle, scroll, take text and draw pointers as the binding tells you.

## What it cannot do on this host, and why

Nothing here is engine-specific by nature, so there is no missing capability of the kind the XR Blocks page lists. `supportsStandalonePanels` is `true`: `createPanel` on the `ui` slice is synchronous, so a bare panel with no window chrome works directly. Whether the host draws a window where it is told, measures a fingertip's distance with the right sign, or shows a hand menu only while its hand is tracked is host work, which the conformance kit below checks on the device.

## Testing it

`test/helpers/fake-native-ui-host.ts` is an in-memory fake of the `ui` slice that behaves as a correct host would: `createPanel` builds a tree synchronously from a small declarative spec, `createWindow` is fire-and-forget with a `readyWindow(...)` helper to simulate the native renderer finishing, and it records the poses and properties it is handed. `test/host.test.ts` runs the shared `windowHostContractCases()` and `sceneTargetContractCases()` against `NativeWindowHost`, `test/element-contract.test.ts` runs `uixElementContractCases()` against panels built through the real host, and `test/binding-rules.test.ts` holds the binding to each IWSDK rule by name, and `test/pointer-arbitration.test.ts` and `test/pointer-presenting.test.ts` hold its pointer offers and the pointers it draws: every chrome button off unless asked, the title defaulting to the id, the press band and release distance, a click on release, a ray press held past `dragDelay` dragging and a shorter one not, a grab on the title bar dragging at once, a drop within a region's snap radius docking, the focus bias, and a window spawned into a region sitting at its slot pose, world-locked. See [conformance suites](/webxr/docs/concepts/conformance-suites) for what the three shared suites check across every adapter.

`nativeUiHostConformanceCases()` is the host conformance kit, exported from this package: 13 runner-free cases, named `ui/<rule>`, that a native app runs on its device against its real `ui` slice. They check that the host draws a window at the pose it is handed, follows the core rule in `body-follow` and `head-locked`, hides a hand menu with no tracked hand, applies the title, chrome and labels, hides and restores, applies focus bias, styles hover exactly as told, scrolls content exactly as told, shows and hides its keyboard when told, and measures a fingertip's signed distance positive in front. The host provides the readbacks of the `NativeUiTestHost` type in a test build: `windowPose`, `windowHidden`, `elementProperties` and `measureTouch`, plus the optional `elementHovered`, `elementHandle`, `scrollPosition` and `keyboardShown` that the hover, scroll and keyboard cases need. Those three cases fail a host that leaves its readback out. Against the reference fake every case passes, and the kit is shown to fail a host that misplaces a window or drops the sign of a distance.

## Tested on a headset

A native app built with this package passed on a Meta Quest 3 on 1 October 2026, played by a person and checked by its conformance kit.

:::caution Known issue on native
The system keyboard for a text field opens outside the wearer's view on a Quest 3, so text cannot be typed yet. Pressing a field focuses it and asks for the keyboard as it should. Where Horizon OS places the keyboard is the host's to fix.
:::

## More information

- [Getting started](../basics/02-getting-started.md)
- [The adapter contract](../basics/07-adapter-contract.md)
- [Docking and regions](../basics/04-docking-and-regions.md)
- [Controls and markup](../basics/06-controls-and-markup.md)
- [Native platform](/webxr/docs/concepts/native-platform)
- npm: [@realitycollective/native-uiextensions](https://www.npmjs.com/package/@realitycollective/native-uiextensions)
- [API reference](pathname:///webxr/api/uiextensions/)
