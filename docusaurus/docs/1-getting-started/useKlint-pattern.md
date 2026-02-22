---
sidebar_position: 3
---

# The useKlint Pattern

The `useKlint` hook is the foundation of every Klint sketch. Understanding this pattern is crucial for building with Klint.

## Basic Pattern

Every Klint sketch follows this pattern:

```tsx
import { useKlint, Klint } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();

  const draw = (K) => {
    // Your drawing code here
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

Klint fills its container — always wrap it in a div with explicit dimensions.

## What useKlint Provides

The `useKlint` hook returns several utilities:

```tsx
const {
  context,          // Canvas context (required for Klint component)
  KlintMouse,       // Mouse tracking hook
  KlintKeyboard,    // Keyboard tracking hook
  KlintImage,       // Image loading hook
  KlintWindow,      // Window events hook
  KlintScroll,      // Scroll handling hook
  KlintGesture,     // Touch gesture hook
  KlintTimeline,    // Animation timeline hook
  KlintPerformance, // Performance monitoring hook
  useDev,           // Development utilities
  togglePlay,       // Play/pause control
} = useKlint();
```

Each of these is documented in detail in [Klint Hooks](../reference/klint-hooks).

## The Context Object

The `context` is a wrapped canvas context that must be passed to the `<Klint>` component:

```tsx
const { context } = useKlint();
return <Klint context={context} draw={draw} />;
```

This pattern ensures:
- Canvas is properly initialized
- Drawing functions have access to the enhanced context
- Performance optimizations are applied
- No unnecessary React re-renders

## Mouse Tracking

Use `KlintMouse` to track mouse position and state:

```tsx
function MouseSketch() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();

  const draw = (K) => {
    K.background('#000');
    K.fillColor(mouse.isPressed ? 'red' : 'white');
    K.circle(mouse.x, mouse.y, 30);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

The mouse object provides `x`, `y`, `px`, `py` (previous position), `vx`, `vy` (velocity), `isPressed`, `isHover`, and `angle`. See [KlintMouse](../reference/klint-hooks#klintmouse) for the full API.

## State Without Re-renders

The `useStorage` hook provides state that doesn't trigger React re-renders. It uses `get(key)` and `set(key, value)` methods:

```tsx
import { useKlint, Klint, useStorage } from '@shopify/klint';

function ParticleSketch() {
  const { context } = useKlint();

  const storage = useStorage({
    particles: [],
    count: 0
  });

  const setup = (K) => {
    const pts = Array(100).fill(null).map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    }));
    storage.set('particles', pts);
  };

  const draw = (K) => {
    K.background('#000');
    const particles = storage.get('particles');

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      K.fillColor('white');
      K.circle(p.x, p.y, 2);
    }

    storage.set('count', storage.get('count') + 1);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} setup={setup} draw={draw} />
    </div>
  );
}
```

## Key Takeaways

1. **Always use `useKlint()`** — It's the entry point to all Klint functionality
2. **Pass `context` to `<Klint>`** — This connects your functions to the canvas
3. **Wrap in a sized container** — Klint fills its parent element
4. **Use provided hooks** — KlintMouse, KlintKeyboard, etc. for interactivity
5. **Prefer `useStorage`** — For state that changes frequently without needing React re-renders
6. **Functions run outside React** — Your draw/setup functions execute in a separate animation loop

## Next Steps

- [TypeScript Setup](./typescript) — Type-safe Klint development
- [Lifecycle Functions](../2-core-concepts/lifecycle) — Understanding setup, draw, and preload
- [Klint Hooks](../reference/klint-hooks) — Full hook API reference
- [React Integration](../2-core-concepts/react-integration) — Advanced React patterns
