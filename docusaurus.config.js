// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Reality Collective',
  tagline: 'Official website of the Reality Collective',
  url: 'https://www.realitycollective.net',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'realitycollective',
  projectName: 'realitycollective.github.io',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/realitycollective/realitycollective.github.io/edit/development/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/realitycollective/realitycollective.github.io/edit/development/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Reality Collective',
        logo: {
          alt: 'Reality Collective',
          src: 'img/logo.png',
        },
        items: [
          {to: '/blog', label: 'Blog', position: 'left'},
          {to: '/about', label: 'About Us', position: 'left'},
          {to: '/mission', label: 'Our Mission', position: 'left'},
          {to: '/contribution', label: 'Contribution', position: 'left'},
          {
            href: 'https://discord.gg/YjHAQD2XT8',
            label: 'Join Us On Discord',
            position: 'left',
          },
          {
            href: 'https://github.com/realitycollective',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Pages',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'About Us',
                to: '/about',
              },
              {
                label: 'Our Mission',
                to: '/mission',
              },
              {
                label: 'Contribution',
                to: '/contribution',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/YjHAQD2XT8',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/realitytoolkit',
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/realitycollective',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Reality Collective. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
