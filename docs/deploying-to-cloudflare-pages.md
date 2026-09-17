---
sidebar_position: 4
sidebar_label: "Deploying to Cloudflare Pages"
title: "Deploying to Cloudflare Pages with GitHub Actions"
description: "A step-by-step guide to deploying a static build to Cloudflare Pages from GitHub Actions, with per-PR staging, a short link and a QR code."
---

# Deploying to Cloudflare Pages with GitHub Actions

By the end of this guide, a repository with a static web build (a Vite app, a demo, a docs site) deploys itself to [Cloudflare Pages](https://developers.cloudflare.com/pages/) from GitHub Actions.
Every push to `main` updates production, and every pull request gets its own isolated staging deployment that production never sees.
The finished run also writes a step summary with the deployed URL, a short link and a QR code, so a teammate can open the build on a headset without typing anything.
This is the pattern the Reality Collective WebXR repositories use.

This is a step-by-step guide, not a "copy this file" guide.
Each step below says what to do, why, and what you should see when it works.
The complete workflow appears once, as a single file, in the appendix at the end, with a list of what to change for your own project.

## Before you start

You need three things.

- A repository on GitHub whose build produces a static folder, for example `dist` from a Vite build.
- A [Cloudflare](https://developers.cloudflare.com/pages/) account.
- Node 20 or later installed locally, so you can run the build once and confirm the output folder before wiring up CI.

## Step 1: create the API token and find your account id

The workflow authenticates to Cloudflare with an API token, never with your Cloudflare login.
Create one from **My Profile > API Tokens** for a personal token, or **Manage Account > API Tokens** for an account-scoped one, then choose **Create Token**; see [Cloudflare's token guide](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) for the full flow.
Give it the permission **Account > Cloudflare Pages > Edit**.
Edit covers both halves of what the workflow does: reading whether a Pages project already exists, and creating or updating one.

You also need your Cloudflare account id.
Cloudflare's [account and zone id guide](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/) lists two ways to find it: search for "Copy account ID" from Account Home, or open **Workers & Pages** and read it from the Account Details panel.

The token is not exercised until the first deploy runs in Step 5.
If it is wrong or under-permissioned, that step's Cloudflare API call fails with a non-200 response and the job stops with an `::error::` annotation, so a token problem shows up as a clear CI failure rather than a silent skip.

## Step 2: add the secrets to the repository

Add two values under **Settings > Secrets and variables > Actions**, either at the repository level or, if several repositories share one Cloudflare account, at the organisation level: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
GitHub's [secrets guide](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) documents both scopes and the menu path.

An unset secret does not fail a workflow; a `${{ secrets.NAME }}` reference to it simply evaluates to an empty string.
The reference workflow relies on exactly that: every deploy step is guarded by `if: env.CLOUDFLARE_API_TOKEN != ''`, so a fork's pull request, which GitHub never hands secrets to, still runs the full build-and-test gate and only skips the two deploy jobs.
That leaves the workflow usable as a pure build gate even before you add the secrets, which is worth confirming before you move on: push once with no secrets set and check that `build-test` still goes green.

## Step 3: set up the trigger

```yaml
on:
  push:
    branches:
      - main
      - development
  pull_request:
  merge_group:
  workflow_dispatch:

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

`push` on `main` and `development` gates every commit landing on either branch; only a push to `main` goes on to deploy, so `development` stays green without ever touching a Cloudflare project.
`pull_request` has no branch filter, so a PR into `development` is gated exactly like a PR into `main`.
`merge_group` lets the same checks report through a GitHub merge queue, if the repository enables one; see GitHub's [events reference](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows).
`workflow_dispatch` adds a manual "Run workflow" button, useful for re-running a production deploy after fixing a secret without needing a new commit.
The `concurrency` block cancels a superseded run on the same ref, so pushing twice in quick succession does not run the gate twice.

## Step 4: the build job

```yaml
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: package-lock.json

      - run: npm ci
      - run: npm run build
      - run: npm test

      - uses: actions/upload-artifact@v7
        with:
          name: app-dist
          path: dist
          if-no-files-found: error
```

`setup-node` with `cache: npm` keys its cache off `package-lock.json`, so a run only pays the full install cost when dependencies change.
`npm ci` installs from the lock file exactly, `npm run build` produces the static folder, and `npm test` acts as a gate: if tests fail, the job stops here and neither deploy job ever runs, because they both declare `needs: build-test`.
The reference workflow also runs a strict typecheck and a "pack and reinstall the package" check before its build, which is specific to a repository that publishes npm packages rather than only a site; a plain static site does not need that step.
`upload-artifact` uploads the built folder so the deploy jobs can download the exact same bytes rather than checking out and rebuilding.
That matters: it is the only way to be sure staging and production ever ship what the build job actually tested.
`if-no-files-found: error` turns an empty or missing `dist` into a hard failure instead of a silently empty deployment.

## Step 5: the production deploy job

```yaml
  deploy-production:
    needs: build-test
    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    steps:
      - uses: actions/checkout@v6

      - uses: actions/download-artifact@v7
        with:
          name: app-dist
          path: dist

      - name: Ensure the Cloudflare Pages project + production branch
        if: env.CLOUDFLARE_API_TOKEN != ''
        env:
          CF_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          PROJECT: my-app
          PROD_BRANCH: main
        run: |
          set -euo pipefail
          api="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects"
          code="$(curl -s -o /dev/null -w '%{http_code}' \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "${api}/${PROJECT}")"
          if [ "$code" = "200" ]; then
            resp="$(curl -fsS -X PATCH "${api}/${PROJECT}" \
              -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
              --data "{\"production_branch\":\"${PROD_BRANCH}\"}")"
          elif [ "$code" = "404" ]; then
            resp="$(curl -fsS -X POST "${api}" \
              -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
              --data "{\"name\":\"${PROJECT}\",\"production_branch\":\"${PROD_BRANCH}\"}")"
          else
            echo "::error::Unexpected HTTP ${code} querying the Pages project."
            exit 1
          fi
          if [ "$(printf '%s' "$resp" | jq -r '.success')" != "true" ]; then
            echo "::error::Cloudflare API call failed."
            exit 1
          fi

      - id: deploy
        if: env.CLOUDFLARE_API_TOKEN != ''
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: >-
            pages deploy dist
            --project-name=my-app
            --branch=${{ github.ref_name }}
            --commit-dirty=true
```

`needs: build-test` makes this job wait for the build job and gives it access to the uploaded artifact; the `if:` guard ANDs two conditions, so only a genuine push (a merge) to `main`, or a manual dispatch run against `main`, reaches the deploy steps, not a pull request that merely targets `main`.
`download-artifact` restores the exact folder the build job uploaded.

The "ensure the project" step does the setup a first-time Cloudflare Pages project needs, using the [Pages projects API](https://developers.cloudflare.com/pages/) directly with `curl`: it first `GET`s the project by name; a `200` means it already exists, so a `PATCH` pins its `production_branch`; a `404` means it does not, so a `POST` creates it with that branch already set; any other status fails the job outright.
Pinning the production branch on every run is deliberate and idempotent: it costs nothing when nothing changed, and it self-heals if someone edits the project settings by hand in the dashboard.
The step also checks the response body's `.success` field, because the Cloudflare API can return an HTTP success code with `success: false` in the body for some validation failures.

The deploy itself is one [`wrangler pages deploy`](https://developers.cloudflare.com/workers/wrangler/commands/#pages-deploy) call, run through the [`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action) so the token and account id never appear on the command line.
`--project-name` targets the project the previous step just ensured exists; `--branch=${{ github.ref_name }}` deploys as `main`, which matches the `production_branch` just pinned, so Cloudflare treats this as the production deployment; `--commit-dirty=true` tells Wrangler not to complain that the checkout in this job is not a clean match for the artifact it is deploying, since the job is deploying a downloaded build folder rather than a fresh checkout.
The action exposes a `deployment-url` output (`steps.deploy.outputs.deployment-url`), which Step 7 uses.

