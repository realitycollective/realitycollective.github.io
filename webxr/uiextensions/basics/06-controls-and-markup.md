---
sidebar_position: 6
title: Controls and markup
description: The uix-* control elements, the UixElement interface, and how a loaded panel becomes a set of working controls.
---

# Controls and markup

Beyond windows, the library adds a small set of controls, written as markup and upgraded into working behaviour once a panel loads.

## Custom elements, not attributes

A control is declared as a custom element, for example `<uix-stepper>`, and its parts are their own elements too: `<uix-value>`, `<uix-decrement>`, `<uix-increment>`. Parameters stay `data-uix-*` attributes on the control element, for example `data-uix-min="0"`, which land in `userData` camel-cased with `data-` stripped, so `data-uix-min` becomes `uixMin`. This is what makes one markup file portable: the IWSDK parser rejects unknown attributes on a built-in tag but accepts a custom tag declared in a component set, while the three.js and XR Blocks parser accepts a custom tag with no registration at all.

## Registering the elements on IWSDK

IWSDK parses panels with a component schema and rejects any tag it does not know, so a panel that uses a control must tell the parser about the `<uix-*>` elements when the world is created. `uixComponentSet` from `@realitycollective/iwsdk-uiextensions` is that declaration; pass it in `spatialUI.componentSets`. Without it, a panel containing any control fails to parse and never attaches, with no error in the scene.

```ts
import { World } from '@iwsdk/core';
import { uixComponentSet } from '@realitycollective/iwsdk-uiextensions';

const world = await World.create(container, {
  features: { spatialUI: { kit: 'horizon', componentSets: [uixComponentSet] } },
});
```

A panel with no controls, only windows and title-bar chrome, needs no component set; `spatialUI: true` is enough, which is what the getting-started pages use. The three.js and XR Blocks adapter needs no equivalent, because its parser accepts an unregistered custom tag.

## The UixElement interface

Every control upgrader works against a small structural interface, `UixElement`: `userData`, `children`, `addEventListener` and `setProperties`. Because the interface is structural rather than tied to one engine's element type, the same upgrader code runs against uikit's element tree on every adapter, including the native one. `walk`, `tagOf`, `findRole` and `findRoles` traverse that tree and locate a control's parts by their tag.

The core publishes the element vocabulary as data. `UIX_CONTROL_TAGS` lists the four control elements, `UIX_ROLE_TAGS` lists the parts they own and `UIX_ELEMENT_TAGS` is both together. A panel loader that validates tags must accept every name on that list as a plain container that keeps its tag and every `data-*` attribute. A loader that rejects or renames one leaves the panel without that control. The IWSDK `uixComponentSet` reads the same list, and so does a native host's build-time or run-time panel loader. The three.js parser accepts any tag and needs no declaration.

`dataAttributeKey()` is the one rule for where a `data-*` attribute lands in `userData`: `data-uix-min` becomes `uixMin`, and an attribute a parser has already camelCased (`dataUixMin`) gives the same key. `tagOf()` reads the `uix-*` custom element name a parser recorded, and returns a name only when it holds a hyphen, so a built-in tag such as `span`, which the three.js and XR Blocks parser records the same way as a custom one, reads as `undefined` everywhere.

## Native panels carry attributes too

The [native adapter](../integrations/05-native.md), `@realitycollective/native-uiextensions`, has no markup parser of its own: the native app sends a tree of `NativeElementNode`s, and each node's `attributes` field carries every `data-*` attribute exactly as the markup wrote it, for example `{ "data-uix-id": "count", "data-uix-min": "0" }`. The proxy element the adapter builds over that tree lifts those attributes into `userData` with the same `dataAttributeKey()` rule every other adapter uses, so a control upgrader cannot tell the difference. A native app that omits `attributes` on an element gives every control on it its defaults, silently, which is a real defect this package shipped and fixed; sending `attributes` on every element is required, not optional.

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

- [The adapter contract](./07-adapter-contract.md)
- [Core adapter](../integrations/01-core.md)
- [Native adapter](../integrations/05-native.md)
- [Package examples](../examples/04-package-examples.md)
- [API reference](pathname:///webxr/api/uiextensions/)
