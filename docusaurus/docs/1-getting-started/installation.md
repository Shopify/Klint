---
sidebar_position: 1
---

# Installation

Add Klint to your React project in seconds.

## Requirements

- React 16.8+ (requires hooks support)
- Node.js 14+

## Install via npm

```bash
npm install @shopify/klint
```

## Install via yarn

```bash
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