## Step 6: the staging deploy job

```yaml
  deploy-staging:
    needs: build-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    steps:
      - uses: actions/checkout@v6

      - uses: actions/download-artifact@v7
        with:
          name: app-dist
          path: dist

      # ... the same "ensure the project" step as Step 5, but with
      # PROJECT: my-app-test and PROD_BRANCH: staging

      - id: deploy
        if: env.CLOUDFLARE_API_TOKEN != ''
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: >-
            pages deploy dist
            --project-name=my-app-test
            --branch=staging
            --commit-dirty=true
```

This job only runs `if: github.event_name == 'pull_request'`, so a push to `development` is gated but never deployed anywhere.
It targets a project with a `-test` suffix, entirely separate from the production project, and pins that project's own `production_branch` to `staging` rather than `main`.

The `--branch` value is the one choice worth thinking about, and the two reference repositories make different ones.
`WebXR-Interactions` deploys staging with `--branch=pr-${{ github.event.pull_request.number }}`, which gives each open pull request its own alias URL, but nothing lives at the project's default URL.
`WebXR-UIExtensions` deploys staging with a fixed `--branch=staging` for every pull request.
Because that project's `production_branch` is also `staging`, this makes the project's own default URL (for example `my-app-test.pages.dev`) always serve whichever pull request deployed most recently.
The guide recommends the fixed `--branch=staging` form: it gives the team one stable, bookmarkable and QR-able staging URL, at the cost that only the latest pull request's build is visible there if two are open at once.

