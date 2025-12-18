/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started/what-is-lukas', 'getting-started/how-it-works'],
    },
    {
      type: 'category',
      label: 'Smart Contracts',
      items: ['contracts/overview', 'contracts/deployment', 'contracts/deployments'],
    },
    {
      type: 'category',
      label: 'SDK',
      items: [
        'sdk/overview',
        'sdk/installation',
        'sdk/core-concepts',
        'sdk/api-reference',
        'sdk/examples',
        'sdk/migration-guide',
        'sdk/troubleshooting',
      ],
    },
  ],
};

export default sidebars;
