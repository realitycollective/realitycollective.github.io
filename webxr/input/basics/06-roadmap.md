---
sidebar_position: 6
title: Roadmap
description: What is in place, what changes are additive-only, and what this package does not plan to do.
---

# Roadmap

This is a short page, because this package moves slowly by design. See [Evolving the contract](../features/02-evolving-the-contract.md) for why.

## In place

`@realitycollective/webxr-input` is released on npm, currently at version 0.1.x, and is consumed by the Interactions family's core today. The capability model, the input source snapshot, the provider interface, pointer streams and the conformance suite are all shipped, along with grip velocity (`linearVelocity`, `angularVelocity`, `velocityBetween`) and the presence capability for showing and hiding the user's own hand and controller visuals. The UI Extensions family's core has planned, but not yet completed, adoption of these pointer and head-pose types in place of its own local duplicates.

## Additive only from here

Future changes to this package add optional fields and new capabilities rather than changing existing ones. Recent releases follow that pattern already: grip velocity, the presence capability and the conformance suite itself all arrived as additions on top of the 0.1.0 shapes, and the snapshot-ownership rule was written into the contract as a clarification enforced by a new conformance case, not a change to an existing one.

## Not planned

No engine code will be added to this package, ever. An architecture test fails the build on any engine import or runtime dependency, and that is a permanent constraint, not a temporary one.

## More information

- [Evolving the contract](../features/02-evolving-the-contract.md)
- [Introduction](./01-introduction.md)
- [Repository](https://github.com/realitycollective/WebXR-Input)
