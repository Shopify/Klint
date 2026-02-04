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
  
  return <Klint context={context} draw={draw} />;
}
```

## What useKlint Provides

The `useKlint` hook returns several utilities:

```tsx
const {
  context,      // Canvas context (required for Klint component)
  KlintMouse,   // Mouse tracking hook
  KlintKeys,    // Keyboard tracking hook
  useStorage,   // State storage without re-renders
  useWindow,    // Window events hook
} = useKlint();
```

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
    
    // mouse.x, mouse.y - current position
    // mouse.pressed - is mouse button pressed
    // mouse.button - which button (0, 1, 2)
    
    K.fillColor(mouse.pressed ? 'red' : 'white');
    K.circle(mouse.x, mouse.y, 30);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Keyboard Input

Track keyboard state with `KlintKeys`:

```tsx
function KeyboardSketch() {
  const { context, KlintKeys } = useKlint();
  const keys = KlintKeys();
  
  const draw = (K) => {
    K.background('#000');
    
    // Check if specific keys are pressed
    if (keys.pressed['ArrowUp']) {
      K.fillColor('green');
      K.text('↑', K.width/2, K.height/2);
    }
    
    // Get array of all pressed keys
    const pressedKeys = keys.getPressedKeys();
    K.text(pressedKeys.join(', '), 10, 20);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## State Without Re-renders

The `useStorage` hook provides state that doesn't trigger React re-renders:

```tsx
function ParticleSketch() {
  const { context, useStorage } = useKlint();
  
  // Create persistent storage
  const particles = useStorage({
    list: [],
    count: 0
  });
  
  const setup = (K) => {
    // Initialize particles
    particles.list = Array(100).fill().map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    }));
  };
  
  const draw = (K) => {
    K.background('#000');
    
    // Update and draw particles
    particles.list.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      K.fillColor('white');
      K.circle(p.x, p.y, 2);
    });
    
    particles.count++;
  };
  
  return <Klint context={context} setup={setup} draw={draw} />;
}
```

## Window Events

Handle window resize and other events:

```tsx
function ResponsiveSketch() {
  const { context, useWindow } = useKlint();
  const { onResize } = useWindow();
  
  const storage = useStorage({
    scale: 1
  });
  
  onResize(() => {
    // Recalculate scale on window resize
    storage.scale = Math.min(window.innerWidth, window.innerHeight) / 500;
  });
  
  const draw = (K) => {
    K.background('#000');
    
    const size = 100 * storage.scale;
    K.fillColor('white');
    K.circle(K.width/2, K.height/2, size);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Complete Example

Here's a complete example using all features:

```tsx
import { useKlint, Klint } from '@shopify/klint';

function CompleteExample() {
  const { 
    context, 
    KlintMouse, 
    KlintKeys, 
    useStorage,
    useWindow 
  } = useKlint();
  
  const { mouse } = KlintMouse();
  const keys = KlintKeys();
  const { onResize } = useWindow();
  
  const state = useStorage({
    trails: [],
    color: 'white',
    size: 30
  });
  
  // Handle window resize
  onResize(() => {
    state.trails = []; // Clear trails on resize
  });
  
  const setup = (K) => {
    K.textAlign('center', 'top');
    K.textSize(14);
  };
  
  const draw = (K) => {
    K.background('#000');
    
    // Change color with keys
    if (keys.pressed['r']) state.color = 'red';
    if (keys.pressed['g']) state.color = 'green';
    if (keys.pressed['b']) state.color = 'blue';
    
    // Add to trail when mouse pressed
    if (mouse.pressed) {
      state.trails.push({ 
        x: mouse.x, 
        y: mouse.y, 
        color: state.color 
      });
      
      // Keep trail length limited
      if (state.trails.length > 100) {
        state.trails.shift();
      }
    }
    
    // Draw trail
    state.trails.forEach((point, i) => {
      const alpha = i / state.trails.length;
      K.fillColor(point.color);
      K.opacity(alpha);
      K.circle(point.x, point.y, state.size * alpha);
    });
    K.opacity(1);
    
    // Draw cursor
    K.fillColor(state.color);
    K.circle(mouse.x, mouse.y, state.size);
    
    // Instructions
    K.fillColor('white');
    K.text('Press R/G/B to change color. Click to draw!', K.width/2, 10);
  };
  
  return <Klint 
    context={context} 
    setup={setup} 
    draw={draw}
    width={800}
    height={600}
  />;
}
```

## Key Takeaways

1. **Always use `useKlint()`** - It's the entry point to all Klint functionality
2. **Pass `context` to `<Klint>`** - This connects your functions to the canvas
3. **Use provided hooks** - KlintMouse, KlintKeys, etc. for interactivity
4. **Prefer `useStorage`** - For state that changes frequently without needing React re-renders
5. **Functions run outside React** - Your draw/setup functions execute in a separate animation loop

## Next Steps

- [TypeScript Setup](./typescript) - Type-safe Klint development
- [Lifecycle Functions](../2-core-concepts/lifecycle) - Understanding setup, draw, and preload
- [React Integration](../2-core-concepts/react-integration) - Advanced React patterns