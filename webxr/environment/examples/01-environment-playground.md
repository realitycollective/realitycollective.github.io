---
sidebar_position: 1
title: Environment playground
description: A standalone three.js and WebXR demo broken down feature by feature, with what to try on a headset.
---

# Environment playground

The playground is a standalone three.js and WebXR scene that makes the family's main ideas visible rather than only asserted in a test file.

## Live and local

Live at <DemoLink demo="environment" />. Run it locally from the repository root:

```bash
npm ci
npm run dev:playground     # http://localhost:8083 - VR button for headsets
```

No audio file ships with the repository. The demo points at `public/audio/hum.mp3` and logs one warning if it is absent, which is what a missing sound should do; drop a file at that path to hear it.

## Preset buttons and transitions

A button is created for every name in `director.presetNames()`, and each one calls `director.transition(name)`:

```ts
for (const name of director.presetNames()) {
  const button = document.createElement("button");
  button.textContent = name;
  button.addEventListener("click", () => {
    director.transition(name);
    void audioPort.resume();
  });
  presets.appendChild(button);
}
```

Every click eases the sky, the fog and both lights together on one curve, because they are one document rather than five things that happen to be animated at once.

## The passthrough toggle and "restores exactly"

The passthrough button flips `director.passthrough`:

```ts
passthroughButton.addEventListener("click", () => {
  director.setPassthrough(!director.passthrough);
});
```

"Restores exactly" means the sky and fog return to precisely what the app was already asking for, mid-transition included, because passthrough is a suppression rather than a second writer and nothing has to remember what to put back.

## The bus and master sliders moving live voices

The master and ambience sliders call `setMasterGain` and `setBusGain` on every `input` event, while cues are already sounding:

```ts
master.addEventListener("input", () => audio.setMasterGain(Number(master.value)));
ambience.addEventListener("input", () => audio.setBusGain("ambience", Number(ambience.value)));
```

This is what makes the mix live: a slider changes the gain of voices that are already playing, not just the gain of the next one started.

## The sensing report panel

The HUD reads every environment and world sensing report and joins them into one line, refreshed whenever either director reports a change:

```ts
function showSensing(): void {
  const environment = SENSING_FEATURES.filter(
    (feature) => !WORLD_FEATURES.includes(feature as (typeof WORLD_FEATURES)[number]),
  ).map((feature) => `${feature}: ${describe(director.getSensing(feature))}`);
  const room = WORLD_FEATURES.map((feature) => `${feature}: ${describe(world.getSensing(feature))}`);
  sensing.textContent = [...environment, ...room].join(" · ");
}
director.onSensing(showSensing);
world.onSensing(showSensing);
```

On a desktop browser this reads `unsupported` or `unavailable` for every sensor-backed feature, because there is no session and no depth, which is the panel doing its job rather than a bug.

## The app-built floor and objects

The floor, a knot and a plinth are ordinary three.js meshes built directly in `main.ts`, in a handful of lines, because content is the app's:

```ts
const floor = new Mesh(
  new PlaneGeometry(60, 60),
  new MeshStandardMaterial({ color: 0x282d33, roughness: 1 }),
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
```

The library describes the sky, the fog and the lights; nothing that could be built here out of a geometry and a material is its job.

## The DOM click bound to `audio.play`

The cue button is the whole of the app-owned binding: it resumes the audio context, then calls `play`:

```ts
cueButton.addEventListener("click", () => {
  void audioPort.resume().then(() => {
    audio.play("chime", { gain: 1 });
    if (audio.activeVoices.every((voice) => voice.cueId !== "hum")) audio.play("hum");
  });
});
```

Swap the click listener for an interaction event, a level change or a socket message, and the line to the library looks the same; nothing in the family knows or cares which it was.

## What to try on a headset

Enter VR with the button the demo adds automatically, then toggle passthrough to see the suppression restore the environment exactly rather than snapping to a different one. Toggle occlusion to see the sensing panel change from "unsupported" on desktop to a real report once a session with depth is active. Watch the console for `world:` log lines as the world-sensing director reports a new plane once the headset has scanned the room.

## More information

- [Getting started](../basics/02-getting-started.md)
- [Presets and transitions](../basics/04-presets-and-transitions.md)
- [Sensing](../features/01-sensing.md)
- [three.js and raw WebXR adapter](../integrations/02-threejs.md)
- [API reference](pathname:///webxr/api/environment/)
