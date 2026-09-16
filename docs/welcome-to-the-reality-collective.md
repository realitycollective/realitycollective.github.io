---
sidebar_label: 'Welcome to the Reality Collective'
title: Welcome to the Reality Collective
description: Who the Reality Collective is, the three frameworks it maintains, how they fit together, and what lives in this section of the site.
sidebar_position: 1
---

# Welcome to the Reality Collective

The Reality Collective is an open community, run by [Dino Fejzagić](https://github.com/FejZa) and [Simon Jackson](https://github.com/SimonDarksideJ), that builds free, open source frameworks for XR development. The aim has not changed since 2022: build your app once, against the framework, and let the framework carry the differences between headsets, vendors and engines. What has changed is the reach. The Collective started with Unity and now covers the web as well.

## The three frameworks

| Framework | For | What it gives you | Where |
| --- | --- | --- | --- |
| Reality Toolkit | Unity | A cross-platform XR toolkit: player rig, input, interactions, locomotion and platform packages for OpenXR, Meta, Pico and visionOS. Installed from OpenUPM. | [realitytoolkit.realitycollective.net](https://realitytoolkit.realitycollective.net/) |
| Service Framework | Unity and the web | One service model with a lifecycle, explicit dependencies and swappable implementations. Ships in C# for Unity and in TypeScript for React, three.js, Babylon.js and Meta IWSDK. | [serviceframework.realitycollective.net](https://serviceframework.realitycollective.net/) |
| Reality Toolkit WebXR | The web | Four TypeScript families for WebXR: input contracts, interactions, spatial UI and environment. Each is an engine-free core plus a thin adapter per engine (three.js, Babylon.js, Meta IWSDK, Google XR Blocks). | [Reality Toolkit WebXR](/webxr) on this site |

## How they fit together

The Reality Toolkit for Unity is the original project and the reason the Collective exists. Its interaction framework is the lineage of the WebXR Interactions family.

The Service Framework is the structural layer. It organises an application as services with a lifecycle and explicit dependencies, and it is deliberately not a feature toolkit: it never implements input, interactions or rendering itself. On Unity it sits under the Reality Toolkit; on the web it sits beside the WebXR families and can host them as services.

Reality Toolkit WebXR is the newest and follows one rule everywhere: the logic lives in an engine-free core with its own tests, an adapter binds that core to one engine and re-exports it, and no family references another. An app installs one adapter per family and wires families together itself. The [Start here](/webxr/docs) page and [the layering rule](/webxr/docs/concepts/layering-rule) explain it in full, and the [Reality Toolkit WebXR quick start](./get-started-webxr.md) gets every family running on a headset in one sitting.

Every published package is open source under the MIT licence. The Unity packages are on [OpenUPM](https://openupm.com/); the web packages are on npm under the `@realitycollective` scope.

## What lives in this section

The pages in this sidebar are about the Collective's shared processes and tooling, not about any one framework. Product documentation lives on each framework's own site, linked in the table above.

- [Setting up a GitHub build server](./setting_up_github_buildserver.md): how the self-hosted runners behind every Reality Collective repository are set up.
- [Repository template generator](./using-project-template-generator.md): creating a new Unity package repository with the automation already in place.
- [Deploying to Cloudflare Pages with GitHub Actions](./deploying-to-cloudflare-pages.md): the production and staging deploy pattern the WebXR repositories use, step by step, with the short link and QR code summary.
- [Reality Toolkit (Unity) quick start](./get-started.md): the OpenUPM install for the Unity toolkit.
- [Reality Toolkit WebXR quick start](./get-started-webxr.md): a Meta IWSDK project using every WebXR family and the Service Framework, on a headset.
- Automation: the [release pipelines](./automation/releasepipelines.md) and [reusable workflows](./automation/reusableworkflows.md) that build, test and publish the Unity packages.

## Getting involved

Questions, ideas and problems go to the [Reality Collective Discord](https://discord.gg/YjHAQD2XT8) or to the issue tracker of the repository concerned. Contributions of any size are welcome; [the contribution guide](/contribution) covers branches, pull requests and the code style. Every project has a `development` branch for daily work and, once released, a `main` branch for the current release.

Read [our mission](/mission) for the longer version of why the Collective exists, and [about us](/about) for who is behind it.
