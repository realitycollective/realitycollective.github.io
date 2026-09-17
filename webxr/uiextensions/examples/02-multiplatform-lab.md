---
sidebar_position: 2
title: Multiplatform lab
description: One demo, three pipelines picked from the hardware on a launch screen, all building the identical portable scene.
---

# Multiplatform lab

The multiplatform lab ships both platform adapters in one client and boots the pipeline that matches the browser it finds itself running on.

## Live and local

Live: <DemoLink demo="uiLab" />.

```bash
npm run dev:multiplatform     # from the workspace root -> http://localhost:8081
```

## The launch screen

Nothing boots until the user presses START. The screen shows what was detected and why, from a browser signature: `OculusBrowser`, `Meta Quest` or `Horizon OS` selects IWSDK, `Android XR` selects XR Blocks, and anything else selects the desktop three.js pipeline. Pressing START is also the proof that the chosen pipeline actually runs on that browser; the choice is written into the URL so a reload or a shared link keeps it.

## The three pipelines

All three build the identical playground, the same five windows and two dock regions from `playground-scene.ts`, with the identical engine-free behaviour from `playground-behaviour.ts`, and each is a dynamic import, so a session only downloads the engine it launches.

- Desktop: a hand-rolled three.js scene with no XR framework, real mouse input through `@pmndrs/pointer-events`, and `DesktopControls` for WASD movement.
- IWSDK: the same playground through the IWSDK adapter's scene host, with drag, dock-by-drag and VR entry; the devtools edit gate rides along here in local dev.
- XR Blocks: the same playground inside an `xb.Script`, with select-ray click forwarding; scope matches the [XR Blocks adapter's feature matrix](../integrations/03-xrblocks-threejs.md).

## The ?uix-engine= override

`?uix-engine=desktop`, `?uix-engine=iwsdk` or `?uix-engine=xrblocks` pre-selects a mode on the launch screen, or forces one outright in the showcase. UA (user-agent) sniffing is best-effort by nature; the override is authoritative.

## Desktop controls

| Input | Action |
| --- | --- |
| W A S D / arrows | walk |
| Shift | sprint |
| Space | jump |
| C / left control | crouch |
| Right-drag | look around |
| Left click | interact with panels |

## Deployment

`ci.yml` deploys this demo to its own isolated Cloudflare Pages projects, never instead of the showcase's. Production, `webxr-uix-lab.pages.dev`, deploys on a push to `main`; staging, `webxr-uix-lab-test.pages.dev`, deploys per pull request, with the devtools edit gate compiled in only when a repository secret is set. Each deploy's step summary publishes a verified short link and QR code for the deployed URL.

## More information

- [Showcase example](./01-showcase.md)
- [XR Blocks and three.js adapter](../integrations/03-xrblocks-threejs.md)
- [Developer cycle](../features/01-developer-cycle.md)
- Live demo: <DemoLink demo="uiLab" />
