---
sidebar_position: 1
title: Sensing
description: Occlusion, light estimation and world sensing, the report states, and the sensor matrix per adapter.
---

# Sensing

Sensor-backed features fail to a scene that looks completely normal, so WebXR Environment reports what a sensor is doing rather than leaving the app to guess.

## Occlusion

Real-world depth occlusion lets the room hide virtual content while passthrough is showing it. `setOcclusion(spec)` asks for it, and the port hears about it only while passthrough is on, because occluding content with a room nobody can see would just be deleting content. An `OcclusionSpec` carries a `mode` (`"hard"`, `"soft"` or `"minmax-soft"`), a `scope` (`"all"` or `"tagged"`), a `softness` and `source` preferences drawn from the WebXR session (usage, data format, depth type, whether depth matches the render view). The spec is remembered across passthrough changes, so an app can set it once at startup and let entering and leaving AR do the right thing.

## Light estimation

`setLightEstimation(true)` lets the host's measurement of the real room take over the ambient, key and IBL slots while it is measuring, covered in full on the [presets and transitions](../basics/04-presets-and-transitions.md) page.

## World sensing

`WorldSensingDirector` is a second, separate director: it asks for planes, meshes and anchors, keeps one registry of each, and emits `added`, `updated` and `removed` by id, so an app can spawn content on a new surface and drop it when the surface goes. It reports detected geometry and creates none; a mesh's vertices are the runtime's own buffers, passed through by reference. `setDetection` turns planes, meshes and anchors on or off; `startHitTest(request)` opens a standing question ("where does this ray meet the room") answered every frame through `hits(sourceId)`; `createAnchor` asks the runtime to remember a point and turns anchor detection on if it was not already.

```ts
world.setDetection({ planes: true, meshes: true });
world.startHitTest({ id: "pointer", space: "right" });
world.onChange((change) => {
  if (change.feature === "planes" && change.added.length > 0) placeOnNewSurface(change.added);
});
```

## The report states

Every sensor-backed feature reports one of four states, in the order things usually go wrong: `"unsupported"` (this host cannot do it at all), `"unavailable"` (the host can, but this session did not get it), `"pending"` (asked for and accepted, nothing measured yet) and `"active"` (working right now). Each report may carry a `detail` sentence for a human; it is never parsed or switched on.

## Ask, then read the report

There is no capability list to read before you start, because what a host can do depends on the session the app asked for. The pattern is the same for every feature: ask, then read the report.

```ts
world.startHitTest({ id: "pointer", space: "right" });
world.getSensing("hitTest");   // unsupported | unavailable | pending | active, with a reason

world.onSensing((report) => {
  if (report.feature === "hitTest" && report.state === "active") showPlacementUI();
});
```

Detection answers immediately: `setDetection` reports before it returns. Hit testing and light estimation answer on a later frame, because both ask the runtime for something, so subscribe with `onSensing` rather than checking once.

:::note
A report never changes what the app asked for; it changes what the app can be told. Light estimation is the one exception, and it is explicit: the estimate is opted into with `setLightEstimation` and layered over the light slots.
:::

## The sensor matrix per adapter

| | three.js | Meta IWSDK | Google XR Blocks |
| --- | --- | --- | --- |
| Sky, fog, ambient, key | yes | yes | yes |
| Image-based lighting | yes (`room` is a neutral ramp without a prefilter) | yes (`room` is native) | yes |
| Depth occlusion | yes, three.js's own, gpu-optimised depth only | yes, per entity | yes, XR Blocks' occlusion pass |
| Light estimation | yes, straight from WebXR | no, reported, and requested upstream | yes, via XR Blocks' `Lighting` |
| Spatial attenuation per cue | yes | yes | yes (three.js audio) |
| Planes and meshes | yes, from the `XRFrame` | yes, from scene understanding | yes, from its own detectors |
| Anchors | yes | yes | no, XR Blocks exposes none to read |
| Hit test | yes, cast from the viewer or from either hand's own ray, with a distance | yes, via `EnvironmentRaycastTarget`, no distance | no, it places objects rather than reporting |
| Measured reflections | yes, given a `reflection` hook | no, reported | no, reported |

## More information

- [The boundary](./02-the-boundary.md)
- [three.js and raw WebXR adapter](../integrations/02-threejs.md)
- [Meta IWSDK adapter](../integrations/03-iwsdk.md)
- [Google XR Blocks adapter](../integrations/04-xrblocks.md)
- [API reference](pathname:///webxr/api/environment/)
