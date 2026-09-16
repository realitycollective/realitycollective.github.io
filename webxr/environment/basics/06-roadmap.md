---
sidebar_position: 6
title: Roadmap
description: What is experimental, what is pending, what has been asked of sibling packages, and what is not planned.
---

# Roadmap

This is a short list, kept to facts recorded in the README, the changelog and the `docs/` folder.

## Experimental

The Google XR Blocks adapter, `@realitycollective/xrblocks-environment`, is marked experimental. It is written against the shape of XR Blocks rather than importing it, because XR Blocks is moving quickly.

## Pending

A Babylon.js adapter is pending an estate-wide review across all five Reality Collective WebXR families, rather than being started inside this repository alone.

## Upstream requests

A number of gaps were found to belong to sibling packages rather than to this one, and are recorded rather than absorbed here. The service framework is asked to surface the raw WebXR blend mode alongside its existing passthrough boolean, and to let a session request carry per-feature init dictionaries such as the depth-sensing preferences this family already models. Meta's IWSDK is asked for WebXR light estimation, which it does not have as of `@iwsdk/core` 0.5.3, and for a global occlusion mode so an app need not name every entity the real world may hide. The full list, with the reasoning behind each item, is in `docs/UPSTREAM_ENHANCEMENTS.md`.

## Not planned

Content and geometry are not planned for this family at any point: no meshes, no prefabs, no placement, no floors. That is not a gap waiting to be filled; it is the boundary the family was built to respect. See [the boundary](../features/02-the-boundary.md) for why.

## More information

- [The boundary](../features/02-the-boundary.md)
- [Getting started](./02-getting-started.md)
- [Environment overview](/webxr/environment)
- [API reference](pathname:///webxr/api/environment/)
