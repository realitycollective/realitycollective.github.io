---
sidebar_position: 2
title: Evolving the contract
description: Why this package changes additively, what a breaking change costs, and why it is the slowest-moving package in the stack.
---

# Evolving the contract

Two families, and every engine adapter under them, depend on this package's shapes staying stable. That is why it evolves additively and is deliberately the slowest-moving package in the Reality Collective WebXR stack.

## Additive by default

New fields on `InputSourceSnapshot`, such as `linearVelocity` and `angularVelocity`, arrive as optional, so an existing provider that does not supply them keeps compiling and keeps passing conformance. A new capability, such as `presence`, is added to `InputCapabilities` and to `NO_CAPABILITIES` at the same time, defaulting to `false` or `"none"`, so a provider written before the addition still returns a complete, valid capability set. A new provider method, such as `setPresenceVisible`, is added as optional on `InputProvider`, and a conformance case then requires it only when the capability it serves is declared true. This is what lets `@realitycollective/webxr-input` add capabilities across several preview releases without forcing every adapter to update on the same day.

## The capability-key test keeps additions honest

Adding a capability in one place only, such as `InputCapabilities` without the matching entry in `INPUT_CAPABILITY_REQUIREMENTS`, is caught by a test that checks the requirement list against the capability keys. See [Capabilities and negotiation](../basics/04-capabilities.md) for what that test enforces.

## Breaking changes are expensive on purpose

A breaking change, such as renaming a field or removing a capability, requires checking every consuming family first: the interaction core, the UI Extensions core, and every engine adapter under both. That cost is intentional. It keeps this package's shapes the one thing an adapter author can rely on not moving under them, which is the entire point of extracting a contracts package in the first place.

## When to retire, not defend

This package does not claim to be a permanent standard. If an engine-free equivalent to this contract emerges upstream, or if spec convergence makes what remains of the problem trivial, the stated plan is to adopt that alternative or retire this package, not to defend its existence for its own sake.

## More information

- [Capabilities and negotiation](../basics/04-capabilities.md)
- [Provider conformance](../basics/05-provider-conformance.md)
- [Roadmap](../basics/06-roadmap.md)
- [The contracts package](../integrations/01-core.md)
