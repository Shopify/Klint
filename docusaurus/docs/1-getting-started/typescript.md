---
sidebar_position: 4
---

# TypeScript Setup

Klint is built with TypeScript and provides comprehensive type definitions.

## Basic Setup

Klint works with TypeScript out of the box. Just import and use:

```tsx
import { useKlint, Klint, KlintContext } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();

  const draw = (K: KlintContext) => {
    K.background('#000');
    K.fillColor('#fff');
    K.circle(K.width / 2, K.height / 2, 50);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

## Type Imports

Key types you'll use:

```tsx
import type {
  KlintContexts,         // Union of both offscreen and main context
  KlintContext,           // The main context — the K parameter in docs
  KlintOffscreenContext,  // Offscreen canvas context type
  KlintProps,             // Props for Klint component
  KlintMouseState,        // Mouse state type
  KlintKeyState,          // Keyboard state type
} from '@shopify/klint';
```

## Typing Storage

Type your storage objects for better IntelliSense:

```tsx
import { useKlint, Klint, useStorage, type KlintContext } from '@shopify/klint';

interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

interface SketchState {
  particles: ParticleData[];
  count: number;
  isRunning: boolean;
}

function ParticleSketch() {
  const { context } = useKlint();

  const state = useStorage<SketchState>({
    particles: [],
    count: 0,
    isRunning: true
  });

  const setup = (K: KlintContext) => {
    const pts = Array(100).fill(null).map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
    state.set('particles', pts);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} setup={setup} draw={draw} />
    </div>
  );
}
```

## Component Props

Type your component props when passing data:

```tsx
interface VisualizerProps {
  data: number[];
  color: string;
  animated?: boolean;
}

function DataVisualizer({ data, color, animated = true }: VisualizerProps) {
  const { context } = useKlint();

  const draw = (K: KlintContext) => {
    K.background('#000');
    K.fillColor(color);

    data.forEach((value, i) => {
      const x = (i / data.length) * K.width;
      const height = value * K.height;
      const y = K.height - height;

      if (animated) {
        const offset = Math.sin(K.time + i * 0.1) * 10;
        K.rectangle(x, y + offset, K.width / data.length, height);
      } else {
        K.rectangle(x, y, K.width / data.length, height);
      }
    });
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

## Custom Types

Create custom types for your sketches:

```tsx
type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

interface Player {
  x: number;
  y: number;
  size: number;
  score: number;
}

interface GameData {
  state: GameState;
  player: Player;
  enemies: { x: number; y: number; speed: number }[];
  highScore: number;
}

function GameSketch() {
  const { context, KlintKeyboard } = useKlint();
  const keys = KlintKeyboard();

  const game = useStorage<GameData>({
    state: 'menu',
    player: { x: 400, y: 300, size: 20, score: 0 },
    enemies: [],
    highScore: 0
  });
}
```

## Next Steps

- [Core Concepts](/docs/core-concepts/lifecycle) — Deep dive into Klint architecture
- [Function Reference](/docs/functions/drawing/circle) — Explore typed function signatures
- [React Integration](/docs/core-concepts/react-integration) — TypeScript with React patterns
