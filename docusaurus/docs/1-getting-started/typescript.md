---
sidebar_position: 4
---

# TypeScript Setup

Klint is built with TypeScript and provides comprehensive type definitions for a great developer experience.

## Basic Setup

Klint works with TypeScript out of the box. Just import and use:

```tsx
import { useKlint, Klint, KlintContext } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();
  
  const draw = (K: KlintContext) => {
    K.background('#000');
    K.fillColor('#fff');
    K.circle(K.width/2, K.height/2, 50);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Type Imports

Key types you'll use:

```tsx
import type { 
  KlintContext,      // The K parameter type
  KlintProps,        // Props for Klint component
  KlintMouseState,   // Mouse state type
  KlintKeyState,     // Keyboard state type
  DrawFunction,      // Type for draw function
  SetupFunction,     // Type for setup function
  PreloadFunction    // Type for preload function
} from '@shopify/klint';
```

## Typing Functions

### Draw Function

```tsx
import type { DrawFunction } from '@shopify/klint';

const draw: DrawFunction = (K) => {
  K.background('#000');
  K.circle(K.width/2, K.height/2, 50);
};

// Or inline
const draw = (K: KlintContext) => {
  K.background('#000');
  K.circle(K.width/2, K.height/2, 50);
};
```

### Setup Function

```tsx
import type { SetupFunction } from '@shopify/klint';

const setup: SetupFunction = (K) => {
  K.textAlign('center', 'middle');
  K.textSize(16);
};
```

### Preload Function

```tsx
import type { PreloadFunction } from '@shopify/klint';

const preload: PreloadFunction = async (K) => {
  const img = await K.loadImage('/path/to/image.jpg');
  return { img };
};
```

## Typing Storage

Type your storage objects for better IntelliSense:

```tsx
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
  const { context, useStorage } = useKlint();
  
  // Typed storage
  const state = useStorage<SketchState>({
    particles: [],
    count: 0,
    isRunning: true
  });
  
  const setup = (K: KlintContext) => {
    state.particles = Array(100).fill(null).map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  };
  
  return <Klint context={context} setup={setup} draw={draw} />;
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
        const offset = Math.sin(K.time * 0.001 + i * 0.1) * 10;
        K.rectangle(x, y + offset, K.width / data.length, height);
      } else {
        K.rectangle(x, y, K.width / data.length, height);
      }
    });
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Custom Types

Create custom types for your sketches:

```tsx
// Types for a game sketch
type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

interface Player {
  x: number;
  y: number;
  size: number;
  score: number;
}

interface Enemy {
  x: number;
  y: number;
  speed: number;
  type: 'basic' | 'fast' | 'strong';
}

interface GameData {
  state: GameState;
  player: Player;
  enemies: Enemy[];
  highScore: number;
}

function GameSketch() {
  const { context, KlintKeys, useStorage } = useKlint();
  const keys = KlintKeys();
  
  const game = useStorage<GameData>({
    state: 'menu',
    player: { x: 400, y: 300, size: 20, score: 0 },
    enemies: [],
    highScore: 0
  });
  
  // Rest of game logic...
}
```

## Type Guards

Use type guards for runtime type checking:

```tsx
// Element type guard
function isCircle(element: any): element is { type: 'circle'; x: number; y: number; r: number } {
  return element?.type === 'circle';
}

// Usage in draw function
const draw = (K: KlintContext) => {
  elements.forEach(element => {
    if (isCircle(element)) {
      K.circle(element.x, element.y, element.r);
    } else if (isRectangle(element)) {
      K.rectangle(element.x, element.y, element.w, element.h);
    }
  });
};
```

## Utility Types

Klint provides utility types for common patterns:

```tsx
import type { 
  Point,      // { x: number; y: number }
  Size,       // { width: number; height: number }
  Bounds,     // { x: number; y: number; width: number; height: number }
  Color,      // string | number | [r: number, g: number, b: number, a?: number]
} from '@shopify/klint';

// Use in your types
interface Shape {
  position: Point;
  size: Size;
  color: Color;
  bounds: Bounds;
}
```

## VSCode Configuration

For the best TypeScript experience with Klint:

1. **Install recommended extensions**:
   - TypeScript and JavaScript Language Features
   - ESLint
   - Prettier

2. **Configure tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["@shopify/klint"]
  }
}
```

## Common TypeScript Patterns

### Generic Hook Pattern

```tsx
function useAnimatedValue<T extends number | Point>(
  initial: T,
  target: T,
  speed: number = 0.1
): T {
  const value = useStorage({ current: initial });
  
  const update = () => {
    if (typeof initial === 'number') {
      value.current = lerp(value.current as number, target as number, speed) as T;
    } else {
      // Handle Point type
      const p = value.current as Point;
      const t = target as Point;
      value.current = {
        x: lerp(p.x, t.x, speed),
        y: lerp(p.y, t.y, speed)
      } as T;
    }
  };
  
  return value.current;
}
```

### Type-safe Event System

```tsx
type EventMap = {
  'particle:spawn': { x: number; y: number };
  'particle:destroy': { id: string };
  'game:over': { score: number };
};

class TypedEventEmitter<T extends Record<string, any>> {
  private handlers: Map<keyof T, Set<(data: any) => void>> = new Map();
  
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }
  
  emit<K extends keyof T>(event: K, data: T[K]) {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }
}

// Usage
const events = new TypedEventEmitter<EventMap>();
events.on('particle:spawn', ({ x, y }) => {
  // TypeScript knows x and y are numbers
});
```

## Next Steps

- [Core Concepts](../2-core-concepts/lifecycle) - Deep dive into Klint architecture
- [Function Reference](../3-functions/drawing/circle) - Explore typed function signatures
- [React Integration](../2-core-concepts/react-integration) - TypeScript with React patterns