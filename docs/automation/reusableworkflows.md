---
sidebar_position: 2
---

# Reusable workflows

The Reality Collective in its aim to remain open and sharing makes al of its automation pipelines available for any team to use, these can be found in our "[Reusable Workflows](https://github.com/realitycollective/reusableworkflows) repository.

> [https://github.com/realitycollective/reusableworkflows](https://github.com/realitycollective/reusableworkflows)

The pipeline is currently at Version 2, so all workflows should be referred to with the "@v2" tag when specifying the workflows.

> At this time, GitHub (for security reasons) does not allow reusable workflows to be access from outside your organisation (or via Fork's), so in order to use the workflows in your own repositories you will need to clone the workflows manually and create your own release tag.

## Workflows available

Below is a list of all the current workflows, their arguments and an overview of their capabilities:

### Run Unity UPM Build

*Script Name: rununityUPMbuild.yml*

Builds a UPM package from the repository (repository MUST be in UPM format) for Android, Standalone and UWP on a Windows host.

> Requires a Windows host setup with NodeJS, PowerShell 7 and Unity for the version to build on.


|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|unityVersion|Yes|string|Short or Long Unity version number, e.g. 2021.3 or 2021.3.21f1|
|dependencies|No|Special*|A Json definition containing branches and URLs to package dependencies|

See [Package Dependencies](#package-dependencies) for more details on building dependencies configuration.

### Run Multi-Version Unity UPM Build

*Script Name: rununityUPMbuildmultiversion.yml*

A multiple Unity version build script of the above UPM build script.  Runs with a pre-configured matrix of Major Unity versions on a Windows Host.

> Requires a Windows host setup with NodeJS, PowerShell 7 and Unity for the version to build on.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|dependencies|No|Special*|A Json definition containing branches and URLs to package dependencies|

See [Package Dependencies](#package-dependencies) for more details on building dependencies configuration.

### Tag Release

*Script Name: tagrelease.yml*

Creates a TAG release using the version number supplied in the parameters.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-host|Yes|string|The runner name to activate the workflow on|
|Version|Yes|string|The raw version number to tag the release with (e.g. 1.0.1), Tag will be prefixed with "v" in the repository.

### UpVersion and Tag Release

*Script Name: upversionandtagrelease.yml*

Performs a managed version upgrade of the "Package.json" in the repository and creates a TAG release once complete.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-host|Yes|string|The runner name to activate the workflow on|
|build-type|No|string|Sets the release type for the versioning, defaults to "pre-release" [^1]|
|target-branch|No|string|The name of the branch to target, defaults to the current working branch for the automation|

[^1] Type of build can be one of the following

    - 'build'         # Build release       - 1.0.0 -> 1.0.0-pre-release.0+1
    - 'pre-release'   # Pre-Release release - 1.0.0 -> 1.0.0-pre-release.1
    - 'patch-release' # Patch release       - 1.0.0-pre-release.1 -> 1.0.0 (reset preview version to current patch, no increase)
    - 'patch'         # Patch release       - 1.0.0 -> 1.0.1
    - 'minor'         # Minor release       - 1.0.0 -> 1.1.0
    - 'major'         # Major release       - 1.0.0 -> 2.0.0

## Utilities

### Get Package version from Package

*Script Name: getpackageversionfrompackage.yml*

Queries the Project.json definition of a package/folder and returns the current version number.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-host|Yes|string|The runner name to activate the workflow on|
|version-file-path|No|string|The path to the project.json, defaults to a project.json in the root of the repository|
|(output) packageversion|N/A|string|Returns the current version number in a Project.json|

### Get Unity version from Package

*Script Name: getunityversionfrompackage.yml*

Queries the Project.json definition of a package/folder and returns the current minimum Unity version number.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-host|Yes|string|The runner name to activate the workflow on|
|version-file-path|No|string|The path to the project.json, defaults to a project.json in the root of the repository|
|(output) unityversion|N/A|string|Returns the current minimum Unity version number in a Project.json|

### Get Unity version from Project

*Script Name: getunityversionfromproject.yml*

Queries the "ProjectVersion.txt" file of a Unity project and returns its current Unity Version number definition.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-host|Yes|string|The runner name to activate the workflow on|
|version-file-path|No|string|The path to the ProjectVersion.txt, defaults to a ProjectVersion.txt in the Packages folder from the root of the repository|
|(output) unityversion|N/A|string|Returns the current minimum Unity version number in a Project.json|

### Refresh Branch

*Script Name: refreshbranch.yml*

Pull changes from an upstream branch and merges then into the target branch.
E.G. Updating the Development branch with the recently merged changes in Main following a release.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-host|Yes|string|The runner name to activate the workflow on|
|target-branch|Yes|string|The name of the branch to target|
|source-branch|Yes|string|The name of the branch to pull upstream changes from|

### Validate Unity Install

*Script Name: validateunityinstall.yml*

A simple check script to validate the runner host environment for a specific version of Unity, supports both minimum (2020.3) and full (2020.3.16 / 2020.3.16f1) version numbers as input.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-target|Yes|string|The runner os to activate the workflow on|
|unityversion|Yes|string|The version of the Unity editor the automation should check for|
|(output) unityeditorversion|N/A|string|Returns Unity version number of the installed version|
|(output) unityversion|N/A|string|A flag to denote whether Unity was found to be installed or not|

## Testing workflows

### Test Parameters

*Script Name: testparams.yml*

A simple test script that outputs to the log the output from another job/step.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-host|Yes|string|The runner name to activate the workflow on|
|teststring|Yes|string|The variable output from another job/step to validate|

Example use:

```yml
  Check-Params-unityversion:
    needs: validate-environment
    uses: realitycollective/reusableworkflows/.github/workflows/testparams.yml@v2-beta
    name: Test output from Validate
    with:
      build-target: windows
      teststring: ${{ needs.validate-environment.outputs.unityversion }}
```

## Deprecated workflows

### Install Unity Editor (maintained for reference - unused)

*Script Name: installunityeditor.yml*

A deprecated script intended to be used to install a version of Unity if it was not found.  Deprecated because the Unity-Hub install was unreliable.

|Parameter|Mandatory|Type|Description|
|-|-|-|-|
|build-target|Yes|string|The runner name to activate the workflow on|
|unityversion|Yes|string|The version of the Unity editor the automation should check for|
|modules|No|Space separated array|The list of additional Unity modules to install, e.g. "webgl android lumin"

## Package Dependencies

Dependency option requires an input string in json format, listing each dependency by **branch name** and **git url**, e.g.

> $dependencies = '[{"ASADependencies": "github.com/SimonDarksideJ/upmGithubActionsTests.git"}]'

**Note** remove the **"https://"** portion to allow using a PAT to access the repo
The Name of the dependency should ALSO MATCH the name of the branch on the repository where the dependency is held (files intended for the packages folder)

Additionally, if Manifest entries are required, then a manifest file with those dependencies (and ONLY the new dependencies) should also be in the dependency branch named the same as the branch name
e.g. "ASADependencies.json" - keep the same structure, but only the dependency entries.

> See the SpatialPersistence repository and build configuration for an example:
>
> [https://github.com/realitycollective/com.realitytoolkit.spatial-persistence.asa](https://github.com/realitycollective/com.realitytoolkit.spatial-persistence.asa)

!!Does NOT support additional scoped registries at this time!
