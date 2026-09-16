---
sidebar_position: 4
title: Releases and versions
description: What released and pre-release mean across the four repositories, the publish order between them, and where to report an issue.
---

# Releases and versions

All four repositories share the same release automation, so the pattern on this page applies whichever family you are reading about.

:::important
The WebXR framework is still in development at ths time and being heavily tested and put through its paces, although it is expected to hit V1 soon.

As such, the main packages: Interactions, Environment and UIExtensions are classified as "Previews" to denote their developmental phase.
:::

## Released versus pre-release

WebXR-Input is the one released family in the stack: its npm `latest` dist-tag is `0.1.4`. WebXR-Interactions, WebXR-UIExtensions and WebXR-Environment are pre-release by design, on `0.1.0` previews whose number moves with every publish. Install their adapters with the `@preview` tag, not the bare package name. A dist-tag is npm's name for a release channel: `latest` is what a bare `npm install` resolves, and `preview` is what `@preview` resolves.

:::note
npm pins the `latest` dist-tag to a package's first publish, so `latest` for these three pre-release families still resolves to their first preview. Installing without `@preview` will not get you the current version.
:::

## What latest and preview mean on npm

Every repository shares one **Publish to npm** workflow, and which dist-tag it publishes under depends on the branch you dispatch it from. Dispatching from `development` publishes under the `preview` dist-tag, then bumps the preview counter so the next run cannot collide. Dispatching from `main` publishes under the `latest` dist-tag, cuts a GitHub release, and re-seeds `development` at the next patch preview. The workflow defaults to a dry run: it builds, tests, runs `verify:pack`, packs every package and uploads the tarballs as artifacts, with nothing pushed to the registry until it is re-run with `dryRun=false`.

## Publish order across repositories

The four repositories publish in a fixed order: WebXR-Input first, then WebXR-Interactions, then WebXR-UIExtensions, then WebXR-Environment. Every package in Interactions and UI Extensions depends on `@realitycollective/webxr-input`, so it must already be on npmjs.com before their `npm ci` can resolve it. WebXR-Environment is the exception. It has no dependency on `webxr-input`, so it carries no cross-repository publish order of its own.

## The two shared workflows

Every repository ships the same two workflows, under the same names.

- **`ci.yml`** - runs on every pull request and on every push to `main` or `development`. It builds, typechecks, runs the test suite with coverage gates, and runs `verify:pack`, the consumer check that packs each package, installs it into a clean project and imports it. In the three repositories with a demo, the same job then deploys to Cloudflare Pages: production from `main`, an isolated `-test` project from a pull request, so a pull request can never touch production.
- **`publish-npm.yml`** - the manual dispatch workflow described above. It defaults to a dry run, and every package in the workspace is still packed and uploaded as a build artifact, so the dry run's tarballs are a receipt even when nothing is published.

## Where to report issues

Each repository takes issues at its own GitHub page: [WebXR-Input](https://github.com/realitycollective/WebXR-Input/issues), [WebXR-Interactions](https://github.com/realitycollective/WebXR-Interactions/issues), [WebXR-UIExtensions](https://github.com/realitycollective/WebXR-UIExtensions/issues) and [WebXR-Environment](https://github.com/realitycollective/WebXR-Environment/issues).

## More information

- [What this stack is and is not](./03-what-this-stack-is-not.md)
- [The layering rule](./01-layering-rule.md)
- [Interactions overview](/webxr/interactions)
- [Environment overview](/webxr/environment)
