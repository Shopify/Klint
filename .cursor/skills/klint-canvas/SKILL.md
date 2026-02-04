---
name: klint-canvas
description: Create 2D canvas sketches with @shopify/klint, a React creative coding library. Use when building canvas animations, generative art, data visualizations, or interactive graphics in React. Triggered by mentions of Klint, canvas drawing, creative coding, p5.js-like patterns, or React canvas components.
---

# Klint Canvas Library

Klint is a React-first 2D canvas library for creative coding, inspired by p5.js/Processing.

## Basic Pattern

```tsx
import { useKlint, Klint } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();
  
  const draw = (K) => {
    K.background('#000');
    K.fillColor('#ff6b6b');
    K.circle(K.width/2, K.height/2, 50);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Lifecycle

Three optional phases: `preload` (async) → `setup` (once) → `draw` (every frame)

```tsx
const preload = async (K) => {
  // Load images, fonts, initialize plugins
  await loadImages({ bg: 'image.jpg' });
};

const setup = (K) => {
  // One-time config: textFont, textSize, alignText
};

const draw = (K) => {
  // Animation loop - runs at 60fps by default
  K.background('#000');
};

return <Klint context={context} preload={preload} setup={setup} draw={draw} />;
```

## Context Properties

- `K.width`, `K.height` - Canvas dimensions (scaled by DPR)
- `K.frame` - Current frame count
- `K.time` - Elapsed time in seconds
- `K.deltaTime` - Time since last frame (ms)
- `K.fps` - Target framerate

## Drawing Functions

### Shapes
```tsx
K.circle(x, y, radius)              // Circle
K.circle(x, y, rx, ry)              // Ellipse
K.rectangle(x, y, w, h?)            // Rectangle (h defaults to w)
K.roundedRectangle(x, y, w, r, h?)  // Rounded corners
K.polygon(x, y, r, sides, r2?, rot?) // Regular polygon
K.line(x1, y1, x2, y2)              // Line
K.point(x, y)                        // Single point
K.disk(x, y, r, start?, end?, closed?) // Arc/pie slice
```

### Styling
```tsx
K.fillColor(color)       // Set fill (CSS color or gradient)
K.strokeColor(color)     // Set stroke
K.strokeWidth(width)     // Line width
K.strokeJoin('round')    // 'miter' | 'round' | 'bevel'
K.strokeCap('round')     // 'butt' | 'round' | 'square'
K.noFill()               // Disable fill
K.noStroke()             // Disable stroke
K.opacity(0.5)           // Global alpha 0-1
K.blend('multiply')      // Composite operation
```

### Text
```tsx
K.textFont('Arial')
K.textSize(24)
K.textWeight('bold')
K.alignText('center', 'middle')  // horizontal, vertical
K.text('Hello', x, y)
K.textWidth('text')              // Measure width
K.paragraph(text, x, y, width, { justification: 'left' })
```

### Transforms
```tsx
K.push()                 // Save state
K.pop()                  // Restore state
K.translate(x, y)        // Move origin
K.rotate(angle)          // Rotate (radians)
K.scale(sx, sy?)         // Scale
K.resetTransform()       // Reset to identity
```

### Gradients
```tsx
const g = K.gradient(x1, y1, x2, y2);
K.addColorStop(g, 0, 'red');
K.addColorStop(g, 1, 'blue');
K.fillColor(g);

K.radialGradient(x1, y1, r1, x2, y2, r2)
K.conicGradient(angle, x, y)
```

### Custom Shapes (Paths)
```tsx
K.beginShape();
K.vertex(x, y);
K.bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y);
K.quadraticVertex(cpx, cpy, x, y);
K.arcVertex(x1, y1, x2, y2, radius);
K.endShape(close);  // close: boolean

// Cutouts
K.beginContour();
K.vertex(x, y);
K.endContour();
```

### Clipping
```tsx
K.push();
K.clipTo((K) => {
  K.circle(x, y, 100);
});
// Draw clipped content here
K.pop();
```

### Images
```tsx
K.image(img, x, y)
K.image(img, x, y, w, h)
K.image(img, sx, sy, sw, sh, dx, dy, dw, dh)  // Source crop
```

### Offscreen Canvas
```tsx
K.createOffscreen('id', width, height, options?, callback?);
const buffer = K.getOffscreen('id');
K.image(buffer, 0, 0);
```

## Input Hooks

### Mouse
```tsx
const { KlintMouse } = useKlint();
const { mouse, onClick, onMouseDown, onMouseUp } = KlintMouse();

