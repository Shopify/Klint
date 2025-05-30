---
sidebar_position: 1
id: introduction
title: 👋 Introduction
slug: /
---

# 🎨 Klint

Klint is p5.js-like React component that comes with a lot of cool plugins to make your creative development easier and (i hope), more enjoyable. It's focused on 2D graphics, using the webCanvas API. Klint fully embraces the limitations of the 2D canvas at it's core, nothing fancy, nothing outstanding, just rewrote so it makes more sense (no longer defining number with strings) just a reliable component to make 2D graphics, motion design, UX or generative art.


## Getting Started
Klint is a *React Component* written in TSX. You will need a React environment to use it.
> **Note:** If you're looking for a non-jsx version, p5.js might be a good pick.

This repository contains:

1. 🎨 The core Klint library — TSX
2. 📑 Documentation – Docusaurus
3. 💻 Editor — Remix
4. 🚀 Sandbox to play with Klint — Remix


## Development and tests

> **Important:** The Klint library isn't public yet, so you'll need to link it manually. We're working to resolve this soon but for now, you will need to add it to your npm package using npm link.

1. Clone the repository
   ```bash
   git clone https://github.com/Shopify/klint.git
   cd klint
   ```

2. Go to the lib folder and link it locally
   ```bash
   cd lib
   npm link
   ```

3. In your working directory, link to the local Klint
   ```bash
   cd your-project
   npm link klint
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. When finished, unlink both in your project and the local repo
   ```bash
   # In your project
   npm unlink klint
   
   # In the Klint lib folder
   npm unlink
   ```

6. If you change anything in the library, you will need to rebuild
   ```bash
   # In the Klint lib folder
   npm build
   npm link
   ```

7. I use Vitest for testing
   ```bash
   npm test
   ```


## Build
There are two builds, minified or not.

   ```bash
   # In the Klint lib folder
   # For the minified
   npm build:minified
   # For the js build
   npm build
   ```


---
## The origin : Winter 24 Hackdays
---
- 📖 [Vault](https://hackdays.shopify.io/projects/19268)
- 📖 [Video](https://hackdays.shopify.io/projects/19268)

### TL.DR
🛰️ I wanted to make an equivalent of p5.js that can be run on the server. The first goal was to make it a component but it spiraled into a little library which covers almost 90% of the p5.js 2D functionalities.

### Participants
- 🔑 Arthur Cloche — @ac
- 👩‍💻 Carolyn McNeillie — @Carolyn McNeillie
- 👨‍💻 John Bogan — @bogan
- 👨‍💻 Dane Sun - @Dane
- 👨‍💻 Eric Johnson - @Eric Johnson

Guest appearance from :
- 💡 Ateş Göral — @atesgoral
- 💡 Josh Sanger — @josh.sanger
- 💡 Mikko Haapoja — @mikko

## Reference Docs
- [WebCanvasAPI](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [p5.js](https://p5js.org/reference/)

