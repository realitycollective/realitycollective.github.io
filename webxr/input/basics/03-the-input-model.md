---
sidebar_position: 3
title: The input model
description: InputSourceSnapshot field by field, the plain-data geometry tuples, handedness and the ownership rule.
---

# The input model

Every frame, a provider hands you an array of `InputSourceSnapshot` objects, one per live input source. A source is a controller, a hand, gaze or a 2D pointer such as a mouse, normalised into the same shape whatever produced it. Fields a provider cannot supply are simply absent from a snapshot, so a consumer gates behaviour on capabilities rather than on checking for a field every frame. See [Capabilities and negotiation](./04-capabilities.md) for that gating.

## Identity fields

`id` is a stable string per session, such as `"left-hand"` or `"right-controller"`, but its exact format is not part of the contract. Never parse it: read `handedness` for the side an input source belongs to instead. `kind` says what kind of physical thing produced the source: `"controller"`, `"hand"`, `"gaze"`, `"pointer2d"` or `"other"`. `handedness` is `"left"`, `"right"` or `"none"`, the last for sources with no side, such as a mouse.

## Pose and geometry

`ray` is the pointing ray, a `RayTuple` of a world-space `origin` and a normalised `direction`. It carries the target ray, hand ray, gaze ray or a projected 2D pointer, depending on `kind`. `gripPose` is the grip or palm pose, a `PoseTuple` of a `Vec3Tuple` position and a `QuatTuple` orientation. `indexTip` is the index fingertip's world position, a plain `Vec3Tuple`, useful for poke and hand-driven behaviours.

Geometry is plain data throughout, with no engine types anywhere: `Vec3Tuple` is `[x, y, z]` in metres, `QuatTuple` is `[x, y, z, w]`, and `PoseTuple` and `RayTuple` combine them. `HeadPose` has the same `position`/`quaternion` shape and is the viewer pose, a camera on desktop and the headset in an XR session.

## Select, squeeze and grab

`select` and `squeeze` are 0 to 1 scalars: the primary action (trigger, pinch strength, mouse button) and the secondary action (grip button). Consumers that need a boolean from a scalar use the shared hysteresis thresholds, `SELECT_PRESS_THRESHOLD` (0.7) and `SELECT_RELEASE_THRESHOLD` (0.3), so a value has to cross a higher bar to register a press than to release one. `nativeGrabbing` is a boolean flag that is true while the engine itself reports this source natively grabbing something, such as an IWSDK grabbable under physics. `hapticsAvailable` reports whether this specific source can take a haptic pulse; the provider-level `capabilities.haptics` says whether any source can.

## Velocity

`linearVelocity` and `angularVelocity` are optional `Vec3Tuple`s on the grip: metres per second, and a rotation axis scaled by radians per second. A provider fills them when its engine reports velocity natively, and a consumer can derive them from two consecutive grip poses otherwise. See [Pointer streams and velocity](../features/01-pointer-streams-and-velocity.md) for `velocityBetween`, the helper that does the deriving.

## Ownership

A snapshot, and every tuple inside it, belongs to whoever `sample()` handed it over to. A provider builds fresh objects on each call and never writes to a snapshot it has already returned, so a consumer may keep one across frames, such as last frame's grip pose for a velocity tracker, without copying it defensively. A provider that pools objects internally must copy on hand-over rather than refill the same object in place. The conformance suite checks this rule; see [Provider conformance](./05-provider-conformance.md).

## More information

- [Capabilities and negotiation](./04-capabilities.md)
- [Pointer streams and velocity](../features/01-pointer-streams-and-velocity.md)
- [Provider conformance](./05-provider-conformance.md)
- [API reference](pathname:///webxr/api/input/)
