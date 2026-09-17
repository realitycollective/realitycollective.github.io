---
sidebar_position: 3
title: Windows and the window manager
description: The WindowManager is the one API for changing a window's state, and every adapter applies every event it emits.
---

# Windows and the window manager

Every window's state lives on the `WindowManager`, and it is the one API app code calls to change a window, whether that call comes from a hand menu, a keyboard shortcut or a voice command.

## The window record

Each open window has a `WindowRecord`: an id, a title, a dock mode, minimised, hidden and dragging flags, a region, chrome and hand-menu placement. `windows.get(id)` always reflects what the scene shows: a title-bar drag that docks a window, or a click on its own pin button, is written back into the record, not just the code path that started the change.

## The manager as the one window API

Because the manager is engine-agnostic, a hand menu or a keyboard shortcut written against it runs unchanged on every adapter.

```ts
windows.hide('status');
windows.show('status');
windows.togglePin('status');
windows.dockTo('status', 'wall');
windows.setChrome('status', { close: true });
windows.close('status');
```

## Chrome ids and title-bar buttons

The title bar is discovered by well-known element ids: `uix-pin`, `uix-dock`, `uix-minimize` and `uix-close`, defined in `WINDOW_CHROME_IDS`. Every button is off by default; pass `closable`, `minimizable`, `pinnable` and `dockable` at spawn, or call `setChrome` later, to turn one on. A disabled button stays in the markup but is hidden and its click ignored, so enabling it later needs no rewiring.

## Follow and pin

`togglePin(id)` switches a window between `body-follow`, where it lazily follows the player, and `world-locked`, where it stays placed in space. `pinLabelFor(record)` returns the label the pin button should show next: `UNPIN` while world-locked, `PIN` while following or while the window is being dragged.

## Minimise

`minimize`, `restore` and `toggleMinimized` collapse and expand the window body while leaving the title bar drawn. `minimizeLabelFor(record)` returns `MIN` when open and `MAX` when minimised, always naming what the next click does.

## Hide and show

`hide(id)` takes a window out of view and out of reach: it is not drawn and not hittable, but its dock mode, region slot and minimised state are all kept. `show(id)` brings it back exactly where it was and focuses it.

## Events the manager emits

Every state change emits a typed event on `windows.events`: `opened`, `closed`, `focused`, `minimized`, `restored`, `hidden`, `shown`, `dockChanged`, `regionChanged`, `returnHome`, `chromeChanged`, `handMenuChanged`, `dragStarted` and `dragEnded`. `close(id)` is the one teardown call: every adapter listens for `closed` and disposes whatever it created for the window.

## More information

- [Docking, regions and hand menus](./04-docking-and-regions.md)
- [The adapter contract](./07-adapter-contract.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [API reference](pathname:///webxr/api/uiextensions/)
