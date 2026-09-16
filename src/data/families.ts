// The four Reality Toolkit WebXR families, as shown on the /webxr page and the family overview pages.
// Facts come from each repository's README on 2026-09-16. Versions are the working-tree values; the
// pre-release families are installed with the @preview dist-tag.
import {links, playgroundLinkMode} from '@site/src/links';

export type AdapterStatus = 'full' | 'reference' | 'experimental' | 'untested' | 'pending' | 'released' | 'dev-only';

export type Adapter = {
  title: string;
  pkg: string;
  body: string;
  status: AdapterStatus;
  statusLabel: string;
  href: string;
};

export type Family = {
  id: 'input' | 'interactions' | 'uiextensions' | 'environment';
  number: string;
  name: string;
  headline: string;
  lead: string;
  chips: string[];
  core: {pkg: string; sub: string};
  mapItems: Array<{pkg: string; sub: string}>;
  mapFoot?: {pkg: string; sub: string};
  reasons: Array<{title: string; body: string}>;
  adaptersHeading: string;
  adaptersLead: string;
  adapters: Adapter[];
  glossary: Array<[string, string]>;
  repo: string;
  released: boolean;
  demo?: {label: string; live: string; preview: string};
  cardBody: string;
  cardAdapters: string;
  cardStatus: string;
  tagline: string;
  stack: {adapter: string; core: string; contracts?: string};
  ladder: Array<{stage: string; core: string; adapter: string}>;
};

