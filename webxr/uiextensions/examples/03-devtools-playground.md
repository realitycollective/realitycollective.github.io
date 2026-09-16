---
sidebar_position: 3
title: Devtools playground
description: The showcase scene plus the edit gate and an in-headset UX Editor that compiles UIKitML at runtime.
---

# Devtools playground

The devtools playground boots the exact same showcase scene as the library's own demo, then adds only what `@realitycollective/uix-devtools` provides: the edit gate and a live UX Editor. It is not deployed; run it locally or over a tunnel.

## The edit gate in dev

```bash
npm run dev:playground        # then open http://localhost:8081/?uix-edit=dev
```

In a plain local dev build no token is minted, so the gate opens for any token appended to the URL; a staging build with `VITE_UIX_EDIT_TOKEN` set requires the exact minted token instead.

## The UX Editor window

A spatial window whose own panel is compiled at runtime by `compilePanelSource`, containing a UIKitML textarea, the Quest system keyboard works in it, and SPAWN, RESPAWN and RESET buttons. SPAWN compiles the current markup and spawns it as a new window; RESPAWN closes the previously spawned window first, so a markup-look-tweak loop never leaves the headset; RESET restores the starter markup.

```ts
const compiled = compilePanelSource(source);
if (compiled.errors.length === 0) {
  createUIWindow(world, {
    id: `uix-editor-spawn-${spawnCount}`,
    title: `Live Panel ${spawnCount}`,
    config: compiled.configUrl,
    pinnable: true,
    dockable: true,
    minimizable: true,
    closable: true,
  });
}
```

## Runtime UIKitML compile

Every spawned panel, including the editor's own, is validated against the same parser IWSDK loads and served from a `blob:` URL that `PanelUI.config` fetches like any file, so nothing here needs a build step. A source with errors still gets reported in the editor's status line rather than failing silently.

## The headset loop with QR codes

```bash
npm run dev:live
```

This starts the dev server with a fresh edit token, opens a Cloudflare quick tunnel, and prints two QR codes: the plain runtime URL and the edit-mode URL with the token appended. Scan the second code on the headset to open an edit session; Ctrl+C ends the run and invalidates both the tunnel URL and the token.

## What players can reach

Nothing. A build without `VITE_UIX_EDIT` set contains no gate at all, because the branch is eliminated at build time, and a build with it still requires the exact per-run token in the URL before the editor's chunk is even downloaded.

## More information

- [Developer cycle](../features/01-developer-cycle.md)
- [Developer tooling](../integrations/04-uix-devtools.md)
- [Showcase example](./01-showcase.md)
- [API reference](pathname:///webxr/api/uiextensions/)
