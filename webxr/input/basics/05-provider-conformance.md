---
sidebar_position: 5
title: Provider conformance
description: The shared InputProvider conformance suite, how a case is shaped, and how a session driver works.
---

# Provider conformance

An adapter proves it implements `InputProvider` correctly by running `inputProviderContractCases()`, a suite shipped as data rather than as tests. Every adapter repository already has its own test runner, so the suite stays runner-free and each adapter iterates it with whichever one it uses.

## Case shape

`inputProviderContractCases()` returns a readonly array of `InputProviderContractCase` objects, each with a `name` string and a `run(provider, driver?)` function. `run` throws an `Error` describing the failure on a broken provider and returns silently on a conforming one, so any test runner can host it as a single assertion.

```ts
for (const contractCase of inputProviderContractCases()) {
  it(contractCase.name, () => contractCase.run(provider, driver));
}
```

## The cases

- **Capability keys.** `getCapabilities()` must return exactly the eleven keys the contract defines, no more and no fewer.
- **Well-formed snapshots.** `sample()` must return an array, and every snapshot needs a non-empty `id`, a known `kind` and `handedness`, and `select`/`squeeze` values in 0 to 1.
- **Declared capabilities come with their methods.** If `capabilities.haptics` is true, `pulse()` must exist; if `capabilities.presence` is true, both `setPresenceVisible()` and `setPresenceModality()` must exist.
- **A working presence pathway is declared.** The converse of the case above: if `setPresenceVisible("none", true)` reports presence is available, `capabilities.presence` must be true and `setPresenceModality()` must exist. The `"none"` target names no side, so this probe changes nothing and is safe to run against a live session.
- **Snapshot ownership.** A snapshot must not change after the next `sample()` call, which catches a provider that refills pooled objects in place instead of handing over fresh ones. See [the input model](./03-the-input-model.md) for the ownership rule this enforces.
- **Unsubscribe works.** `onCapabilitiesChanged()` and `onSourcesChanged()` must each return a callable `Unsubscribe`.
- **A session cycle respects unsubscribe.** A listener that has unsubscribed must not be called again across a session start and end.

## Drivers

`InputProviderContractDriver` is an optional pair of hooks, `enterSession()` and `exitSession()`, that an adapter's test harness supplies when it can fake a session. The session-cycle case needs both hooks to run at all; without a driver, or with only one hook, that case passes without exercising anything. This is deliberate: a partial driver is always safe, and a case that cannot be faked never blocks conformance, it simply cannot check what it was written to check.

## The worked example

[Conformance in practice](../examples/01-conformance-in-practice.md) walks through a real test file that builds a provider and a driver, then runs every case against it.

## More information

- [Getting started](./02-getting-started.md)
- [The input model](./03-the-input-model.md)
- [Conformance in practice](../examples/01-conformance-in-practice.md)
- [Evolving the contract](../features/02-evolving-the-contract.md)
