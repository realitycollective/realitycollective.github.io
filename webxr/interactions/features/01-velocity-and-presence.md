---
sidebar_position: 1
title: Velocity and presence
description: How the core measures the speed of a hand or controller, and how adapters show or hide the user's own hands and controllers.
---

# Velocity and presence

## Native versus derived velocity

A throw, a flick or a swipe needs to know how fast a hand was moving when it let go. WebXR does not report that, and most engines do not either, so the core differentiates the grip poses it already samples, in `VelocityTracker`. This runs by default; pass `velocity: false` to the runtime options to skip it, or `{ smoothing }` (a factor in `(0, 1]`, `1` is raw with no smoothing) to average out a noisy pose stream. Where a provider supplies its own `linearVelocity` or `angularVelocity`, on a snapshot already, the tracker leaves it alone: the provider's own numbers always win.

## First-frame and reappearance rules

A source seen for the first time, or seen again after dropping out of tracking, reports no velocity that frame, so a reconnecting controller cannot report a metres-per-second jump from wherever it was last seen. A frame with no elapsed time is treated the same way.

## Reading velocity

```ts
interactions.runtime.onSample((sources) => {
  for (const source of sources) {
    if (source.linearVelocity) console.log(source.id, source.linearVelocity);
  }
});
```

`runtime.getSource(id)` returns the same snapshot for one source, undefined before the first update or once it stops reporting.

## Presence

Presence is showing or hiding the user's own hand and controller visuals, and, where the host allows it, forcing which family is shown. Each adapter offers a different amount of it, because each engine owns its visuals differently.

- **three.js** has nothing to show until the app hands over a model with `registerVisual(handedness, root)`. `capabilities.presence` is false until the first one is registered, true afterwards, and false again if the last one is handed back with `unregisterVisual`. There is no automatic hands/controllers choice here, since the app supplies both models itself.
- **Meta IWSDK** offers full presence, because IWSDK builds the hand and controller models it shows and hides. `setPresenceVisible(target, visible)` controls either side; `setPresenceModality("hands" | "controllers" | "auto")` forces the family shown.
- **Babylon.js** shows and hides what Babylon itself built, motion controller root meshes and hand meshes, once Babylon has built one to hide. Babylon decides which visual belongs to which input source, so there is no hands/controllers switch: `setPresenceModality` always returns false.
- **Google XR Blocks** offers none. XR Blocks owns its controller and hand visuals and exposes no way to hide them, so `capabilities.presence` is always false.

```ts
provider.registerVisual("left", leftHandModel);
provider.setPresenceVisible("left", false); // hide the left hand
```

## More information

- [three.js adapter](../integrations/02-threejs.md)
- [Meta IWSDK adapter](../integrations/04-iwsdk.md)
- [Babylon.js adapter](../integrations/03-babylon.md)
- [Google XR Blocks adapter](../integrations/05-xrblocks.md)
