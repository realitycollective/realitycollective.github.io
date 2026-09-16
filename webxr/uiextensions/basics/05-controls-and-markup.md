---
sidebar_position: 5
title: Controls and markup
description: The uix-* control elements, the UixElement interface, and how a loaded panel becomes a set of working controls.
---

# Controls and markup

Beyond windows, the library adds a small set of controls, written as markup and upgraded into working behaviour once a panel loads.

## Custom elements, not attributes

A control is declared as a custom element, for example `<uix-stepper>`, and its parts are their own elements too: `<uix-value>`, `<uix-decrement>`, `<uix-increment>`. Parameters stay `data-uix-*` attributes on the control element, for example `data-uix-min="0"`, which land in `userData` camel-cased with `data-` stripped, so `data-uix-min` becomes `uixMin`. This is what makes one markup file portable: the IWSDK parser rejects unknown attributes on a built-in tag but accepts a custom tag declared in a component set, while the three.js and XR Blocks parser accepts a custom tag with no registration at all.

:::warning
The `@realitycollective/iwsdk-uiextensions` package README and its shipped `Examples/controls` markup still show the older `data-uix="stepper"` attribute form. The current core upgrades custom elements only, as recorded in the CHANGELOG, so use the element form on this page.
:::

## The UixElement interface

Every control upgrader works against a small structural interface, `UixElement`: `userData`, `children`, `addEventListener` and `setProperties`. Because the interface is structural rather than tied to one engine's element type, the same upgrader code runs against uikit's element tree on both adapters. `walk`, `tagOf`, `findRole` and `findRoles` traverse that tree and locate a control's parts by their tag.

## Stepper

`<uix-stepper>` is a numeric value with `<uix-decrement>` and `<uix-increment>` buttons either side of `<uix-value>`. Parameters: `data-uix-min`, `data-uix-max`, `data-uix-step`, `data-uix-value`.

```html
<uix-stepper data-uix-id="count" data-uix-min="0" data-uix-max="10" data-uix-step="1">
  <uix-decrement>-</uix-decrement>
  <uix-value>.</uix-value>
  <uix-increment>+</uix-increment>
</uix-stepper>
```

## Toggle

`<uix-toggle>` is a boolean control where the whole element is the click target, with an optional `<uix-label>` whose text and the control's background colour switch with the state. Parameters: `data-uix-on`, `data-uix-on-text`, `data-uix-off-text`, `data-uix-on-color`, `data-uix-off-color`.

## Expandable label

`<uix-expandable-label>` collapses multi-line text to a character budget, lines multiplied by characters-per-line, with an ellipsis and a `<uix-more>` affordance that expands it in place. Truncation is character-budget based rather than pixel based, because uikit lays text out with MSDF glyphs at panel resolution, which needs the live renderer to measure exactly.

## Log view

`<uix-log-view>` is a scrolling list rendered into a fixed pool of `<uix-line>` rows, because UIKitML only creates a text node for an element with a literal placeholder child. Its follow mode pins the viewport to the newest entry, like a console; `<uix-up>`, `<uix-down>` and `<uix-clear>` are optional controls for the viewport and the buffer.

## How markup becomes a working control

`upgradePanel(documentKey, root)` walks a panel's element tree once, matches every `<uix-*>` tag against its upgrader, and returns a `PanelControls` object keyed by each control's `data-uix-id`. It is idempotent per `documentKey`, so calling it more than once for the same panel is safe.

```ts
const controls = panelControlsFor(document);
controls.stepper('health').events.on('change', (value) => setHealth(value));
```

## More information

- [The adapter contract](./06-adapter-contract.md)
- [Core adapter](../integrations/01-core.md)
- [Package examples](../examples/04-package-examples.md)
- [API reference](pathname:///webxr/api/uiextensions/)
