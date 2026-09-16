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

## Directional cones

A cue's `spatial.cone` says how narrowly it points: `inner` and `outer` are the full width of the cone in radians, and `outsideGain` is how loud it still is outside the outer cone. A play's `facing` says which way this particular sound is turned, as the direction it travels, the same convention `KeyLightSpec.direction` uses. Both are the package's own terms; each adapter converts to the degrees and the forward axis its host wants.

```ts
audio.play("horn", { at: [2, 1, -3], facing: [0, 0, -1] });
```

## Knowing when a sound finished (adapter differences)

The three.js adapter holds a play that arrives before its buffer has decoded and starts it once the decode lands, unless it was stopped in the meantime, so the first press of a session is not silent. IWSDK reports only whether a source is playing, never that it has just stopped, so its adapter polls in the tick it is already given and infers the end; a voice that never starts is reaped after a timeout with a warning rather than tracked forever. Neither difference reaches the app: the core has already applied the retrigger policy before either adapter sees a request, so `restart` means the same thing on both engines.

## More information

- [Getting started](./02-getting-started.md)
- [three.js and raw WebXR adapter](../integrations/02-threejs.md)
- [Meta IWSDK adapter](../integrations/03-iwsdk.md)
- [API reference](pathname:///webxr/api/environment/)
