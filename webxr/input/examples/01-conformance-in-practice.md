---
sidebar_position: 1
title: Conformance in practice
description: A walkthrough of a real test file that runs the shared contract cases against the three.js provider and its siblings.
---

# Conformance in practice

The Interactions repository's `iwsdk-interactions` package carries a test file, `provider-parity.test.ts`, that builds an instance of every engine adapter's provider, including the three.js one, and runs the full shared conformance suite against each. Its own comment explains why it lives in one place: four providers built against four different engines is exactly the shape of defect that hides, where one of them quietly drops a method and nothing notices until an app swaps adapters.

## Building a provider and a driver

Each adapter gets a small builder function that returns a `provider` and, where the test harness can manage one, a `driver`. The three.js builder constructs a `WebXRInputProvider` with a stub `xr` context whose session, reference space and frame are all `null`, and a real three.js `PerspectiveCamera`, and it supplies no driver:

```ts
function threeProvider(): Built {
  const provider = new WebXRInputProvider({
    xr: { getSession: () => null, getReferenceSpace: () => null, getFrame: () => null },
    camera: new PerspectiveCamera(70, 4 / 3, 0.05, 100),
  } as never);
  return { provider };
}
```

The IWSDK builder, by contrast, supplies a driver, because its fake world can start and end a session cycle: `enterSession` swaps in a fresh `FakeSession`, and `exitSession` sets it back to `null`. Without a driver, the one contract case that checks a listener stays silent across a session cycle simply passes without exercising anything; see [Provider conformance](../basics/05-provider-conformance.md).

## The loop over the shared cases

`describe.each` runs the same block once per adapter, and inside it a plain loop over `inputProviderContractCases()` turns every case into its own test:

```ts
describe.each(providers)("%s provider", (_name, build) => {
  for (const contractCase of inputProviderContractCases()) {
    it(contractCase.name, () => {
      const { provider, driver } = build();
      contractCase.run(provider, driver);
    });
  }
});
```

Because the cases themselves come from `@realitycollective/webxr-input`, this file cannot drift from the contract it implements; it only builds the instances and adds the handful of checks the shared suite does not cover, such as confirming `capabilities.presence` comes back as a boolean.

## What a failing case looks like

`run` throws a plain `Error` with a message describing exactly what went wrong. The capability-keys case, for example, throws a message in the shape `getCapabilities() must return exactly [...], got [...]`, naming every expected key and every key the provider actually returned. Because each case becomes its own `it()`, a test runner reports the adapter name from `describe.each` and the case name together, so a failure points straight at which adapter broke and which part of the contract it broke on.

## Adding a case and watching it fail first

A new conformance case starts in `@realitycollective/webxr-input`, added to the array in `contract-cases.ts` and returned from `inputProviderContractCases()`. Because `provider-parity.test.ts` iterates that function rather than a fixed list, the new case is picked up automatically once the adapter repository's dependency on the contracts package is updated, with no change needed in the adapter repository itself. If an existing provider does not yet satisfy the new case, its `it(contractCase.name, ...)` fails immediately, which is the intended order of operations: the contract changes first, and a failing adapter test shows exactly which adapter still needs updating before the new capability or rule can be relied on.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Provider conformance](../basics/05-provider-conformance.md)
- [Implementations](../integrations/02-implementations.md)
- [API reference](pathname:///webxr/api/input/)
