---
sidebar_position: 4
title: Docking, regions and hand menus
description: DockMode values, layout regions and their slot maths, and hand-locked windows with the palm gate and near drag.
---

# Docking, regions and hand menus

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

## Hand menus and the palm gate

A hand-locked window's `handMenu` options choose the hand (`left`, `right`, or `either` for whichever palm is raised), the anchor relative to the palm (`above` the fingertips, `inside` on the thumb side, `outside`, or `wrist`), a distance and an extra hand-local offset, and the palm gate: whether the menu shows only while the palm faces the viewer, and how many degrees off square it may be. Defaults are left hand, above, gated at sixty degrees. The gate is evaluated every frame from the hand and head poses; while it is shut, the window is neither drawn nor hittable, and `hide()` still wins over an open gate. A source with no hands at all, such as a desktop page, falls back to body-follow placement so the same scene still shows its menus.

## Hold-to-drag and near drag

A title-bar press only becomes a drag after being held for a delay, 0.3 seconds by default, so a shorter press stays a click and title-bar buttons never fight the drag gesture. On the IWSDK adapter, a near grab, a controller squeeze, or a hand pinch while the hand is on the title bar, drags at once with no hold delay, because it is already a deliberate gesture. Turn it off with `registerUIExtensions(world, { nearDrag: false })`, leaving the far ray as the only way to move a window.

## More information

- [The adapter contract](./06-adapter-contract.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [Showcase example](../examples/01-showcase.md)
- [API reference](pathname:///webxr/api/uiextensions/)
