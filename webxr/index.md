---
sidebar_position: 1
title: Start here
description: An overview of the Reality Collective WebXR stack, its four families, supported engines and how to install each adapter.
slug: /
---

# Start here

Reality Toolkit WebXR is a set of four TypeScript families for building WebXR apps that are not locked to one engine. Each family ships an engine-free core and a thin adapter per engine. Your interaction, UI and environment logic then runs on three.js, Meta's IWSDK, Google's XR Blocks or Babylon.js, where a family supports it.

## The four families

| Family | What it owns | Core package | Adapters | Status |
| --- | --- | --- | --- | --- |
| WebXR-Input | Input contracts: normalised input sources, capability negotiation, the provider interface | `@realitycollective/webxr-input` | none - consumed through the other families' adapters | Released (npm `latest` is `0.1.4`) |
| WebXR-Interactions | Interactivity: interactables, interactors, behaviours, targeting and feedback intents | `@realitycollective/webxr-interactions` | `threejs-interactions`, `babylon-interactions`, `iwsdk-interactions`, `xrblocks-interactions` | Pre-release (`0.1.0` previews, install `@preview`) |
| WebXR-UIExtensions | Spatial UI: windows, docking, layout regions and controls | `@realitycollective/webxr-uiextensions` | `iwsdk-uiextensions`, `xrblocks-uiextensions` | Pre-release (`0.1.0` previews, install `@preview`) |
| WebXR-Environment | The setting around the player - sky, fog, light - and the playback of sound | `@realitycollective/webxr-environment` | `threejs-environment`, `iwsdk-environment`, `xrblocks-environment` | Pre-release (`0.1.0` previews, install `@preview`) |

A fifth package, the [Service Framework](https://serviceframework.realitycollective.net/), provides dependency injection and the runtime session that these four families build on, and it is documented on its own site.

## Pick your engine

Each family ships an engine-free core and a thin adapter per engine, so this table tells you which adapter to install once you know your engine.

| Family | three.js | Babylon.js | Meta IWSDK | Google XR Blocks |
| --- | --- | --- | --- | --- |
| WebXR-Input | none (contracts only) | none (contracts only) | none (contracts only) | none (contracts only) |
| WebXR-Interactions | yes | yes, not yet run against a real Babylon app | yes | experimental |
| WebXR-UIExtensions | experimental (shares the XR Blocks adapter) | none | yes | experimental |
| WebXR-Environment | yes | pending | yes | experimental |

## Install matrix

WebXR-Input is never installed directly - every adapter below re-exports it. Interactions, UI Extensions and Environment are pre-release, so install their adapters with the `@preview` dist-tag.

```bash
# WebXR-Interactions
npm install @realitycollective/threejs-interactions@preview
npm install @realitycollective/babylon-interactions@preview
npm install @realitycollective/iwsdk-interactions@preview
npm install @realitycollective/xrblocks-interactions@preview

# WebXR-UIExtensions
npm install @realitycollective/iwsdk-uiextensions@preview
npm install @realitycollective/xrblocks-uiextensions@preview

# WebXR-Environment
npm install @realitycollective/threejs-environment@preview
npm install @realitycollective/iwsdk-environment@preview
npm install @realitycollective/xrblocks-environment@preview
```

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
- [Releases and versions](/webxr/docs/concepts/releases-and-versions)
- [Interactions getting started](/webxr/docs/interactions/basics/getting-started)
- [Service Framework](https://serviceframework.realitycollective.net/)
