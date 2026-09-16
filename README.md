# Reality Collective website

This repository holds the Reality Collective website at [https://www.realitycollective.net/](https://www.realitycollective.net/): the homepage, the blog, the Collective's own documentation, and the Reality Toolkit WebXR documentation with its generated API reference.

## Site structure

- `src/pages/index.tsx` is the homepage.
- `docs/` is the Collective's own documentation (welcome, build server, project templates, automation).
- `src/pages/webxr/` holds the Reality Toolkit WebXR header page and the four family overview pages. The overview pages share one component, `src/components/FamilyOverview`, fed by `src/data/families.ts`.
- `webxr/` is the Reality Toolkit WebXR documentation, a separate docs instance served at `/webxr/docs`. It has a Start here page, a `concepts/` folder, and one folder per family (`input`, `interactions`, `uiextensions`, `environment`), each with a Welcome page, `basics/`, `features/`, `integrations/` and `examples/`. Sidebars are in `webxr-sidebars.ts`.
- `webxr-api/` is the generated API reference, served at `/webxr/api` (not committed; see below).
- `blog/` is the blog.

The WebXR section has its own base paths so it can move to its own site later by changing `routeBasePath` in `docusaurus.config.ts`.

## Running the site locally

Requires Node 20 or newer and git.

The quickest check is the one-shot script. It installs dependencies, clones the four WebXR repositories into `.sources/`, generates the API reference into `webxr-api/`, builds the site and serves it on <http://localhost:3000>. Everything stays inside this folder.

```bash
npm run local                  # full run, then serves ./build
npm run local -- --dev         # full run, then the hot-reloading dev server
npm run local -- --no-serve    # full run, no server (what CI does)
npm run local -- --skip-fetch  # reuse the existing .sources checkouts
npm run local -- --skip-api    # no API reference, docs and pages only
```

The individual steps are also available:

```bash
npm ci
npm run api:fetch    # clone or update the WebXR repos listed in api-sources.json
npm run api:ts       # generate the API reference (TypeDoc, one run per family)
npm run api:index    # API landing page
npm run api          # all three of the above
npm run api:clean    # remove webxr-api/
npm start            # dev server; works with or without webxr-api/
npm run build        # production build, fails on broken links
npm run serve        # serve ./build
```

## Choosing which WebXR version to document

`api-sources.json` pins a repository and a ref (branch, tag or commit) for each family. Those are the defaults for CI and for `npm run local`. Change the file to move the published site to a new version.

For a one-off run against another branch, pass the ref on the command line or through the environment:

```bash
npm run local -- --interactions-ref=feature/scheduler-rework
WEBXR_INTERACTIONS_REF=feature/scheduler-rework npm run api        # same thing, step by step
```

To document an uncommitted local checkout instead, point the tool at the folder. Nothing is fetched for that family:

```bash
npm run local -- --input-dir=../WebXR-Input --interactions-dir=../WebXR-Interactions --uiextensions-dir=../WebXR-UIExtensions --environment-dir=../WebXR-Environment
```

The variables are `WEBXR_INPUT_REF`, `WEBXR_INTERACTIONS_REF`, `WEBXR_UIEXTENSIONS_REF`, `WEBXR_ENVIRONMENT_REF` and the matching `_DIR` variables. The `Test deployment` workflow exposes the four refs as inputs when run manually from the Actions tab, so a branch can be validated in CI before the pin is changed. The API landing page records which ref and commit each family was generated from.

## API reference

The API section is generated at build time and is not committed. Pages are produced from the TSDoc comments in the four repositories, so improvements belong there. Each family is a separate TypeDoc run over that repository's `packages/*`, which keeps one sidebar per family. Types an adapter re-exports from another repository (for example the input contracts) are documented under the family that defines them.

## Playground links and release status

Each family's playground is deployed to two Cloudflare Pages projects: production (`webxr-<name>.pages.dev`, from the repository's `main` branch) and staging (`webxr-<name>-test.pages.dev`). `playgroundLinkMode` in `src/links.ts` decides which host the site links: `'live'` (the current setting) links the production hosts everywhere, and `'status'` links a pre-release family to its staging host until its `released` flag in `src/data/families.ts` is set. The Start here page always lists both hosts. The markdown pages never carry a literal playground URL: they use the `<DemoLink>`, `<DemoHosts>`, `<PlaygroundTable>` and `<PlaygroundNote>` components from `src/components/DemoLinks`, registered for every page in `src/theme/MDXComponents.tsx`. When a family ships its first stable release, set its `released` flag to `true` and every page switches to the production host on the next build. Nothing else changes.

## Previewing a pull request

Every pull request runs the `Test deployment` workflow. It generates the API reference, builds the site and uploads the `build` folder as an artifact named `site-pr-<number>`. The workflow leaves a comment on the PR with a link to the artifact. Download it, unzip it and run `npx serve -s build` to browse the exact output the PR would publish.

## Deployment

Whenever a change lands on `main` the `Deploy to GitHub Pages` workflow builds the site and publishes it through `actions/deploy-pages`. The repository's Pages source must be set to "GitHub Actions" (Settings, Pages, Build and deployment) for this to take effect; the older `gh-pages` branch is no longer used.

![main](https://github.com/realitycollective/realitycollective.github.io/actions/workflows/deploy.yml/badge.svg?branch=main)

## Contributing

Target pull requests at the `main` branch. Documentation pages for the WebXR families live under `webxr/<family>/`; keep to the page shapes already there (Basics, Adapters, Examples) and state on every page which adapter does what.

© Reality Collective 2026
