// Writes webxr-api/index.md, the landing page for the API reference section.
// Records which repository refs the generated pages came from.
import fs from 'node:fs';
import path from 'node:path';
import {apiDocsDir, describeSource, ensureDir, readSources, source} from './lib.mjs';

const sources = readSources();

const lines = [
  '---',
  'title: API reference',
  'sidebar_label: Overview',
  'sidebar_position: 0',
  'custom_edit_url: null',
  '---',
  '',
  '# API reference',
  '',
  'Generated reference for every package in the four Reality Toolkit WebXR families. The pages are produced from the TSDoc comments in each repository at build time; edit the source comments, not these pages.',
  '',
  'Each adapter re-exports its core and the input contracts, so a symbol you use through an adapter is documented under the family that defines it. Types from `@realitycollective/webxr-input` are documented under Input.',
  '',
  '| Family | Packages | Source |',
  '| --- | --- | --- |',
];

let count = 0;
for (const [name, entry] of Object.entries(sources)) {
  if (!fs.existsSync(path.join(apiDocsDir, name, 'typedoc-sidebar.cjs'))) {
    continue;
  }
  count += 1;
  // Package names come from the checkout, because a single-package repository has no @realitycollective folder in its output.
  const packagesDir = path.join(source(name).dir, 'packages');
  const pkgs = fs.existsSync(packagesDir)
    ? fs.readdirSync(packagesDir).filter((p) => fs.existsSync(path.join(packagesDir, p, 'package.json'))).map((p) => '`' + p + '`').join(', ')
    : '';
  lines.push(`| [${entry.label ?? name}](./${name}/index.md) | ${pkgs} | ${describeSource(name)} |`);
}

lines.push('');

ensureDir(apiDocsDir);
fs.writeFileSync(path.join(apiDocsDir, 'index.md'), lines.join('\n'));
console.log(`API index written (${count} families)`);
