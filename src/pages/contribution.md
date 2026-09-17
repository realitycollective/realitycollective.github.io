---
title: Contributing to the Reality Collective
description: How to contribute to the Reality Collective projects, from raising an issue to getting a pull request merged.
hide_table_of_contents: true
---

Thank you for choosing to contribute. The Reality Collective is an open community and welcomes contributions of any size, from a typo fix to a new adapter. This guide covers the steps to contribute code to any of the projects.

You can also support the Collective through GitHub Sponsors for its maintainers, [Simon Jackson](https://github.com/sponsors/SimonDarksideJ) and [Dino Fejzagić](https://github.com/sponsors/FejZa).

Please read this page in full before contributing.

## How to contribute

Every Reality Collective project has a `development` branch for daily work, and released projects also have a `main` branch holding the current release. New features and fixes are always submitted against `development`.

If you are looking for something to work on, start with the issues labelled "Help Wanted" in each project, for example in the [Service Framework](https://github.com/realitycollective/com.realitycollective.service-framework/issues?q=is%3Aissue+is%3Aopen+label%3A%22Help+Wanted%22). Let us know on the issue that you plan to work on it, so that nobody duplicates your effort.

:::important[Raise an issue before a PR]
An issue should precede any pull request that changes behaviour, whether it is a bug report, a proposed correction or new functionality. A minor fix or a documentation change can go straight to a pull request.
:::

The projects follow the standard [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow). You should be familiar with [using Git](https://docs.github.com/en/get-started/git-basics/set-up-git), [forking a repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) and [submitting a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

After you submit a pull request, the project's GitHub Actions workflows build your changes and run the tests; check the Actions tab of that repository for the result. Maintainers and contributors then review the change and give feedback to improve it. Once everyone is satisfied, we merge it.

## Quick guidelines

A few rules and suggestions for contributing to any Reality Collective project.

* :bangbang: **NEVER** commit code that you did not personally write or that you are not licensed to contribute.
* **PLEASE** keep a pull request focused on one topic and of a reasonable size, or we may ask you to split it.
* **PLEASE** write simple, descriptive commit messages.
* **DO NOT** surprise us with new APIs or large features. Open an issue to discuss the idea first.
* **DO NOT** reorder type members; it makes the change hard to compare in review.
* **DO** follow the existing style of the file you are changing, and the style of the project around it.
* **DO** add to the unit tests when adding a feature or fixing a bug.
* **DO NOT** send pull requests for style changes alone.
* **PLEASE** keep a civil and respectful tone when discussing and reviewing contributions.
* **PLEASE** tell others about the Reality Collective and your contributions.

## Licensing

Reality Collective projects are released under the [MIT License](https://opensource.org/license/MIT). See the `LICENSE` file in each repository.

We accept contributions in good faith that they are not bound by a conflicting licence. By submitting a pull request you agree to distribute your work under the project's licence and copyright.

When adding a new file, include the following header where the project uses one:

```csharp
// Copyright (c) Reality Collective. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
```

## Need more help?

Ask on our [Discord](https://discord.gg/YjHAQD2XT8), or raise an issue in the relevant project.

Thank you for reading this guide and for helping to make XR development better.

:heart: The Reality Collective
