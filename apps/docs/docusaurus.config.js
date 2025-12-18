// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '$LUKAS Documentation',
  tagline: 'The Gravity Center of LatAm Pesos',
  favicon: 'img/favicon.ico',

  url: 'https://lukas-latam.com',
  baseUrl: '/documentation/',

  organizationName: 'lukas-latam',
  projectName: 'lukas-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/lukas-social-card.jpg',
      navbar: {
        title: '$LUKAS',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: 'docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'X',
                href: 'https://x.com/Lukas_lat',
              },
            ],
          },
          {
            title: 'Navigation',
            items: [
              {
                label: '← Back to Home',
                href: '#',
                target: '_self',
                className: 'footer-back-main',
              },
            ],
          },
        ],
        copyright: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.25em;">
            <span>Copyright © ${new Date().getFullYear()} $LUKAS. Built with Docusaurus.</span>
            <span style="font-size:0.95em;opacity:0.7;">v0.2.18</span>
          </div>
          <script>
            (function() {
              var setHomeLink = function() {
                var link = document.querySelector('.footer-back-main');
                if (link) {
                  var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                  link.setAttribute('href', isLocal ? 'http://localhost:3000' : 'https://lukas.lat');
                }
              };
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setHomeLink);
              } else {
                setHomeLink();
              }
            })();
          </script>
        `,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
