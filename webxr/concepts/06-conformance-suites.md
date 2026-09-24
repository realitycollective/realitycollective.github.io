---
sidebar_position: 6
title: Conformance suites
description: The twelve shared suites that hold every platform, native included, to the same contract, and how a platform runs them.
---

# Conformance suites

The golden rule behind every family is that clients only ever talk to the core, and every platform implements the same contract underneath. That promise only holds if the platforms are actually checked against each other, so every core contract a platform implements now ships a shared conformance suite as data, twelve in all across the five packages.

## The runner-free suite shape

Each suite is a function that returns a readonly array of cases, and each case is `{ name, run }`. `run` throws a plain `Error` describing the failure on a broken subject and returns silently on a conforming one, so any test runner can host it as a single assertion, and a bare JavaScript engine with no test runner at all can host it as a loop. No suite package assumes vitest, jest or any other runner.

## The twelve suites

| Family | Core package | Suite | Cases | Holds a platform to |
| --- | --- | --- | --- | --- |
| Service Framework | `service-framework` | `runtimeAdapterContractCases` | 10 | The same session lifecycle and capability behaviour on every `RuntimeAdapter`, headless or on a headset |
| Service Framework | `service-framework` | `renderTickContractCases` | 5 | One `renderTick` per frame, counted from 1, with `timestamp` and `deltaTime` in milliseconds, whichever binding emits it |
| Service Framework | `service-framework` | `hostIOContractCases` | 5 | The same `fetchBytes` and `gunzip` behaviour on the web and native `HostIO`, with nothing that needs a browser |
| WebXR-Input | `webxr-input` | `inputProviderContractCases` | 7 | Capability keys, well-formed snapshots, snapshot ownership and a working presence pathway on every `InputProvider` |
| WebXR-Interactions | `webxr-interactions` | `hitTesterContractCases` | 6 | A ray or proximity query answers null or the nearer target, with a positive distance and a point near the query |
| WebXR-Interactions | `webxr-interactions` | `transformPortContractCases` | 11 | `getWorldPose()` is live, `getRestWorldPose()` stays at the registration pose, offsets compose from rest, and every returned tuple is fresh |
| WebXR-UIExtensions | `webxr-uiextensions` | `windowHostContractCases` | 7 | `createWindow`, `onReady` and `onPanelReady` replay for a late subscriber, closing through the `WindowManager` tears a window down, and `dispose()` leaves nothing to replay |
| WebXR-UIExtensions | `webxr-uiextensions` | `sceneTargetContractCases` | 5 | `applyScene` opens the same windows under the same id, title, region and dock mode on every host, and a region always wins over a dock mode |
| WebXR-UIExtensions | `webxr-uiextensions` | `uixElementContractCases` | 6 | The element tree, property writes and element events a control walks behave the same from the same markup, ending with a real stepper driven by clicks |
| WebXR-Environment | `webxr-environment` | `environmentPortContractCases` | 6 | Every slot's spec variants apply without throwing, and `observe()` reports what a port can and cannot sense |
| WebXR-Environment | `webxr-environment` | `audioPortContractCases` | 6 | A voice's `ended` callback fires exactly once, and never again after it is stopped |
| WebXR-Environment | `webxr-environment` | `worldSensingPortContractCases` | 7 | A sensing request a port accepts never rejects the promise it hands back |

Every platform in a family, native included, runs its family's suites: `native-interactions` runs `inputProviderContractCases()`, `hitTesterContractCases()` and `transformPortContractCases()` alongside the other four Interactions platforms, and `native-environment` runs all three Environment suites alongside its siblings.

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

Each core package also carries a "broken subject" test alongside its suite: a fake that breaks one thing at a time, run through the matching case, asserting it throws. This is what proves a case actually checks something, rather than passing on any subject handed to it. A native package that returns the wrong slice, drops a copy, or reads the wrong pose fails the same way a broken fake does.

## More information

- [Native as a platform](./05-native-platform.md)
- [Provider conformance](/webxr/docs/input/basics/provider-conformance)
- [Conformance in practice](/webxr/docs/input/examples/conformance-in-practice)
- [Service Framework: Conformance suites](https://serviceframework.realitycollective.net/docs/web/features/conformance_suites)
