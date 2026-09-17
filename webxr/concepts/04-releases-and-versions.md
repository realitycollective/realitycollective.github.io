---
sidebar_position: 4
title: Releases and versions
description: The released versions, what the latest and preview dist-tags mean, the publish order between the four repositories, and where to report an issue.
---

# Releases and versions

All four repositories share the same release automation, so the pattern on this page applies whichever family you are reading about.

## Released versions

All four families have a stable release on npm. WebXR-Input is at `0.1.4`; WebXR-Interactions, WebXR-UIExtensions and WebXR-Environment shipped `0.1.0` on 17 September 2026. A bare `npm install` of any package resolves the stable release, because every package's `latest` dist-tag points at it. A dist-tag is npm's name for a release channel: `latest` is what a bare `npm install` resolves, and `preview` is what `@preview` resolves.

The `0.x` range is deliberate: the APIs are stable enough to build on, but a minor version may still change a signature, and the changelog of each repository records every such change under a **Changed** heading. Pin the versions you build against and read the changelog before moving up.

:::note
Every package also carries a `preview` dist-tag, published from each repository's `development` branch ahead of the next release. Install `@preview` only when you want to try a change before it ships; the previews are not supported.
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
