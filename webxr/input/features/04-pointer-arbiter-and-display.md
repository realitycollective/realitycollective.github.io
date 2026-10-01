---
sidebar_position: 4
title: The pointer arbiter and pointer display
description: One pointer decision per hand across interactables and UI panels, and the ray and cursor as app configuration on every platform.
---

# The pointer arbiter and pointer display

From 0.1.8, this package decides which pointer owns a hand or controller, and how that pointer looks. Both are pure logic with no engine. The Interactions family and the UI Extensions family share them, so a hand points at an object and at a panel in exactly the same way on every platform.

A **pointer** here is one of the three ways a hand or controller reaches something: **touch** (the fingertip), **grab** (the grip) and **ray** (the far pointing ray). A **target** is anything a pointer can reach: a registered interactable or a UI panel.

## Why one decision

Meta IWSDK 1.0.0, the reference platform, keeps one set of pointers per hand over everything in the scene, panels included. The first of touch, grab and ray that has a target owns the hand. While the owning pointer is pressing, it keeps the hand until it releases. One cursor sits wherever the owning pointer meets its target.

If interactables and panels each decided on their own, a fingertip on a panel would not retire the ray over an object behind it, and the cursor would never appear on a panel. The arbiter is the one decision both families share.

## How the arbiter decides

`PointerArbiter` collects offers from **target sets**. A target set is one family's view of the arbiter, registered with `registerSet(id, kind)`, where `kind` is `"object"` or `"panel"`. Every frame, for every source it saw, a set offers its nearest candidate for each pointer kind, or `null` for none. A `PointerCandidate` is a `targetId`, a world-space `point` where the cursor would sit, and a `distance` in metres: the ray parameter for a ray, the surface distance for touch and grab.

`resolve(sourceId)` then decides for that source:

1. For each pointer kind, the nearest candidate across every set wins.
2. The owning pointer is the first of `POINTER_PRIORITY` (`touch`, `grab`, `ray`) with a candidate.
3. The selection lock: while the owning pointer is pressing or grabbing (`setSelecting`), it stays the owner, with its own set's latest candidate, until it releases.

The decision is a `PointerDecision`: the source, the active pointer kind or `null`, and the winning `PointerOffer`. Each set asks `owns(sourceId, pointer)` before it acts, and stands down when `ownedElsewhere(sourceId)` is true. `pickActivePointer` is the priority-and-lock rule on its own, for a binding that needs it outside an arbiter.

Each family names a source its own way. The Interactions runtime uses the provider's snapshot id; a window host may know only the side. `alias("left", sourceId)` lets both names reach the same source, and the Interactions runtime registers those aliases for you. `forget(sourceId)` drops a source that stopped being tracked.

The eye-gaze source is not decided by the near pointers. The Interactions runtime decides it with its gaze cone and records it with `setDecision`, so the visuals still answer for it. See [Eye gaze and pinch](./05-eye-gaze-and-pinch.md).

## What a binding shows

`visuals(sourceId, hasRay)`, or `pointerVisualsFor` without an arbiter, turns a decision into `PointerVisuals`:

- `ray` is true while the source has a ray and no near pointer owns it. Touch or grab hides the ray, and so does eye gaze taking over far targeting.
- `cursor` is true exactly while the active pointer has a candidate, and `cursorPoint` is where it sits, on an object or on a panel.
- `targetKind`, `targetId` and `hitDistance` say what the cursor sits on and how far away it is.

## Pointer display: the look is the app's

How the ray and cursor look is app configuration, not something an engine decides. `PointerDisplayConfig` holds every setting, and `POINTER_DISPLAY_DEFAULTS` holds IWSDK 1.0.0's values, so the default look matches the reference on every platform.

