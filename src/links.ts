// External destinations used by the homepage and the WebXR pages. Kept in one place so they change once.
// Which playground host the site links to. 'live' links the production hosts everywhere (the decision of
// 2026-09-16: publish the live addresses and move the packages to 1.0.0 as soon as possible). 'status'
// links a pre-release family to its preview host until its released flag in src/data/families.ts flips.
export const playgroundLinkMode: 'live' | 'status' = 'live';

export const links = {
  discord: 'https://discord.gg/YjHAQD2XT8',
  github: 'https://github.com/realitycollective',
  realityToolkit: 'https://realitytoolkit.realitycollective.net/',
  serviceFramework: 'https://serviceframework.realitycollective.net/',
  npmScope: 'https://www.npmjs.com/org/realitycollective',
  licence: 'https://github.com/realitycollective/WebXR-Input/blob/main/LICENSE',
  repos: {
    input: 'https://github.com/realitycollective/WebXR-Input',
    interactions: 'https://github.com/realitycollective/WebXR-Interactions',
    uiextensions: 'https://github.com/realitycollective/WebXR-UIExtensions',
    environment: 'https://github.com/realitycollective/WebXR-Environment',
  },
  // Cloudflare Pages projects. Production deploys from each repository's main branch; the -test projects are
  // the staging deploys. A pre-release family links to staging until its first stable release.
  demos: {
    interactions: {live: 'https://webxr-interactions.pages.dev', preview: 'https://webxr-interactions-test.pages.dev'},
    environment: {live: 'https://webxr-environment.pages.dev', preview: 'https://webxr-environment-test.pages.dev'},
    uiShowcase: {live: 'https://webxr-uiextensions.pages.dev', preview: 'https://webxr-uiextensions-test.pages.dev'},
    uiLab: {live: 'https://webxr-uix-lab.pages.dev', preview: 'https://webxr-uix-lab-test.pages.dev'},
  },
};
