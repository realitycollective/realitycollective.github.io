---
sidebar_position: 1
title: Developer cycle
description: The four development loops, the edit gate, the uix-dev CLI, and how demos resolve the libraries before and after publishing.
---

# Developer cycle

The repository behind UI Extensions has four development loops, fastest first, and a CLI for getting a build onto a headset in one command.

## The four loops

| Loop | Where it runs | Latency per change |
| --- | --- | --- |
| Headless | terminal (vitest) | seconds |
| Desktop | desktop browser | seconds, hot module reload |
| Headset live | Quest, via tunnel or USB | seconds, hot module reload |
| Deployed | Cloudflare Pages | minutes |

Use the fastest loop that answers the question at hand, and only fall down the list when the device or the deployed environment is genuinely needed. The headless loop also runs `test/architecture.test.ts`, which fails a change that introduces an engine import into the engine-free core, keeping the library portable.

## The edit gate

Three independent layers keep the live-edit tooling out of a player's hands. The runtime library never imports `@realitycollective/uix-devtools`, so an app that does not install it cannot ship it. Where the gate is compiled in, a build flag, `import.meta.env.DEV` or `VITE_UIX_EDIT`, eliminates the whole branch from a production build with the flag unset. Where it is compiled in, it opens only for an exact token match on the page URL (`?uix-edit=<token>`), and the editor overlay itself is a dynamic import, so a normal visitor never downloads its chunk.

## The uix-dev CLI

```bash
npx uix-dev doctor          # check node, cloudflared, adb - with install hints
npx uix-dev tunnel          # mint a token, start the dev server, open a Cloudflare quick tunnel
npx uix-dev qr <url>        # print a QR code for any URL
```

`tunnel` mints a fresh edit-session token per run, starts the demo's dev server with the token exported, opens a free Cloudflare quick tunnel with no account needed, and prints two QR codes: the plain runtime URL and the edit-mode URL. The token dies with the run: closing the tunnel invalidates it, so nobody can wander into an edit session from an old link.

## How demos resolve the libraries, before and after publishing

Nothing in the repository installs `@realitycollective/*` packages from a registry. The demos, the tests and the type check all resolve those package names to `packages/<name>/src`, so a contributor is always running the code in front of them, and a library edit hot-reloads straight into a running demo with no build step. Publishing does not change that: the resolution stays source-linked even once the packages are live, which is why `npm run verify:pack` exists separately, to pack, install and import the tarballs exactly as a consuming app would.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Developer tooling](../integrations/04-uix-devtools.md)
- [Devtools playground example](../examples/03-devtools-playground.md)
- [API reference](pathname:///webxr/api/uiextensions/)
