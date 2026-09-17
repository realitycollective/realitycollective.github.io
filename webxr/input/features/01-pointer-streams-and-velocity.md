---
sidebar_position: 1
title: Pointer streams and velocity
description: PointerSample and PointerInputSource, why the UI family shares them, and deriving velocity from consecutive poses.
---

# Pointer streams and velocity

Alongside per-frame snapshots, this package defines a second, event-driven shape for a single input source: press, move and release. `PointerSample` is a pointer world position (`origin`, a `Vec3Tuple`) and a normalised pointing direction (`direction`, a `Vec3Tuple`). `PointerInputSource` delivers a stream of these for one source through three subscription methods: `onPress`, `onMove` and `onRelease`, each returning an `Unsubscribe` function.

## Why the UI family shares it

`PointerSample` and `PointerInputSource` are structurally identical to the pointer contract in `@realitycollective/webxr-uiextensions`. That means one engine adapter can drive both the interaction family's behaviours and the UI Extensions family's windowing from the same pointer stream, rather than each family needing its own. Once delivered, a sample and its tuples belong to the listener, exactly as with `InputSourceSnapshot`: a source never writes to a delivered sample again, so a listener may keep one across frames without copying it.

## Deriving velocity

Grip velocity drives throws and flicks: how fast and in what direction an object was moving when it was released. Some providers report it natively, filling `InputSourceSnapshot.linearVelocity` and `.angularVelocity` directly from the engine. For the rest, `velocityBetween(prev, next, dtSeconds)` is a pure helper that derives both from two consecutive grip poses.

```ts
import { velocityBetween, type PoseTuple } from "@realitycollective/threejs-interactions";

let previousPose: PoseTuple | undefined;

function onGripPose(pose: PoseTuple, dtSeconds: number): void {
  if (previousPose) {
    const { linear, angular } = velocityBetween(previousPose, pose, dtSeconds);
    // linear: metres per second, world space.
    // angular: a rotation axis scaled by radians per second, shortest arc.
  }
  previousPose = pose;
}
```

`linear` is metres per second in world space. `angular` is a rotation axis scaled by radians per second, taken along the shortest arc between the two orientations. Both come back as zero vectors when `dtSeconds` is zero, negative or not a finite number, so a dropped frame can never produce an infinite velocity. The result is shaped to drop straight into `InputSourceSnapshot.linearVelocity` and `.angularVelocity`, whichever provider or consumer computes it.

## More information

- [The input model](../basics/03-the-input-model.md)
- [Capabilities and negotiation](../basics/04-capabilities.md)
- [UI Extensions IWSDK adapter](/webxr/docs/uiextensions/integrations/iwsdk)
- [API reference](pathname:///webxr/api/input/)