export const families: Family[] = [
  {
    id: 'input',
    tagline: 'The cross-platform contracts required for unified input.',
    stack: {adapter: 'threejs-, babylon-, iwsdk-, xrblocks-interactions and the UI adapters implement InputProvider', core: 'webxr-input · types, capabilities, provider, pointer streams, conformance cases'},
    ladder: [
      {stage: 'Describe input', core: 'InputSourceSnapshot, plain tuples, opaque ids, handedness', adapter: 'Fills one snapshot per source every frame from its engine'},
      {stage: 'Declare capabilities', core: 'The capability keys, satisfies and unmetRequirements', adapter: 'Derives the keys from the live session and raises change events'},
      {stage: 'Sample', core: 'The pull-based InputProvider contract', adapter: 'Reads controllers, hands, mouse or touch and returns the samples'},
      {stage: 'Haptics and presence', core: 'Optional pulse, setPresenceVisible, setPresenceModality', adapter: 'Forwards to the engine where it can, leaves the member out where it cannot'},
      {stage: 'Prove conformance', core: 'inputProviderContractCases() as data', adapter: 'Runs every case in its own test runner'},
    ],
    number: '01',
    name: 'Input',
    headline: 'The contracts every adapter speaks.',
    lead: 'WebXR Input describes XR input in plain TypeScript types: where a hand or controller is pointing, what it is touching, and what the device can actually do. It has no dependency on any 3D engine and no runtime dependencies at all, and a test enforces both. That is what lets the Interactions and UI Extensions families share one description of input, so an engine adapter is written once and feeds both.',
    chips: ['Released, 0.1.x on npm', 'MIT', 'Zero dependencies'],
    core: {pkg: 'webxr-input', sub: 'types · capabilities · provider · pointer streams · velocity · conformance cases'},
    mapItems: [
      {pkg: 'webxr-interactions', sub: 'consumes it'},
      {pkg: 'webxr-uiextensions', sub: 'consumes it'},
    ],
    mapFoot: {pkg: 'engine adapters', sub: 'implement InputProvider · three.js, Babylon.js, IWSDK, XR Blocks'},
    reasons: [
      {title: 'One description of input', body: 'A ray, a grip pose, a fingertip, select and squeeze as numbers from 0 to 1. Plain tuples, no engine types anywhere, so a pose means the same thing to every family.'},
      {title: 'Capabilities from the live session', body: 'What a provider can deliver is derived from the session that is actually running, and consumers gate behaviour on it with satisfies and unmetRequirements.'},
      {title: 'Conformance as data', body: 'The provider contract ships as a list of named cases, not as tests. An adapter loops over them in its own test runner and proves it conforms.'},
    ],
    adaptersHeading: 'Who implements it',
    adaptersLead: 'Apps never install this package. Every adapter in the Interactions and UI Extensions families implements the provider interface and re-exports the contracts, so an app reads these types through the adapter it already has.',
    adapters: [
      {title: 'Interactions adapters', pkg: 'threejs-, babylon-, iwsdk-, xrblocks-interactions', body: 'Each implements InputProvider over its engine and hands the samples to the interaction core.', status: 'full', statusLabel: 'four adapters', href: '/webxr/docs/input/integrations/implementations'},
      {title: 'UI Extensions adapters', pkg: 'iwsdk-, xrblocks-uiextensions', body: 'Drive windows and controls through the shared pointer contract, so one input stack serves both families.', status: 'full', statusLabel: 'two adapters', href: '/webxr/docs/input/integrations/implementations'},
      {title: 'Your own adapter', pkg: 'implement InputProvider', body: 'Pull-based sample(), capability-change events, optional haptics and presence. Run inputProviderContractCases() to prove it.', status: 'reference', statusLabel: 'guide', href: '/webxr/docs/input/basics/provider-conformance'},
    ],
    glossary: [
      ['Snapshot', 'one normalised input source per frame: ray, grip, fingertip, select, squeeze'],
      ['Capabilities', 'what a provider can deliver, derived from the live session'],
      ['Provider', 'the single interface an engine adapter implements'],
      ['Pointer sample', 'a press-move-release stream, shared with the UI family'],
      ['Contract case', 'a named conformance check an adapter runs in its own test runner'],
    ],
    repo: links.repos.input,
    cardBody: 'The contracts. Where a hand or controller points, what it touches, what the device can do. Zero dependencies, consumed by every other family.',
    cardAdapters: 'Implemented by each engine adapter',
    cardStatus: 'Released',
    released: true,
  },
  {
    id: 'interactions',
    tagline: 'Interactables, interactors and behaviours for any engine.',
    stack: {adapter: 'threejs-, babylon-, iwsdk- or xrblocks-interactions', core: 'webxr-interactions · behaviours, targeting, gaze, events, feedback', contracts: 'webxr-input · one description of input'},
    ladder: [
      {stage: 'Sample input', core: 'Asks the provider for snapshots each frame', adapter: 'Implements InputProvider over raw WebXR, Babylon.js, IWSDK or XR Blocks'},
      {stage: 'Pick a target', core: 'Platform hint, then touch, then ray, with a hold on the boundary', adapter: 'Hit-tests the scene and supplies the platform answer where it has one'},
      {stage: 'Run behaviours', core: 'Press, pulse, hinge, dial, slide, grab, toss-score', adapter: 'Applies poses through its transform port'},
      {stage: 'Emit events', core: 'One event stream; never calls into app code', adapter: 'Nothing to add'},
      {stage: 'Feedback', core: 'Requests a haptic pulse or a cue', adapter: 'Fulfils haptics where the engine can and reports where it cannot'},
    ],
    number: '02',
    name: 'Interactions',
    headline: 'Buttons, levers, dials and grabbable things.',
    lead: 'WebXR Interactions adds interactive objects to a WebXR scene. The interaction logic has no 3D engine code in it. You add one adapter for the engine you already use, and that adapter feeds the shared core. It is based wholly on the Reality Toolkit\'s interaction framework for Unity, revised for the web.',
    chips: ['0.1.0 previews, install @preview', 'MIT', 'Pre-release by design'],
    core: {pkg: 'webxr-interactions', sub: 'behaviours · targeting · gaze · events · feedback · descriptors'},
    mapItems: [
      {pkg: 'threejs-interactions', sub: 'adapter'},
      {pkg: 'babylon-interactions', sub: 'adapter'},
      {pkg: 'iwsdk-interactions', sub: 'adapter'},
      {pkg: 'xrblocks-interactions', sub: 'adapter, experimental'},
    ],
    mapFoot: {pkg: 'webxr-input', sub: 'contracts · separate repository'},
    reasons: [
      {title: 'Behaviours, ready made', body: 'Press with an optional latching mode, pulse, hinge, dial, slide, grab and toss-scoring for throw-and-catch games. Attach one to an object and subscribe to its events.'},
      {title: 'Targeting that does not flicker', body: 'For each hand or controller the core picks one target: the platform\'s own answer first, then a close touch, then a pointing ray, with a short hold on the boundary between two objects.'},
      {title: 'Capabilities that speak up', body: 'If the headset cannot do what a behaviour needs, the behaviour switches itself off and says so, rather than silently doing nothing.'},
    ],
    adaptersHeading: 'Pick an adapter',
    adaptersLead: 'Install exactly one. Each re-exports the core and the input contracts, so you never install those yourself.',
    adapters: [
      {title: 'three.js and raw WebXR', pkg: 'threejs-interactions', body: 'The default, standalone adapter. Reads raw WebXR, adds three.js hit-testing and object movement, and a desktop mouse fallback. Presence is opt-in through registerVisual.', status: 'full', statusLabel: 'default', href: '/webxr/docs/interactions/integrations/threejs'},
      {title: 'Babylon.js', pkg: 'babylon-interactions', body: 'Reads a WebXRDefaultExperience: controllers, motion controller trigger and grip, hand joints. Structurally typed, so no @babylonjs/core import.', status: 'untested', statusLabel: 'not yet run on a real app', href: '/webxr/docs/interactions/integrations/babylon'},
      {title: 'Meta IWSDK', pkg: 'iwsdk-interactions', body: 'Passes IWSDK\'s own press and grab answers straight through, with native grab fulfilment and full presence control. Setup is one call: registerInteractions(world).', status: 'full', statusLabel: 'full', href: '/webxr/docs/interactions/integrations/iwsdk'},
      {title: 'Google XR Blocks', pkg: 'xrblocks-interactions', body: 'Maps the XR Blocks input pipeline onto the three.js machinery. XR Blocks has no haptics and no way to hide its own hand visuals, so neither is offered.', status: 'experimental', statusLabel: 'experimental', href: '/webxr/docs/interactions/integrations/xrblocks'},
    ],
    glossary: [
      ['Interactable', 'an object in your scene that can be interacted with, such as a button'],
      ['Interactor', 'the thing doing the interacting: a hand, a controller, a ray or a mouse'],
      ['Behaviour', 'press, pulse, hinge, dial, slide, grab or toss-score, attached to an interactable'],
      ['Descriptor', 'a whole scene of stations as portable data'],
      ['Feedback', 'a request for a haptic pulse or a sound; playing it is the app\'s job'],
    ],
    repo: links.repos.interactions,
    demo: {label: 'Interaction playground', ...links.demos.interactions},
    cardBody: 'Interactables, interactors and behaviours: press, hinge, dial, slide, grab, toss-scoring, gaze dwell. Capability checks that switch a behaviour off and say why.',
    cardAdapters: 'three.js · Babylon.js · IWSDK · XR Blocks',
    cardStatus: 'Preview',
    released: false,
  },
  {
    id: 'uiextensions',
    tagline: 'Windows, docks, hand menus and controls for spatial UI.',
    stack: {adapter: 'iwsdk-uiextensions or xrblocks-uiextensions', core: 'webxr-uiextensions · window manager, docking, regions, controls, scene descriptor', contracts: 'webxr-input · pointer and pose contracts'},
    ladder: [
      {stage: 'Describe the scene', core: 'SceneDescriptor: windows and regions as data', adapter: 'Builds panels from it, UIKitML on IWSDK, uikit on three.js'},
      {stage: 'Manage windows', core: 'WindowManager: state, dock, pin, minimise, events', adapter: 'Moves the engine objects to match'},
      {stage: 'Drag and dock', core: 'Drag maths, hold-to-drag, region layout', adapter: 'Delivers press, move and release from its input'},
      {stage: 'Controls', core: 'Stepper, toggle, expandable and log models plus the upgraders', adapter: 'Supplies the element tree the upgraders walk'},
      {stage: 'Prove conformance', core: 'windowHostContractCases() as data', adapter: 'Runs every case in its own test runner'},
    ],
    number: '03',
    name: 'UI Extensions',
    headline: 'Windows, docks, hand menus and controls, in the scene.',
    lead: 'WebXR UI Extensions is a library for building user interfaces inside a WebXR scene. It gives you movable, resizable windows that can be dragged, snapped into fixed regions of the scene, and filled with buttons, sliders and other controls. Panels are written in UIKitML, IWSDK\'s HTML and CSS-like markup for spatial panels. The core logic is plain TypeScript with no dependency on any 3D engine.',
    chips: ['0.1.0 previews, install @preview', 'MIT', 'Pre-release by design'],
    core: {pkg: 'webxr-uiextensions', sub: 'window manager · docking · regions · drag maths · controls · scene descriptor'},
    mapItems: [
      {pkg: 'iwsdk-uiextensions', sub: 'reference adapter'},
      {pkg: 'xrblocks-uiextensions', sub: 'adapter, experimental'},
      {pkg: 'uix-devtools', sub: 'dev-only tooling'},
    ],
    mapFoot: {pkg: 'webxr-input', sub: 'pointer and pose contracts · separate repository'},
    reasons: [
      {title: 'One window API', body: 'The window manager is the one place an app drives a window from: show, hide, pin, dock, home, minimise and the title-bar buttons, with events for everything that changes.'},
      {title: 'Scenes as portable data', body: 'A SceneDescriptor lists windows and regions as plain data. The IWSDK, XR Blocks and plain three.js versions behave identically from identical data.'},
      {title: 'Markup, not components', body: 'A plain element carrying a data-uix attribute becomes a stepper, a toggle, an expandable section or a log view, so you write markup rather than wiring controls.'},
    ],
    adaptersHeading: 'Pick an adapter',
    adaptersLead: 'Install exactly one. Each re-exports the whole core, so an app installs one package. Depend on the core directly only for headless logic, tests, tooling or a new adapter.',
    adapters: [
      {title: 'Meta IWSDK', pkg: 'iwsdk-uiextensions', body: 'The reference implementation: ECS systems binding the core to @iwsdk/core, a window factory, regions, hand menus and the shipped examples.', status: 'reference', statusLabel: 'reference, full feature set', href: '/webxr/docs/uiextensions/integrations/iwsdk'},
      {title: 'Google XR Blocks and plain three.js', pkg: 'xrblocks-uiextensions', body: 'Hosts the windowing core in any three.js WebXR scene, including XR Blocks Scripts, with uikit panels, follow mode and desktop controls.', status: 'experimental', statusLabel: 'experimental, partial feature set', href: '/webxr/docs/uiextensions/integrations/xrblocks-threejs'},
      {title: 'Developer tooling', pkg: 'uix-devtools', body: 'An edit-session launch gate, runtime UIKitML compilation and the uix-dev CLI with a Cloudflare quick tunnel and QR onboarding for headset testing. Never ship it.', status: 'dev-only', statusLabel: 'dev dependency only', href: '/webxr/docs/uiextensions/integrations/uix-devtools'},
    ],
    glossary: [
      ['Window', 'a movable, resizable panel with a title bar and optional pin, dock, minimise and close buttons'],
      ['Region', 'a named area of the scene that windows snap into, world-locked or body-locked'],
      ['Dock mode', 'how a window is anchored: free, docked, body-follow or hand-locked'],
      ['UIKitML', 'the HTML and CSS-like markup a panel is written in'],
      ['Scene descriptor', 'the portable list of windows and regions an adapter builds from'],
    ],
    repo: links.repos.uiextensions,
    demo: {label: 'UI Extensions showcase', ...links.demos.uiShowcase},
    cardBody: 'Movable, dockable windows, layout regions, hand menus and controls for spatial UI, authored in UIKitML. Plus dev tooling for live editing on a headset.',
    cardAdapters: 'IWSDK · XR Blocks and three.js',
    cardStatus: 'Preview',
    released: false,
  },
  {
    id: 'environment',
    tagline: 'Sky, fog, light and sound, described as one document.',
    stack: {adapter: 'threejs-, iwsdk- or xrblocks-environment', core: 'webxr-environment · environment document, presets, audio, sensing'},
    ladder: [
      {stage: 'Describe the world', core: 'One document: sky, fog, ambient, key light, image-based lighting', adapter: 'Writes each slot to the engine: scene.background, Fog, DomeGradient, lights'},
      {stage: 'Change it', core: 'Presets, easing, every slot on one curve', adapter: 'Regenerates textures and mutates lights in place'},
      {stage: 'Passthrough', core: 'Suppresses the sky slot; nothing to restore', adapter: 'Stops drawing the background while the real world shows'},
      {stage: 'Sound', core: 'Cues, buses, retrigger policy, absolute gains', adapter: 'Plays through Web Audio or AudioSource entities'},
      {stage: 'Sense the room', core: 'Asks for occlusion, light estimation, planes, anchors and hit tests; diffs the reports', adapter: 'Answers unsupported, unavailable, pending or active, with a reason'},
    ],
    number: '04',
    name: 'Environment',
    headline: 'The sky, the fog, the light, and the sound in it.',
    lead: 'WebXR Environment describes the world around the player, the sky, the fog and the light, and the sound in it, as plain data, and applies that description through a thin adapter for whichever engine is hosting. Every one of those is a platform facility that each host exposes differently. Content is never here: meshes, prefabs and placement belong to the app.',
    chips: ['0.1.0 previews, install @preview', 'MIT', 'Core has zero dependencies'],
    core: {pkg: 'webxr-environment', sub: 'environment document · presets · audio director · occlusion · light estimation · world sensing'},
    mapItems: [
      {pkg: 'threejs-environment', sub: 'adapter'},
      {pkg: 'iwsdk-environment', sub: 'adapter'},
      {pkg: 'xrblocks-environment', sub: 'adapter, experimental, builds on three.js'},
    ],
    reasons: [
      {title: 'An environment as one document', body: 'Sky, fog, ambient light, key light and an environment map for image-based lighting, as plain data. Name a preset, then ease to it: every slot moves together on one curve.'},
      {title: 'One owner for the background', body: 'Passthrough is a suppression on top of the one writer, not a second writer. The sky stops being drawn while the real world shows and comes back unchanged afterwards.'},
      {title: 'Sensors that admit when they do nothing', body: 'Depth occlusion, light estimation and world sensing report unsupported, unavailable, pending or active, each with a sentence saying why. Nothing fails silently.'},
    ],
    adaptersHeading: 'Pick an adapter',
    adaptersLead: 'Install exactly one. Each re-exports the core, so you never install the core yourself. A Babylon.js adapter is pending an estate-wide review.',
    adapters: [
      {title: 'three.js and raw WebXR', pkg: 'threejs-environment', body: 'A gradient sky as an equirectangular texture regenerated in place, Fog and FogExp2, an AmbientLight and a DirectionalLight, Web Audio playback, light estimation straight from WebXR.', status: 'full', statusLabel: 'full', href: '/webxr/docs/environment/integrations/threejs'},
      {title: 'Meta IWSDK', pkg: 'iwsdk-environment', body: 'Drives IWSDK\'s own DomeGradient, IBL and light components, AudioSource entities and depth occlusion. IWSDK 0.5 has no light estimation, and the adapter says so. Setup is one call: registerEnvironment(world).', status: 'full', statusLabel: 'full', href: '/webxr/docs/environment/integrations/iwsdk'},
      {title: 'Google XR Blocks', pkg: 'xrblocks-environment', body: 'The three.js adapter plus two sensors: XR Blocks\' depth occlusion and its Lighting manager for light estimation.', status: 'experimental', statusLabel: 'experimental', href: '/webxr/docs/environment/integrations/xrblocks'},
      {title: 'Babylon.js', pkg: 'pending', body: 'Waits on a review across all five families rather than being started here.', status: 'pending', statusLabel: 'pending', href: '/webxr/docs/environment/basics/roadmap'},
    ],
    glossary: [
      ['Environment', 'the setting: what the sky looks like, how far you can see, what colour the light is'],
      ['Cue', 'a sound the app knows how to make, played by name'],
      ['Preset', 'a named environment, possibly partial, that the director eases to'],
      ['Passthrough', 'the real world showing through; a suppression of the sky, pushed in by the app'],
      ['Report', 'what a sensor says about itself: unsupported, unavailable, pending or active, with a reason'],
    ],
    repo: links.repos.environment,
    demo: {label: 'Environment playground', ...links.demos.environment},
    cardBody: 'The world around the player as one document: sky, fog, light, image-based lighting, passthrough, occlusion, world sensing and the sound in it.',
    cardAdapters: 'three.js · IWSDK · XR Blocks',
    cardStatus: 'Preview',
    released: false,
  },
];

export function familyById(id: Family['id']): Family {
  const found = families.find((f) => f.id === id);
  if (!found) {
    throw new Error(`Unknown family ${id}`);
  }
  return found;
}

// The playground URL a family should link to today: the staging deploy while the family is pre-release,
// the production deploy once it has shipped a stable release.
export function demoUrl(family: Family): string | undefined {
  if (!family.demo) {
    return undefined;
  }
  return playgroundLinkMode === 'live' || family.released ? family.demo.live : family.demo.preview;
}

export function demoLabel(family: Family): string {
  return playgroundLinkMode === 'live' || family.released ? 'Live playground' : 'Preview playground';
}
