---
sidebar_position: 6
title: Patterns
description: Common ways apps put the interaction core to work, from descriptor-driven scenes to headless behaviour tests.
---

# Patterns

## Descriptor-driven scenes as portable data

An `InteractionDescriptor` is plain, JSON-able data: which interactables exist, which behaviours they carry, and their gaze policy. Any adapter can rebuild the same scene from the same descriptor; only the mesh builders that turn each id into a scene object are engine-specific.

```ts
import type { InteractionDescriptor } from "@realitycollective/threejs-interactions";

const descriptor: InteractionDescriptor = {
  interactables: [
    { id: "button", behaviours: [{ kind: "press" }, { kind: "pulse" }] },
  ],
};

for (const interactable of descriptor.interactables) {
  const object = sceneObjects.get(interactable.id);
  if (object) interactions.register(interactable, object);
}
```

`registerDescriptor(runtime, descriptor, portsFor)` is the lower-level function this loop wraps: it builds a runtime's interactables directly from a descriptor, for code that has already wired its own transform ports and hit-testing another way.

## Wiring feedback to the app's audio

A small map from feedback cue to tone or sample id, driven from one subscription.

```ts
const CUE_TONES: Record<string, number> = {
  actuate: 660,
  release: 440,
  grab: 520,
  score: 880,
};

interactions.runtime.onFeedback((intent) => {
  const tone = CUE_TONES[intent.cue];
  if (tone) playBlip(tone);
});
```

## Throws: physics host or your own code

An object registered with a physics body, through the `body` or `shape` option of `register`, is held and thrown by the platform's physics. From 0.1.1 a `poseOnly` grab hands the object's own release velocity to the engine through `endHold`, and the engine's physics flies the object; there is nothing to write. An object with no body stays where it is dropped, and a throw's flight after `grabEnd` is your own code:

```ts
interactions.runtime.onEvent((event) => {
  if (event.interactableId !== "ball") return;
  if (event.type === "grabEnd") startFlying(ball);
});
```

## Gating hand mechanics on handedness

The desktop mouse fallback reports `handedness: "none"` and rides the camera ray, so its motion is camera motion, not hand motion. A pattern such as launching a thrown object with its measured velocity should check the source before trusting that velocity as a throw.

```ts
interactions.runtime.onEvent((event) => {
  if (event.type !== "grabEnd" || !event.interactorId) return;
  const source = interactions.runtime.getSource(event.interactorId);
  if (source?.handedness === "none") return; // mouse: camera motion, not a throw
  launchWithVelocity(source?.linearVelocity);
});
```

## Testing behaviours headlessly

Behaviours are plain classes implementing the `Behaviour` interface: no engine, no DOM. A test can instantiate one directly, call `onPressStart`, `update` and `getValue` against a small mock `BehaviourContext`, and assert the events and feedback intents it produced, with no renderer or browser involved. `npm test` runs the workspace's vitest suites, which cover every behaviour and provider this way.

## More information

- [Behaviours](./03-behaviours.md)
- [Events and feedback](./05-events-and-feedback.md)
- [Interaction playground example](../examples/01-interaction-playground.md)
- [Core: the engine-free package](../integrations/01-core.md)
