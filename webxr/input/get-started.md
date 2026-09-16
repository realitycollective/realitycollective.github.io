---
sidebar_position: 1
sidebar_label: Welcome to WebXR Input
title: Welcome to WebXR Input
description: The engine-free contracts that describe XR input, who consumes them, and how an adapter or app depends on them.
---

# Welcome to WebXR Input

`@realitycollective/webxr-input` is a small set of plain TypeScript types that describe XR input: where a hand or controller is pointing, what it is touching, and what the device can actually do. It has no dependency on any 3D engine, so one engine adapter written against it can feed more than one family of behaviour.

## Overview

An application never talks to this package on its own; it reads the types through whichever engine adapter it installs, such as `@realitycollective/threejs-interactions`. An **adapter** is the only place an engine name is allowed to appear. It implements the `InputProvider` interface this package defines, turning an engine's raw input into the shapes described here. A **provider** is that implementation: one object that samples input every frame and reports what the current session can actually do. This package itself never imports an engine, and a test in its own repository fails the build if one appears.

Start with [the input model](./basics/03-the-input-model.md) for the concepts, or jump to the [quickstart](#quickstart) below.

## Requirements

- Node 20 or newer for tooling. The package itself runs in any modern browser with WebXR.
- A bundler or framework of your choice; each adapter that depends on this package picks its own.
- TypeScript is recommended but not required; the package ships type declarations.

Current release: `0.1.x` on npm, published under the `latest` dist-tag.

### Packages

| Package | What it is | Peers |
| --- | --- | --- |
| `@realitycollective/webxr-input` | The contracts: capabilities, input source snapshots, the `InputProvider` interface, pointer streams and the conformance suite | None. Zero runtime dependencies, enforced by an architecture test. |

Every engine adapter in the Interactions family depends on this package and re-exports it in full, so an app never installs it directly.

```sh
npm install @realitycollective/webxr-input
```

Install it directly only to write a new engine adapter, or to write headless tooling and tests against the raw contracts.

## Use cases

- writing a new engine adapter, so its `InputProvider` implementation and the shared conformance suite agree from the start
- checking a live session's capabilities before an app or behaviour relies on one, such as haptics or a native grab
- tooling or a test suite that needs the input shapes but not an engine, such as a schema generator
- proving two adapters behave the same way at the input boundary, by running the same conformance suite against both

## Quickstart

Three steps: implement the provider interface, prove it with the shared conformance suite, then ship it through your adapter package.

### 1. Implement `InputProvider`

A provider implements `sample()`, which returns a fresh `InputSourceSnapshot` array once per frame, `getCapabilities()`, and the capability and source change subscriptions the interface declares.

```ts
import type { InputProvider } from "@realitycollective/webxr-input";

class MyEngineInputProvider implements InputProvider {
  // sample(), getCapabilities(), onCapabilitiesChanged(), onSourcesChanged() ...
}
```

### 2. Run the shared conformance suite

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

### 3. Ship it through your adapter package

Re-export this package's contracts alongside your provider, so an app that installs the adapter gets everything it needs from one dependency.

```ts
// your adapter package's index.ts
export * from "@realitycollective/webxr-input";
export { MyEngineInputProvider } from "./my-engine-provider.js";
```

[Getting started](./basics/02-getting-started.md) walks through both the app-author and adapter-author paths in more detail.

## Examples and runnable apps

This package ships no demo app of its own; it has no scene to render and no engine to run one in. [Conformance in practice](./examples/01-conformance-in-practice.md) walks through a real adapter test file that builds a provider and runs every shared case against it, the closest thing this package has to a runnable example. Each adapter that consumes it, in the Interactions family, ships its own runnable demo instead; see the [Interactions overview](/webxr/interactions).

## What this stack is and is not

The Reality Collective WebXR packages aim at one outcome: an app's logic, input handling, interactions and UI should not care which engine hosts them. Each family ships an engine-free core and thin adapters for Meta IWSDK, plain three.js and WebXR, Babylon.js and Google XR Blocks. When an app still has to reach into the host, either a contract is missing, which is a bug to report, or the app is overreaching. Portable world-building is not a current promise. Scene content, meshes, prefabs and placement, is built by the app, ideally behind a factory interface the app owns.

## Feedback

Questions and problems go to the [Reality Collective Discord](https://discord.gg/YjHAQD2XT8) or the [issue tracker](https://github.com/realitycollective/WebXR-Input/issues).

## Documentation

- [Basics](./basics/01-introduction.md): the concepts, one page per topic
- [Features](./features/01-pointer-streams-and-velocity.md): pointer streams, evolving the contract, and design and decisions
- [Host integrations](./integrations/01-core.md): the contracts package as an npm dependency, and which adapters implement it
- [Examples](./examples/01-conformance-in-practice.md): a worked conformance test
- [Input overview](/webxr/input)
