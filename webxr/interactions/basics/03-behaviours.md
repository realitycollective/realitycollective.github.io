---
sidebar_position: 3
title: Behaviours
description: Every ready-made interaction type the core provides, its options and what it emits.
---

# Behaviours

A **behaviour** is a mechanism attached to an interactable: a small state machine that reads routed input, ticks every frame, and writes its output through the interactable's transform port, the adapter-implemented surface that turns numbers into an engine object's position and rotation. An interactable can carry more than one behaviour. `createBehaviour` turns a plain config object into a behaviour instance, and an app can add its own kinds with `registerBehaviourKind` (see [Custom behaviours](#custom-behaviours) below).

## Press

A mechanical button. Options, all optional: `axis` (local press axis, default `[0, 1, 0]`), `travel` (full travel in metres, default `0.04`), `depthFraction` (fraction of travel reached at full press, default `0.5`), `stiffness` (default `220`) and `damping` (default `12`) for the underdamped spring that gives the button its bounce, and `latching` (default `false`). In momentary mode a press fires `actuated` and a release fires `released`. In latching mode (`latching: true`) a press toggles the state and holds it; releasing the interactor does nothing, and the next press toggles it back. Every frame the button's travel changes, it emits `valueChanged` with the spring's current position, 0 at rest and 1 at full depth. It requires at least one of rays, pokes, a 2D pointer or gaze, so it always has some way to be triggered.

```ts
{ kind: "press", travel: 0.045, depthFraction: 0.6, latching: true }
```

## Pulse

An additive visual effect: a brief scale and emissive flash on actuation, decaying back to rest. It composes with any other behaviour on the same interactable, most often `press`, because it declares no targeting requirements of its own: attach both, and the button depresses and flashes together. Options: `scaleAmount` (default `0.25`), `emissiveAmount` (default `1.5`) and `decayRate` (default `6`, higher decays faster).

```ts
{ kind: "pulse", scaleAmount: 0.2, decayRate: 5 }
```

## Hinge

A position-driven lever, pivoted about a fixed axis. While an interactor grabs it, the lever swings to point at the interactor's hand, rather than tracking a wrist rotation; letting go leaves it where it was. The hand's position is the grip, then the index fingertip, then the ray origin, whichever the source reports first, because a closed hand's fingertip barely moves around a wheel's axis. The same order serves dial and slide. Options: `axis` (the hinge axis, default `[1, 0, 0]`), `restDir` (the arm's local rest direction, default `[0, 1, 0]`) and `maxAngle` (maximum swing either side of rest, in radians, default `π/4`). It requires grab input. Its value is centred: `0.5` at rest, rising toward `1` on one side and falling toward `0` on the other. It measures the hand against the transform port's rest pose, `getRestWorldPose()`, captured when the object registered.

```ts
{ kind: "hinge", axis: [1, 0, 0], restDir: [0, 0, 1], maxAngle: (40 * Math.PI) / 180 }
```

## Dial

A twistable knob. While grabbed, the bearing of the interactor's hand around the dial's axis accumulates a rotation clamped to `[0, maxAngle]`. Options: `axis` (the twist axis, default `[0, 1, 0]`) and `maxAngle` (radians, default `3π/2`, one and a half turns). It requires grab input. Its value is `0` at rest and `1` at the limit. Like hinge, it reads the transform port's rest pose rather than its live pose.

```ts
{ kind: "dial", axis: [0, 1, 0], maxAngle: (3 * Math.PI) / 2 }
```

## Slide

A handle pulled along one axis, such as a pulley. While held, the handle follows the interactor's displacement along the axis; on release a spring returns it to rest while it keeps reporting its value. Options: `axis` (the rail axis, default `[0, 1, 0]`), `travel` (full pull travel in metres, default `0.3`), `stiffness` (default `180`) and `damping` (default `14`). It requires grab input. Its value is the pull distance divided by travel, `0` at rest and `1` at full pull. It too measures displacement from the transform port's rest pose.

```ts
{ kind: "slide", axis: [0, 1, 0], travel: 0.3 }
```

## Grab

Pick up and carry an object. It has no options of its own: how it is fulfilled is negotiated automatically from the provider's capabilities, never set in your descriptor. When the negotiated capability is `poseOnly`, the behaviour owns the carry itself: on grab it captures the offset between the interactor's grip and the object, then follows the grip every frame. When the capability is `native` (an engine that grabs and throws for you, such as IWSDK with physics enabled), the behaviour only mirrors the engine's own transitions into `grabStart` and `grabEnd` events; the engine moves the object. It requires grab input. Unlike hinge, dial and slide, it reads the transform port's live pose, `getWorldPose()`, so the offset it captures is measured from where the object really is.

What starts and ends a grab depends on the interactor. A controller grabs with its grip button: the squeeze value starts the grab at 0.7 and ends it below 0.3. A hand has no squeeze. Its `select` is the runtime's binary pinch gesture, 1 while pinched and 0 otherwise, and its `squeeze` is always 0. A hand therefore grabs a grab-only target with its pinch, and the grab ends on the frame the pinch ends.

### Physics and the throw

An object registered with a physics body, through the `body` or `shape` option of the adapter's `register`, is held through the transform port's `beginHold()`, which suspends its physics so gravity and collisions do not fight the carry. On release the behaviour calls `endHold(release)`, and the engine's own physics carries the throw. An object with no body rests where it is released. See [the held pose](../features/02-design-and-decisions.md#9-the-held-pose-physics-stays-with-the-platforms-engine) and [the physics facility](../integrations/01-core.md#the-physics-facility).

The release velocity is the velocity of the held object, not of the hand. The behaviour records each pose it writes, and `ReleaseVelocityTracker` differentiates them over the last `RELEASE_WINDOW_SECONDS`, 1/60 of a second, the physics step IWSDK measures a throw over. The angular velocity comes from the orientation change over the same window. An object that never moved throws nothing. When a grab ends without the user letting go, because the source was lost, the target was unregistered, the interactable was disabled or the runtime was disposed, the release is zero.

```ts
{ kind: "grab" }
```

## Toss score

Attach to a hoop or a goal. Each frame it checks whether any of its named target interactables passed through its plane, inside its ring radius, since the last frame, and emits `scored` when one does. Options: `targetIds` (required, the interactable ids that can score), `radius` (ring radius in metres, default `0.2`) and `axis` (the hoop's local up, default `[0, 1, 0]`). Scoring is pure geometry. How the target got there, whether thrown by native physics or carried by a `grab` behaviour and released into an app's own ballistics, is not this behaviour's concern. It reads each target's live pose, `getWorldPose()`, so a ball in flight is measured from where it actually is.

```ts
{ kind: "tossScore", targetIds: ["ball"], radius: 0.2 }
```

## Custom behaviours

An app can register its own behaviour kind with `registerBehaviourKind(kind, factory)`, so a descriptor can name a mechanism the core does not ship. The factory receives the raw config object and a `{ grabFulfilment }` context, the same negotiated value the built-in `grab` behaviour reads, and returns an object implementing the `Behaviour` interface.

## More information

- [Getting started](./02-getting-started.md)
- [Targeting, gaze and capabilities](./04-targeting-gaze-and-capabilities.md)
- [Events and feedback](./05-events-and-feedback.md)
- [Patterns](./06-patterns.md)
