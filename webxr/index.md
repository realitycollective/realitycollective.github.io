---
sidebar_position: 1
title: Start here
description: An overview of the Reality Collective WebXR stack, its four families, supported engines and how to install each adapter.
slug: /
---

Reality Toolkit WebXR is a set of four TypeScript families for building WebXR apps that are not locked to one engine. Each family ships an engine-free core and one adapter per platform, with the Meta IWSDK adapter as the reference every other one is held to. Your interaction, UI and environment logic then runs on three.js, Meta's IWSDK, Google's XR Blocks, Babylon.js or a native XR app, where a family supports it.

## The four families

| Family | What it owns | Core package | Adapters | Status |
| --- | --- | --- | --- | --- |
| WebXR-Input | Input contracts: normalised input sources, capability negotiation, the provider interface, eye gaze, and the pointer arbiter and display both families share | `@realitycollective/webxr-input` | none - consumed through the other families' adapters | Released, `0.1.8` on npm |
| WebXR-Interactions | Interactivity: interactables, interactors, behaviours, targeting and feedback intents | `@realitycollective/webxr-interactions` | `threejs-interactions`, `babylon-interactions`, `iwsdk-interactions`, `xrblocks-interactions`, `native-interactions` | Released, `0.1.1` on npm |
| WebXR-UIExtensions | Spatial UI: windows, docking, layout regions and controls | `@realitycollective/webxr-uiextensions` | `iwsdk-uiextensions`, `threejs-uiextensions`, `xrblocks-uiextensions`, `native-uiextensions` | Released, `0.1.1` on npm |
| WebXR-Environment | The setting around the player - sky, fog, light - and the playback of sound | `@realitycollective/webxr-environment` | `threejs-environment`, `iwsdk-environment`, `xrblocks-environment`, `native-environment` | Released, `0.1.1` on npm |

A fifth package, the [Service Framework](https://serviceframework.realitycollective.net/), provides dependency injection and the runtime session that these four families build on, and it is documented on its own site.

## Pick your engine

Each family ships an engine-free core and one adapter per platform, so this table tells you which adapter to install once you know your engine.

| Family | three.js | Babylon.js | Meta IWSDK | Google XR Blocks | Native |
| --- | --- | --- | --- | --- | --- |
| WebXR-Input | none (contracts only) | none (contracts only) | none (contracts only) | none (contracts only) | none (contracts only) |
| WebXR-Interactions | yes | yes, not yet run against a real Babylon app | yes, the reference | experimental | yes, tested on a Quest 3, one known issue |
| WebXR-UIExtensions | yes, from 0.1.1 | none, deferred: the panels render with uikit, which draws only into three.js | yes, the reference | experimental | yes, tested on a Quest 3, one known issue |
| WebXR-Environment | yes | none, deferred to a later round | yes, the reference | experimental | yes, tested on a Quest 3 |

## Install matrix

WebXR-Input is never installed directly - every adapter below re-exports it. All four families are released on npm, so a bare `npm install` resolves the stable version of each adapter.

```bash
# WebXR-Interactions
npm install @realitycollective/threejs-interactions
npm install @realitycollective/babylon-interactions
npm install @realitycollective/iwsdk-interactions
npm install @realitycollective/xrblocks-interactions
npm install @realitycollective/native-interactions

# WebXR-UIExtensions
npm install @realitycollective/iwsdk-uiextensions
npm install @realitycollective/threejs-uiextensions
npm install @realitycollective/xrblocks-uiextensions
npm install @realitycollective/native-uiextensions

# WebXR-Environment
npm install @realitycollective/threejs-environment
npm install @realitycollective/iwsdk-environment
npm install @realitycollective/xrblocks-environment
npm install @realitycollective/native-environment
```

The `native-*` packages are for a native app on OpenXR or visionOS. A native app also needs the service framework's native binding, `@realitycollective/service-framework-native`, for frames and sessions; see [Native as a platform](./concepts/05-native-platform.md). The known issues on native are listed there.

## Live demos

Every family with a demo has two Cloudflare Pages deploys: a preview build of the development branch and a live build of the last stable release.

<PlaygroundNote />

<PlaygroundTable />

## Where to go next

Want something running on a headset first? [Walkthrough: your first scene on Meta IWSDK](./walkthrough-first-iwsdk-scene.md) goes from an empty folder to a UI panel and a sphere in front of you. [The Reality Toolkit WebXR quick start](/docs/get-started-webxr) then extends the same project to every family and the Service Framework: a pressable sphere, a sky and a sound.

Read [The layering rule](/webxr/docs/concepts/layering-rule) to see how an app, an adapter, a core and the input contracts fit together, then open the family you need: [Interactions](/webxr/interactions), [UI Extensions](/webxr/uiextensions), [Environment](/webxr/environment) or [Input](/webxr/input).

Each family is documented the same way as the Service Framework for the web: a Welcome page, then Basics, Features, Host integrations and Examples.

| Family | Welcome | Basics | Features | Host integrations | Examples |
| --- | --- | --- | --- | --- | --- |
| [Input](/webxr/input) | [Welcome to WebXR Input](/webxr/docs/input/get-started) | [Basics](/webxr/docs/input/basics) | [Features](/webxr/docs/input/features) | [Host integrations](/webxr/docs/input/integrations) | [Examples](/webxr/docs/input/examples) |
| [Interactions](/webxr/interactions) | [Welcome to WebXR Interactions](/webxr/docs/interactions/get-started) | [Basics](/webxr/docs/interactions/basics) | [Features](/webxr/docs/interactions/features) | [Host integrations](/webxr/docs/interactions/integrations) | [Examples](/webxr/docs/interactions/examples) |
| [UI Extensions](/webxr/uiextensions) | [Welcome to WebXR UI Extensions](/webxr/docs/uiextensions/get-started) | [Basics](/webxr/docs/uiextensions/basics) | [Features](/webxr/docs/uiextensions/features) | [Host integrations](/webxr/docs/uiextensions/integrations) | [Examples](/webxr/docs/uiextensions/examples) |
| [Environment](/webxr/environment) | [Welcome to WebXR Environment](/webxr/docs/environment/get-started) | [Basics](/webxr/docs/environment/basics) | [Features](/webxr/docs/environment/features) | [Host integrations](/webxr/docs/environment/integrations) | [Examples](/webxr/docs/environment/examples) |

## More information

- [The layering rule](/webxr/docs/concepts/layering-rule)
- [Engines and adapters](/webxr/docs/concepts/engines)
- [Native as a platform](/webxr/docs/concepts/native-platform)
- [Conformance suites](/webxr/docs/concepts/conformance-suites)
- [Releases and versions](/webxr/docs/concepts/releases-and-versions)
- [Interactions getting started](/webxr/docs/interactions/basics/getting-started)
- [Service Framework](https://serviceframework.realitycollective.net/)
