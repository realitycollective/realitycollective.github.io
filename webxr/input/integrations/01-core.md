---
sidebar_position: 1
title: "The contracts package: @realitycollective/webxr-input"
description: What ships in the core contracts package, its architecture test, and how to depend on it for testing and tooling.
---

# The contracts package: @realitycollective/webxr-input

`@realitycollective/webxr-input` is the core this whole family is built on: types and tiny pure helper functions, no engine imports, no runtime dependencies. An application does not install it directly; every engine adapter re-exports it in full. An adapter author, or anyone writing tooling or tests against the raw contracts, installs it directly.

```sh
npm install @realitycollective/webxr-input
```

## What it exports, by file

`src/index.ts` re-exports six files, each with a distinct part of the contract.

| File | Exports |
| --- | --- |
| `types.ts` | `Vec3Tuple`, `QuatTuple`, `PoseTuple`, `RayTuple`, `HeadPose`, `HeadPoseSource`, `Unsubscribe` |
| `capabilities.ts` | `InputCapabilities`, `GrabCapability`, `NO_CAPABILITIES`, `INPUT_CAPABILITY_REQUIREMENTS`, `InputCapabilityRequirement`, `satisfies`, `unmetRequirements` |
| `source.ts` | `InputSourceSnapshot`, `Handedness`, `InputSourceKind`, `PresenceModality`, `SELECT_PRESS_THRESHOLD`, `SELECT_RELEASE_THRESHOLD` |
| `provider.ts` | `InputProvider`, `InputHitHint` |
| `pointer.ts` | `PointerSample`, `PointerInputSource` |
| `velocity.ts` | `velocityBetween` |
| `contract-cases.ts` | `inputProviderContractCases`, `InputProviderContractCase`, `InputProviderContractDriver` |

[The input model](../basics/03-the-input-model.md) and [Capabilities and negotiation](../basics/04-capabilities.md) cover what these types mean; this page is about the package as a dependency.

## The architecture test

A test in this package's own `test/` folder scans every file under `src/` for imports of `three`, `@iwsdk/*`, `@pmndrs/*` and `xrblocks`, and fails the build if any appear. A second check parses `package.json` and fails if `dependencies` or `peerDependencies` is non-empty. Together they are what let both the Interactions and UI Extensions families depend on this package from any engine, with no risk of an engine leaking in through a transitive dependency.

## Depending on it in tests and tooling

An adapter's own test suite imports `inputProviderContractCases()` from this package directly, rather than from the adapter's own re-export, to make the dependency on the shared suite explicit.

```ts
import {
  inputProviderContractCases,
  type InputProvider,
  type InputProviderContractDriver,
} from "@realitycollective/webxr-input";
```

Build tooling that only needs the types, such as a script generating documentation or a schema, can depend on this package alone without pulling in an engine adapter or the interaction runtime that sits above it.

## More information

- [Implementations](./02-implementations.md)
- [Provider conformance](../basics/05-provider-conformance.md)
- [Conformance in practice](../examples/01-conformance-in-practice.md)
- [npm package](https://www.npmjs.com/package/@realitycollective/webxr-input)
