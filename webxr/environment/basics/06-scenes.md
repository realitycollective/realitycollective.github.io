---
sidebar_position: 6
title: Scenes
description: Loading, stacking, preloading and unloading scenes inside one XR session, the same way on every host.
---

# Scenes

From 0.1.1.

A WebXR app cannot change scene by changing page, because navigating away ends the immersive session. So every app with more than one scene manages them inside one session. `SceneManager` does that the same way on every host: your scenes are a list, like Unity's build settings, and your services say "load the court additively" or "go to level 3". Each host builds the content its own best way. On the web that means fetch, build and fade; on a native host it means loading from the app package, and it can be instant if the scene was preloaded.

## Manager and port

The rules live in the core's `SceneManager`: the scene list, the stack, the active scene, persistence and the lifecycle events. Each adapter implements a `ScenePort`, which builds and destroys scene content with the host's own loaders. A scene's `src` means the same thing on every host, a URL or a path relative to the app's content root, and the host resolves it. The manager never reads what is in a scene.

| Adapter | Setup | How a scene is built |
| --- | --- | --- |
| three.js | `createThreeScenes(root, options)` | A group under `root`; `GLTFLoader` by default, or your own `load` |
| Meta IWSDK | `createIWSDKScenes(world, options)` | IWSDK's own `SceneJSONImporter` reading an `iwsdk.scene.v1` document, under a persistent root of its own |
| Google XR Blocks | `createXRBlocksScenes(root, options)` | The three.js port, under XR Blocks' three.js scene |
| Native | `createNativeScenes(host?, options)` | The native app, through the `scenes` slice of `__rcHost` |

## Setup

```ts
import { createIWSDKScenes, registerEnvironment, PERSISTENT_SCENE_ID } from "@realitycollective/iwsdk-environment";

const env = registerEnvironment(world, { presets });
const { manager } = createIWSDKScenes(world, {
  environment: env.environment,          // the active scene drives the sky, fog and light
  transition: { durationMs: 1500 },
});

manager.register([
  { id: "lobby", src: "/scenes/lobby.iwsdk.scene.json", environment: "dusk" },
  { id: "court", src: "/scenes/court.iwsdk.scene.json" },
  { id: "level-3", src: "/scenes/level-3.iwsdk.scene.json", environment: "night" },
]);

await manager.load("lobby");
```

A scene's `environment` is a spec or the name of a preset the director knows. A scene without one leaves the environment as it is.

## Loading and unloading

```ts
await manager.load("lobby");                             // single: replaces everything loaded
await manager.load("court", { mode: "additive" });       // additive: adds to the top of the stack
await manager.unload("lobby");                           // any scene in the stack, not only the top
manager.loaded();                                        // the stack, bottom first
```

- A **single** load unloads every loaded scene, keeping persistent nodes, then loads. Unloaded events fire before the loaded event.
- An **additive** load adds to the top of the stack and changes nothing else.
- **Unload** removes any scene in the stack. The rest keep their order. Instances spawned into that scene go with it; persistent nodes do not.
- Loads and unloads run one at a time, in call order. Loading a scene that is already loaded or loading returns the same promise. Loading an id that is not in the list rejects, and so does a scene whose content repeats a node id.

## Preloading

```ts
await manager.load("level-3", { activate: false });   // built, hidden, not hit-testable
// ... fade out ...
manager.activate("level-3");                          // shown at once
```

A preloaded scene is fully built but neither shown nor hit-testable until `activate`. That is how a native host gets an instant switch, and the web a fetch hidden behind a fade. A preloaded single load leaves the current scenes playing while it builds, and replaces them when it is activated.

## The active scene

There is at most one active scene. It is where `instantiate` puts new objects when no scene is named, and its `environment` drives the environment director, with the same transition a preset change uses. `setActiveScene(id)` changes it; unloading it makes the top shown scene active, or none. A single load makes the new scene active; an additive one does only when you pass `makeActive: true`, or when nothing is active yet.

## Nodes, instances and persistence

Node ids are unique within a scene. `setNodeActive(sceneId, nodeId, active)` turns one node on or off; off means neither rendered nor hit-testable.

```ts
manager.setNodeActive("court", "press-station", true);            // reveal a station
const id = manager.instantiate("ball", { position: [0, 1, -1], orientation: [0, 0, 0, 1] });
manager.destroy(id);
manager.makePersistent("lobby", "hud");                            // survives single loads
manager.getNode(PERSISTENT_SCENE_ID, "hud");                      // its address from now on
```

An instance id addresses the instance as a node of the scene it was spawned into. `makePersistent` takes a node out of its scene's lifetime, like Unity's `DontDestroyOnLoad`; from then on it is addressed under `PERSISTENT_SCENE_ID`, and it lives until the manager is disposed.

## Interaction targets on scene nodes

`getNode(sceneId, nodeId)` returns the host's own node: an `Object3D` on three.js and XR Blocks, an entity on IWSDK, the native app's key on native. Register interaction targets through `bindNode`, which ties them to the node's lifetime:

```ts
manager.bindNode("court", "tee", (entity) => {
  interactions.register({ id: "tee", behaviours: [{ kind: "grab" }] }, entity);
  return () => interactions.unregister("tee");   // runs when the scene unloads
});
```

A binding is live only while its scene is shown. In a preloaded scene it runs on `activate`, which keeps a hidden scene's targets out of hit testing on every host, including hosts whose hit testers never check visibility. The release runs when the scene unloads, the node is destroyed or the manager is disposed.

## Events and disposal

`onSceneLoaded`, `onSceneUnloaded` and `onActiveSceneChanged` each return an unsubscribe. `dispose()` leaves nothing on the host: no scenes, instances, persistent nodes, bindings or listeners, and it puts back the environment a scene first overrode. Dispose the scene manager before the environment director.

## What it does not do

How a scene looks, its materials, opacity, animation and effects, is presentation you build per host. Converting a scene format between hosts is your asset pipeline's job. There is no physics port: a host builds physics from the physics components in its own scene format. See [the boundary](../features/02-the-boundary.md).

## Proving a host conforms

`sceneManagerContractCases()`, 18 cases, runs the real `SceneManager` over a host's real `ScenePort`. The host builds the fixture scenes in `SCENE_CONTRACT_FIXTURES` with its own objects and answers from the host itself: does a node exist, is it shown, would the host's own hit testing find it, where is it, and how many objects has the port left behind. All four adapters pass it. See [conformance suites](/webxr/docs/concepts/conformance-suites).

## More information

- [Presets and transitions](./04-presets-and-transitions.md)
- [The boundary](../features/02-the-boundary.md)
- [Native adapter](../integrations/05-native.md)
- [API reference](pathname:///webxr/api/environment/)
