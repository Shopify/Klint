---
sidebar_position: 1
---

# Installation

Add Klint to a React or vanilla JavaScript project in seconds.

## Requirements

- Node.js 18 or newer for development and server-side tooling
- React 18 or 19 when using the React entry point

React is an optional peer dependency. It is not required when importing `@shopify/klint/native`.

## Install via npm

```bash
npm install @shopify/klint
```

## Install with another package manager

```bash
pnpm add @shopify/klint
# or
yarn add @shopify/klint
```

## TypeScript Support

Klint is written in TypeScript and includes type definitions out of the box. See [TypeScript Setup](./typescript) for detailed type usage.

## Verify it works

```tsx
import { useKlint, Klint } from '@shopify/klint';

function TestSketch() {
  const { context } = useKlint();

  const draw = (K) => {
    K.background('#000');
    K.fillColor('#ff6b6b');
    K.circle(K.width / 2, K.height / 2, 50);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

If you see a red circle on a black background, you're ready to go!

## Next Steps

- [Quick Start](./quick-start) — Create your first interactive sketch
- [useKlint Pattern](./useKlint-pattern) — Understand the core pattern
- [TypeScript Setup](./typescript) — Configure TypeScript for Klint
- [Vanilla JavaScript](./vanilla-javascript) — Use Klint without React