A pull request can never reach production here for two independent reasons: the production job's `if:` guard excludes the `pull_request` event outright, and even if it did not, this job only ever touches the separate `-test` project and its `staging` branch.

## Step 7: the step summary with short link and QR code

`$GITHUB_STEP_SUMMARY` is a per-step environment variable pointing at a temporary Markdown file; anything appended to it is rendered on that run's Summary page, up to 1 MiB per step (see GitHub's [job summary docs](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/workflow-commands-for-github-actions#adding-a-job-summary)).

The reference workflow's `.github/scripts/publish-shortlink.sh` turns the deployed apex URL into a short one using [da.gd](https://da.gd), a plain-text URL shortener with no account needed.
It never trusts the shortener's own "created" response, because da.gd can report a custom code as already taken while actually serving a dead 404 for it: every candidate is verified by requesting it and checking that the resolved redirect matches the target URL.
It tries the preferred code first, then up to two numbered alternates, then falls back to a random da.gd code, which da.gd deduplicates by target URL so the same random code comes back on every run.
On success it prints the verified short URL and exits `0`; if nothing could be verified, it prints nothing and exits `1`, and the workflow step falls back to publishing the direct URL with a `::warning::` annotation instead.

The QR code needs no library: the summary step embeds a Markdown image pointing at `https://api.qrserver.com/v1/create-qr-code/`, with the URL to encode passed as its `data` query parameter.
The finished summary is a heading naming the environment (PRODUCTION or STAGING), the short code as a large heading, a two-column table of the short code, the stable URL and this specific build's URL, each linking out, and the QR image underneath.

## Step 8: run it

Push a commit to `main`, or merge a pull request into it, to trigger a production deploy; open a pull request to trigger a staging deploy.
Watch the run under the repository's **Actions** tab, then open the finished run and read its **Summary** page for the table and QR code.
Scan the QR code with the headset browser's camera or its QR button to open the build directly.

If a deploy step shows as skipped in the log, check the "Ensure the Cloudflare Pages project" step first: a skip there means `CLOUDFLARE_API_TOKEN` was empty, so revisit Step 2's repository secrets.
If that step instead fails with an unexpected HTTP status or `success: false`, check for a project name collision, meaning another project in the account already owns that name, and change `PROJECT` in the workflow.

## Appendix: a complete workflow

```yaml
name: CI

on:
  push:
    branches:
      - main
      - development
  pull_request:
  merge_group:
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-test:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v6

      - uses: actions/setup-node@v6
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: package-lock.json

      - run: npm ci
      - run: npm run build
      - run: npm test

      - uses: actions/upload-artifact@v7
        with:
          name: app-dist
          path: dist
          if-no-files-found: error

  deploy-production:
    needs: build-test
    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    steps:
      - uses: actions/checkout@v6

      - uses: actions/download-artifact@v7
        with:
          name: app-dist
          path: dist

      - name: Ensure the Cloudflare Pages project + production branch
        if: env.CLOUDFLARE_API_TOKEN != ''
        env:
          CF_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          PROJECT: my-app
          PROD_BRANCH: main
        run: |
          set -euo pipefail
          api="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects"
          code="$(curl -s -o /dev/null -w '%{http_code}' \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "${api}/${PROJECT}")"
          if [ "$code" = "200" ]; then
            resp="$(curl -fsS -X PATCH "${api}/${PROJECT}" \
              -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
              --data "{\"production_branch\":\"${PROD_BRANCH}\"}")"
          elif [ "$code" = "404" ]; then
            resp="$(curl -fsS -X POST "${api}" \
              -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
              --data "{\"name\":\"${PROJECT}\",\"production_branch\":\"${PROD_BRANCH}\"}")"
          else
            echo "::error::Unexpected HTTP ${code} querying the Pages project."
            exit 1
          fi
          if [ "$(printf '%s' "$resp" | jq -r '.success')" != "true" ]; then
            echo "::error::Cloudflare API call failed."
            printf '%s\n' "$resp" | jq . 2>/dev/null || printf '%s\n' "$resp"
            exit 1
          fi

      - name: Deploy to Cloudflare Pages (production)
        id: deploy
        if: env.CLOUDFLARE_API_TOKEN != ''
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: >-
            pages deploy dist
            --project-name=my-app
            --branch=${{ github.ref_name }}
            --commit-dirty=true

      - name: Publish short code + QR
        if: steps.deploy.outcome == 'success'
        env:
          APEX_URL: https://my-app.pages.dev
          DEPLOY_URL: ${{ steps.deploy.outputs.deployment-url }}
        run: |
          set -uo pipefail
          if SHORT="$("${GITHUB_WORKSPACE}/.github/scripts/publish-shortlink.sh" "$APEX_URL" myapp)"; then
            SRC="verified"
          else
            echo "::warning title=Short link::No da.gd short link could be verified for ${APEX_URL} - publishing the direct URL."
            SHORT="$APEX_URL"; SRC="unavailable"
          fi
          disp() { local u="$1"; u="${u#https://}"; printf '%s' "${u#http://}"; }
          qrenc="$(jq -rn --arg u "$SHORT" '$u|@uri')"
          {
            echo "## my-app (PRODUCTION) - open on your headset"
            echo ""
            echo "# \`$(disp "$SHORT")\`"
            echo ""
            echo "| | |"
            echo "| --- | --- |"
            echo "| **Short code** | [\`$(disp "$SHORT")\`](${SHORT}) (${SRC}) |"
            echo "| **Stable URL** | [\`${APEX_URL}\`](${APEX_URL}) |"
            echo "| **This build** | [\`${DEPLOY_URL}\`](${DEPLOY_URL}) |"
            echo ""
            echo "![QR code](https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${qrenc})"
          } >> "$GITHUB_STEP_SUMMARY"

  deploy-staging:
    needs: build-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    steps:
      - uses: actions/checkout@v6

      - uses: actions/download-artifact@v7
        with:
          name: app-dist
          path: dist

      - name: Ensure the staging Cloudflare Pages project (my-app-test)
        if: env.CLOUDFLARE_API_TOKEN != ''
        env:
          CF_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          PROJECT: my-app-test
          PROD_BRANCH: staging
        run: |
          set -euo pipefail
          api="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects"
          code="$(curl -s -o /dev/null -w '%{http_code}' \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "${api}/${PROJECT}")"
          if [ "$code" = "200" ]; then
            resp="$(curl -fsS -X PATCH "${api}/${PROJECT}" \
              -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
              --data "{\"production_branch\":\"${PROD_BRANCH}\"}")"
          elif [ "$code" = "404" ]; then
            resp="$(curl -fsS -X POST "${api}" \
              -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json" \
              --data "{\"name\":\"${PROJECT}\",\"production_branch\":\"${PROD_BRANCH}\"}")"
          else
            echo "::error::Unexpected HTTP ${code} querying the staging Pages project."
            exit 1
          fi
          if [ "$(printf '%s' "$resp" | jq -r '.success')" != "true" ]; then
            echo "::error::Cloudflare API call failed."
            printf '%s\n' "$resp" | jq . 2>/dev/null || printf '%s\n' "$resp"
            exit 1
          fi

      - name: Deploy to Cloudflare Pages (staging)
        id: deploy
        if: env.CLOUDFLARE_API_TOKEN != ''
        uses: cloudflare/wrangler-action@v4
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: >-
            pages deploy dist
            --project-name=my-app-test
            --branch=staging
            --commit-dirty=true

      - name: Publish staging short code + QR
        if: steps.deploy.outcome == 'success'
        env:
          APEX_URL: https://my-app-test.pages.dev
          DEPLOY_URL: ${{ steps.deploy.outputs.deployment-url }}
        run: |
          set -uo pipefail
          if ! SHORT="$("${GITHUB_WORKSPACE}/.github/scripts/publish-shortlink.sh" "$APEX_URL" myapptest)"; then
            echo "::warning title=Short link::No da.gd short link could be verified for ${APEX_URL} - publishing the direct URL."
            SHORT="$APEX_URL"
          fi
          disp() { local u="$1"; u="${u#https://}"; printf '%s' "${u#http://}"; }
          qrenc="$(jq -rn --arg u "$SHORT" '$u|@uri')"
          {
            echo "## my-app (STAGING - my-app-test)"
            echo ""
            echo "> This PR deployed to the **isolated** \`my-app-test\` project."
            echo "> The live site \`my-app.pages.dev\` was **not** touched."
            echo ""
            echo "# \`$(disp "$SHORT")\`"
            echo ""
            echo "| | |"
            echo "| --- | --- |"
            echo "| **Short code** | [\`$(disp "$SHORT")\`](${SHORT}) |"
            echo "| **Staging URL** | [\`${APEX_URL}\`](${APEX_URL}) |"
            echo "| **This build** | [\`${DEPLOY_URL}\`](${DEPLOY_URL}) |"
            echo ""
            echo "![QR code](https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${qrenc})"
          } >> "$GITHUB_STEP_SUMMARY"
```

What to change for your own project:

- Both project names (`my-app` and its `-test` twin) in every `PROJECT` env and every `--project-name` flag, and the matching `APEX_URL` values.
- The build command (`npm run build`) and the output folder (`dist`) everywhere they appear, including the `path:` on both artifact steps.
- The branch names in `on.push.branches` if your integration branch is not called `development`.
- If you do not need staging: delete the whole `deploy-staging` job and drop `pull_request` from the `on:` block, unless you still want pull requests gated without a deploy, in which case keep the trigger and only delete the job.
- The short link script lives at `.github/scripts/publish-shortlink.sh` in the reference repository; copy it into your own repository at the same path and keep it executable (`chmod +x`), or delete the "Publish short code + QR" steps and publish `$APEX_URL` directly in the summary instead.

## More information

- [WebXR UI Extensions developer cycle: Loop 4, staging & production deploys](/webxr/docs/uiextensions/features/developer-cycle)
- [The reference workflow on GitHub](https://github.com/realitycollective/WebXR-UIExtensions/blob/main/.github/workflows/ci.yml)
- [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)
