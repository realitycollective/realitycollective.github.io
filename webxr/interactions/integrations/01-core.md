---
sidebar_position: 1
title: "Core: @realitycollective/webxr-interactions"
description: What lives in the engine-free core, when to depend on it directly, and how it is tested.
---

# Core: @realitycollective/webxr-interactions

The engine-free package every adapter re-exports. Most apps never install it directly; they install one adapter instead, and get this package along with it.

## What lives in it

Behaviours (`press`, `pulse`, `hinge`, `dial`, `slide`, `grab`, `tossScore`) as pure state machines; the runtime and binder, which handles targeting, press and grab transitions with hysteresis, gaze gating and dwell, capability negotiation, events and feedback intents; and the shared input contracts, re-exported from `@realitycollective/webxr-input`.

## When to depend on it directly

Two cases. Writing a new engine adapter: you need `TransformPort`, `HitTester`, `InputProvider` and the runtime, with none of a specific engine's types pulled in. Writing headless tests for your own behaviours or descriptors, where a three.js or Babylon dependency would buy nothing.

```sh
npm install @realitycollective/webxr-interactions@preview
```

Everyone else installs one adapter instead; each adapter re-exports this package wholesale, so an app depends on exactly one package.

## The architecture test

The design rule "no engine imports" is enforced, not just documented. The workspace runs an architecture test that fails the build the moment an engine import lands inside this package's source, so behaviours, the runtime, gaze and the interaction math stay engine-free because nothing else is possible.

## Headless testing

Behaviours are plain classes implementing the `Behaviour` interface, and the runtime speaks only tuples and interactable ids. Both are unit-testable with vitest against a mock `BehaviourContext` and a fake `InputProvider`, with no renderer or browser required. See [Patterns](../basics/06-patterns.md) for the shape of such a test.

## More information

- [Introduction](../basics/01-introduction.md)
- [Behaviours](../basics/03-behaviours.md)
- [Patterns](../basics/06-patterns.md)
- [API reference](pathname:///webxr/api/interactions/)
