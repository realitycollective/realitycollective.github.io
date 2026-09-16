---
sidebar_position: 5
title: Events and feedback
description: The event stream every interaction produces, feedback as a request the app fulfils, and why the core never calls into your code.
---

# Events and feedback

## Why events only

Events are the only outbound pathway out of the interaction core. Adapters feed input in, through the shared input contracts, and everything downstream, gameplay, UI, feedback, subscribes to events out. There is no side door such as a raw engine tag to listen to instead.

## Subscribing

```ts
interactions.runtime.onEvent((event) => {
  console.log(event.type, event.interactableId, event.value);
});
```

Each `InteractionEvent` carries a `type` and an `interactableId`, plus optional `behaviourKind`, `interactorId`, `value` and `reason` fields depending on the event.

| Event | Fires when |
| --- | --- |
| `hoverEnter` / `hoverExit` | An interactor starts or stops targeting an interactable |
| `pressStart` / `pressEnd` | A press-capable interactor crosses the press or release threshold |
| `actuated` / `released` | A `press` behaviour fires or lets go |
| `valueChanged` | A behaviour's analog value moves |
| `grabStart` / `grabEnd` | An interactor picks up or drops a grabbable interactable |
| `scored` | A `tossScore` behaviour registers a pass through its hoop |
| `dwellProgress` | A gaze-dwell meter moves |
| `behaviourEnabled` / `behaviourDisabled` | Capability negotiation turns a behaviour on or off |
| `interactableEnabled` / `interactableDisabled` | `setInteractableEnabled` is called |

## Feedback as a request

The core asks for a haptic pulse or a sound; it never plays either itself. A behaviour emits a `FeedbackIntent` describing the physical moment, such as "this press just actuated, a short strong pulse would fit", and the app subscribes and realises it however it likes. The cues actually raised today are `hover`, `actuate`, `release`, `grab`, `drop`, `score` and `dwellComplete`. Two further cues, `press` and `valueTick`, exist in the type but are not yet raised by any shipped behaviour.

## routeHapticsToProvider

An opt-in helper that forwards the haptic half of every feedback intent to the input provider's `pulse`. It no-ops on sources with no haptic actuator, such as hands, and only fires when `capabilities.haptics` is true.

```ts
import { routeHapticsToProvider } from "@realitycollective/threejs-interactions";

routeHapticsToProvider(
  (listener) => interactions.runtime.onFeedback(listener),
  interactions.provider,
);
```

## routeAudioToSink

An opt-in helper that plays a sound for the feedback intents named in a cue map, through whatever the app uses to play audio.

```ts
routeAudioToSink(
  (listener) => interactions.runtime.onFeedback(listener),
  mySink,
  { actuate: "click", score: "chime" },
);
```

Cues absent from the map are ignored, so an app sonifies only the moments it has sounds for.

## Why the core never calls into your code

Events out, never callbacks in. The core has no reference to your scene objects or gameplay state; it only ever emits what happened, so your app decides what to do about it, and a listener can unsubscribe safely from inside its own callback.

## More information

- [Behaviours](./03-behaviours.md)
- [Targeting, gaze and capabilities](./04-targeting-gaze-and-capabilities.md)
- [Patterns](./06-patterns.md)
- [API reference](pathname:///webxr/api/interactions/)
