import fs from 'node:fs';
import path from 'node:path';
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Sidebar for the generated WebXR API reference (webxr-api/). scripts/generate-api-ts.mjs writes one
// typedoc-sidebar.cjs per family; a family whose output is absent is left out.
// Docusaurus loads this file through a CommonJS transform, so require and __dirname are available.
const apiDocsDir = path.resolve(__dirname, 'webxr-api');

const families: Array<{dir: string; label: string}> = [
  {dir: 'input', label: 'Input'},
  {dir: 'interactions', label: 'Interactions'},
  {dir: 'uiextensions', label: 'UI Extensions'},
  {dir: 'environment', label: 'Environment'},
];

const items: unknown[] = ['index'];

for (const {dir, label} of families) {
  const sidebar = path.join(apiDocsDir, dir, 'typedoc-sidebar.cjs');
  if (fs.existsSync(sidebar)) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const generated = require(sidebar) as unknown[];
    items.push({
      type: 'category',
      label,
      link: {type: 'doc', id: `${dir}/index`},
      items: generated,
    });
  }
}

const sidebars: SidebarsConfig = {
  api: items as SidebarsConfig['api'],
};

export default sidebars;
