---
sidebar_position: 1
title: Interaction playground
description: A standalone three.js demo of the full station set, driven from one portable descriptor, runnable on desktop or a headset.
---

# Interaction playground

Live: <DemoLink demo="interactions" />

Run it locally:

```sh
npm ci
npm run dev:playground     # http://localhost:8082
```

Desktop controls: WASD or the arrow keys walk, Shift sprints, Space jumps, C crouches, right-drag looks, and left mouse works whichever station you are pointing at, held and dragged where a station needs it.

## Wall Levers

Two hinge levers mounted on a wall plate: one swings up and down, the other side to side. Only the hinge axis differs between them.

```ts
{
  id: "pg-lever-wall-v",
  behaviours: [{ kind: "hinge", axis: [1, 0, 0], restDir: [0, 0, 1], maxAngle: (40 * Math.PI) / 180 }],
},
{
  id: "pg-lever-wall-h",
  behaviours: [{ kind: "hinge", axis: [0, 1, 0], restDir: [0, 0, 1], maxAngle: (40 * Math.PI) / 180 }],
},
```

Behaviour and events: `hinge`, with `grabStart`/`grabEnd` on take and release, and `valueChanged` as it swings. On a headset: grab the arm and pull it up and down, or side to side, then let go. Mouse: hold left mouse on the arm and drag.

## Table Lever

A lever pivoted at its base on a tabletop plate, swinging toward wherever the hand pulls it.

```ts
{
  id: "pg-lever-table",
  behaviours: [{ kind: "hinge", axis: [1, 0, 0], restDir: [0, 1, 0], maxAngle: (50 * Math.PI) / 180 }],
},
```

Behaviour and events: `hinge`; `grabStart`/`grabEnd`, `valueChanged`. On a headset: grab and pull; the arm points at the hand rather than following wrist rotation. Mouse: hold left mouse and pull.

## Gaze Dwell

A look-to-activate button with a fill ring, needing no hands at all.

```ts
{
  id: "pg-gaze-button",
  behaviours: [
    { kind: "press", axis: [0, 0, 1], travel: 0.03, depthFraction: 0.6 },
    { kind: "pulse", scaleAmount: 0.2, emissiveAmount: 1.2, decayRate: 5 },
  ],
  gaze: { dwell: { holdSeconds: 1.8, decayFactor: 2.5 } },
},
```

Behaviour and events: `press` and `pulse`, gated by dwell; `dwellProgress` drives the demo's ring scale, and a completed dwell fires a synthesized press and release, then `actuated`. On a headset: look at the panel and hold your gaze; the ring fills and the button fires itself. Mouse: right-drag to aim the view at the panel, then hold still. No click is needed.

## Scoop and Toss

A grabbable ball and a hoop above it that scores a pass. The flight after release is the demo's own client-side ballistics, not the interaction layer's.

```ts
{
  id: "pg-ball",
  behaviours: [{ kind: "grab" }],
  pokeRadius: 0.09,
},
{
  id: "pg-hoop",
  behaviours: [{ kind: "tossScore", targetIds: ["pg-ball"], radius: 0.2, axis: [0, 1, 0] }],
},
```

Behaviour and events: `grab` on the ball (`grabStart`/`grabEnd`); `tossScore` on the hoop (`scored`, driving the score counter). The demo's own ball update integrates gravity and velocity from the ball's held-frame motion once it is released. On a headset: pick up the ball and throw it at the hoop. Mouse: hold left mouse on the ball to pick it up, move and release to throw.

## Push Button

The simplest station: a button that travels as it is pressed and pulses on actuation, and works from a plain click.

```ts
{
  id: "pg-button",
  behaviours: [
    { kind: "press", axis: [0, 1, 0], travel: 0.045, depthFraction: 0.6 },
    { kind: "pulse", scaleAmount: 0.25, emissiveAmount: 1.5, decayRate: 6 },
  ],
},
```

Behaviour and events: `press` and `pulse`; `pressStart`/`pressEnd`, `actuated`/`released`, `valueChanged`. On a headset: point and pull the trigger, or poke it with a fingertip. Mouse: left click.

## Dial

A knob that turns to follow the hand through one and a half turns, with a marker showing where it is pointing.

```ts
{
  id: "pg-dial",
  behaviours: [{ kind: "dial", axis: [0, 1, 0], maxAngle: (3 * Math.PI) / 2 }],
},
```

Behaviour and events: `dial`; `grabStart`/`grabEnd`, `valueChanged` as it turns. On a headset: grab the knob and turn your hand around its axis. Mouse: hold left mouse and drag in an arc.

## Pulley

A handle on a rail that slides along one axis and springs back on release.

```ts
{
  id: "pg-pulley",
  behaviours: [{ kind: "slide", axis: [0, 1, 0], travel: 0.3 }],
},
```

Behaviour and events: `slide`; `grabStart`/`grabEnd`, `valueChanged` as it pulls, continuing to publish while the spring returns it home. On a headset: grab the handle and pull, then let go. Mouse: hold left mouse and slide.

## Station panels

Each station's description sits on a UI Extensions window, built from the same `UixWindowHost` and docking that family's own playground uses. Every panel loads the same compiled markup, with its body and hint text injected once the panel is ready, rather than seven near-identical files.

## Audio cues

Client-side WebAudio blips, realised from feedback intents: a small frequency map, keyed by cue (`actuate`, `release`, `grab`, `drop`, `score`, `dwellComplete`), turns a feedback intent into a tone by subscribing to `interactions.runtime.onFeedback`.

## Haptics routing

The demo opts in with `routeHapticsToProvider`, forwarding every feedback intent's haptic half straight to the controller. It silently no-ops on hands, which have no actuator.

## Toss ballistics

The interaction layer never touches the ball once it is released. `grabEnd` on `pg-ball` hands control to the demo's own ball update, which measures the ball's velocity across its last held frames, then integrates gravity and position each frame until it falls below the floor or too far away, at which point it resets to its tee. This is the "physics is a property of the object, not the interaction layer" rule made concrete.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Patterns](../basics/06-patterns.md)
- [three.js adapter](../integrations/02-threejs.md)
- [API reference](pathname:///webxr/api/interactions/)
