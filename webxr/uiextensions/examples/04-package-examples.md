---
sidebar_position: 4
title: Package examples
description: The three copy-paste examples shipped inside the IWSDK adapter's npm package - basic-window, controls and dock-regions.
---

# Package examples

`@realitycollective/iwsdk-uiextensions` ships three copy-paste starting points inside its own npm package, under `Examples/`. The folder ships inside the tarball, so the examples are always the ones that match the installed version. Each assumes an IWSDK app created with `npm create @iwsdk@latest`.

## basic-window

A managed window with no title-bar buttons of its own, driven entirely from a hand menu: a hand-locked window on the left hand with HIDE, PIN, HOME, MIN, BUTTONS and CLOSE, each one a `WindowManager` call, with labels read back from the record.

```ts
const windows = registerUIExtensions(world);
const host = createSceneHost(world);

host.createWindow({
  id: 'hello',
  title: 'Hello Window',
  config: './ui/window.uikitml',
  dockMode: DockMode.BodyFollow,
});

const menu = host.createWindow({
  id: 'hand-menu',
  config: './ui/hand-menu.uikitml',
  dockMode: DockMode.HandLocked,
  handMenu: { hand: 'left', anchor: 'above', palmGate: true },
});
```

`window.uikitml` is the ordinary window chrome snippet with a short instruction line; `hand-menu.uikitml` is the reference hand-menu markup, a vertical stack of six buttons with no title bar. `main.ts` re-reads the record on every relevant manager event, `hidden`, `shown`, `dockChanged`, `minimized`, `restored`, `chromeChanged`, `dragEnded` and `closed`, so the menu's labels stay honest even when the window changes by other means, such as its own title bar once BUTTONS switches it on.

## controls

Control upgrades on a plain panel, with no window required: the `UIControlsSystem` upgrades every loaded panel, not just windows.

```ts
const panel = world.createTransformEntity().addComponent(PanelUI, { config: './ui/controls.uikitml' });
```

`controls.uikitml` lays out a stepper, a toggle, an expandable label and a log view; `main.ts` wires their handles once the panel loads, pushing a line into the log on every stepper change and toggle change. This example's shipped markup still uses the older `data-uix="stepper"` attribute form rather than the current `<uix-stepper>` custom-element contract; check it against [Controls and markup](../basics/05-controls-and-markup.md) before copying it into a new project.

## dock-regions

Layout regions, drop-to-dock and a follow-region toolbar.

```ts
createDockRegion(world, { id: 'wall', flow: 'column', pitch: 0.6, capacity: 3, snapRadius: 0.65, position: [1.6, 1.9, -1.5] });
createDockRegion(world, { id: 'toolbar', flow: 'row', pitch: 0.55, follow: true, followOffset: [0, -0.7, -1.1] });

createUIWindow(world, { id: 'docked', title: 'Docked Window', config: './ui/window.uikitml', region: 'wall', dockable: true, pinnable: true });
createUIWindow(world, { id: 'floating', title: 'Drag Me Into A Region', config: './ui/window.uikitml', position: [0, 1.5, -1.4], dockable: true, pinnable: true });
```

`main.ts` spawns one window straight into the wall region and a second free-floating window to drag into either region, and shows that both regions are reachable from code too: `windows.dockTo`, `windows.undock`, `windows.returnHome`.

## More information

- [Controls and markup](../basics/05-controls-and-markup.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [Showcase example](./01-showcase.md)
- npm: [@realitycollective/iwsdk-uiextensions](https://www.npmjs.com/package/@realitycollective/iwsdk-uiextensions)
