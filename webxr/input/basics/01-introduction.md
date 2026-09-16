---
sidebar_position: 1
title: Introduction
description: Why the Reality Collective ships an engine-free input contract, who consumes it, and the rules it follows.
---

# Introduction

`@realitycollective/webxr-input` is a small set of plain TypeScript types that describe XR input: where a hand or controller is pointing, what it is touching, and what the device can actually do. It has no dependency on any 3D engine and no runtime dependencies at all, and a test enforces both.

## The problem it solves

WebXR deliberately exposes low-level input, such as `XRInputSource`, raw `Gamepad` state and `select`/`squeeze` events, and leaves the job of turning that into meaning to userland code. That gap is acknowledged in the ecosystem's own trackers, not just by this project. The spec offers no way to ask whether an input source has a primary action at all: Quest hands emit `select`, visionOS hands do not ([immersive-web/webxr#1358](https://github.com/immersive-web/webxr/issues/1358)). Apple Vision Pro's `transient-pointer` input shifted input indices enough that the browser vendor published a migration guide ([WebKit, March 2024](https://webkit.org/blog/15162/introducing-natural-input-for-webxr-in-apple-vision-pro/)). Addressing a controller by handedness rather than by its position in an array has been an open three.js request since 2020 ([three.js#20348](https://github.com/mrdoob/three.js/issues/20348)). On the accessibility side, the W3C's [XR Accessibility User Requirements](https://www.w3.org/TR/xaur/) call for device-independent action and gesture remapping, and the immersive-web accessibility explainer says that support for it "will most frequently fall to individual libraries". This package is one of those libraries.

## Why not something that already exists

Excellent prior art exists for parts of this problem, and this package reuses some of it rather than replacing it. [`@webxr-input-profiles/*`](https://github.com/immersive-web/webxr-input-profiles) supplies controller profile data, button layouts and models, but no sources, capabilities, hands or provider concept. An adapter can still use it internally for button and axis mapping. [`@pmndrs/pointer-events`](https://github.com/pmndrs/xr) dispatches pointer events over a three.js scene graph, which is a good fit inside a three.js adapter but is not engine-free. [`@pmndrs/xr`](https://github.com/pmndrs/xr) carries input state types that are inseparable from its own `Object3D`-based runtime. [`@iwsdk/xr-input`](https://developers.meta.com/horizon/documentation/web/iwsdk-concept-xr-input) is the closest relative: a profile-keyed, unified pointer system, but it is a concrete three.js runtime with a peer dependency on three.js, not a contracts layer, and it sits behind the IWSDK adapter rather than replacing this package. Babylon.js, A-Frame, PlayCanvas, XR Blocks and Wonderland each maintain their own full input layer, entirely engine-internal. None of this prior art is an engine-free contract, which is the specific, narrow gap this package fills: about three hundred lines of types that the existing systems can be described in.

## Who consumes it

An engine adapter, such as the three.js adapter, implements the `InputProvider` interface this package defines. The interaction family's core and the UI Extensions family's core (adoption planned) both consume `InputProvider` to drive their behaviour, so one adapter written for an engine feeds both families at once. An application never installs this package directly: every engine adapter re-exports it in full, so depending on the adapter is enough.

## Rules of the road

This package holds types and tiny pure helper functions only. No engine import is allowed in its source, and a test fails the build if one appears. It declares no runtime dependencies, so adding it can never pull an engine into a consumer's dependency tree. It evolves additively: new capabilities and snapshot fields arrive as optional, and a breaking change requires checking every consuming family first. It is deliberately the slowest-moving package in the Reality Collective WebXR stack.

## More information

- [Getting started](./02-getting-started.md)
- [The input model](./03-the-input-model.md)
- [The contracts package](../integrations/01-core.md)
- [Input overview](/webxr/input)
