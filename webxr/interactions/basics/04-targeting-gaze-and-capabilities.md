---
sidebar_position: 4
title: Targeting, gaze and capabilities
description: How the core resolves which interactable an interactor is touching, gaze gating and dwell, and how capability negotiation disables what a headset cannot do.
---

# Targeting, gaze and capabilities

## Target resolution order

For each interactor, the core resolves one target per frame, trying three sources in order and stopping at the first that hits a registered, enabled interactable. First, a provider hint for this frame, when the adapter supplies one: provider power wins, so an engine that already knows what is being touched, such as Meta IWSDK's own tag system, is trusted over the core's own hit-testing. Second, a close proximity touch from the interactor's index fingertip, tested against a poke radius. Third, a pointing ray, tested against the scene through the adapter's hit tester.

Each interactable tracks the set of interactors currently targeting it. `hoverEnter` fires the moment that set goes from empty to non-empty, and `hoverExit` fires when it empties again.

## Press and grab activation

A controller's trigger (`select`) presses; its grip button (`squeeze`) grabs. A hand pinch, or a desktop mouse click, resolves to a grab instead of a press when the target has a grabbable behaviour but no pressable one, since a pinch carries no separate grip signal. Activation uses hysteresis: a signal must reach 0.7 to start a press or grab, but only needs to stay above 0.3 to hold it. This stops a value sitting near the boundary from flickering between pressed and released. A provider hint for `"press"` or `"grab"` overrides this resolution entirely and is honoured directly.

## Gaze

**Gaze required** gates non-gaze input: when an interactable's descriptor sets `gaze: { required: true }`, a press or a grab on it is only honoured while it is also being looked at, regardless of what its ray or proximity test found.

**Gaze dwell** is accessibility: looking at an interactable fills a dwell meter, and a full meter fires a synthesized press with no hands needed. Enable it with `gaze: { dwell: true }` for the defaults, or a `DwellConfig` to tune them: `holdSeconds` (seconds of sustained gaze to fire, default `1.8`), `decayFactor` (how much faster the meter drains than it fills while looking away, default `2.5`) and `rearmBelow` (the meter must fall back below this before it can fire again, default `0.1`).
A `dwellProgress` event fires whenever the meter moves by at least one percent, carrying the 0 to 1 progress as its value, so an app can render a fill ring from it. Reaching 1 fires a synthesized `pressStart`/`pressEnd` pair, using either `head-gaze` as the interactor id or a real gaze source's own id, plus a `dwellComplete` feedback cue.

## Capability negotiation

Every behaviour declares `requires`, capabilities that must all be present, and optionally `requiresAnyOf`, groups where at least one member of each group must be present. When the live capabilities cannot satisfy a behaviour's declared needs, the behaviour disables itself and the runtime emits `behaviourDisabled` with a `reason` string listing the unmet capability names, rather than the behaviour silently doing nothing. A later capability change that satisfies the requirement emits `behaviourEnabled`. Negotiation re-runs automatically whenever the provider's capabilities change, for example when hand tracking swaps for controllers mid-session.

## More information

- [Behaviours](./03-behaviours.md)
- [Events and feedback](./05-events-and-feedback.md)
- [Core: the engine-free package](../integrations/01-core.md)
- [API reference](pathname:///webxr/api/interactions/)
