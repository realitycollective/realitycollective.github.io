---
sidebar_position: 1
title: Introduction
description: Windows, docking, layout regions and controls for a WebXR scene, built on an engine-free core with thin engine adapters.
---

# Introduction

WebXR UI Extensions gives you movable, resizable windows inside a WebXR scene, plus the controls and layout tools to fill them in. The library is engine-free at its core, so the same windows and controls behave the same way on every engine it supports.

## Windows, docking and layout regions

A window is a movable, resizable panel with an optional title bar and title-bar buttons: pin, dock, minimise and close, each one off unless the app turns it on. Docking is snapping a window into a dock region, a named area of the scene that lays its members out in a row, column or grid of evenly spaced slots. A window can also be world-locked (placed in space), body-follow (lazily follows the player), head-locked (rigidly attached to the view) or hand-locked (rides a hand and shows only while the palm faces the viewer, called a hand menu). A dock region can itself follow the player, which turns its contents into a body-locked toolbar.

## Controls

Beyond windows, the library adds a small set of controls you write as markup: a stepper (a numeric value with increment and decrement buttons), a toggle, an expandable multi-line label, and a scrolling log view. Each control is a custom markup element, for example `<uix-stepper>`, that the library upgrades into working behaviour once the panel loads.

## UIKitML

Panels are authored in UIKitML, an HTML and CSS-like markup language that Meta's Immersive Web SDK defines for spatial panels. Every adapter parses the same UIKitML source, so one panel file renders identically wherever it is hosted.

## What the core owns, what an adapter owns

The core package, `@realitycollective/webxr-uiextensions`, owns every UX decision: window lifecycle, dock state, region layout, drag maths, hold-to-drag timing, hand-menu placement and the control models. It imports no 3D engine, so the same decisions apply unchanged wherever it runs. An adapter is the only place an engine name appears: it turns UIKitML into a live panel, delivers pointer and hand input into the core, and supplies the viewer pose. Two adapters ship today: `@realitycollective/iwsdk-uiextensions` for Meta IWSDK, the reference implementation, and `@realitycollective/xrblocks-uiextensions` for Google XR Blocks and plain three.js, which is experimental. Where a host cannot do something, the adapter reports it rather than staying silent: `WindowHost.supportsStandalonePanels` says whether a bare panel is even possible on that host, and `createPanel` throws where it is not.

## The runtime dependency and the architecture test

The core carries exactly one runtime dependency, `@realitycollective/webxr-input`, the contracts package shared with the Interactions family: plain tuples and records for poses and rays, with no engine imports of its own. A test, `test/architecture.test.ts`, fails the build the moment `three`, `@iwsdk/*`, `@pmndrs/*`, `xrblocks`, or any dependency beyond that one, appears anywhere under `src/`, which is what keeps the core portable to a future engine.

## The layering rule

UI Extensions sits above the WebXR-Input contracts and beside the Interactions family, never inside either. See [the layering rule](/webxr/docs/concepts/layering-rule) for how the families relate to one another.

## More information

- [Getting started](./02-getting-started.md)
- [The adapter contract](./07-adapter-contract.md)
- [Core adapter](../integrations/01-core.md)
- [API reference](pathname:///webxr/api/uiextensions/)
