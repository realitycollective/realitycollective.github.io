---
sidebar_position: 2
title: Near touch and one press per poke
description: The TouchPress state machine that turns a fingertip's signed distance into press, hold and release, and the IWSDK touch guard that applies it to every poke target.
---

# Near touch and one press per poke

Pressing a spatial panel with a fingertip looks simple and is not. An engine measures the fingertip's distance to the panel without a sign, so 2 cm behind the panel reads the same as 2 cm in front. A finger pushed through a panel and pulled back out therefore fires press, release, press, release: two clicks for one gesture. A finger arriving from behind presses too. The core's `TouchPress` state machine exists to give every adapter one answer to this, and on IWSDK the `UITouchGuardSystem` applies it to every poke target in the app.

## The three guarantees

`TouchPress` works on signed distance, positive in front of the panel, and holds three rules:

1. A press starts only from the front. A fingertip first seen behind the panel, or one that crosses the press band from behind, never presses, unless `allowFromBehind` is set.
2. Once pressed, the touch is held until a release. However deep the finger goes and whichever way it comes back, no second press can start until a release has been reported.
3. Release happens when the fingertip comes back out in front past the release distance, or when contact is lost entirely, because the hover ended or tracking dropped. The release distance is larger than the press distance, so a finger resting on the surface does not chatter.

Defaults: press at 2 cm, release at 3 cm. `resolveTouchPress` fills the rest and rejects a release distance smaller than the press distance.

## Targets at both ends

The machine records what was under the finger when the press started and reports what is under it at the release, because they can differ: a finger that enters one button and leaves through its neighbour. Each `update` returns a `TouchUpdate` with `pressed` and `released` flags for the exact frames those happened, `pressTarget`, `releaseTarget` and `sameTarget`. Whether a release over a different target still counts as a click is the adapter's rule, or the engine's; the machine only makes both ends visible so that rule can be applied.

```ts
import { TouchPress } from '@realitycollective/webxr-uiextensions';

const touch = new TouchPress<Element>({ pressDistance: 0.02, releaseDistance: 0.03 });

// Each frame, from whatever the adapter measured: signed distance and the element under the fingertip.
const update = touch.update(sample ? { signedDistance: sample.distance, target: sample.element } : undefined);
if (update.pressed) down(update.pressTarget);
if (update.released && update.sameTarget) click(update.releaseTarget);
```

## On IWSDK: the touch guard

IWSDK's own touch pointers press when the fingertip's unsigned distance drops under 2 cm and release when it rises above, which is exactly the double-click case above. `UITouchGuardSystem`, registered by `registerUIExtensions` straight after IWSDK's `InputSystem`, takes over the two touch pointers' `down` and `up`. IWSDK's own calls become no-ops, and each frame the fingertip's signed distance to the surface it is over, using the intersection's normal in world space, is fed to a `TouchPress` whose transitions call the original `down` and `up`. The pointer still delivers `pointerdown`, `pointerup` and `click` to the element exactly as before, so nothing downstream changes; only when they fire does. IWSDK's 800 ms click window is unchanged, and a target without a normal keeps the unsigned behaviour.

Every poke target in the app benefits, IWSDK's own panels and every `PokeInteractable` included, because they share the same two pointers. Thresholds go through the register options, and the whole system can be left out:

```ts
registerUIExtensions(world, { touchGuard: { pressDistance: 0.015, releaseDistance: 0.03 } });
registerUIExtensions(world, { touchGuard: false });
```

## On XR Blocks and plain three.js

That adapter has no near-touch pointer of its own yet, so the guard does not apply there; the desktop mouse and the XR select ray deliver hover and click straight to the uikit controls. The core's `TouchPress` is ready for a near pointer when one is added, and an adapter author can feed it from any fingertip measurement, as the example above shows.

## More information

- [Controls and markup](../basics/06-controls-and-markup.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [XR Blocks and plain three.js adapter](../integrations/03-xrblocks-threejs.md)
- [API reference](pathname:///webxr/api/uiextensions/)
