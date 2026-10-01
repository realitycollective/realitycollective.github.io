---
sidebar_position: 5
title: Eye gaze and pinch
description: The eyeGaze capability, the rule that turns eye tracking and a pinch into far targeting, and what a provider samples while it applies.
---

# Eye gaze and pinch

From 0.1.7, this package states how a headset with eye tracking targets far objects: you look at a target and pinch to select it. This is the mode Meta IWSDK 1.0.0 switches to when a session grants eye tracking. The rule is pure logic here, so every provider hands consumers the same snapshots.

**Eye gaze** is where the user's eyes are looking, reported by the runtime as a ray. It is different from **head gaze**, a ray straight out of the headset, which the `gaze` capability already covers and which needs no eye tracking.

## The capability

`InputCapabilities.eyeGaze` is true while a tracked eye-gaze source is available. On the web that means the session granted eye tracking and has an `XRInputSource` whose `targetRayMode` is `"gaze"`. A consumer that needs it declares the `"eyeGaze"` requirement, like any other capability.

## The rule

`EyeGazeInput` applies the rule to one frame of a provider's raw snapshots. The provider builds its hand and controller snapshots as usual, then passes them to `update(frame, sources, dt)` with the frame's gaze reading. An `EyeGazeFrame` says whether a gaze source exists, its raw pose or `null` for an invalid one, and each hand's ray-space pose. What `update` returns is what the provider samples.

- **Gaze owns far targeting** from the first valid gaze pose. While it does, hand and controller snapshots lose their `ray`; their grip and fingertip stay, so touch and grab still work up close.
- **One gaze snapshot** is added, with kind `"gaze"` and id `EYE_GAZE_SOURCE_ID` (`"eye-gaze"`). Its `ray` is the smoothed gaze ray, absent while the pose is invalid.
- **Either hand's pinch commits a selection** while the gaze pose is valid, and that hand owns it until it releases. The gaze snapshot's `select` is the owning hand's pinch, and its `handedness` names that hand (`"none"` until a hand commits).
- **A pinch held from before never becomes a click.** A hand counts only after it has been seen released.
- **Blinks are survived.** Far targeting stays with gaze through `trackingLossGraceSeconds` (5 seconds) of invalid poses. A committed hold lasts until the pinch ends, even past that grace. When the gaze source goes away, far targeting returns to the hands at once and any hold ends.
- **A drag follows the hand.** The gaze snapshot carries the owning hand's ray-space pose as `selectorPose`, from the frame the pinch commits until it releases. With `pointerTransformFollowsHand` on, the Interactions runtime aims a ray from that pose at the gaze hit, so an object dragged by gaze moves with the hand.

The gaze ray is smoothed with a one-euro filter, a standard low-lag smoothing filter that cuts jitter more when the input is slow. `EyeGazeFilter` applies it to a pose and `OneEuroScalar` to one number. `rayFromPose` and `rayPoseFromRay` convert between a pose and its ray, for a provider that has only one of them. `ownsFarTargeting()` and `selectingHand()` report the rule's state, and `reset()` forgets it at the end of a session.

## The defaults

`EYE_GAZE_DEFAULTS` holds IWSDK 1.0.0's values. `EyeGazeOptions` overrides any of them, and `resolveEyeGazeOptions` fills in the rest.

| Option | Meaning | Default |
| --- | --- | --- |
| `coneAngleDegrees` | Half-angle of the selection cone around the gaze ray | 5 |
| `maxRayLength` | Farthest a gaze target may be, metres | 30 |
| `dwellWindowSeconds` | How long the gaze must agree on a target before it counts; 0 turns it off | 0.15 |
| `filterMinCutoff`, `filterBeta`, `filterDCutoff` | The one-euro filter's tuning | 1.5, 0.05, 1 |
| `pointerTransformFollowsHand` | A gaze-started drag follows the pinching hand | `true` |
| `suppressWhenDirectPointerActive` | Gaze targets nothing while a touch or grab pointer is active | `true` |
| `trackingLossGraceSeconds` | How long gaze keeps far targeting through invalid poses | 5 |

The cone, the dwell window and the suppression are applied by the Interactions runtime, which is where targets are known. Pass them through its `eyeGaze` option. The constants live here so one table states the whole reference.

## Proving a provider

`inputProviderContractCases()` has three cases a provider with `eyeGaze` must pass: a gaze snapshot that carries a ray leaves no hand or controller with a far ray; at most one gaze snapshot is sampled; and a gaze snapshot owned by a hand carries that hand's `selectorPose`, while one owned by no hand carries none.

`MemoryInputProvider` passes them when built with `{ eyeGaze: true }`. `pinch(side, strength)` sets a hand's pinch, 1 or 0, and `setGazePose(pose)` sets the next gaze pose, or `null` for a blink. That makes it a fake for testing a gaze-driven behaviour without a headset.

## Which providers report it

The three.js, Babylon.js, IWSDK and native providers report `eyeGaze` and apply this rule. The XR Blocks provider reports head gaze only. See [Implementations](../integrations/02-implementations.md).

## More information

- [The input model](../basics/03-the-input-model.md)
- [Capabilities and negotiation](../basics/04-capabilities.md)
- [The pointer arbiter and pointer display](./04-pointer-arbiter-and-display.md)
- [API reference](pathname:///webxr/api/input/)
