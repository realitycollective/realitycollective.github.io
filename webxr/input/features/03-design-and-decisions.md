---
sidebar_position: 3
title: Design and decisions
sidebar_label: "Design and decisions"
description: Why this package stays engine-free and dependency-free, its key decisions, and what it deliberately does not build.
---

# Design and decisions

## Summary

- `@realitycollective/webxr-input` stays a single conceptual thing: types and tiny pure helper functions, nothing else
- no engine import and no runtime dependency, ever, enforced by an architecture test rather than a guideline
- capabilities are derived facts about the live session, not requests an app makes
- the package evolves additively; a breaking change is deliberately expensive
- it is deliberately the slowest-moving package in the Reality Collective WebXR stack

## Key decisions

### 1. Engine-free by construction, not by convention

The package holds only types and pure helper functions.

**Why:** an architecture test scans every file under `src/` for imports of `three`, `@iwsdk/*`, `@pmndrs/*` and `xrblocks`, and fails the build if one appears; a second check parses `package.json` and fails if `dependencies` or `peerDependencies` is non-empty. Together they are what let the Interactions family, and the UI Extensions family once it adopts this package, depend on it from any engine with no risk of an engine leaking in transitively.

### 2. Adapters re-export the contracts; apps never install them directly

Every engine adapter re-exports this package in full.

**Why:** keeps an app's install to exactly one package, and means picking up a new capability is "update the adapter", not "add a second dependency".

### 3. Capabilities are derived facts, not requests

`InputCapabilities` describes what the live session can deliver; a provider derives it from the session, never from what an app asked for or hoped to get.

**Why:** a session can change under an app, hands can swap for controllers, or a session can start or end, and capabilities have to reflect that truthfully, re-published whenever it happens.

### 4. The requirement list is tested against the capability keys

`INPUT_CAPABILITY_REQUIREMENTS` is written as runtime data specifically so a test can check it against the keys of `NO_CAPABILITIES`.

**Why:** stops a capability being added to `InputCapabilities` in one place only, with the requirement list left to drift out of step.

### 5. Grab is a three-mode fulfilment contract, not a boolean

`GrabCapability` is `"none"`, `"poseOnly"` or `"native"`, rather than a single boolean flag.

**Why:** matches what engines actually offer, such as IWSDK's own physics-driven grab against an adapter that can only report poses, rather than forcing every engine into one shape.

### 6. Snapshot ownership is a hard, tested rule

A snapshot belongs to whoever `sample()` handed it to; a provider builds fresh objects each call and never mutates one it has already returned.

**Why:** lets a consumer keep last frame's grip pose for a velocity tracker without defensive copying. The conformance suite has a dedicated case that catches a provider that pools objects and refills them in place instead.

### 7. Pointer streams are shaped to match UI Extensions

`PointerSample` and `PointerInputSource` are structurally identical to the pointer contract in `@realitycollective/webxr-uiextensions`.

**Why:** lets one engine adapter drive both the interaction family's behaviours and the UI Extensions family's windowing from the same pointer stream, rather than each family needing its own.

### 8. Evolve additively; a breaking change is deliberately expensive

New fields and capabilities arrive as optional; a breaking change requires checking every consuming family first.

**Why:** keeps this package's shapes the one thing an adapter author can rely on not moving under them, which is the entire point of extracting a contracts package in the first place.

### 9. The conformance suite ships as data, not as fixed tests

`inputProviderContractCases()` returns case objects, each a `name` and a `run(provider, driver?)` function, rather than a fixed test file.

**Why:** every adapter repository already has its own test runner, so the suite stays runner-free and each adapter iterates it with whichever runner it already uses.

## Package breakdown

This family is a single package.

### `@realitycollective/webxr-input`

`src/index.ts` re-exports six files, each covering a distinct part of the contract.

| File | Exports |
| --- | --- |
| `types.ts` | `Vec3Tuple`, `QuatTuple`, `PoseTuple`, `RayTuple`, `HeadPose`, `HeadPoseSource`, `Unsubscribe` |
| `capabilities.ts` | `InputCapabilities`, `GrabCapability`, `NO_CAPABILITIES`, `INPUT_CAPABILITY_REQUIREMENTS`, `InputCapabilityRequirement`, `satisfies`, `unmetRequirements` |
| `source.ts` | `InputSourceSnapshot`, `Handedness`, `InputSourceKind`, `PresenceModality`, `SELECT_PRESS_THRESHOLD`, `SELECT_RELEASE_THRESHOLD` |
| `provider.ts` | `InputProvider`, `InputHitHint` |
| `pointer.ts` | `PointerSample`, `PointerInputSource` |
| `velocity.ts` | `velocityBetween` |
| `contract-cases.ts` | `inputProviderContractCases`, `InputProviderContractCase`, `InputProviderContractDriver` |

## Code layout

```text
WebXR-Input/
├── packages/
│   └── webxr-input/         @realitycollective/webxr-input - the contracts
│       ├── src/              types, capabilities, provider, pointer streams
│       └── test/             contract tests + the engine-free architecture gate
├── scripts/                  shared release tooling (set-version, verify-pack)
└── .github/workflows/        ci.yml + publish-npm.yml
```

## What is deliberately not built

- No engine code, ever. This is a permanent constraint enforced by the architecture test, not a temporary gap waiting to close.
- No runtime dependencies of any kind, so depending on this package can never pull anything else into a consumer's tree.
- No scene or content model. Portable world-building, meshes, prefabs and placement, is left to the app; this package covers input only.
- No claim of permanence as a standard. If an engine-free equivalent emerges upstream, or spec convergence makes the remaining gap trivial, the plan is to adopt or retire this package, not defend its existence.

## More information

- [Introduction](../basics/01-introduction.md)
- [Roadmap](../basics/06-roadmap.md)
- [The contracts package](../integrations/01-core.md)
- [API reference](pathname:///webxr/api/input/)
