---
sidebar_position: 3
title: The environment document
description: The five slots an environment carries, how partial specs inherit, and the one interpolation rule.
---

# The environment document

An `EnvironmentSpec` describes a whole environment as one document, five slots wide, so the director can interpolate all of them together on one curve.

## Sky

A sky is one of three kinds. A **gradient** sky has a `top` colour at the zenith and a `bottom` colour at the nadir, with an optional `equator` colour where they meet at the horizon. Pass `equator` explicitly when you need both engines to agree on a bright band at eye level, because IWSDK's dome is a three-stop ramp and would otherwise guess the middle colour from the two-stop ramp three.js builds. A gradient also takes `horizon`, where the two colours meet as a fraction of the way up the sphere (default `0.5`), `exponent` to sharpen or soften the blend (default `1`, a linear ramp), and `intensity`. A **solid** sky is a single flat colour, the cheapest sky there is. A **texture** sky wraps an authored equirectangular image around the world, with an intensity, a rotation and an optional blur for a sky used as a backdrop.

## Fog

Fog is either **linear**, which ramps to full fog between a `near` and a `far` distance, or **exponential**, which thickens with distance according to a `density` value.

## Ambient and key light

An **ambient light** is uniform illumination from every direction: a colour and an intensity. A **key light** is the one directional light most scenes need, a sun, a moon or a work lamp: a colour, an intensity and a `direction`, which is the direction the light travels rather than the direction it points from. `[0, -1, 0]` is overhead.

## Environment map for image-based lighting

Image-based lighting, or IBL, is what the world reflects and what lights everything the key light does not reach. Without it a physically based material has nothing to reflect, because on every host the sky and the environment map are two separate facilities: `scene.background` and `scene.environment` on three.js, `DomeGradient` and `IBLGradient` on IWSDK. It takes the same three kinds as the sky, `gradient`, `texture` and `room` (the host's own neutral room probe), plus a fourth, `estimated`: the reflections the host measured from the real room, which arrives only through light estimation.

## Partial specs: inherit versus explicit null

An `EnvironmentSpec` is a **partial** description. An **omitted** slot leaves it exactly as it is: `{ fog: null }` clears the fog and touches nothing else. An **explicit `null`** turns the slot off. That is what makes presets composable: a storm preset can carry only the sky and fog it cares about and layer onto whatever lighting is already there.

```ts
director.apply({ fog: null });        // clears the fog, touches nothing else
director.apply({ sky: DUSK.sky });    // changes the sky, keeps the lighting
```

## The one interpolation rule

A slot interpolates only when both ends describe the **same kind** of thing: two gradient skies, two linear fogs, two ambient lights. A slot appearing, a slot disappearing, or a linear fog becoming exponential takes the target value at `t = 0` and holds it, because there is no honest halfway point between "fog" and "no fog". To ease fog in, make both ends fogs, using `clearedFog` to push the starting fog out to where it has no visible effect:

```ts
director.apply({ fog: clearedFog(DUSK.fog!) });                // present, but invisible
director.transition({ fog: DUSK.fog! }, { durationMs: 4000 }); // rolls in
```

## `ENVIRONMENT_SLOTS` and `EMPTY_ENVIRONMENT`

`ENVIRONMENT_SLOTS` is the ordered list of slot names, `["sky", "fog", "ambient", "key", "ibl"]`, the order the director pushes them to the port. `EMPTY_ENVIRONMENT` is a fully resolved environment with every slot `null`: a black void with no light, and the starting point before anything has been applied.

## More information

- [Presets and transitions](./04-presets-and-transitions.md)
- [Sensing](../features/01-sensing.md)
- [Core adapter reference](../integrations/01-core.md)
- [API reference](pathname:///webxr/api/environment/)
