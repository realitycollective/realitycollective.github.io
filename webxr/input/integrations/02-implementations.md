---
sidebar_position: 2
title: Implementations
description: The engine adapters that implement InputProvider, and which capability each one reports according to its own README.
---

# Implementations

Five adapters in the Interactions family implement `InputProvider` today. Each is described in depth on its own page; this page only says which one to reach for and links onward.

## three.js

`@realitycollective/threejs-interactions` reads raw WebXR directly: controllers, hand joints and haptic pulses through the browser's own XR API, with a desktop mouse fallback. See the [three.js adapter](/webxr/docs/interactions/integrations/threejs).

## Babylon.js

`@realitycollective/babylon-interactions` feeds a Babylon `WebXRDefaultExperience` into the contracts, matching Babylon's API shape in TypeScript rather than importing it, so an upstream Babylon release cannot break an app's install. Its own README notes it has not yet been exercised against a real Babylon runtime and should be treated as a preview. See the [Babylon adapter](/webxr/docs/interactions/integrations/babylon).

## Meta IWSDK

`@realitycollective/iwsdk-interactions` connects to Meta's Immersive Web SDK, passing through IWSDK's own `Pressed` and `Grabbed` tags as pre-resolved targeting hints instead of recomputing them. See the [IWSDK adapter](/webxr/docs/interactions/integrations/iwsdk).

## Google XR Blocks

`@realitycollective/xrblocks-interactions` feeds XR Blocks input into the contracts and reuses the three.js adapter's hit-testing. Its own README marks it experimental, since the XR Blocks pipeline is still young. See the [XR Blocks adapter](/webxr/docs/interactions/integrations/xrblocks).

## Native

`@realitycollective/native-interactions` reads the `input` slice a native app (OpenXR on Quest, CompositorServices on visionOS) installs on `globalThis.__rcHost`, and copies every snapshot before it leaves the provider, so a host that reuses its own buffers cannot change a snapshot the app is still holding. From 0.1.1 (preview); from 0.1.1-preview.2 the host reports facts, whether the session is immersive and focused and whether hand tracking is on, and the provider derives every capability from them and from the live sources exactly as the IWSDK provider does, and decides presence per side itself. Tested headless against an in-memory fake of the slice only; not yet run on real hardware. See the [Native adapter](/webxr/docs/interactions/integrations/native).

## Which capability each one reports

This table records only what each adapter's own README states. A blank cell means the README does not describe that capability either way; check the adapter's page or its README for anything not shown here.

| Capability | three.js | Babylon | IWSDK | XR Blocks |
| --- | --- | --- | --- | --- |
| rays | Raycasting against the scene graph | `scene.pickWithRay` hook | - | Ray sources from `Input.getFrame()` |
| pokes | Proximity sphere test (`hitProximity`) | - | - | Direct touches from `Input.getFrame()` |
| grabs | Moves and rotates objects for the grab behaviour | Moves, rotates and scales nodes for the grab behaviour | IWSDK performs the grab itself when grabbing or physics is enabled | - |
| handJoints | Hand joints | Hand-tracking joints | Hand joints | - |
| pointer2d | Mouse fallback | `scene.onPointerObservable` fallback | - | - |
| haptics | Haptic pulses | Through the motion controller's `pulse` | - | Through the controller's WebXR Gamepad actuators, from 0.1.1-preview.2; none in 0.1.0 |
| presence | Off until `registerVisual`, then on | Shows and hides what Babylon built; no modality switch | - | - |

`pinch`, `buttonsAxes`, `gaze`, `headPose` and `grabsNative` are not described explicitly in any of the four READMEs, so they are left off this table rather than guessed at.

Native is left off this table too, for a different reason: what it reports depends on the host's facts and sources rather than on the adapter, derived by the same rules as IWSDK. Rays, pokes and pose-only grabs follow immersion; hand joints and pinch follow the hand-tracking fact or a tracked hand; buttons and axes follow a controller source; haptics follow a source with an actuator on a host that can pulse; gaze and the head pose follow a reported head pose; and presence follows whether the host applies it.

## More information

- [The contracts package](./01-core.md)
- [Provider conformance](../basics/05-provider-conformance.md)
- [Conformance in practice](../examples/01-conformance-in-practice.md)
- [Pointer streams and velocity](../features/01-pointer-streams-and-velocity.md)
- [Native as a platform](/webxr/docs/concepts/native-platform)
