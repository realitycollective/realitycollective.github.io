---
sidebar_position: 6
title: Roadmap
description: What is experimental, what is pending, what has been asked of sibling packages, and what is not planned.
---

# Roadmap

This is a short list, kept to facts recorded in the README, the changelog and the `docs/` folder.

## Experimental

The Google XR Blocks adapter, `@realitycollective/xrblocks-environment`, is marked experimental. It is written against the shape of XR Blocks rather than importing it, because XR Blocks is moving quickly.

## Headless-tested only: the native adapter

`@realitycollective/native-environment`, from 0.1.1 (preview), reads the `environment`, `audio` and `sensing` slices of `globalThis.__rcHost` for a native app on OpenXR or visionOS. It runs the same three conformance suites as the other adapters, against in-memory fakes of its three slices, and holds the same coverage gate.

:::warning
This adapter is tested headless only, against in-memory fakes of the `environment`, `audio` and `sensing` slices. It has not run against a real native host on Quest 3 or the visionOS Simulator; a device run is the native team's step.
:::

## Pending

A Babylon.js adapter is pending an estate-wide review across all five Reality Collective WebXR families, rather than being started inside this repository alone.

## Upstream requests

A number of gaps were found to belong to sibling packages rather than to this one, and are recorded rather than absorbed here. The service framework is asked to surface the raw WebXR blend mode alongside its existing passthrough boolean, and to let a session request carry per-feature init dictionaries such as the depth-sensing preferences this family already models. Meta's IWSDK is asked for WebXR light estimation, which it does not have as of `@iwsdk/core` 0.5.3, and for a global occlusion mode so an app need not name every entity the real world may hide. The full list, with the reasoning behind each item, is in `docs/UPSTREAM_ENHANCEMENTS.md`.

## Not planned

Content and geometry are not planned for this family at any point: no meshes, no prefabs, no placement, no floors. That is not a gap waiting to be filled; it is the boundary the family was built to respect. See [the boundary](../features/02-the-boundary.md) for why.

## More information

- [The boundary](../features/02-the-boundary.md)
- [Getting started](./02-getting-started.md)
- [Native adapter](../integrations/05-native.md)
- [Environment overview](/webxr/environment)
- [API reference](pathname:///webxr/api/environment/)