// In draw:
mouse.x, mouse.y          // Position (DPR scaled)
mouse.px, mouse.py        // Previous position
mouse.vx, mouse.vy        // Velocity
mouse.isPressed           // Boolean
mouse.isHover             // Boolean
```

### Keyboard
```tsx
const { KlintKeyboard } = useKlint();
const { keyboard, keyPressed, keyReleased, keyCombo, isPressed } = KlintKeyboard();

keyPressed('Space', (K, e) => { /* ... */ });
keyCombo(['Ctrl', 'S'], (K, e) => { /* ... */ });
isPressed('ArrowUp')  // Boolean
```

### Touch/Gesture
```tsx
const { KlintGesture } = useKlint();
const { gesture, onTap, onSwipe, onPinch } = KlintGesture();

onSwipe((K, e, gesture, direction) => { /* left|right|up|down */ });
onPinch((K, e, gesture) => { gesture.scale });
```

### Scroll
```tsx
const { KlintScroll } = useKlint();
const { scroll, onScroll } = KlintScroll();
scroll.distance, scroll.velocity
```

## Elements

### Color
```tsx
K.Color.rgb(255, 0, 0)
K.Color.rgba(255, 0, 0, 0.5)
K.Color.hsl(180, 50, 50)
K.Color.hsla(180, 50, 50, 0.5)
K.Color.oklch(0.7, 0.15, 180)
K.Color.gray(128, 0.5)
K.Color.blendColors(colorA, colorB, factor, 'oklch')
K.Color.lighten(color, 20)
K.Color.darken(color, 20)
K.Color.createPalette(baseColor, steps)
// Named colors: K.Color.coral, .navy, .midnight, etc.
```

### Vector
```tsx
const v = K.createVector(x, y);
v.add(v2).sub(v2).mult(n).div(n)
v.normalize().rotate(angle)
v.mag()           // Length
v.dist(v2)        // Distance
v.dot(v2)         // Dot product
v.copy()          // Clone
Vector.fromAngle(center, angle, radius)
```

### Easing
```tsx
K.Easing.linear(t)
K.Easing.easeInQuad(t)
K.Easing.easeOutCubic(t)
K.Easing.easeInOutExpo(t)
// Also: Sine, Circ, Back, Elastic, Bounce
```

## Math Utilities
```tsx
K.lerp(a, b, t)                    // Linear interpolation
K.remap(n, inMin, inMax, outMin, outMax)
K.constrain(val, min, max)         // Clamp
K.distance(x1, y1, x2, y2)
K.fract(n, mod)                    // Modulo (handles negatives)
```

## Component Options

```tsx
<Klint
  context={context}
  draw={draw}
  options={{
    fps: 60,
    dpr: 2,                    // Device pixel ratio
    origin: 'center',          // 'corner' | 'center'
    alpha: 'true',
    static: 'true',            // Single render, converts to image
    noloop: 'true',            // No animation loop
  }}
  enablePerformanceTracking={true}
/>
```

## State Management

```tsx
import { useStorage, useProps } from '@shopify/klint';

// Mutable state (persists across frames)
const store = useStorage({ particles: [], count: 0 });
store.set('count', 10);
store.get('count');

// React props bridge
const props = useProps({ color: 'red' });
// In draw: props.get('color')
```

## Common Patterns

### Fade Trail Effect
```tsx
const draw = (K) => {
  K.fillColor('rgba(0, 0, 0, 0.1)');
  K.rectangle(0, 0, K.width, K.height);
  // Draw moving objects...
};
```

### Particle System
```tsx
const store = useStorage({ particles: [] });

const setup = (K) => {
  store.set('particles', Array(100).fill(0).map(() => ({
    x: Math.random() * K.width,
    y: Math.random() * K.height,
    vx: Math.random() * 2 - 1,
    vy: Math.random() * 2 - 1
  })));
};

const draw = (K) => {
  K.background('#000');
  for (const p of store.get('particles')) {
    p.x += p.vx;
    p.y += p.vy;
    K.fillColor('#fff');
    K.circle(p.x, p.y, 3);
  }
};
```

### Center Origin
```tsx
<Klint context={context} draw={draw} options={{ origin: 'center' }} />

// Now (0,0) is at canvas center
const draw = (K) => {
  K.circle(0, 0, 50); // Draws at center
};
```

## Key Differences from p5.js

| p5.js | Klint |
|-------|-------|
| `fill(255, 0, 0)` | `K.fillColor('red')` |
| `ellipse(x, y, w, h)` | `K.circle(x, y, rx, ry)` |
| `stroke(255)` | `K.strokeColor('#fff')` |
| `createCanvas(w, h)` | Parent container sizing |
| Global functions | All on `K` context |
