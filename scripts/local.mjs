// One-shot local verification: install, fetch the four WebXR repositories, generate the API reference,
// build the site and serve it. Everything lives inside this folder (node_modules, .sources, webxr-api,
// build), so nothing is installed globally and the result matches what CI publishes.
//
//   npm run local                    full run, then serves ./build on http://localhost:3000
//   npm run local -- --dev           full run, then starts the hot-reloading dev server instead
//   npm run local -- --no-serve      full run, no server (CI-style check)
//   npm run local -- --skip-install  reuse the existing node_modules
//   npm run local -- --skip-fetch    reuse the existing .sources checkouts as they are
//   npm run local -- --skip-api      skip the API reference entirely
//
// Choosing what to document (branch, tag or commit; defaults come from api-sources.json):
//   npm run local -- --interactions-ref=feature/x --input-ref=v0.1.4
//   npm run local -- --input-dir=../WebXR-Input --interactions-dir=../WebXR-Interactions   (local checkouts, no fetch)
//
// The same settings are read from WEBXR_<FAMILY>_REF and WEBXR_<FAMILY>_DIR, which is what CI uses.
import fs from 'node:fs';
import path from 'node:path';
import {readSources, rootDir, run, which} from './lib.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => !a.includes('=')));
const values = Object.fromEntries(args.filter((a) => a.includes('=')).map((a) => a.replace(/^--/, '').split(/=(.*)/s).slice(0, 2)));
const flag = (name) => flags.has(`--${name}`);

const envFromArg = {};
for (const [name, entry] of Object.entries(readSources())) {
  envFromArg[`${name}-ref`] = `${entry.env}_REF`;
  envFromArg[`${name}-dir`] = `${entry.env}_DIR`;
}
for (const [arg, env] of Object.entries(envFromArg)) {
  if (values[arg] !== undefined) {
    process.env[env] = values[arg];
  }
}
const unknown = Object.keys(values).filter((k) => !(k in envFromArg));
if (unknown.length > 0) {
  throw new Error(`Unknown option(s): ${unknown.map((k) => '--' + k).join(', ')}`);
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) {
  throw new Error(`Node 20 or newer is required, found ${process.versions.node}`);
}
if (!which('git')) {
  throw new Error('git is required on PATH');
}

const step = (title) => console.log(`\n=== ${title} ===`);
const script = (name) => path.join(rootDir, 'scripts', name);
const overrides = Object.values(envFromArg).filter((e) => process.env[e]).map((e) => `${e}=${process.env[e]}`);
if (overrides.length > 0) {
  console.log(`Overrides: ${overrides.join('  ')}`);
}

step('Install site dependencies');
if (flag('skip-install') && fs.existsSync(path.join(rootDir, 'node_modules'))) {
  console.log('skipped');
} else {
  run('npm', ['ci', '--no-audit', '--no-fund'], {cwd: rootDir});
}

if (flag('skip-api')) {
  step('API reference');
  console.log('skipped');
} else {
  step('Fetch WebXR sources');
  if (flag('skip-fetch')) {
    console.log('skipped');
  } else {
    run(process.execPath, [script('fetch-sources.mjs')]);
  }

  step('Generate API reference');
  run(process.execPath, [script('generate-api-ts.mjs')]);

  step('Write API index');
  run(process.execPath, [script('generate-api-index.mjs')]);
}

step('Typecheck');
run('npm', ['run', 'typecheck'], {cwd: rootDir});

if (flag('dev')) {
  step('Dev server (Ctrl+C to stop)');
  run('npm', ['start'], {cwd: rootDir});
} else {
  step('Build');
  run('npm', ['run', 'build'], {cwd: rootDir});
  if (flag('no-serve')) {
    console.log('\nBuild complete: ./build');
  } else {
    step('Serve (Ctrl+C to stop)');
    run('npm', ['run', 'serve'], {cwd: rootDir});
  }
}
