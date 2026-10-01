---
sidebar_position: 5
title: Audio
description: The cue registry, buses and master gain, retrigger policy, attenuation, cones, and knowing when a sound finished.
---

# Audio

`AudioDirector` owns a cue registry, a mix and the voices playing right now, and hands an adapter an already-resolved, absolute gain with no mixing decisions left to make.

## The cue registry

An `AudioCue` describes a sound, never an event: an id the app chooses, a file the adapter resolves, and how it behaves when triggered repeatedly. What triggers it is not modelled here at all; the app decides that a sound should happen and calls `play`.

```ts
audio.register({ id: "click", src: "/audio/click.mp3", bus: "ui", gain: 0.8 });
```

## Buses and master

A **bus** is a mix group, any string, that springs into existence at unity gain the first time it is named. The default set is `music`, `sfx`, `voice`, `ambience` and `ui`; a cue with no `bus` lands on `sfx`. `master` is a separate scalar over every bus, so "duck everything" and "turn the music down" never fight over one number.

```ts
audio.setBusGain("ambience", 0.6);
audio.setMasterGain(0.8);
```

## Mute separate from level

`setMuted(muted, bus?)` mutes a bus, or everything when no bus is named, and is kept separate from gain: muting and then unmuting restores exactly the level that was set before, rather than losing it to a silent zero.

## Retrigger policy and minimum interval

`AudioCue.policy` says what a second play request does while a cue is already sounding: `"overlap"` starts another voice (the default), `"restart"` stops the sounding voices and starts a new one, `"ignore"` drops the request. `minIntervalMs` sets the minimum gap between two accepted plays of the same cue; a request inside the window is dropped, which is what stops a feedback intent firing every frame from turning into a chainsaw.

## Relative gain

A caller's requested gain is **relative** to the mix, never over it. `PlayOptions.gain` and `AudioCue.gain` both trim the sound, and the bus and master gains still apply on top, so whatever calls `play` is a peer of the mix and never an owner of it.

```ts
audio.play("click", { gain: 1 });
```

## Per-cue attenuation

`AudioCue.spatial` says how a positional voice gets quieter with distance: `refDistance` (full volume out to this many metres), `rolloffFactor`, `maxDistance` and `model` (`"linear"`, `"inverse"` or `"exponential"`). Every field is something all three hosts already expose per source, so a footstep and a waterfall need not fall off at the same rate.

### What an omitted field means

A cue may say nothing, or only some of it. The core fills every omitted field from `AUDIO_ATTENUATION_DEFAULTS` before a request reaches a port. The defaults are the Web Audio panner's own: inverse distance, full volume within 1 m, a rolloff factor of 1, a maximum distance of 10 000 m, and a cone of 360 degrees inside and out, so the sound is the same in every direction. Angles are radians. The web hosts inherited these values from their engines without saying so. A native host had no way to know them, so the core now states them and every adapter writes every field rather than leaving it to its engine.

The result is that `AudioVoiceRequest.spatial` is always complete for a positional voice. It is `null` only for a voice heard from the listener, which has no attenuation at all. `resolveAudioSpatial(spatial)` returns a cue's attenuation with the defaults filled in, if you want to read it.

### The distance rule

`distanceGain(distance, spatial)` returns the gain factor, from 0 to 1, that distance alone leaves a positional voice with. The distance is in metres from the listener and is never counted as less than `refDistance`. The curves are Web Audio's.

- `"inverse"` gives `ref / (ref + rolloff * (d - ref))`.
- `"linear"` gives `1 - rolloff * (d - ref) / (max - ref)`, with `d` capped at `maxDistance` and the result never below 0.
- `"exponential"` gives `(d / ref)` raised to the power of minus `rolloff`, with `d` capped at `maxDistance`.

A native host applies exactly this rule, and its conformance kit checks the number it produces.

## The listener

The listener is the viewer's head. Its position and orientation are the head pose every frame, so a positional voice is heard from where the viewer is and facing the way the viewer faces. The core states this as `AUDIO_LISTENER_RULE`. On the web it is the `AudioListener` on the camera. On three.js and XR Blocks the adapter does it for you when you pass `head`, the render camera, in the audio options, and parents the listener under it unless it already sits there. IWSDK's audio system parents its own listener to the camera. A native host places its engine's listener at the head pose its `input` slice reports, every frame.

## Directional cones

A cue's `spatial.cone` says how narrowly it points: `inner` and `outer` are the full width of the cone in radians, and `outsideGain` is how loud it still is outside the outer cone. A play's `facing` says which way this particular sound is turned, as the direction it travels, the same convention `KeyLightSpec.direction` uses. Both are the package's own terms; each adapter converts to the degrees and the forward axis its host wants.

```ts
audio.play("horn", { at: [2, 1, -3], facing: [0, 0, -1] });
```

## Knowing when a sound finished (adapter differences)

The three.js adapter holds a play that arrives before its buffer has decoded and starts it once the decode lands, unless it was stopped in the meantime, so the first press of a session is not silent. IWSDK reports only whether a source is playing, never that it has just stopped, so its adapter polls in the tick it is already given and infers the end; a voice that never starts is reaped after a timeout with a warning rather than tracked forever. The core states that rule once, as `AudioStartReaper` with `DEFAULT_AUDIO_START_TIMEOUT_MS`, 10 000 ms, and every adapter's audio port composes it: three.js and native take a `startTimeoutMs` option, and IWSDK uses the shared reaper with its default. A looping voice, and a voice whose cue declares its own `durationMs`, are never reaped this way. A cue that legitimately plays longer than the timeout should declare its `durationMs`. Neither difference reaches the app: the core has already applied the retrigger policy before either adapter sees a request, so `restart` means the same thing on both engines.

## More information

- [Getting started](./02-getting-started.md)
- [three.js and raw WebXR adapter](../integrations/02-threejs.md)
- [Meta IWSDK adapter](../integrations/03-iwsdk.md)
- [API reference](pathname:///webxr/api/environment/)
