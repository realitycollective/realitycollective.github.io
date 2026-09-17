---
sidebar_position: 4
title: Docking and regions
description: DockMode values, layout regions and their slot maths, hold-to-drag and near drag.
---

# Docking and regions

A window is always in exactly one dock mode, and a dock region is a named area of the scene that lays its docked windows out in slots.

## Dock modes

Four values, from `DockMode`:

- `world-locked` - placed in space; the window keeps its world transform.
- `body-follow` - lazily follows the player, with a deadzone so it does not jitter.
- `head-locked` - rigidly attached to the view; use sparingly.
- `hand-locked` - rides a hand and shows while the palm is raised toward the viewer, a hand menu.

`togglePinned` moves a window between `world-locked` and `body-follow`; a head-locked or hand-locked window unpins to `world-locked` too, because pinning either of those in place simply makes it an ordinary window.

## Layout regions

A dock region lays its members out in a row (+X), a column (-Y) or a grid of the given number of columns, at a fixed pitch between slot origins. A region can cap how many windows it accepts, and defines a snap radius: the distance within which a dropped window is captured into the next free slot. A region can itself follow the player, which turns its docked windows into a body-locked toolbar. The showcase demo shows both: a world-locked "console wall" column and a body-locked "belt" row.

## Hand menus

A `hand-locked` window is a hand menu: it rides a hand and shows while the palm faces the viewer, and where there are no hands it falls back to body-follow placement. The options, the palm gate and the reference markup have their own page, [Hand menus](./05-hand-menus.md).

## Hold-to-drag and near drag

A title-bar press only becomes a drag after being held for a delay, 0.3 seconds by default, so a shorter press stays a click and title-bar buttons never fight the drag gesture. On the IWSDK adapter, a near grab, a controller squeeze, or a hand pinch while the hand is on the title bar, drags at once with no hold delay, because it is already a deliberate gesture. Turn it off with `registerUIExtensions(world, { nearDrag: false })`, leaving the far ray as the only way to move a window.

## More information

- [Hand menus](./05-hand-menus.md)
- [The adapter contract](./07-adapter-contract.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [Showcase example](../examples/01-showcase.md)
- [API reference](pathname:///webxr/api/uiextensions/)
