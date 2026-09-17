---
sidebar_position: 2
title: Getting started
description: Two starting points for the input contracts, one for an app author and one for an adapter author.
---

# Getting started

This page has two starting points, because the input contracts serve two different readers. An app author reads the types through their engine adapter and never installs this package on its own. An adapter author implements the `InputProvider` interface and proves it with the shared conformance suite.

## As an app author

You never run `npm install @realitycollective/webxr-input` yourself. Every engine adapter, such as `@realitycollective/threejs-interactions`, re-exports the whole contracts package, so installing the adapter is enough. The types you need, such as `InputCapabilities` and `InputProvider`, come from that adapter's package.

```ts
import {
  unmetRequirements,
  type InputCapabilityRequirement,
} from "@realitycollective/threejs-interactions";

const required: InputCapabilityRequirement[] = ["rays", "grabsNative"];
const missing = unmetRequirements(provider.getCapabilities(), required);

if (missing.length > 0) {
  console.warn("degraded input, missing:", missing);
}
```

The next page, [the input model](./03-the-input-model.md), covers what a provider hands you each frame. [Capabilities and negotiation](./04-capabilities.md) covers checking what the current device can do before you rely on it.

## As an adapter author

Implementing `InputProvider` means writing `sample()`, capability change subscriptions and the source change subscription described on [the input model](./03-the-input-model.md) page. Once the shape compiles, prove it behaves correctly by running the shared conformance suite, `inputProviderContractCases()`, from `@realitycollective/webxr-input` in your own test runner. Each case is a `name` and a `run(provider, driver?)` function that throws on failure, so a typical adapter test file is a short loop.

```ts
import { describe, it } from "vitest";
import { inputProviderContractCases } from "@realitycollective/webxr-input";
import { MyEngineInputProvider } from "./my-engine-provider.js";

describe("MyEngineInputProvider", () => {
  for (const contractCase of inputProviderContractCases()) {
    it(contractCase.name, () => {
      contractCase.run(new MyEngineInputProvider());
    });
  }
});
```

A case that needs a session driver, such as one that checks a listener stays silent after it unsubscribes, passes without running when your test harness cannot fake a session. [Provider conformance](./05-provider-conformance.md) covers the case shapes and drivers in full, and [Conformance in practice](../examples/01-conformance-in-practice.md) walks through a working adapter's test file.

## More information

- [The input model](./03-the-input-model.md)
- [Provider conformance](./05-provider-conformance.md)
- [Conformance in practice](../examples/01-conformance-in-practice.md)
- [The contracts package](../integrations/01-core.md)
