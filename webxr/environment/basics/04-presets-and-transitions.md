---
sidebar_position: 4
title: Presets and transitions
description: Naming and registering presets, easing, transition timing, and how passthrough and light estimation layer over the slots.
---

# Presets and transitions

A **preset** is a named `EnvironmentSpec` the director can look up by string, which is what lets a button say `"dusk"` instead of carrying a whole document.

## Stock presets

`STOCK_PRESETS` ships six example environments: `void`, `dawn`, `noon`, `dusk`, `night` and `overcast`. Each is an ordinary `EnvironmentSpec` with no privileged status, meant to give a new project something to look at in its first five minutes. Copy one and edit it rather than layering overrides on it forever, and delete the import once your own presets exist.

## Naming and registering presets

Pass presets at construction through `EnvironmentDirectorOptions.presets`, or register one afterwards with `define`:

```ts
director.define("storm", { sky: STORMY_SKY, fog: STORMY_FOG });
```

`preset(name)` looks one up, returning `undefined` when it was never defined, and `presetNames()` lists everything currently registered, in the order it was added.

## Easing names and transition timing

`transition(specOrName, options)` eases to a spec or a preset name over `options.durationMs`, using `options.easing`, one of `"linear"`, `"easeIn"`, `"easeOut"` or `"easeInOut"`, or your own `(t) => t` function. A non-positive duration behaves like `apply`: an immediate snap. `defaultTransition`, set once at construction, supplies the duration and easing a call site does not give. `apply(specOrName)` always snaps immediately and cancels any transition in flight, so a hard cut wins over a fade that is still running.

## One owner for the background

There is exactly one writer for the sky, the fog and the lights: the director. "Who last wrote `scene.background`" is a race the moment two features care about the sky, and the director exists so that race never happens.

## Passthrough as a suppression

Passthrough is not a second writer. `setPassthrough(active)` takes a boolean or a WebXR blend mode (`"opaque"`, `"alpha-blend"` or `"additive"`), and applies as a **suppression** on top of whatever the app asked for: the sky and fog stop being drawn while the real world is showing, and they come back unchanged when it ends, with nothing to remember.

```ts
director.setPassthrough(true);        // sky and fog suppressed
director.setPassthrough("additive");  // same, and the director knows the blend mode
```

The blend mode argument matters because the two passthrough modes behave oppositely. `alpha-blend`, Quest video passthrough, composites normally, so black is black. `additive`, a see-through optical display, adds the rendered image to the world, so black is fully transparent and a dark fog or a dark fallback sky is simply not there. By default passthrough suppresses `sky` and `fog`; pass `passthroughSuppresses` as a list to change that, or as a record keyed by blend mode when the two modes should suppress different slots.

## Light estimation as a layer over the slots

`setLightEstimation(true)` lets the host's measurement of the real room take over the ambient, key and IBL slots while it is measuring, as a layer over what the app asked for rather than an edit to it. Turning it off hands the slots straight back with nothing to remember, exactly like passthrough. Pass a spec instead of `true` to choose which of `ambient`, `key`, `ibl` and `shadows` the estimate may take over; all default to on except `shadows`.

```ts
director.setLightEstimation({ ambient: true, key: true, ibl: true, shadows: false });
```

## More information

- [The environment document](./03-the-environment-document.md)
- [Sensing](../features/01-sensing.md)
- [three.js and raw WebXR adapter](../integrations/02-threejs.md)
- [API reference](pathname:///webxr/api/environment/)
