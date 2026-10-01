---
sidebar_position: 7
title: The adapter contract
description: PanelHost, WindowHost, HeadPoseSource, the rules the core holds for every adapter, and the conformance suites an adapter runs to prove it implements the contract.
---

# The adapter contract

An adapter supplies three capabilities the engine-free core cannot provide for itself, and app code reaches all of them through a small set of interfaces from `@realitycollective/webxr-uiextensions`.

## PanelHost and PanelHandle

`PanelHost.createPanel(configJson)` turns compiled UIKitML into a live panel and returns a `PanelHandle`: its root element, `getElementById`, `setTargetDimensions` and `dispose`.

## WindowHost

`WindowHost` extends `PanelHost` with the portable window surface: `supportsStandalonePanels`, a boolean saying whether `createPanel` works on this host at all, and `onPanelReady(listener)`, which fires as each panel becomes wireable and replays the panels already live. IWSDK reports `supportsStandalonePanels: false`, because the ECS (entity-component-system) owns panel lifecycles there and `createPanel` throws; the three.js, XR Blocks and native hosts report `true`. `PanelReadyEvent.kind` says what became ready: `window` for one created through the window factory, `panel` for a bare panel the adapter noticed, whose `id` is then the adapter's best stable identifier for it, the config path on IWSDK.

From 0.1.1, `WindowHost.dispose()` is a required member, implemented by every platform host (`IwsdkSceneHost`, `UixWindowHost` on three.js and its XR Blocks subclass, and `NativeWindowHost`). It means the same thing everywhere: close every window the host opened, through its `WindowManager`, so each goes down the normal close path, then release the host's own subscriptions and listeners, so `onPanelReady` replays nothing afterwards. It is safe to call twice. A host written outside this repository must add it to conform.

## SceneTarget

`SceneTarget.spawnRegion(region)` and `spawnWindow(window)` are what `applyScene(target, descriptor)` calls to turn a portable `SceneDescriptor` into a host's own windows and regions, so a client builds its UI once and never asks which platform draws it. Every shipped host, IWSDK, three.js, XR Blocks and native, implements `SceneTarget` alongside `WindowHost`. When a descriptor gives a window both a `region` and a `dockMode`, the region wins: the window is world-locked, because the `WindowManager` holds that rule (see [Docking and regions](./04-docking-and-regions.md)), not any one host.

## WindowHandle

Every adapter's `createWindow` is engine-specific, because the `config` payload differs per engine, but it always returns a `WindowHandle`: `id`, `panel` (`undefined` until the document is attached), and `onReady(listener)`, which runs once and fires immediately if the panel is already there.

## HeadPoseSource and HandPoseSource

`HeadPoseSource.getHeadPose()` supplies the viewer pose each frame, for follow mode and body-locked regions: the camera on desktop, the headset pose in XR. `HandPoseSource.getHandPose(hand)` supplies a hand's pose as a WebXR grip space, for hand menus; a hand-locked window whose hand is not tracked is hidden, on every platform. The optional `hasHands()` that let one host fall back to body-follow placement instead is gone from 0.1.1, a breaking change for a hand pose source written outside this repository, because that fallback was a behaviour the IWSDK reference never had. Both interfaces use plain tuples, defined in `@realitycollective/webxr-input`, the contracts package this family shares with Interactions.

## The rules the core holds for every adapter

