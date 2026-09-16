import fs from 'node:fs';
import path from 'node:path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config, PluginConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// The WebXR API reference is generated into webxr-api/ by `npm run api` (see api-sources.json and scripts/).
// The folder is gitignored, so the section only exists on builds that ran the generators (CI does).
const hasApiDocs = fs.existsSync(path.resolve(__dirname, 'webxr-api', 'index.md'));

// Second docs instance: the Reality Toolkit WebXR documentation. It has its own base path so the whole
// section can move to its own site later by changing routeBasePath alone.
const webxrDocsPlugin: PluginConfig = [
  '@docusaurus/plugin-content-docs',
  {
    id: 'webxr',
    path: 'webxr',
    routeBasePath: 'webxr/docs',
    sidebarPath: './webxr-sidebars.ts',
    editUrl: 'https://github.com/realitycollective/realitycollective.github.io/edit/main/',
    showLastUpdateTime: false,
  },
];

const webxrApiPlugin: PluginConfig = [
  '@docusaurus/plugin-content-docs',
  {
    id: 'webxr-api',
    path: 'webxr-api',
    routeBasePath: 'webxr/api',
    sidebarPath: './webxr-api-sidebars.ts',
    showLastUpdateTime: false,
  },
];

const webxrNavItems = [
  {to: '/webxr', label: 'Overview'},
  {type: 'docSidebar' as const, docsPluginId: 'webxr', sidebarId: 'stack', label: 'Start here'},
  {type: 'docSidebar' as const, docsPluginId: 'webxr', sidebarId: 'input', label: 'Input'},
  {type: 'docSidebar' as const, docsPluginId: 'webxr', sidebarId: 'interactions', label: 'Interactions'},
  {type: 'docSidebar' as const, docsPluginId: 'webxr', sidebarId: 'uiextensions', label: 'UI Extensions'},
  {type: 'docSidebar' as const, docsPluginId: 'webxr', sidebarId: 'environment', label: 'Environment'},
  ...(hasApiDocs ? [{to: '/webxr/api', label: 'API reference'}] : []),
];

const config: Config = {
  title: 'Reality Collective',
  tagline: 'Open source frameworks for XR, in Unity and on the web',
  favicon: 'img/favicon.ico',

  url: 'https://www.realitycollective.net',
  baseUrl: '/',

  organizationName: 'realitycollective',
  projectName: 'realitycollective.github.io',

  // Read by the React pages so API links only render when the reference was generated.
  customFields: {hasApiDocs},

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Space Grotesk for headings and IBM Plex Sans for body: the pairing shared with the Service Framework site.
  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
      type: 'text/css',
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [webxrDocsPlugin, ...(hasApiDocs ? [webxrApiPlugin] : [])],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/realitycollective/realitycollective.github.io/edit/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/realitycollective/realitycollective.github.io/edit/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/webxr-social-card.png',
    navbar: {
      title: 'Reality Collective',
      logo: {
        alt: 'Reality Collective',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'dropdown',
          label: 'Reality Toolkit WebXR',
          position: 'left',
          to: '/webxr',
          items: webxrNavItems,
        },
        {to: '/docs/welcome-to-the-reality-collective', label: 'Collective docs', position: 'left'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {to: '/about', label: 'About Us', position: 'left'},
        {to: '/mission', label: 'Our Mission', position: 'left'},
        {to: '/contribution', label: 'Contribution', position: 'left'},
        {
          href: 'https://discord.gg/YjHAQD2XT8',
          label: 'Discord',
          position: 'right',
        },
        {
          type: 'dropdown',
          label: 'GitHub',
          position: 'right',
          items: [
            {label: 'Reality Collective', href: 'https://github.com/realitycollective'},
            {label: 'WebXR-Input', href: 'https://github.com/realitycollective/WebXR-Input'},
            {label: 'WebXR-Interactions', href: 'https://github.com/realitycollective/WebXR-Interactions'},
            {label: 'WebXR-UIExtensions', href: 'https://github.com/realitycollective/WebXR-UIExtensions'},
            {label: 'WebXR-Environment', href: 'https://github.com/realitycollective/WebXR-Environment'},
            {label: 'This website', href: 'https://github.com/realitycollective/realitycollective.github.io'},
          ],
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Reality Toolkit WebXR',
          items: [
            {label: 'Overview', to: '/webxr'},
            {label: 'Start here', to: '/webxr/docs'},
            {label: 'Input', to: '/webxr/input'},
            {label: 'Interactions', to: '/webxr/interactions'},
            {label: 'UI Extensions', to: '/webxr/uiextensions'},
            {label: 'Environment', to: '/webxr/environment'},
            ...(hasApiDocs ? [{label: 'API reference', to: '/webxr/api'}] : []),
          ],
        },
        {
          title: 'Projects',
          items: [
            {label: 'Reality Toolkit', href: 'https://realitytoolkit.realitycollective.net/'},
            {label: 'Service Framework', href: 'https://serviceframework.realitycollective.net/'},
            {label: 'Reality Toolkit WebXR', to: '/webxr'},
          ],
        },
        {
          title: 'Collective',
          items: [
            {label: 'Blog', to: '/blog'},
            {label: 'About Us', to: '/about'},
            {label: 'Our Mission', to: '/mission'},
            {label: 'Contribution', to: '/contribution'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Discord', href: 'https://discord.gg/YjHAQD2XT8'},
            {label: 'GitHub', href: 'https://github.com/realitycollective'},
            {label: 'Twitter', href: 'https://twitter.com/realitytoolkit'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Reality Collective. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'json', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
