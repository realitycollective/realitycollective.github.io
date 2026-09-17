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

  // Rspack, SWC and the faster bundler pipeline: the site has about 1,500 pages once the API reference is
  // generated, and this cuts the CI build time without changing the output.
  future: {
    faster: true,
    // faster's SSG worker threads need this v4 flag; it removes a legacy postBuild "head" argument no
    // plugin here uses.
    v4: {removeLegacyPostBuildHeadAttribute: true},
  },

  // The Google Fonts stylesheet below is render-blocking; opening the two connections early shortens
  // the time to first text.
  headTags: [
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
  ],

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

  plugins: [webxrDocsPlugin, ...(hasApiDocs ? [webxrApiPlugin] : []), ['./plugins/latest-posts.ts', {count: 2}]],

  themes: [
    // Offline search, built at build time, so it needs no account and works on the PR previews too. The
    // API reference is left out of the index: 1,426 generated pages would swamp the results and the
    // TypeDoc pages have their own module index.
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: ['docs', 'webxr/docs'],
        docsPluginIdForPreferredVersion: 'default',
        ignoreFiles: [/^webxr-api\//],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
      },
    ],
  ],

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
    // Site-wide default social card, 1200x630 (1.91:1). The WebXR launch post sets its own card in front matter.
    image: 'img/rc-social-card-og.png',
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
        // One dropdown for the Collective's own pages: seven top-level items wrapped the navbar onto two
        // lines and truncated the site title between 997px and about 1250px.
        {
          type: 'dropdown',
          label: 'Collective',
          position: 'left',
          to: '/docs/welcome-to-the-reality-collective',
          items: [
            {to: '/docs/welcome-to-the-reality-collective', label: 'Collective docs'},
            {to: '/about', label: 'About Us'},
            {to: '/mission', label: 'Our Mission'},
            {to: '/contribution', label: 'Contribution'},
          ],
        },
        {to: '/blog', label: 'Blog', position: 'left'},
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
            {label: 'Reality Toolkit (Unity)', href: 'https://github.com/realitycollective/com.realitytoolkit.core'},
            {label: 'Service Framework (Unity)', href: 'https://github.com/realitycollective/com.realitycollective.service-framework'},
            {label: 'Service Framework (TypeScript)', href: 'https://github.com/realitycollective/com.realitycollective.service-framework.ts'},
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
            {label: 'X (Twitter)', href: 'https://x.com/realitytoolkit'},
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