An adapter applies rules; it never decides them. From 0.1.1 every rule the IWSDK adapter applies through its engine's systems is stated in the core as pure logic, and every other adapter runs the same function: `stepFollow()` is IWSDK's `FollowSystem` restated step for step, with `DEFAULT_WINDOW_FOLLOW` (offset `[0, -0.15, -1.2]`, speed 3, a 0.35 m dead zone and 30 degrees) and `DEFAULT_REGION_FOLLOW` (IWSDK's `Follower` defaults, offset `[0, -0.2, -1.4]`, speed 1, 0.4 m); `applyFocusBias()` draws the focused window `DEFAULT_FOCUS_BIAS` (0.02 m) nearer per window behind it; `regionSlotPose()` places a docked window in its region's frame; `EdgePress` and `dispatchTouchUpdate` turn a ray, grab or touch pointer into press, release and click, with a click on release; `TitlebarDragController` runs hold-to-drag after `DEFAULT_DRAG_DELAY` (0.3 s) for a ray and at once for a grab, billboards while dragging and captures a drop into a region; `cursorPlacement()` puts a cursor disc `DEFAULT_CURSOR_OFFSET` (0.004 m) off the surface it hits; `HoverTracker` decides which element each pointer is over, raising `pointerenter` and `pointerleave` once per change and holding an element's hover style while any pointer is over it; `ScrollState` runs uikit's drag, coast, rubber band and wheel scrolling; `TextEntry` tracks which text field has focus and what its keyboard is asked for; `PanelPointerOffers` offers each source's nearest panel to the shared pointer arbiter; and `DEFAULT_REGION` and the hand-menu defaults are the one set of defaults every adapter reads. The IWSDK adapter proves the core equal to its engine: `follow-reference.test.ts` drives IWSDK 1.0's own `FollowSystem` beside `stepFollow` over the same head motion and requires the same position and facing every frame, so the rule cannot drift from the reference on any platform.

## Hover, scrolling and text entry

Three more rules are stated once in the core, so every adapter behaves the same.

**Hover.** `HoverTracker` takes what each pointer is over this frame and returns what changed: the element a pointer moved onto and the one it left, and the element that gained its first pointer or lost its last. A pointer that stops reporting counts as having left. The three.js binding raises hover events from it, and the native binding tells its host through `setHover`.

**Scrolling.** `ScrollState` restates uikit's scroll handling for a host that has none. A drag moves the content with the pointer. Released, the content coasts, multiplying its velocity by 0.9 each frame and stopping below 10 pixels a second. Past either end a rubber band shrinks a further push and pulls the position back by 30 percent of the overshoot each frame, with the push having no effect beyond 100 pixels. A wheel scrolls by its deltas, clamped to the range. These numbers are `SCROLL_DEFAULTS`. A thumbstick is not part of the rule. An app that wants one maps its axis to the wheel at a speed it chooses.

**Text entry.** A text field asks for a keyboard through `TextInputFacility`, the platform's keyboard behind one contract: `show` takes a `TextEntryRequest` with the field's value, `multiline` and the HTML input `type`, `hide` dismisses it, and `onInput` and `onClose` report the whole value after each change and the end of entry. The default is the browser's keyboard through a hidden HTML input on the web, and the system keyboard on a native host. `TextEntry` keeps which field has focus and its value. Every reported value replaces the field's and raises `valueChanged`.

## Panel pointer offers

`PanelPointerOffers` is how a window host takes part in the one pointer decision per source that Interactions shares. The host registers a `panel` target set with the `PointerArbiter` from `@realitycollective/webxr-input` and, each frame, calls `offer(sourceKey, kind, candidate)` with the nearest panel that source's ray, fingertip or grip reaches, as a `PanelPointerCandidate`: the panel id, the world point and the distance. `PANEL_GRAB_RADIUS`, 0.07 m, is the distance from a grip within which a panel is a grab candidate. After offering, the host calls `resolve(sourceKey)`, and then hovers, presses, touches, drags and scrolls with a pointer kind only while `owns(sourceKey, kind)` is true. `setSelecting` marks a pointer that is pressing or dragging, which keeps the source locked to it. A source key is the source's handedness, or the id the input provider uses. The Interactions runtime aliases one to the other.

A host used on its own gets an arbiter of its own. The rule for drawing is that whoever owns the arbiter presents every source. With a shared arbiter that is the Interactions runtime, panel cursors included. With its own, it is the window host, which calls `present(sourceKey, hasRay, selecting, display)` and hands the resulting `PresentedPointer` to its platform: whether to draw the ray, its extent and colour, the cursor disc, and what the cursor sits on. After a source disappears the host calls `present` once more with nothing to draw. See [the pointer arbiter and display](/webxr/docs/input/features/pointer-arbiter-and-display) for the arbiter and the display settings.

## Proving a new adapter conforms

Three suites, each shipped as data rather than as tests: a case is a name and a `run(setup)` (`uixElementContractCases()` and `sceneTargetContractCases()` return `Promise<void>` from `run`) that throws a plain `Error` on failure, so an adapter runs the cases in whatever test runner it already has. See [conformance suites](/webxr/docs/concepts/conformance-suites) for how this pattern works across every family.

- `windowHostContractCases()`, 7 cases: the `WindowHost` surface itself, ending with the case added in 0.1.1 that holds every host to implementing `dispose()`. A `WindowHostContractSetup` wraps what differs per adapter: `host`, the `manager` the host applies, `createWindow(id)`, and two optional hooks, `attach` for a host that attaches panels asynchronously and `panelConfig` for one that supports bare panels.
- `sceneTargetContractCases()`, 5 cases: that `applyScene(target, CONTRACT_SCENE)` opens the same windows, in the same regions, with the same dock mode and chrome, on every host's own `WindowManager`. A `SceneTargetContractSetup` wraps `target`, `manager`, and an optional `settle(windowIds)` hook for a host that finishes building windows over later frames.
- `uixElementContractCases()`, 6 cases: that a panel built from `CONTRACT_PANEL_MARKUP` gives every platform the same `UixElement` tree, in markup order, with `tagOf` and `data-uix-*` attributes readable, property writes and element events reaching the right element and nobody else, and a stepper upgraded from that markup following clicks to its maximum. A `UixElementContractSubject` wraps `root` and a `drive: UixElementContractDriver`, which reads a rendered property (`rendered(element, property)`) and fires a user event the platform's own way (`fire(element, type)`).

```ts
import { windowHostContractCases } from '@realitycollective/webxr-uiextensions';
import type { WindowHostContractSetup } from '@realitycollective/webxr-uiextensions';

function makeSetup(): WindowHostContractSetup {
  const host = createMyHost();
  return {
    host,
    manager: host.manager,
    createWindow: (id) => host.createWindow({ id, config: myConfig() }),
  };
}

for (const contractCase of windowHostContractCases()) {
  it(contractCase.name, () => contractCase.run(makeSetup()));
}
```

All four shipped adapters, IWSDK, three.js, XR Blocks and native, run all three suites, so a case failing on a new adapter is a real behavioural difference, not a difference in test style. The native adapter additionally ships a host conformance kit, `nativeUiHostConformanceCases()`, for what a real native host does with what it is handed; see the [native adapter](../integrations/05-native.md).

## MemoryWindowHost, the family's own mock

`MemoryWindowHost`, `MemoryWindowHandle`, `MemoryPanel` and `createMemoryWindowHostSetup()`, in the core itself, are an in-memory `WindowHost` for a consumer or a new adapter with no engine at hand yet. The mock opens windows on a real `WindowManager`; a window's panel attaches when the test calls `attach(id)`, as on IWSDK, and closing a window through the manager disposes its panel and drops it from `onPanelReady` replay. `createMemoryWindowHostSetup()` returns a fresh `WindowHostContractSetup`, so the suite runs in one loop with no host of your own to write first:

```ts
import { windowHostContractCases, createMemoryWindowHostSetup } from '@realitycollective/webxr-uiextensions';

for (const contractCase of windowHostContractCases()) {
  it(contractCase.name, () => contractCase.run(createMemoryWindowHostSetup()));
}
```

## More information

- [Windows and the window manager](./03-windows-and-the-window-manager.md)
- [Docking and regions](./04-docking-and-regions.md)
- [Core adapter](../integrations/01-core.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [Native adapter](../integrations/05-native.md)
- [Conformance suites](/webxr/docs/concepts/conformance-suites)
- [API reference](pathname:///webxr/api/uiextensions/)
