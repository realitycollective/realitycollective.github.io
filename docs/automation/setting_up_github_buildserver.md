---
sidebar_position: 1
---

# Setting up a GitHub Build Server

All the Reality Collective projects are all automated using [self hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners) on GitHub using GitHub actions.  These make use of several [reusable workflows](https://github.com/realitycollective/reusableworkflows) to test, build and package all the projects.

To operate these and reduce costs we self host our own build servers which need to be setup accordingly, which the following guide details the setup process.

## Software Requirements

* [Unity Hub](https://unity.com/unity-hub) - plus clients
* [Visual Studio](https://visualstudio.microsoft.com/) - any edition (can just use the version installed with Unity)
* [NodeJS - V16+](https://nodejs.org/en/download/)
* [Powershell 7](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.2) (not just the version included with Win11)
* [DotNet 6 SDK](https://dotnet.microsoft.com/en-us/download/dotnet)
* [Java JRE 8+](https://www.java.com/en/download/)
* [Git for Windows](https://gitforwindows.org/)
* [Github Runner client](https://github.com/actions/runner/releases)
* (optional) [VSCode](https://code.visualstudio.com/)

## Server setup process

For the main part, it is simply a case of getting all the software installed and registered in the following order:

1. Install [NodeJS - V16+](https://nodejs.org/en/download/), making sure to also opt in to the additional Chocolatey dependencies.
2. Install [Powershell 7](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.2) to ensure all the paths and latest versions of the tools are installed.
3. Install [Git for Windows](https://gitforwindows.org/) for all Git related operations got the Actions.
4. Install the [DotNet 6 SDK](https://dotnet.microsoft.com/en-us/download/dotnet), note it is the SDK for your platform, e.g. the 64bit client for most cases.
5. Install the latest [Java JRE 8+](https://www.java.com/en/download/), required only for Android builds.
6. Install the latest [Unity Hub](https://unity.com/unity-hub) and all the latest client versions your builds require. (The automation scripts will auto-install Unity versions, but it can be unreliable, because Unity...)
7. Optionally, you can also install [VSCode](https://code.visualstudio.com/) which helps managing the environment and diagnosing any build issues on the server (plus its awesome)

## GitHub runner setup

Once the environment is setup, you will need to install the GitHub Actions runners for either your Organisation or individual projects (the process is the same).  Repeat the following process for each runner you want to setup (the Reality Collective has at least 6 runners setup on each machine for reference, just setup how many you need):

1. Download the latest [Github Runner client](https://github.com/actions/runner/releases) to the build server
2. **Important** Create a new folder at the ROOT of a drive (preferably your fastest drive, e.g. ssd) with a single letter (keep it short).  For example, we setup a folder called "g" (for GitHub)
3. Extract the GitHub runner client to a folder in the new folder with the name of the runner you want to setup, e.g. "realitycollective-01"
4. In a browser, navigate to the "Runners" configuration ofr your Organisation or Project under "*Settings -> Actions -> Runners*"
5. Click on the "New runner" button which will take you to an instruction screen for setting up the runner
6. Copy the command from the "Configure" section which includes the setup token for the runner (which identifies and authenticates the runner client), e.g.

> ./config.cmd --url https://github.com/realitycollective --token MYSECRETTOKEN

7. On the build server, open a "Command Prompt" or "Terminal" window with **Elevated Permissions** (Run as administrator), e.g. "*Start -> Run -> CMD -> Run as administrator*"
8. Navigate to the folder you extracted the GitHub runner to, e.g. "*c:\g\realitycollective-01*"
9. Paste the command you copied (you might need to remove the ".\" from the command depending on the window you are using)
10. Hit enter (:D)
11. You will now be walked through several options to configure the runner.
12. Hit **Enter** to accept the default "Runner Group" (unless you have GitHub Enterprise, you can only have a SINGLE runner group)
13. Enter the name of the runner you want to configure, e.g. "realitycollective-01"
14. Hit **Enter** to accept the default labels for your runner. This identify the capabilities of the Build environment, the defaults should be fine.  (for more information, read about [GitHub actions labels](https://docs.github.com/en/actions/hosting-your-own-runners/using-labels-with-self-hosted-runners) here)
15. When prompted, enter "w" for the working folder, you can select the default _work, but better to keep folder lengths small.
16. You will then be asked if you want to "**Configure the Runner to run as a Service**", if you want to, hit "**Y**" (we always run it as a service)
17. When asked for the credentials, just hit **Enter** to accept the default, which is sufficient for most scenarios.  If you need additional permissions, then look to creating a Service Account on the build server.
18. This completes the runner setup.

> If your projects are "**Public**" repositories and this is the first time setting up GitHub Runners, you will also need to configure your "**Default Runner Setup**" to be able to use Public repositories (by default, ONLY Private repos are allowed).  Simply navigate back to the Runner Configuration on GitHub via "*GitHub -> Settings -> Actions -> Runner Groups*", click on the **Default** group and click the checkbox to "**Allow public repositories**"

## Trouble shooting

One issue we occasionally run in to, is that Unity does not enable the default permissions for building Android projects, resulting in such errors as "Build failure, unable to update the SDK"

To resolve this, [follow the instructions in this post](https://stackoverflow.com/questions/54010590/unity-build-failure-unable-to-update-the-sdk) to try and resolve the issue.
FOr no reason, different fixes are needed at different times, but you only need to solve this once.