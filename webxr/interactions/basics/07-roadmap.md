---
sidebar_position: 7
title: Roadmap
description: What ships today, what is experimental, and what is deliberately out of scope.
---

# Roadmap

## In place

The core behaviour set (`press`, including latching, `pulse`, `hinge`, `dial`, `slide`, `grab` in `poseOnly` and `native` modes, `tossScore`); gaze, both `required` gating and dwell-to-press; targeting, with provider hints beating the core's own hit-testing; capability negotiation with a visible `behaviourDisabled` outcome; events as the only outbound pathway; feedback intents with the two opt-in routing helpers; per-source velocity tracking; presence control on three.js, Babylon and IWSDK; the standalone three.js adapter, including a desktop mouse fallback and optional `three-mesh-bvh` acceleration; the Meta IWSDK adapter's one-call `registerInteractions` and native grab fulfilment; and the interaction playground demo.

From 0.1.1, every one of the five platforms below follows the IWSDK 1.0 reference through the same core rules:

- **Shared suites.** `hitTesterContractCases()` (17 cases), `transformPortContractCases()` (14), `nearPointerContractCases()` (9) and `physicsFacilityContractCases()` (10) run on every platform. The hit-tester suite holds every platform to IWSDK's surface-distance, default-radius and visible-only rules.
- **The grab lifecycle.** A hand grabs with its binary pinch and its squeeze is 0. A dial, slide or hinge follows the grip, then the fingertip, then the ray origin. A throw leaves with the held object's velocity over 1/60 of a second.
- **Near pointers and one pointer per source.** Touch, grab and ray are decided once per source across objects and UI panels, through the shared `PointerArbiter`. The app's `pointerDisplay` settings decide what is drawn, and each binding draws it.
- **Eye gaze and pinch.** The gaze cone, the dwell consensus and the pinching hand that drives a gaze drag are core rules. IWSDK, three.js, Babylon.js and native report the gaze source. The XR Blocks provider does not yet.
- **The physics facility.** One `PhysicsFacility` contract with IWSDK's defaults, over Havok on IWSDK and Babylon.js, Rapier on three.js and XR Blocks, and the native host's engine, Jolt on Quest and Android and RealityKit on visionOS. The held pose, `beginHold` and `endHold`, runs through it.
- **Recorded traces.** A trace recorded on the reference is replayed through each binding's own ports and compared within stated tolerances.
- **Provider rules.** Every provider samples nothing while its session is hidden, and a controller's index tip is its ray origin.
- **Native.** The binding derives capabilities and decides presence and the pointer drawing itself. The host conformance kit has 49 cases.

## Tested on a headset

On 1 October 2026 a native app built with `native-interactions` passed a person's play-through on a Meta Quest 3, and the host conformance kit checked it. One known issue remains on native: grab does not yet work as it should. Pinch works as expected.

## Experimental or not yet run

The Babylon adapter is written against the documented Babylon API and covered by structural fakes. The playground runs it in a real Babylon scene on desktop, and it has had no headset pass. Its physics facility fails 7 of the 10 shared physics cases against a real Havok plugin, so treat physics on Babylon as unproven. The Google XR Blocks adapter is marked experimental: the upstream API may still move. It is structurally typed against xrblocks 0.21.1, fires haptics through the controller's WebXR Gamepad, reports XR Blocks' `ManipulationManager` grab as an engine-owned grab, and holds a RAPIER rigid body during a grab. It has no presence control, because XR Blocks owns its hand and controller visuals and exposes no way to hide them. The [native adapter](../integrations/06-native.md), `native-interactions`, reads `globalThis.__rcHost` and runs every rule the IWSDK adapter runs. It is proved headless against an in-memory fake of the host and on a Quest 3 through the host conformance kit.

## Platform differences with a stated reason

Every platform behaves as the IWSDK reference does, except where a platform cannot, and each such difference has a reason a reviewer can check. The XR Blocks provider reports no eye-gaze source. three.js and Babylon.js have no engine-owned grab, so grabs there are pose-only and there is nothing to report as a hint. three.js and Babylon.js have no hands-or-controllers family switch, because the app owns the visuals on three.js and Babylon picks the visual per source, so `setPresenceModality` returns false there. XR Blocks has no presence at all. On three.js, XR Blocks and Babylon.js the app hands the engine module to the adapter, because the adapters import no physics engine, so an app that passes none has no physics there. A native host that reports a hand joint as its grip pose, rather than the WebXR grip frame, rotates hand menus and grabs; that is host work, and the Input contract states the frame a grip pose must be in.

## Deliberately not planned

A physics engine of the family's own. Each platform's engine simulates, and the facility holds, resumes, teleports and hands over velocities through one contract. Force-driven grabs, where the hand pushes a heavy object, articulated grabs, where a chain or flail stays simulated while held, and per-object grab physics settings are recognised and deliberately left for later. An object registered with no body has no flight after release, and its flight is the app's own code, as the playground's own ballistics show. Scene meshes, prefabs and placement remain the app's job. Loading and switching scenes is the Environment family's [scene manager](/webxr/docs/environment/basics/scenes).

## What comes next

Work on the next version lands on the `development` branch, which publishes previews of it under the `preview` tag. A preview shows where the family is heading and is not supported.

## Also worth knowing

`InteractionRuntime.onSourcesSampled` is deprecated in favour of `onSample`; the two deliver an identical stream since Input 0.1.1 added velocity fields to every snapshot. It still works and will only be removed in a later major release.

## More information

- [Introduction](./01-introduction.md)
- [Babylon.js adapter](../integrations/03-babylon.md)
- [Google XR Blocks adapter](../integrations/05-xrblocks.md)
- [Native adapter](../integrations/06-native.md)
- [Repository on GitHub](https://github.com/realitycollective/WebXR-Interactions)
