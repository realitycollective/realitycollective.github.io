---
sidebar_position: 4
title: Capabilities and negotiation
description: InputCapabilities, the grab modes, the requirement list, and negotiating what the live session can actually do.
---

# Capabilities and negotiation

A capability is a fact about what the current session can actually deliver, such as whether hand joints are available or a source has haptics. `InputCapabilities` is a fixed set of these facts, and a provider derives them from the live session, never from what an application asked for or hoped to get. That matters because a session can change under an application: hands can swap for controllers, or a session can start or end, and capabilities are re-published whenever that happens.

## The capability keys

`InputCapabilities` has eleven fields: `rays` (pointing rays with a select action), `pokes` (fingertip or proximity press), `grabs` (see below), `handJoints` (per-joint hand poses), `pinch` (0 to 1 pinch strength from hand tracking), `buttonsAxes` (gamepad-style buttons and axes beyond select and squeeze), `gaze` (head-gaze usable as a pointer), `pointer2d` (a 2D mouse or touch fallback projected into the scene), `headPose` (a live head pose is available), `haptics` (at least one source has a haptic actuator) and `presence` (the provider can show or hide the user's own hand and controller visuals). `NO_CAPABILITIES` is the safe default before a session exists: every boolean is `false` and `grabs` is `"none"`.

`grabs` is a `GrabCapability`, one of three fulfilment modes rather than a boolean. `"none"` means no grab input at all. `"poseOnly"` means the provider reports grab start, end and poses, and the consumer moves the object itself. `"native"` means the engine owns carry and throw, such as IWSDK grabbables under physics, and the provider only reports the transitions and observed poses.

## Requirements and negotiation

A consumer, such as an interaction behaviour, declares what it needs as one or more `InputCapabilityRequirement` values from the `INPUT_CAPABILITY_REQUIREMENTS` list. That list mirrors the capability keys, except `grabs` has two requirements: `"grabs"`, satisfied by `"poseOnly"` or `"native"`, and `"grabsNative"`, satisfied only by `"native"`. `satisfies(capabilities, requirement)` checks a single requirement against a capability set, and `unmetRequirements(capabilities, requirements)` returns the subset of a requirement list that is not satisfied.

```ts
import {
  unmetRequirements,
  type InputCapabilityRequirement,
} from "@realitycollective/threejs-interactions";

const needed: InputCapabilityRequirement[] = ["grabsNative", "haptics"];
const missing = unmetRequirements(provider.getCapabilities(), needed);

if (missing.length > 0) {
  // Disable the behaviour and say why, rather than failing silently.
  console.warn("feature degraded, missing:", missing);
}
```

## The test that keeps them in step

`INPUT_CAPABILITY_REQUIREMENTS` is written as runtime data specifically so a test can check it against the keys of `NO_CAPABILITIES`. That test fails if a new capability is added to `InputCapabilities` without a matching entry in the requirement list, so a capability cannot be added in one place only.

## More information

- [The input model](./03-the-input-model.md)
- [Provider conformance](./05-provider-conformance.md)
- [Evolving the contract](../features/02-evolving-the-contract.md)
- [API reference](pathname:///webxr/api/input/)
