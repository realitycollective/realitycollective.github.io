---
title: Contribution
description: How to contribute
hide_table_of_contents: true
---

# Contributing to the Reality Collective

We are happy that you have chosen to contribute to the Reality Collective and its projects, we are a trully open community and support any contributions small or large. This simple guide was written to guide you throug the steps to contirbute code.

Alternatively, you can choose to support the Reality Collective and it's projects though GitHub sponsors (other options coming soon).

Please read this document completely before contributing.

## How To Contribute

All Reality Collective projects have `development` branch for daily development, released packages also have a `Main` branch for the current active release.  New features and fixes are always submitted to the `development` branch.

If you are looking for ways to help, you should start by looking at the "Help Wanted tasks" in each project, for example in the [Service Framework](https://github.com/realitycollective/com.realitycollective.service-framework/issues?q=is%3Aissue+is%3Aopen+label%3A%22Help+Wanted%22).  Please let us know if you plan to work on an issue so that others are not duplicating your work.

> !! An Issue should proceed any PR to outline the change (Unless it is minor or a documentation update), whether it is an actual bug report, a proposal for correction, or additional functionality.

The Reality Collective projects follow the standards [GitHub flow](https://guides.github.com/introduction/flow/index.html).  You should learn and be familiar with how to [use Git](https://help.github.com/articles/set-up-git/), how to [create a fork of any Reality Collective project](https://help.github.com/articles/fork-a-repo/), and how to [submit a Pull Request](https://help.github.com/articles/using-pull-requests/).

After you submit a PR, the [Reality Collective build servers](https://github.com/realitycollective/com.realitycollective.service-framework/actions/) will build your changes and verify that all tests pass (CHeck the `Actions` tab for the respective project).  Project maintainers and contributors will review your changes and provide constructive feedback to improve your submission.

Once we are satisfied that your changes are good, we will merge your PR.

## Quick Guidelines

Here are a few simple rules and suggestions to remember when contributing to any Reality Collective project.

* :bangbang: **NEVER** commit code that you did not personally write.
* :bangbang: **NEVER** use decompiler tools to steal code and submit it as your own work.
* :bangbang: **NEVER** decompile XNA assemblies and steal Microsoft's copyrighted code.
* **PLEASE** try to keep your PRs focused on a single topic and of a reasonable size or we may ask you to break it up.
* **PLEASE** be sure to write simple and descriptive commit messages.
* **DO NOT** surprise us with new APIs or big new features. Open an issue to discuss your ideas first.
* **DO NOT** reorder type members as it makes it difficult to compare code changes in a PR.
* **DO** try to follow our [coding style](CODESTYLE.md) for new code.
* **DO** give priority to the existing style of the file you are changing.
* **DO** try to add to our [unit tests](Tests) when adding new features or fixing bugs.
* **DO NOT** send PRs for code style changes or make code changes just for the sake of style.
* **PLEASE** keep a civil and respectful tone when discussing and reviewing contributions.
* **PLEASE** tell others about the Reality Collective and your contributions via social media.

## Licensing

Reality Collective projects are under the [Microsoft Public License](https://opensource.org/licenses/MS-PL).  See the `LICENSE.txt` file for more details.

We accept contributions in "good faith" that it is not bound to a conflicting license.  By submitting a PR you agree to distribute your work under the Reality Collective license and copyright.

To this end, when submitting new files, include the following in the header if appropriate:

```csharp
﻿// Copyright (c) Reality Collective. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
```

## Need More Help?

If you need help, please ask questions on our [Discord](https://discord.gg/YjHAQD2XT8) or raise issues in each respective project.

Thanks for reading this guide and helping make XR Development great!

 :heart: The Reality Collective