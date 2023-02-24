---
sidebar_position: 1
---

# Release Pipelines

The Reality Collective has invested a significant amount of time building and developing the automation flow to manage the tricky task of ensuring that app packages and projects built by the team are both versioned correctly and verified to ensure any and all issues are identified early in the development process.

The ultimate aims are as follows:

* Ensure development releases are defined as previews and version maintained.
* Validate each and every check-in to ensure it builds and validates for all versions of Unity that the packages support.
* Validate each and every check-in to ensure it builds and validates for all platforms that the packages support.
* Identify any current issues with development both against the developed release and future Unity versions.
* Maintain a proper release cadence for published releases.

## Current Pipelines

Below is a list of the current pipelines and their intended function and use.

### Development - Build and Test UPM Release

The aim of this pipeline is to test and build any Pull Requests made to Reality Collective packages projects, this includes any pull requests targeting the development branch (feature branches) or any submitted changes to feature branches (excluding main).

The steps of the workflow are as follows:

1. Validate Environment
    Gets the current minimum target version of Unity from the target package.

2. Validate Unity
    Validates the build server environment to check there is a version of Unity installed for the packages requested release.
At this time we have suspended automatically installing the required / latest version of Unity as the Unity hub is too unreliable to depend on, instead the latest build of Unity is used for the requested Minor version (e.g. 2021.3.25 for requested version 2021.3)

3. Run Unit Tests and build
    Runs all defined Unit tests for the UPM package and performs test builds on the supported operating systems for the target version of Unity.

Once finished, a Log is uploaded with the results of the tests.

> Note, ALL PR'S require the automation to be completed successfully in order to be merged.

There is a multi-version build script available which will also check MULTIPLE versions of Unity against a package which is being experimented with for future use.

### Development Publish

As the published version of the development branch needs to be maintained, this is managed automatically by the automation process.  Once changes are merged into development the version of Development is updated and a new Tag is published, marking a new development release.  This is then automatically consumed by OpenUPM which watches the repository for version changes.

> Note the versioning name has changed of late due to the updates by Unity, now ignoring the "preview" tag, so all versions now use the NPM standard "pre-release" instead.

### Main Publish

Publishing full releases is a little more involved, as you would expect and the pipelines can adapt to meet the needs of a release, as follows:

* For a default **patch** release, a "Patch" version is published, requiring a PR from the Development branch targeting the Main branch.  *This is the default path*.  This will update the version as follows "1.0.0-pre-release.1 -> 1.0.0".
* For a **Minor** release, a special PR is required from the Development branch targeting the Main branch specifying the keyword "minor-release" to be included with the **PR title**.  This will update the Minor version as follows "1.0.0 -> 1.1.0".
* For a **Major** release, a special PR is required from the Development branch targeting the Main branch specifying the keyword "major-release" to be included with the **PR title**.  This will update the Minor version as follows "1.0.0 -> 2.0.0".

There is an additional special workflow for emergency releases which will take the current version of the source branch and simply create a release WITHOUT up versioning the current version.  To enact this, simply create a PR targeting the Main branch specifying the keyword "no-ver" in the title.

> Only be used under strict guidance.

Once the Main branch is updated and released, the development branch version is updated (to be a patch version higher that Main/Release) to begin the next development cycle.  This does NOT product a new Tag release (as it is considered to be a mirror of the current production release).

## Summary

For any queries related to the automation workflow, please talk to the team via discord, or raise an [RFI request](https://github.com/realitycollective/realitytoolkit.dev/issues/new?assignees=&labels=question&template=request_for_information.md&title=) on GitHub.
