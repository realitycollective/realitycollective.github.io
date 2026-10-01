---
sidebar_position: 4
title: Targeting, gaze and capabilities
description: How the core resolves which interactable an interactor is touching, gaze gating and dwell, and how capability negotiation disables what a headset cannot do.
---

# Targeting, gaze and capabilities

## Target resolution order

For each interactor, the core resolves one target per frame. First, a provider hint for this frame, when the adapter supplies one: provider power wins, so an engine that already knows what is being touched, such as Meta IWSDK's own tag system, is trusted over the core's own hit-testing. When there is no hint, the core runs three pointers, each with its own candidate, and the first that has one owns the source: **touch** first, then **grab**, then **ray**.

- **Touch** is a fingertip near a target. A controller's ray origin stands in for the fingertip, so a controller pokes too.
- **Grab** is the grip close to a target. The grip is a sphere of 0.07 m, and a target whose surface it reaches is the candidate.
- **Ray** is the pointing ray, tested against the scene through the adapter's hit tester.

Once the active pointer is pressing or grabbing, it stays active until the release, so a target cannot be stolen mid-press. Each interactable tracks the set of interactors currently targeting it. `hoverEnter` fires the moment that set goes from empty to non-empty, and `hoverExit` fires when it empties again.

### Near pointers

A fingertip starts hovering a target when its distance to the target's surface is within 0.15 m, and keeps hovering until it is beyond 0.2 m. It presses when that distance is 0.02 m or less, and releases on the way out past the same distance. A touch press needs no select signal. It never presses from inside or from behind: a fingertip first seen inside the press distance, such as a hand that appears in tracking inside the target, must be seen outside it and come back before it presses.

The distances are the runtime's `nearPointer` option, a partial `NearPointerOptions`, over `NEAR_POINTER_DEFAULTS`: `touchHoverEnter` 0.15, `touchHoverExit` 0.2, `touchDown` 0.02 and `grabRadius` 0.07, all in metres. An interactable's own `pokeRadius` replaces the hover enter distance for that target alone, and the exit distance moves with it. Before 0.1.1 the value had no effect. The runtime asks the hit tester once per source, at the widest radius any enabled interactable registered, and accepts the nearest hit only inside that interactable's own radius. A farther interactable with a larger radius is not found behind a nearer one with a smaller radius.

A hit tester's `hitProximity` reports the nearest point on the target's surface, never its centre, so the touch cursor sits on the object.

### One pointer across objects and UI panels

A hand or controller has one pointer, whether it is aimed at an interactable or at a UI Extensions panel. The runtime registers its interactables with a `PointerArbiter` from `@realitycollective/webxr-input`, as a target set named `INTERACTIONS_POINTER_SET`. Pass the same arbiter to the UI Extensions host and to the runtime, through the `pointers` option of the adapter's setup, and one decision covers both. A panel nearer than an object takes the ray. A fingertip on a panel retires the ray over an object, and the reverse. An app that omits `pointers` gets an arbiter of its own that decides over the runtime's targets alone.

### What the ray and cursor show

The runtime publishes a `PointerVisuals` per source through `onPointerVisuals` and `getPointerVisuals(sourceId)`, and `getActivePointer(sourceId)` returns the pointer that owns a source. The ray and its cursor show only while the ray owns the source or no pointer does, and the cursor sits at the active pointer's hit. What the app then shows is its pointer display configuration. The `pointerDisplay` option takes a `PointerDisplay` or a partial `PointerDisplayConfig`, with IWSDK 1.0.0's look by default, and `getPointerDisplay().set(...)` changes it at run time. The runtime resolves the arbiter's decision under those settings into one `PointerDrawing` per source, published through `onPointerDrawing` and `getPointerDrawing(sourceId)`. `getPointerArbiter()` and `isSelecting(sourceId)` are public.

