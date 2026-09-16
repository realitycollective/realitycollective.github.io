---
sidebar_position: 4
title: 'Developer tooling: @realitycollective/uix-devtools'
description: The edit-session gate, runtime UIKitML compilation and the uix-dev CLI, never shipped in a player-facing bundle.
---

# Developer tooling: @realitycollective/uix-devtools

## What it is

`@realitycollective/uix-devtools` is developer-only tooling for the IWSDK adapter: an edit-session launch gate, runtime UIKitML compilation for live editing, and a CLI, `uix-dev`, that gets a local build onto a headset in one command through a Cloudflare quick tunnel. Install it as a `devDependency`. It is never meant to reach a player-facing bundle.

```bash
npm install --save-dev @realitycollective/uix-devtools@preview
```

## The edit gate, and why it is compiled out of production

`installEditGate` opens only for an exact match on a session token carried in the page URL (`?uix-edit=<token>`), and remembers an accepted token in `sessionStorage` so an in-headset reload keeps the session.

```ts
import { installEditGate } from '@realitycollective/uix-devtools';

if (import.meta.env.DEV || import.meta.env.VITE_UIX_EDIT) {
  const expected = import.meta.env.VITE_UIX_EDIT_TOKEN as string | undefined;
  installEditGate({
    ...(expected ? { tokens: [expected] } : {}),
    load: (session) => import('./editor-overlay.js').then((m) => m.install(session)),
  });
}
```

Guard the whole call behind a build-time flag such as `import.meta.env.VITE_UIX_EDIT`: a production build with the flag unset eliminates the branch entirely, so the gate does not exist in a shipped bundle, not merely a closed one. `load` runs a dynamic import, so the editor overlay lives in its own chunk that a normal visitor never downloads.

## Runtime panel sources

IWSDK 0.5 fetches a panel's `config` as text and parses the UIKitML itself, so `compilePanelSource(source)` validates a source against the same parser IWSDK loads and wraps it in a `blob:` URL that `PanelUI.config` can fetch like any file.

```ts
import { compilePanelSource } from '@realitycollective/uix-devtools';
import { createUIWindow } from '@realitycollective/iwsdk-uiextensions';

const panel = compilePanelSource(source);
if (panel.errors.length === 0) {
  createUIWindow(world, { id: 'live', title: 'Live', config: panel.configUrl });
}
```

Diagnostics land in `errors` rather than throwing, and a source with errors still gets a `configUrl`, so a failure shows up in-world instead of silently doing nothing. This is the mechanism behind the in-headset UX Editor: edit markup in a textarea, compile, and spawn a real draggable window, with no build step.

## The CLI

```bash
uix-dev tunnel [--port N] [--cwd DIR] [--no-dev-server]
uix-dev doctor
uix-dev qr <url>
```

`tunnel` mints a per-run edit token, starts the target demo's dev server with the token exported, opens a free Cloudflare quick tunnel with no account needed, and prints two QR codes: the plain runtime URL and the edit-mode URL. `doctor` checks node, cloudflared and adb availability with install hints; `qr` prints a QR code for any URL, useful for a staging deploy link.

## Safety model

| Layer | Mechanism | Player-facing result |
| --- | --- | --- |
| Packaging | separate dev-only package, never imported by the runtime library | not installed, not present |
| Build | the gate call is guarded by `import.meta.env` flags | branch eliminated from production bundles |
| Runtime | exact-token match required; overlay is a lazy chunk | wrong or no token means nothing loads, nothing downloads |

## More information

- [Developer cycle](../features/01-developer-cycle.md)
- [Devtools playground example](../examples/03-devtools-playground.md)
- npm: [@realitycollective/uix-devtools](https://www.npmjs.com/package/@realitycollective/uix-devtools)
- [API reference](pathname:///webxr/api/uiextensions/)
