---
sidebar_position: 7
title: Roadmap
description: What is experimental, what is pending, what has been asked of sibling packages, and what is not planned.
---

# Roadmap

This is a short list, kept to facts recorded in the README, the changelog and the `docs/` folder.

## Experimental

The Google XR Blocks adapter, `@realitycollective/xrblocks-environment`, is marked experimental. It is written against the shape of XR Blocks rather than importing it, because XR Blocks is moving quickly.

## The native adapter

`@realitycollective/native-environment`, from 0.1.1, reads the `environment`, `audio`, `sensing` and `scenes` slices of `globalThis.__rcHost` for a native app on OpenXR or visionOS. It runs the same four conformance suites as the other adapters, against in-memory fakes of its four slices, and holds the same coverage gate. It also ships `nativeEnvironmentHostConformanceCases()`, 16 cases, the kit a native app runs on its device to prove what its renderer and audio engine do with what they are handed; see the [native adapter](../integrations/05-native.md#the-host-conformance-kit). Whether a host draws every sky and fog kind, casts shadows, reflects an environment map, occludes behind the real world or plays a voice at all is host work that kit shows on the device.

A native app built with this package passed on a Meta Quest 3 on 1 October 2026, played by a person and checked by its conformance kit. There are no known issues.

## New in 0.1.1

[Scene management](./06-scenes.md) is released: a scene list, single and additive loading, a stack any scene can leave, preloading, an active scene that drives the environment, persistent nodes and lifecycle events, on all four adapters. The owner placed it in this family on 25 September 2026. The release also states the audio rules in the core: the attenuation a positional voice has when its cue says nothing, the distance rule and the listener rule, so a native host applies the same ones as the web. See [Audio](./05-audio.md).

## What comes next

The `development` branch publishes previews of the next version under the `preview` tag. Install one with `@preview` only to try work in progress. Previews are not supported, and what is in `latest` is what the family promises.

## Pending

A Babylon.js adapter was deferred to a later round on 28 September 2026. Babylon.js 9 exposes everything the ports need, so it is work outstanding rather than a platform limit, and it is recorded as such with the UI Extensions family's Babylon binding, which has a harder obstacle in its panel renderer.

## Upstream requests

A number of gaps were found to belong to sibling packages rather than to this one, and are recorded rather than absorbed here. The service framework is asked to surface the raw WebXR blend mode alongside its existing passthrough boolean, and to let a session request carry per-feature init dictionaries such as the depth-sensing preferences this family already models. Meta's IWSDK is asked for WebXR light estimation and reflection estimation, which it does not have as of `@iwsdk/core` 1.0.0 any more than in 0.5.3, and for a global occlusion mode so an app need not name every entity the real world may hide. The reference reports both as unsupported, and every other platform that can measure them reports them the same way through the sensing seam, so nothing differs by platform in what an app is told. The full list, with the reasoning behind each item, is in `docs/UPSTREAM_ENHANCEMENTS.md`.

## Not planned

Content and geometry are not planned for this family at any point: no meshes, no prefabs, no placement, no floors. The scene manager loads a scene the app authored and never reads what is in it. How a scene looks, a physics port and converting scene formats between hosts are not planned either. That is not a gap waiting to be filled; it is the boundary the family was built to respect. See [the boundary](../features/02-the-boundary.md) for why.

## More information

- [The boundary](../features/02-the-boundary.md)
- [Getting started](./02-getting-started.md)
- [Native adapter](../integrations/05-native.md)
- [Environment overview](/webxr/environment)
- [API reference](pathname:///webxr/api/environment/)
