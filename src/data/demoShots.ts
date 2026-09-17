// Screenshots of the live playgrounds for the /webxr carousel. Taken 2026-09-17 from the production hosts on
// their desktop builds (mouse fallback, no headset) at 1280x720, stored at 640x360 under static/img/webxr/shots.
// Each tile links to the playground it was taken from. Order mixes the families so no two neighbours match.
import {links} from '@site/src/links';

export interface DemoShot {
  src: string;
  alt: string;
  caption: string;
  href: string;
}

const shots = '/img/webxr/shots';

export const demoShots: DemoShot[] = [
  {src: `${shots}/interactions-overview.webp`, alt: 'The interaction playground: seven stations on a ring of dark plinths with their description panels above', caption: 'Interaction playground', href: links.demos.interactions.live},
  {src: `${shots}/uix-showcase-overview.webp`, alt: 'The UI Extensions showcase: six windows floating over a grid floor with two glowing dock regions', caption: 'UI Extensions showcase', href: links.demos.uiShowcase.live},
  {src: `${shots}/environment-noon.webp`, alt: 'The environment playground at noon: a grey knot sculpture on a plinth under a blue gradient sky', caption: 'Environment playground, noon', href: links.demos.environment.live},
  {src: `${shots}/uix-lab-xrblocks.webp`, alt: 'The multiplatform lab on the Google XR Blocks pipeline: the same windows inside a simulated living room', caption: 'Multiplatform lab, XR Blocks', href: links.demos.uiLab.live},
  {src: `${shots}/interactions-levers.webp`, alt: 'The wall levers and table lever stations of the interaction playground', caption: 'Interaction playground, levers', href: links.demos.interactions.live},
  {src: `${shots}/uix-showcase-hand-menu.webp`, alt: 'The Window Control hand menu, a vertical stack of buttons, beside the Player Status window it drives', caption: 'UI Extensions, hand menu', href: links.demos.uiShowcase.live},
  {src: `${shots}/environment-dusk.webp`, alt: 'The environment playground at dusk: warm low light on the knot sculpture', caption: 'Environment playground, dusk', href: links.demos.environment.live},
  {src: `${shots}/uix-lab-desktop.webp`, alt: 'The multiplatform lab on the plain three.js pipeline: the showcase windows on a dark grid', caption: 'Multiplatform lab, three.js', href: links.demos.uiLab.live},
  {src: `${shots}/interactions-dial-pulley.webp`, alt: 'The push button, dial and pulley stations of the interaction playground', caption: 'Interaction playground, dial and button', href: links.demos.interactions.live},
  {src: `${shots}/environment-panel.webp`, alt: 'The environment playground with its control panel: preset buttons, passthrough and occlusion toggles, bus sliders and the sensing report', caption: 'Environment playground, controls', href: links.demos.environment.live},
  {src: `${shots}/interactions-centre.webp`, alt: 'The interaction playground seen from the start position, every station in view', caption: 'Interaction playground, all stations', href: links.demos.interactions.live},
  {src: `${shots}/environment-overcast.webp`, alt: 'The environment playground under the overcast preset: a flat grey sky', caption: 'Environment playground, overcast', href: links.demos.environment.live},
];
