---
sidebar_position: 3
title: What this stack is and is not
description: What the Reality Toolkit WebXR families promise, what they leave to the app, and where the Service Framework fits alongside them.
---

# What this stack is and is not

Every family in the Reality Toolkit WebXR stack answers to the same short statement, repeated in each repository's README, and it is worth reading slowly the first time.

## What it is

The stack aims at one outcome: an app's logic, input handling, interactions and UI should not care which engine hosts them. Each family ships an engine-free core and thin adapters for the engines it supports, so the same app logic can run on Meta IWSDK, plain three.js and raw WebXR, and, where a family supports them, Babylon.js and Google XR Blocks. When an app still has to reach into the host directly, that is one of two things: either a contract is missing, which is a bug worth reporting, or the app is overreaching what the stack promises.

## What it is not

Portable world-building is not a current promise. Scene content, meshes, prefabs and placement, is built by the app, ideally behind a factory interface the app owns, so a second host could implement the same factories later. A shared content descriptor, following the shape of WebXR-UIExtensions' `SceneDescriptor`, will only be considered once a second host is actually targeted, not before. In the meantime, Meta's `iwsdk.scene.v1` format is an acceptable authoring interchange for scenes built for IWSDK.

WebXR-Environment states the same rule for its own domain. It creates no geometry, and the presets it ships are examples to copy in the first five minutes of a project, not a view on how any world should look. A ground plane, for example, is content rather than a platform facility, which is why an earlier draft's parametric `GroundSpec` was removed once that distinction was made explicit.

## Where the Service Framework sits

The [Service Framework](https://serviceframework.realitycollective.net/) is the fifth package in the estate, and it owns what the four families deliberately do not: dependency injection, the runtime adapter, the session, and the capabilities derived from it, such as whether passthrough is active. Each of the four families takes what it needs from the session through a boolean or a report, rather than reading the session itself, which is what keeps their cores free of any dependency on it. The Service Framework is documented on its own site rather than here.

## More information

- [The layering rule](./01-layering-rule.md)
- [Releases and versions](./04-releases-and-versions.md)
- [Environment overview](/webxr/environment)
- [Service Framework](https://serviceframework.realitycollective.net/)