| Setting | Meaning | Default |
| --- | --- | --- |
| `cursorOnObjects` | Draw the cursor where the active pointer meets an interactable | `true` |
| `cursorOnPanels` | Draw the cursor where the active pointer meets a UI panel | `true` |
| `ray` | When the ray is drawn, if the arbiter allows one: `"never"`, `"always"` or `"whileHitting"` | `"whileHitting"` |
| `rayOnlyOnPanels` | With `"whileHitting"`, only a panel hit counts | `false` |
| `rayLength` | Length of the ray mesh, metres | 1 |
| `rayReach` | The drawn part never extends past this, metres | 0.3 |
| `rayFade` | Metres over which the ray fades out at its far end | 0.05 |
| `rayHandFade` | Metres at the hand over which the ray fades in | 0.03 |
| `rayRadius` | Ray radius, metres | 0.001 |
| `rayColor` | Ray colour, `[r, g, b]` from 0 to 1 | white |
| `raySelectedColor` | Ray colour while selecting | `0x3383e6` as `[r, g, b]` |
| `cursorRadius` | Cursor disc radius, metres | 0.008 |
| `cursorOffset` | Metres the disc sits off the surface | 0.004 |
| `cursorOpacity` | Disc opacity | 0.7 |
| `cursorSelectedOpacity` | Disc opacity while selecting | 1 |
| `cursorSelectedScale` | Disc scale while selecting | 0.8 |
| `cursorGrowFrom` | Beyond this hit distance, metres, the disc grows by the excess | 0.3 |

With these defaults the ray is a short stub, drawn from 3 cm in front of the hand out to 30 cm or the hit, whichever is nearer, and only while it hits something. That is IWSDK's look. Set `ray: "always"` and a longer `rayReach` for a visible full-length ray.

`resolvePointerDisplay(options)` fills in the defaults and throws on a value that cannot be drawn, such as a negative length or an opacity above 1. `PointerDisplay` holds the settings for an app at run time: `get()` reads them, `set(partial)` changes any of them, and `onChange` tells a binding to redraw.

`pointerDrawing(config, visuals, selecting)`, or `PointerDisplay.drawing`, combines the arbiter's visuals with the settings into a `PointerDrawing`. It states whether to draw the ray, where it starts, stays solid and ends along the ray, its radius and colour, and the cursor's point, radius, opacity and offset. A binding draws exactly this, and a native host is handed it, so no platform decides how a pointer looks.

## Using it in an app

You rarely call the arbiter yourself. Every Interactions binding and every UI Extensions window host takes two options:

- `pointers`: a `PointerArbiter` to share. Pass the same one to the Interactions binding and to each window host, so one decision covers interactables and panels. A binding given none makes its own and decides over its own targets, exactly as before 0.1.8.
- `pointerDisplay`: a `PointerDisplay` to share, or a partial `PointerDisplayConfig`. The Interactions runtime exposes it as `getPointerDisplay()`, so `runtime.getPointerDisplay().set({ ray: "always" })` changes the look at run time.

```ts
import { PointerArbiter } from "@realitycollective/threejs-interactions";

const pointers = new PointerArbiter();
// Hand the same arbiter to the Interactions binding and to every UI Extensions window host:
// createThreeInteractions({ ..., pointers, pointerDisplay: { ray: "always", rayReach: 2 } })
// connectUIExtensions({ ..., pointers })
```

Whoever owns the arbiter presents every source. With a shared arbiter, the Interactions runtime publishes the drawing for every source, the panel cursor included. A window host with an arbiter of its own presents its panels itself.

The frame order matters: window hosts offer first, then the Interactions runtime resolves, so its decision sees both families' offers. The IWSDK bindings register their systems in that order. When your app drives each binding's frame update itself, update the window hosts before the Interactions runtime.

The Interactions [targeting page](/webxr/docs/interactions/basics/targeting-gaze-and-capabilities) covers how each binding draws the ray and cursor. The UI Extensions [adapter contract](/webxr/docs/uiextensions/basics/adapter-contract) covers how window hosts offer panels.

## More information

- [The input model](../basics/03-the-input-model.md)
- [Eye gaze and pinch](./05-eye-gaze-and-pinch.md)
- [Pointer streams and velocity](./01-pointer-streams-and-velocity.md)
- [API reference](pathname:///webxr/api/input/)
