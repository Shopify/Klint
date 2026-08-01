---
sidebar_position: 1
id: introduction
title: Welcome to Klint
slug: /
---

# Klint

Klint is a modern 2D canvas library for React, inspired by p5.js and Processing. It makes creative coding in React intuitive and powerful, perfect for generative art, data visualization, interactive graphics, and creative web experiences.

## What makes Klint special?

- **React-first**: Built specifically for React with hooks and component patterns
- **Creative coding**: p5.js-like API with modern JavaScript/TypeScript
- **Performance**: Direct canvas access with minimal overhead, no unnecessary re-renders
- **Developer friendly**: Full TypeScript support and Monaco editor
- **Extensible**: Plugin system and easy customization

## Installation

```bash
npm install @shopify/klint
```

## Quick Example

```tsx
import { useKlint, Klint } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();

  const draw = (K) => {
    K.background('#000');
    K.fillColor('#ff6b6b');
    K.noStroke();
    K.circle(K.width / 2, K.height / 2, 50);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

Klint fills its container — wrap it in a div with explicit dimensions.

## Interactive Editor

The fastest way to learn Klint is with the interactive editor:

```bash
npx @shopify/klint create-editor my-klint-project
cd my-klint-project
npm install
npm run dev
```

## Next Steps

- **[Quick Start](/docs/getting-started/quick-start)** — Create your first sketch with interactive examples
- **[Installation](/docs/getting-started/installation)** — Setup and requirements
- **[Core Concepts](/docs/core-concepts/lifecycle)** — Understand lifecycle, context, and React integration
- **[Function Reference](/docs/functions/drawing/circle)** — Complete API documentation
- **[Coming from p5.js?](./reference/from-p5js)** — Migration guide
