---
sidebar_position: 7
title: Roadmap
description: What ships today, what is experimental, and what is deliberately out of scope.
---

# Roadmap

## In place

The core behaviour set (`press`, including latching, `pulse`, `hinge`, `dial`, `slide`, `grab` in `poseOnly` and `native` modes, `tossScore`); gaze, both `required` gating and dwell-to-press; targeting, with provider hints beating the core's own hit-testing; capability negotiation with a visible `behaviourDisabled` outcome; events as the only outbound pathway; feedback intents with the two opt-in routing helpers; per-source velocity tracking; presence control on three.js, Babylon and IWSDK; the standalone three.js adapter, including a desktop mouse fallback and optional `three-mesh-bvh` acceleration; the Meta IWSDK adapter's one-call `registerInteractions` and native grab fulfilment; the interaction playground demo; and, from 0.1.1, `hitTesterContractCases()` and `transformPortContractCases()`, the two conformance suites every one of the five platforms below now passes. From 0.1.1-preview.1, the held pose: `TransformPort.beginHold()` and `endHold(release)`, which the `poseOnly` grab calls so a grabbed physics object stops falling while held and leaves the hand with the hand's velocity, implemented on IWSDK, Babylon, XR Blocks (RAPIER, from preview.2) and on the native `interactions` slice, where the two are required. From 0.1.1-preview.2, the platform synchronisation: the IWSDK reference moved to 1.0.0, the hit-tester suite grew to 11 cases holding every platform to IWSDK's surface-distance, default-radius and visible-only rules, every provider samples nothing while its session is hidden, a controller's index tip is its ray origin everywhere, and the native binding derives capabilities and decides presence itself.

## Experimental or not yet run

The Babylon adapter is written against the documented Babylon API and covered by structural fakes only; it has not yet been exercised against a real Babylon runtime. The Google XR Blocks adapter is marked experimental: the upstream API may still move. It is structurally typed against xrblocks 0.21.1 and, from 0.1.1-preview.2, fires haptics through the controller's WebXR Gamepad, reports XR Blocks' `ManipulationManager` grab as an engine-owned grab, and holds a RAPIER rigid body during a grab; it still has no presence control, because XR Blocks owns its hand and controller visuals and exposes no way to hide them. The [native adapter](../integrations/06-native.md), `native-interactions`, reads `globalThis.__rcHost`, runs every rule the IWSDK adapter runs, and is tested only against an in-memory fake of the host; it has not yet run against a real native host, and ships the host conformance kit for that run.

## Platform differences with a stated reason

Every platform behaves as the IWSDK reference does, except where a platform cannot, and each such difference has a reason a reviewer can check. three.js and Babylon.js have no engine-owned grab, so grabs there are pose-only and there is nothing to report as a hint. three.js has no physics engine, so its transform port omits the held pose. three.js and Babylon.js have no hands-or-controllers family switch, because the app owns the visuals on three.js and Babylon picks the visual per source, so `setPresenceModality` returns false there. XR Blocks has no presence at all. A native host that reports a hand joint as its grip pose, rather than the WebXR grip frame, rotates hand menus and grabs; that is host work, and the Input contract now states the frame a grip pose must be in.

## Deliberately not planned

A physics engine of its own, or a physics port. Where the host has physics, the held pose suspends and resumes it and hands over the release velocity; the simulation stays the host engine's. Force-driven grabs, where the hand pushes a heavy object, articulated grabs, where a chain or flail stays simulated while held, and per-object grab physics settings are recognised and deliberately left for later. On a host without physics a throw's flight is the app's own code, as the playground's own ballistics show. Scene meshes, prefabs and placement remain the app's job; loading and switching scenes is the Environment family's [scene manager](/webxr/docs/environment/basics/scenes).

## Also worth knowing

`InteractionRuntime.onSourcesSampled` is deprecated in favour of `onSample`; the two deliver an identical stream since Input 0.1.1 added velocity fields to every snapshot. It still works and will only be removed in a later major release.

## More information

- [Introduction](./01-introduction.md)
- [Babylon.js adapter](../integrations/03-babylon.md)
- [Google XR Blocks adapter](../integrations/05-xrblocks.md)
- [Native adapter](../integrations/06-native.md)
- [Repository on GitHub](https://github.com/realitycollective/WebXR-Interactions)
