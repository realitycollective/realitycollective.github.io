---
slug: serviceframework
title: The Service Framework has landed
authors: [simon, rony, dino]
tags: [welcome, service, framework]
---

[![Reality Collective Logo](https://github.com/realitycollective/realitycollective.logo/raw/main/Branding/RealityCollectiveBanner_600x300.png)](https://realitycollective.io/)

# A brave new world

Building projects in Unity is hard, if done right.  There are so many tools out there and lots of assets to choose from and not all of them play nicely together.
This gets even more tricky if you then need to have "managers" in your project that run in your scene or if you need connections to external services and components.

### **Enter the [Service Framework](https://service-framework.realitycollective.io/)**

---

## Getting the best performance for your code in Unity

What started out as an internal component of [Microsoft's MRTK](https://github.com/microsoft/MixedRealityToolkit-Unity) and then later on in the [XRTK](https://github.com/XRTK/com.xrtk.core), the Service Framework provided a fundamental management system for running all the high-priority capabilities of the toolkit with no latency.

This enabled you to create a "Service", which is a runtime component that continually runs and utilises Unity MonoBehaviour events such as Start, Update, Destroy. When registered with the Service Framework, it operates when and where it was needed, far better and more performant than just creating empty GameObjects just to run code.

It enables such capabilities as:

* Platform specific operation - choose which platforms your service runs on.
* Zero Latency from Unity operations - services are fully c# based with no Unity overhead.
* Ability to host several sub-services (data providers) as part of a service, automatically maintained by a parent service and also platform aware.
* Fully configurable with Scriptable profiles - Each service can host a configuration profile to change the behavior of your service without changing code.

However, due to its integral nature, it was not available outside of these toolkits and thus was limited in implementation.

**BUT NO MORE!!**

---

## Enter the **new and improved** [Service Framework](https://service-framework.realitycollective.io/)

[![](https://github.com/realitycollective/realitycollective.logo/raw/main/Branding/RealityCollectiveLogo_256.png)](https://service-framework.realitycollective.io/)

In essence, everything that was good and fantastic about the implementation in other frameworks has been extracted, improved and enhanced so that it is now available for **ANY Unity project**, not limited to XR.

On top of the previous capabilities, we have added and improved the framework with these additional features:

* Enables the Framework to run either as a single Managed GameObject, or as a private implementation within existing code
* Configurable to run as a single persistent manager for the lifetime of the project (current behaviour) or separately in each scene.
* Dynamic Inspector properties by default, reducing the need for custom inspectors for services (but still possible)
* Configuration run or Code run registration of services.
* Improved Service Generator for creating new services.
* Easy migration from other frameworks, only requiring namespace and base implementation changes (migration docs to follow)
* [Documentation!!](https://service-framework.realitycollective.io/docs/get-started) - still a Work in Progress but advancing quickly

There is so much more than can really be noted in a simple blog post, so we encourage you to check it out from our [new Homepage](https://realitycollective.io/)

## But what can I use it for?

The first and most obvious question for any framework, tool or utility is what can it be used for?

The answer for the Service Framework is a little bit open as it can be used for almost anything where you need a component in your project to run in the background or interact with external services.

Some of the use cases where the Service Framework has been used by our current partners and consumers include:

* A settings framework to track and maintain the current state of the application. (far better than a random static class)
* A communications service, that can provide different implementations based on the platform it is running on with no impact to the running application.
* A storage service with connections to several providers, such as Azure, Sketchfab, local storage and more.
* A data processing service that supports many different file types and content, all delivered in a common format inside the application.
* A scene loading service, maintaining the states and order of screens loaded / unloaded and more.
* A battle management system (for the gamers) which runs battle simulations, spits out reports and updates leaderboards / etc
* An achievement system with connectivity to different platforms and services.

The options are almost endless and some of the above you may see published as packages in the future.  The extensibility of the implementation means that it greatly simplifies consumption of services in projects, especially if you then re-use those same services in multiple projects.

## The beginning of the journey

[![](https://media.giphy.com/media/1jl0Xuj9wEptDaNTjT/giphy.gif)](https://service-framework.realitycollective.io/)

As of today, the first public preview of the Service Framework is now available for use, published on OpenUPM.  The Framework is fully supported and tested on all current LTS versions of Unity and is the most tested thing ever.

> The service framework preview is actively being used in production projects by our sponsors and some of our private preview partners.  Just remember it is still technically "in preview" but we have found no critical issues to date since its foundation has been running for years now.

[![openupm](https://img.shields.io/npm/v/com.realitycollective.service-framework?label=openupm&registry_uri=https://package.openupm.com)](https://openupm.com/packages/com.realitycollective.service-framework/)

It can be installed quickly into your project from the command-line using the OpenUPM CLI, once you have installed it and its dependencies (you can also register it manually in your manifest).

```text
`openupm add com.realitycollective.service-framework`
```

> For more details on installing the Service Framework, check out the "[**Getting Started**](https://service-framework.realitycollective.io/docs/basics/getting_started#installing-the-service-framework)" docs on the Service-Frameworks page.

Once installed, configuration and implementation is quick and easy.

![Service Framework blank configuration](https://service-framework.realitycollective.io/assets/images/02_03_ServiceFrameworkEmptyConfiguraton-d138c705ad43f06c01f1881afe773fd7.png)

## And there is more

Alongside the Service Framework is another package which is simply called "[**Utilities**](https://github.com/realitycollective/com.realitycollective.utilities)".  This package contains many reusable features that are also consumed by the Service Framework.

Including, but not limited to:

* Editor Extensions
* Runtime Extensions (Soooo many extensions)
* Several code attributes to tag data and properties in classes
* Utilities such as Async and Structured Web requests

Expect more reusable features to be added to this package over time.

Documentation is still a little light (read non-existent) at the moment for the Utilities package as the focus of the recent release was the Service Framework itself.  But this will come with time, it is more of a look and see what you find useful for now.

## Beyond the Collective

We hope you will join us on our journey with the **Reality Collective** as we hope to release even more tools and features in the near future.
Our mission at the collective is not limited to any one platform, framework or implementation, we are simply building the tools EVERY Unity developer needs and packaging them up for easy reuse.

Join us on our [Discord Server](https://discord.gg/YjHAQD2XT8) if you have questions or just want to chat about where we are headed.

[![](https://media.giphy.com/media/JUMagNHzWMeAkx9pyV/giphy.gif)](https://discord.gg/YjHAQD2XT8)