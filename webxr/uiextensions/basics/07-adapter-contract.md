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

`WindowHost` extends `PanelHost` with the portable window surface: `supportsStandalonePanels`, a boolean saying whether `createPanel` works on this host at all, and `onPanelReady(listener)`, which fires as each panel becomes wireable and replays the panels already live. IWSDK reports `supportsStandalonePanels: false`, because the ECS (entity-component-system) owns panel lifecycles there and `createPanel` throws; the three.js and XR Blocks host reports `true`. `PanelReadyEvent.kind` says what became ready: `window` for one created through the window factory, `panel` for a bare panel the adapter noticed, whose `id` is then the adapter's best stable identifier for it, the config path on IWSDK.

## WindowHandle

Every adapter's `createWindow` is engine-specific, because the `config` payload differs per engine, but it always returns a `WindowHandle`: `id`, `panel` (`undefined` until the document is attached), and `onReady(listener)`, which runs once and fires immediately if the panel is already there.

## HeadPoseSource and HandPoseSource

`HeadPoseSource.getHeadPose()` supplies the viewer pose each frame, for follow mode and body-locked regions: the camera on desktop, the headset pose in XR. `HandPoseSource.getHandPose(hand)` supplies a hand's pose as a WebXR grip space, for hand menus; an optional `hasHands()` reports whether hands can be tracked at all right now, so a hand-locked window can fall back to body-follow placement outside a session. Both interfaces use plain tuples, defined in `@realitycollective/webxr-input`, the contracts package this family shares with Interactions.

## Proving a new adapter conforms

`windowHostContractCases()` ships the `WindowHost` conformance suite as data rather than as tests: each case is a name and a `run(setup)` that throws an `Error` on failure, so an adapter runs the cases in whatever test runner it already has. A `WindowHostContractSetup` wraps what differs per adapter: `host`, the `manager` the host applies, `createWindow(id)`, and two optional hooks, `attach` for a host that attaches panels asynchronously and `panelConfig` for one that supports bare panels.

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

Both shipped adapters run this suite, so a case failing on a new adapter is a real behavioural difference, not a difference in test style.

## More information

- [Windows and the window manager](./03-windows-and-the-window-manager.md)
- [Core adapter](../integrations/01-core.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [API reference](pathname:///webxr/api/uiextensions/)
