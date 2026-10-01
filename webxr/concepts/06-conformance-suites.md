---
sidebar_position: 6
title: Conformance suites
description: The thirteen shared suites that hold every platform, native included, to the same contract, the host conformance kits a native app runs on its device, and how a platform runs them.
---

# Conformance suites

The golden rule behind every family is that clients only ever talk to the core, and every platform implements the same contract underneath. That promise only holds if the platforms are actually checked against each other, so every core contract a platform implements now ships a shared conformance suite as data, thirteen in all across the five packages. The IWSDK binding is the reference behaviour in every family, and the suites are how every other platform is held to it.

There are three kinds of case, and every rule needs the kind that fits it. A **core case** proves the core's own logic, in the core package's unit tests, once. A **contract case** proves what a binding hands its platform, from the shared suites on this page, run in every platform's test suite. A **host case** proves what a real native host does with what it is handed, from a host conformance kit, run on the device; see [Native as a platform](./05-native-platform.md#host-conformance-kits). A rule with no case is untested, and untested counts as not compatible.

## The runner-free suite shape

Each suite is a function that returns a readonly array of cases, and each case is `{ name, run }`. `run` throws a plain `Error` describing the failure on a broken subject and returns silently on a conforming one, so any test runner can host it as a single assertion, and a bare JavaScript engine with no test runner at all can host it as a loop. No suite package assumes vitest, jest or any other runner.

## The thirteen suites

| Family | Core package | Suite | Cases | Holds a platform to |
| --- | --- | --- | --- | --- |
| Service Framework | `service-framework` | `runtimeAdapterContractCases` | 14 | The same session lifecycle and capability behaviour on every `RuntimeAdapter`, headless or on a headset, including session modes, end-and-request and recentring |
| Service Framework | `service-framework` | `renderTickContractCases` | 5 | One `renderTick` per frame, counted from 1, with `timestamp` and `deltaTime` in milliseconds, whichever binding emits it |
| Service Framework | `service-framework` | `hostIOContractCases` | 5 | The same `fetchBytes` and `gunzip` behaviour on the web and native `HostIO`, with nothing that needs a browser |
| WebXR-Input | `webxr-input` | `inputProviderContractCases` | 11 | Capability keys, well-formed snapshots, a hand's binary select and zero squeeze, the eye-gaze rule, snapshot ownership and a working presence pathway on every `InputProvider` |
| WebXR-Interactions | `webxr-interactions` | `hitTesterContractCases` | 17 | A ray or proximity query answers null or the nearer target, with a positive distance and a point near the query; a proximity distance is to the target's surface, clamped at zero, and its point is the nearest surface point, never the centre; a target with no declared radius is a 0.1 m sphere, a ray that passes a target farther than its radius misses it, and only visible objects are targets. Where a platform has a cone query for eye gaze, it finds targets inside the cone and prefers the one nearer the axis |
| WebXR-Interactions | `webxr-interactions` | `nearPointerContractCases` | 9 | Through the platform's own hit tester: a fingertip hovers at 0.15 m and presses at 0.02 m, a grip within 0.07 m grabs, touch beats grab beats ray, a pressing pointer keeps the hand, and a panel and an object compete for one pointer under the shared arbiter |
| WebXR-Interactions | `webxr-interactions` | `transformPortContractCases` | 14 | `getWorldPose()` is live, `getRestWorldPose()` stays at the registration pose, offsets compose from rest, and every returned tuple is fresh. Where the subject has physics, a held body does not fall, a released one leaves with its velocity, and a reset one comes to rest; without physics those three skip |
| WebXR-Interactions | `webxr-interactions` | `physicsFacilityContractCases` | 10 | A platform's physics keeps the core's defaults: gravity, a dynamic sphere coming to rest on a static box, restitution, static and kinematic bodies, suspend and resume for a held body, pose and velocity writes, gravity factor and disposal |
| WebXR-UIExtensions | `webxr-uiextensions` | `windowHostContractCases` | 7 | `createWindow`, `onReady` and `onPanelReady` replay for a late subscriber, closing through the `WindowManager` tears a window down, and `dispose()` leaves nothing to replay |
| WebXR-UIExtensions | `webxr-uiextensions` | `sceneTargetContractCases` | 5 | `applyScene` opens the same windows under the same id, title, region and dock mode on every host, and a region always wins over a dock mode |
| WebXR-UIExtensions | `webxr-uiextensions` | `uixElementContractCases` | 6 | The element tree, property writes and element events a control walks behave the same from the same markup, ending with a real stepper driven by clicks |
| WebXR-Environment | `webxr-environment` | `environmentPortContractCases` | 6 | Every slot's spec variants apply without throwing, and `observe()` reports what a port can and cannot sense |
| WebXR-Environment | `webxr-environment` | `audioPortContractCases` | 7 | A voice's `ended` callback fires exactly once, never again after it is stopped, and a voice that never starts is released once the port's start timeout elapses |
| WebXR-Environment | `webxr-environment` | `worldSensingPortContractCases` | 7 | A sensing request a port accepts never rejects the promise it hands back |
| WebXR-Environment | `webxr-environment` | `sceneManagerContractCases` | 18 | The real `SceneManager` over the host's real `ScenePort` keeps every scene rule: single and additive loads, unload order, instances and persistent nodes, the active scene and its environment, preload hidden from rendering and hit testing, call ordering, unique node ids, bindings and a clean dispose. The host answers from itself through an inspector |

