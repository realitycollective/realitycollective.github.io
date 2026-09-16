// Generates the WebXR API reference into webxr-api/<family>/ with TypeDoc, one run per repository so
// each family gets its own sidebar and index. Requires each checkout (npm run api:fetch, or <ENV>_DIR)
// with its node_modules installed.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {apiDocsDir, readSources, rootDir, run, source, sourceNames, walk} from './lib.mjs';

const typedocBin = path.join(rootDir, 'node_modules', 'typedoc', 'bin', 'typedoc');
const labels = Object.fromEntries(Object.entries(readSources()).map(([k, v]) => [k, v.label ?? k]));

for (const name of sourceNames()) {
  const {dir, repo: repoUrl} = source(name);
  const packagesDir = path.join(dir, 'packages');
  if (!fs.existsSync(packagesDir)) {
    throw new Error(`[${name}] sources not found at ${packagesDir}. Run "npm run api:fetch" first.`);
  }
  if (!fs.existsSync(path.join(dir, 'node_modules'))) {
    throw new Error(`[${name}] checkout has no node_modules. Run "npm run api:fetch" (or npm ci inside ${dir}).`);
  }

  const outDir = path.join(apiDocsDir, name);
  const packages = fs
    .readdirSync(packagesDir, {withFileTypes: true})
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(packagesDir, e.name, 'package.json')))
    .map((e) => path.join(packagesDir, e.name).split(path.sep).join('/')); // TypeDoc treats entry points as globs and rejects backslashes

  run(process.execPath, [
    typedocBin,
    '--options', path.join(rootDir, 'typedoc.json'),
    '--out', outDir,
    '--name', `${labels[name]} API`,
    '--entryPoints', ...packages,
  ], {label: `[${name}] typedoc (${packages.length} packages) -> ${path.relative(rootDir, outDir)}`});

  const sidebar = path.join(outDir, 'typedoc-sidebar.cjs');
  if (!fs.existsSync(sidebar)) {
    throw new Error(`[${name}] expected ${sidebar} to be generated`);
  }

  // Generated pages are parsed as CommonMark rather than MDX (front matter "mdx.format: md"), so braces or
  // angle brackets in TSDoc prose cannot break the site build. The title comes from the page's H1.
  const pages = walk(outDir, (f) => f.endsWith('.md'));
  const repoBase = repoUrl.replace(/\.git$/, '');
  const sha = spawnSync('git', ['-C', dir, 'rev-parse', 'HEAD'], {encoding: 'utf8'}).stdout?.trim() || 'HEAD';
  for (const file of pages) {
    let src = fs.readFileSync(file, 'utf8');
    if (src.startsWith('---')) {
      continue;
    }
    // Package READMEs link to files next to them (./LICENSE, ./Examples/...). Point those at GitHub.
    // With one package in the repository TypeDoc writes that README as the family's own index.md.
    const posixFile = file.split(path.sep).join('/');
    const pkgMatch = posixFile.match(/\/@realitycollective\/([^/]+)\/index\.md$/);
    const readmePkg = pkgMatch ? pkgMatch[1] : packages.length === 1 && posixFile === `${outDir.split(path.sep).join('/')}/index.md` ? path.basename(packages[0]) : null;
    if (readmePkg) {
      // A README's ./LICENSE or ./Examples link points at the package folder on GitHub when the file is
      // there, and at the repository root otherwise (every repository keeps one LICENSE at its root).
      src = src.replace(/\]\(\.\/([^)#]+)\)/g, (m, rel) => {
        if (fs.existsSync(path.join(path.dirname(file), rel))) {
          return m;
        }
        const inPackage = fs.existsSync(path.join(dir, 'packages', readmePkg, rel));
        return inPackage ? `](${repoBase}/blob/${sha}/packages/${readmePkg}/${rel})` : `](${repoBase}/blob/${sha}/${rel})`;
      });
    }
    // TypeDoc copies markdown files a README links to outside its package into _media/, which Docusaurus
    // ignores (underscore-prefixed paths are partials). Point those links at the repository instead.
    src = src.replace(/\]\((?:\.\.\/)*_media\/[^)]+\)/g, `](${repoBase}/tree/${sha})`);
    const h1 = src.match(/^#\s+(.+)$/m);
    const title = h1 ? h1[1].replace(/\\([<>|])/g, '$1').replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') : path.basename(file, '.md');
    const frontMatter = ['---', `title: "${title.replace(/"/g, '\\"')}"`, 'mdx:', '  format: md', 'custom_edit_url: null', '---', ''].join('\n');
    fs.writeFileSync(file, frontMatter + src);
  }
  // The copied _media files are not linked any more and would otherwise be ignored partials.
  fs.rmSync(path.join(outDir, '_media'), {recursive: true, force: true});
  console.log(`[${name}] API written to ${path.relative(rootDir, outDir)} (${pages.length} pages)`);
}
