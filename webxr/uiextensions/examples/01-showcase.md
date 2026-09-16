---
sidebar_position: 1
title: Showcase
description: Six windows and two dock regions demonstrating the whole surface, on the IWSDK and desktop three.js pipelines.
---

# Showcase

The showcase is six windows and two dock regions, built from one portable scene descriptor and driven by identical demo logic on every engine.

## Live and local

Live: <DemoLink demo="uiShowcase" />.

```bash
npm run dev:showcase     # from the workspace root -> http://localhost:8081
```

## Runtime detection

The runtime is chosen from the browser: Meta Horizon OS (Quest) boots the IWSDK adapter, anything else boots the XR Blocks adapter's plain three.js half. IWSDK takes the view pose from the headset and ships no desktop camera, so driving this scene with it on a desktop would render from a frozen viewpoint. Force either build with `?uix-engine=iwsdk` or `?uix-engine=desktop`. Desktop controls: left click drives the spatial UI, WASD walks, Shift sprints, Space and C jump and crouch, and right-drag looks around.

## Crew Registration

Demonstrates native UIKitML `<input>`/`<textarea>` fields, with the system keyboard on a headset, a horizon-kit `Slider`, and submit validation.

```ts
{
  id: 'registration',
  title: 'Crew Registration',
  config: './ui/registration.uikitml',
  position: [-0.55, 1.55, -1.5],
  maxWidth: 0.9,
  maxHeight: 1.1,
  pinnable: true,
  dockable: true,
  minimizable: true,
  closable: true,
}
```

`playground-behaviour.ts` binds each field's `onValueChange` into a local form object, and the submit button either reports a missing call sign or logs a welcome message with the entered speed. Try it: leave the name blank and press submit, then fill it in and submit again.

## Event Log

Demonstrates live logging: every `WindowManager` lifecycle event lands here, including events fired before this panel finishes loading, which are queued and flushed once it does.

```ts
{
  id: 'event-log',
  title: 'Event Log',
  config: './ui/event-log.uikitml',
  position: [1.7, 1.9, -1.5],
  region: 'console-wall',
  maxWidth: 0.85,
  maxHeight: 0.8,
  pinnable: true,
  dockable: true,
  minimizable: true,
}
```

Its close button is deliberately left off: it is the dogfooding surface for every other window's lifecycle, and closing it would hide the evidence. Try it: pin, dock or minimise any other window and watch the corresponding line appear.

## Click Machine

Demonstrates every title-bar button enabled at spawn, alongside its own click counter.

```ts
{
  id: 'clicker',
  title: 'Click Machine (all buttons)',
  config: './ui/clicker.uikitml',
  position: [0.55, 1.5, -1.55],
  maxWidth: 0.7,
  maxHeight: 0.9,
  pinnable: true,
  dockable: true,
  minimizable: true,
  closable: true,
}
```

A click on its button pushes a timestamped line into an in-panel log and into the shared event log. Try it: click repeatedly, then try each title-bar button in turn.

## Player Status

Demonstrates a movable info window driven entirely from another window, Window Control: a health stepper, a shield toggle and an expandable bio.

```ts
{
  id: 'player-status',
  title: 'Player Status (menu-driven)',
  config: './ui/player-status.uikitml',
  dockMode: DockMode.BodyFollow,
  followOffset: [0.5, -0.25, -1.05],
  maxWidth: 0.75,
  maxHeight: 0.95,
}
```

It spawns with every title-bar button off; `playground-behaviour.ts` wires its stepper, toggle and expandable-label controls to the event log, and Window Control's buttons-on call is what switches its chrome on later. Try it: raise your left palm to open Window Control, then press BUTTONS ON and drag the window by its now-visible title bar.

## Gallery

Demonstrates the no-buttons default: image rendering through the native `<img>` element, with only drag available.

```ts
{
  id: 'gallery',
  title: 'Gallery (no buttons)',
  config: './ui/gallery.uikitml',
  position: [-1.6, 1.6, -1.2],
  maxWidth: 0.65,
  maxHeight: 0.85,
}
```

No title-bar buttons are requested, so none are shown; the title bar still drags. Try it: drag it by the title bar into either dock region.

## Window Control

A hand menu, hand-locked, on the left hand, shown while the palm faces the viewer, whose every button is one `WindowManager` call on Player Status.

```ts
{
  id: 'window-control',
  title: 'Window Control',
  config: './ui/window-control.uikitml',
  dockMode: DockMode.HandLocked,
  handMenu: { hand: 'left', anchor: 'above' },
  followOffset: [-0.35, -0.3, -0.9],
  maxWidth: 0.3,
  maxHeight: 0.4,
}
```

Buttons: HIDE/SHOW, PIN/UNPIN, TO BELT, TO WALL, UNDOCK, HOME, MIN/MAX and BUTTONS ON/OFF, each reading its label back from the `WindowManager` record so it always names the next action. On the desktop build, where there are no hands, it follows the body instead of riding a palm. Try it: press TO WALL, then HOME to see it return, then BUTTONS ON to reveal Player Status's own title bar.

## The dock regions

Console wall: a world-locked column on the right, capacity three, that windows stack into.

```ts
{
  id: 'console-wall',
  flow: 'column',
  pitch: 0.62,
  capacity: 3,
  snapRadius: 0.65,
  position: [1.7, 1.9, -1.5],
}
```

Belt: a body-locked row, low and centred, capacity two, that follows the player.

```ts
{
  id: 'belt',
  flow: 'row',
  pitch: 0.62,
  capacity: 2,
  snapRadius: 0.5,
  follow: true,
  followOffset: [0, -0.75, -1.1],
}
```

Try it: use Window Control's TO WALL and TO BELT buttons, or drag any window near a region to drop it in directly.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Meta IWSDK adapter](../integrations/02-iwsdk.md)
- [Multiplatform lab example](./02-multiplatform-lab.md)
- Live demo: <DemoLink demo="uiShowcase" />
