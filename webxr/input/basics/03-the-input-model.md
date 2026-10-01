---
sidebar_position: 3
title: The input model
description: InputSourceSnapshot field by field, the plain-data geometry tuples, handedness and the ownership rule.
---

# The input model

Every frame, a provider hands you an array of `InputSourceSnapshot` objects, one per live input source. A source is a controller, a hand, gaze or a 2D pointer such as a mouse, normalised into the same shape whatever produced it. Fields a provider cannot supply are simply absent from a snapshot, so a consumer gates behaviour on capabilities rather than on checking for a field every frame. See [Capabilities and negotiation](./04-capabilities.md) for that gating.

## Identity fields

`id` is a stable string per session, such as `"left-hand"` or `"right-controller"`, but its exact format is not part of the contract. Never parse it: read `handedness` for the side an input source belongs to instead. `kind` says what kind of physical thing produced the source: `"controller"`, `"hand"`, `"gaze"`, `"pointer2d"` or `"other"`. `handedness` is `"left"`, `"right"` or `"none"`, the last for sources with no side, such as a mouse. A provider with eye gaze samples one extra snapshot of kind `"gaze"`, whose `handedness` names the hand that owns its selection; see [Eye gaze and pinch](../features/05-eye-gaze-and-pinch.md).

## Pose and geometry

`ray` is the pointing ray, a `RayTuple` of a world-space `origin` and a normalised `direction`. It carries the target ray, hand ray, gaze ray or a projected 2D pointer, depending on `kind`. `gripPose` is the WebXR grip space, a `PoseTuple` of a `Vec3Tuple` position and a `QuatTuple` orientation: for a controller its grip, and for a hand the runtime's grip pose, WebXR `gripSpace` or OpenXR `/input/grip/pose`, which IWSDK reads. It is never a hand joint. Its frame has `-Z` toward the thumb and `+Y` up the arm, where an OpenXR joint such as `XR_HAND_JOINT_PALM_EXT` has `-Y` out of the palm, so a provider that has only joints must convert, or hand menus and grabs built on it come out rotated. `indexTip` is the index fingertip's world position, a plain `Vec3Tuple`, useful for poke and hand-driven behaviours; for a controller it is the ray origin, as IWSDK's input rig makes it, so a controller pokes as a fingertip does. These semantics were written into the contract in 0.1.6, on 28 September 2026, after a native host had to guess them; no type or behaviour changed.

Geometry is plain data throughout, with no engine types anywhere: `Vec3Tuple` is `[x, y, z]` in metres, `QuatTuple` is `[x, y, z, w]`, and `PoseTuple` and `RayTuple` combine them. `HeadPose` has the same `position`/`quaternion` shape and is the viewer pose, a camera on desktop and the headset in an XR session.

## Select, squeeze and grab

`select` and `squeeze` are 0 to 1 scalars: the primary action and the secondary action. What each reports depends on `kind`, and the contract states it from 0.1.8:

| `kind` | `select` | `squeeze` |
| --- | --- | --- |
| `"controller"` | The trigger's analog value, 0 at rest | The grip button's analog value, 0 at rest |
| `"hand"` | 1 while the runtime reports its pinch gesture, otherwise 0. Never an analog pinch strength. | Always 0 |
| `"gaze"` | The pinch of the hand that owns the gaze selection | 0 |
| `"pointer2d"` | 1 while the primary button is down | Not stated by the contract |

A hand's pinch is binary because the runtime already applies its own threshold to the gesture, as the browser's `selectstart` and `selectend` events do. A hand has no squeeze on the web, and its grab is its pinch through `select`. A provider that reported the analog pinch strength, or OpenXR's grasp value as squeeze, would hold a grab open on a relaxed hand. A conformance case checks this rule.

Consumers that need a boolean from a scalar use the shared hysteresis thresholds, `SELECT_PRESS_THRESHOLD` (0.7) and `SELECT_RELEASE_THRESHOLD` (0.3), so a value has to cross a higher bar to register a press than to release one. `nativeGrabbing` is a boolean flag that is true while the engine itself reports this source natively grabbing something, such as an IWSDK grabbable under physics. It is equivalent to a `grab` hint from `sampleHints()`, and a provider supplies one of the two, never both; `sampleHints()` is frame-fresh. `hapticsAvailable` reports whether this specific source can take a haptic pulse; the provider-level `capabilities.haptics` says whether any source can. A `pulse` intensity is 0..1, and a provider clamps it.

`selectorPose` is present only on the eye-gaze snapshot, while a hand's pinch owns its selection: that hand's ray-space pose, which lets a drag started by gaze follow the hand.

## Velocity

`linearVelocity` and `angularVelocity` are optional `Vec3Tuple`s on the grip: metres per second, and a rotation axis scaled by radians per second. A provider fills them when its engine reports velocity natively, and a consumer can derive them from two consecutive grip poses otherwise. Who derives velocity is decided per snapshot, not by a capability flag: velocity a provider supplies is used as it is, and the Interactions runtime's tracker fills in only what a snapshot lacks. See [Pointer streams and velocity](../features/01-pointer-streams-and-velocity.md) for `velocityBetween`, the helper that does the deriving.

## Ownership

A snapshot, and every tuple inside it, belongs to whoever `sample()` handed it over to. A provider builds fresh objects on each call and never writes to a snapshot it has already returned, so a consumer may keep one across frames, such as last frame's grip pose for a velocity tracker, without copying it defensively. A provider that pools objects internally must copy on hand-over rather than refill the same object in place. The conformance suite checks this rule; see [Provider conformance](./05-provider-conformance.md).

## More information

- [Capabilities and negotiation](./04-capabilities.md)
- [Pointer streams and velocity](../features/01-pointer-streams-and-velocity.md)
- [Provider conformance](./05-provider-conformance.md)
- [Eye gaze and pinch](../features/05-eye-gaze-and-pinch.md)
- [API reference](pathname:///webxr/api/input/)