Every platform in a family, native included, runs its family's suites: `native-interactions` runs `inputProviderContractCases()`, `hitTesterContractCases()`, `nearPointerContractCases()`, `transformPortContractCases()` and `physicsFacilityContractCases()` alongside the other four Interactions platforms, `native-uiextensions` runs the three UI Extensions suites alongside IWSDK, three.js and XR Blocks, and `native-environment` runs all four Environment suites alongside its siblings. The transform suite's three physics cases and the physics facility suite run on every platform with a physics facility: IWSDK over its own Havok physics, three.js and XR Blocks over Rapier, Babylon over Havok, and native over the host's `physics` slice. The Babylon facility passes against a stand-in engine; against real Havok it does not yet pass every case.

A fake that stands in for a host in these suites behaves as a correct host would, and every suite is shown to fail a host with the defect it exists for, so a green run means the platform matches the reference rather than that the fake was forgiving.

## How a platform runs them

A platform with its own test runner loops over the suite and turns each case into one test:

```ts
for (const contractCase of transformPortContractCases()) {
  it(contractCase.name, () => contractCase.run(makeSubject()));
}
```

A native app has no test runner on device, so the same loop runs plainly and reports each case by name:

```js
for (const contractCase of uixElementContractCases()) {
  try {
    contractCase.run(makeSubject());
    report(contractCase.name, "pass");
  } catch (error) {
    report(contractCase.name, "fail", error.message);
  }
}
```

Both loops iterate the same function from the same package, so a suite change reaches every platform's tests the moment its dependency on the core is updated, with no change needed in the platform's own repository.

## Every case can fail

Each core package also carries a "broken subject" test alongside its suite: a fake that breaks one thing at a time, run through the matching case, asserting it throws. This is what proves a case actually checks something, rather than passing on any subject handed to it. A native package that returns the wrong slice, drops a copy, or reads the wrong pose fails the same way a broken fake does. The host conformance kits carry the same negative tests: each is shown to fail a host that misplaces a window, measures proximity to a centre, loses a release velocity or flattens every sky kind to one.

## More information

- [Native as a platform](./05-native-platform.md)
- [Provider conformance](/webxr/docs/input/basics/provider-conformance)
- [Conformance in practice](/webxr/docs/input/examples/conformance-in-practice)
- [Service Framework: Conformance suites](https://serviceframework.realitycollective.net/docs/web/features/conformance_suites)
