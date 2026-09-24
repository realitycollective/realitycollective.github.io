---
sidebar_position: 7
title: The adapter contract
description: PanelHost, WindowHost, HeadPoseSource and the conformance suite an adapter runs to prove it implements the contract.
---

# The adapter contract

An adapter supplies three capabilities the engine-free core cannot provide for itself, and app code reaches all of them through a small set of interfaces from `@realitycollective/webxr-uiextensions`.

## PanelHost and PanelHandle

`PanelHost.createPanel(configJson)` turns compiled UIKitML into a live panel and returns a `PanelHandle`: its root element, `getElementById`, `setTargetDimensions` and `dispose`.

## WindowHost

`WindowHost` extends `PanelHost` with the portable window surface: `supportsStandalonePanels`, a boolean saying whether `createPanel` works on this host at all, and `onPanelReady(listener)`, which fires as each panel becomes wireable and replays the panels already live. IWSDK reports `supportsStandalonePanels: false`, because the ECS (entity-component-system) owns panel lifecycles there and `createPanel` throws; the three.js, XR Blocks and native hosts report `true`. `PanelReadyEvent.kind` says what became ready: `window` for one created through the window factory, `panel` for a bare panel the adapter noticed, whose `id` is then the adapter's best stable identifier for it, the config path on IWSDK.

From 0.1.1 (preview), `WindowHost.dispose()` is a required member, implemented by every platform host (`IwsdkSceneHost`, `UixWindowHost` on XR Blocks and three.js, and `NativeWindowHost`). It means the same thing everywhere: close every window the host opened, through its `WindowManager`, so each goes down the normal close path, then release the host's own subscriptions and listeners, so `onPanelReady` replays nothing afterwards. It is safe to call twice. A host written outside this repository must add it to conform.

## SceneTarget

`SceneTarget.spawnRegion(region)` and `spawnWindow(window)` are what `applyScene(target, descriptor)` calls to turn a portable `SceneDescriptor` into a host's own windows and regions, so a client builds its UI once and never asks which platform draws it. Every shipped host, IWSDK, XR Blocks and native, implements `SceneTarget` alongside `WindowHost`. When a descriptor gives a window both a `region` and a `dockMode`, the region wins: the window is world-locked, because the `WindowManager` holds that rule (see [Docking and regions](./04-docking-and-regions.md)), not any one host.

## WindowHandle

Every adapter's `createWindow` is engine-specific, because the `config` payload differs per engine, but it always returns a `WindowHandle`: `id`, `panel` (`undefined` until the document is attached), and `onReady(listener)`, which runs once and fires immediately if the panel is already there.

## HeadPoseSource and HandPoseSource

`HeadPoseSource.getHeadPose()` supplies the viewer pose each frame, for follow mode and body-locked regions: the camera on desktop, the headset pose in XR. `HandPoseSource.getHandPose(hand)` supplies a hand's pose as a WebXR grip space, for hand menus; an optional `hasHands()` reports whether hands can be tracked at all right now, so a hand-locked window can fall back to body-follow placement outside a session. Both interfaces use plain tuples, defined in `@realitycollective/webxr-input`, the contracts package this family shares with Interactions.

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

All three shipped adapters, IWSDK, XR Blocks and native, run all three suites, so a case failing on a new adapter is a real behavioural difference, not a difference in test style.

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