Each binding draws that drawing the same way. `ThreePointerVisuals` draws IWSDK's ray stub and cursor disc into a scene, and the three.js and XR Blocks setups take `pointerVisuals: { scene }`. `BabylonPointerVisuals` draws the same through the app's own `MeshBuilder`, `StandardMaterial`, `Color3` and `Quaternion`, passed as `pointerVisuals: { kit }`. `IWSDKPointerVisuals` applies the settings to IWSDK's own ray and cursor, and `registerInteractions` takes `pointerVisuals: false` to leave IWSDK's visuals alone. On native, the host is handed the resolved drawing every frame and draws exactly that. See the [native adapter](../integrations/06-native.md#what-the-host-is-handed-to-draw). The arbiter, the display settings and the drawing are described in [the pointer arbiter and display](/webxr/docs/input/features/pointer-arbiter-and-display).

## Press and grab activation

A controller's trigger (`select`) presses; its grip button (`squeeze`) grabs. A hand's `select` is the runtime's binary pinch gesture, 1 or 0, and its `squeeze` is always 0. A hand pinch, or a desktop mouse click, resolves to a grab instead of a press when the target has a grabbable behaviour but no pressable one, since a pinch carries no separate grip signal. Activation uses hysteresis: a signal must reach 0.7 to start a press or grab, but only needs to stay above 0.3 to hold it. A pinch is binary, so the grab starts on the pinch and ends on the frame the pinch ends. The hysteresis stops an analog value sitting near the boundary from flickering between pressed and released. A provider hint for `"press"` or `"grab"` overrides this resolution entirely and is honoured directly.

## Gaze

**Gaze required** gates non-gaze input: when an interactable's descriptor sets `gaze: { required: true }`, a press or a grab on it is only honoured while it is also being looked at, regardless of what its ray or proximity test found.

**Gaze dwell** is accessibility: looking at an interactable fills a dwell meter, and a full meter fires a synthesized press with no hands needed. Enable it with `gaze: { dwell: true }` for the defaults, or a `DwellConfig` to tune them: `holdSeconds` (seconds of sustained gaze to fire, default `1.8`), `decayFactor` (how much faster the meter drains than it fills while looking away, default `2.5`) and `rearmBelow` (the meter must fall back below this before it can fire again, default `0.1`).
A `dwellProgress` event fires whenever the meter moves by at least one percent, carrying the 0 to 1 progress as its value, so an app can render a fill ring from it. Reaching 1 fires a synthesized `pressStart`/`pressEnd` pair, using either `head-gaze` as the interactor id or a real gaze source's own id, plus a `dwellComplete` feedback cue.

## Eye gaze and pinch

On a headset with eye tracking, the provider reports `capabilities.eyeGaze` and adds one gaze source, whose ray follows the eyes. This is the gaze-and-pinch interaction that is the primary input on Meta VR Glasses. While it is on, hand and controller far rays are dropped, and near touch and grab stay live. The runtime then targets the gaze source differently from a plain ray:

- It asks the hit tester's optional `hitCone(ray, halfAngle, maxLength)`. A target the ray reaches wins outright. Otherwise the target nearest the axis inside the cone wins, and the nearer target wins a tie within half a degree.
- A `GazeConsensus` votes over a short window so the target does not flicker. The vote is time-weighted.
- It targets nothing while a hand's near pointer is hovering or grabbing.
- It satisfies `gaze: { required: true }` and dwell from the eye gaze.
- When the hand that owns the selection pinches, the gazed target is pressed or grabbed. From the next frame the gaze source's ray is driven from that hand, aimed at the gaze hit, so a drag follows the hand. This is the `pointerTransformFollowsHand` setting. Listeners on `onSample`, such as the pointer bridge, and every behaviour see that ray.

The runtime's `eyeGaze` option tunes it, over `EYE_GAZE_DEFAULTS`: a `coneAngleDegrees` of 5, a `maxRayLength` of 30 m, a `dwellWindowSeconds` of 0.15, suppression near a hand's pointer on, and `pointerTransformFollowsHand` on. The three.js, Babylon.js, IWSDK and native setups take an `eyeGaze` option that tunes their provider's filter and tracking-loss grace. Only `registerInteractions` on IWSDK also passes it to the runtime's targeting, so on the other adapters the cone, window and suppression stay at their defaults. The XR Blocks provider reports no eye gaze. The provider half of the rule, the gaze source, the filter and the pinch ownership, is described in [eye gaze and pinch](/webxr/docs/input/features/eye-gaze-and-pinch). A platform that reports no eye gaze changes nothing: a gaze-kind source still targets by plain ray, as head gaze does. `coneHitForSpheres` answers `hitCone` over spheres for a tester with no geometry of its own.

## Capability negotiation

Every behaviour declares `requires`, capabilities that must all be present, and optionally `requiresAnyOf`, groups where at least one member of each group must be present. When the live capabilities cannot satisfy a behaviour's declared needs, the behaviour disables itself and the runtime emits `behaviourDisabled` with a `reason` string listing the unmet capability names, rather than the behaviour silently doing nothing. A later capability change that satisfies the requirement emits `behaviourEnabled`. Negotiation re-runs automatically whenever the provider's capabilities change, for example when hand tracking swaps for controllers mid-session.

## More information

- [Behaviours](./03-behaviours.md)
- [Events and feedback](./05-events-and-feedback.md)
- [Core: the engine-free package](../integrations/01-core.md)
- [API reference](pathname:///webxr/api/interactions/)
