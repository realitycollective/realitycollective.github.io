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

A position-driven lever, pivoted about a fixed axis. While an interactor grabs it, the lever swings to point at the interactor's hand, rather than tracking a wrist rotation; letting go leaves it where it was. Options: `axis` (the hinge axis, default `[1, 0, 0]`), `restDir` (the arm's local rest direction, default `[0, 1, 0]`) and `maxAngle` (maximum swing either side of rest, in radians, default `π/4`). It requires grab input. Its value is centred: `0.5` at rest, rising toward `1` on one side and falling toward `0` on the other.

```ts
{ kind: "hinge", axis: [1, 0, 0], restDir: [0, 0, 1], maxAngle: (40 * Math.PI) / 180 }
```

## Dial

A twistable knob. While grabbed, the bearing of the interactor's hand around the dial's axis accumulates a rotation clamped to `[0, maxAngle]`. Options: `axis` (the twist axis, default `[0, 1, 0]`) and `maxAngle` (radians, default `3π/2`, one and a half turns). It requires grab input. Its value is `0` at rest and `1` at the limit.

```ts
{ kind: "dial", axis: [0, 1, 0], maxAngle: (3 * Math.PI) / 2 }
```

## Slide

A handle pulled along one axis, such as a pulley. While held, the handle follows the interactor's displacement along the axis; on release a spring returns it to rest while it keeps reporting its value. Options: `axis` (the rail axis, default `[0, 1, 0]`), `travel` (full pull travel in metres, default `0.3`), `stiffness` (default `180`) and `damping` (default `14`). It requires grab input. Its value is the pull distance divided by travel, `0` at rest and `1` at full pull.

```ts
{ kind: "slide", axis: [0, 1, 0], travel: 0.3 }
```

## Grab

Pick up and carry an object. It has no options of its own: how it is fulfilled is negotiated automatically from the provider's capabilities, never set in your descriptor. When the negotiated capability is `poseOnly`, the behaviour owns the carry itself: on grab it captures the offset between the interactor's grip and the object, then follows the grip every frame. The object stays exactly where it is dropped, because ballistics is deliberately the app's concern, not the interaction layer's. When the capability is `native` (an engine that grabs and throws for you, such as IWSDK with physics enabled), the behaviour only mirrors the engine's own transitions into `grabStart` and `grabEnd` events; the engine moves the object. It requires grab input.

```ts
{ kind: "grab" }
```

## Toss score

Attach to a hoop or a goal. Each frame it checks whether any of its named target interactables passed through its plane, inside its ring radius, since the last frame, and emits `scored` when one does. Options: `targetIds` (required, the interactable ids that can score), `radius` (ring radius in metres, default `0.2`) and `axis` (the hoop's local up, default `[0, 1, 0]`). Scoring is pure geometry. How the target got there, whether thrown by native physics or carried by a `grab` behaviour and released into an app's own ballistics, is not this behaviour's concern.

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
