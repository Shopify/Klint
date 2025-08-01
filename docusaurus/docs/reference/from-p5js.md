---
sidebar_position: 4
---

# Migrating from p5.js

If you're coming from p5.js, this guide will help you transition to Klint.

## Key Differences

### 1. React Integration

**p5.js** - Standalone or instance mode:
```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255, 0, 0);
  circle(200, 200, 50);
}
```

**Klint** - React component:
```tsx
import { useKlint, Klint } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();
  
  const setup = (K) => {
    // Setup runs once
  };
  
  const draw = (K) => {
    K.background('#dcdcdc');
    K.fillColor('red');
    K.circle(200, 200, 50);
  };
  
  return <Klint context={context} setup={setup} draw={draw} width={400} height={400} />;
}
```

### 2. Function Names

| p5.js | Klint | Notes |
|-------|-------|-------|
| `fill(r, g, b)` | `K.fillColor(r, g, b)` | Also accepts CSS colors |
| `stroke(r, g, b)` | `K.strokeColor(r, g, b)` | Also accepts CSS colors |
| `strokeWeight(w)` | `K.strokeWidth(w)` | Same behavior |
| `noFill()` | `K.noFill()` | Same behavior |
| `noStroke()` | `K.noStroke()` | Same behavior |
| `ellipse(x, y, w, h)` | `K.circle(x, y, r)` | Uses radius, not diameter |
| `rect(x, y, w, h)` | `K.rectangle(x, y, w, h)` | Same behavior |
| `createVector(x, y)` | `Vector.create(x, y)` | Using Vector element |

### 3. Color Handling

**p5.js**:
```javascript
fill(255, 0, 0);        // RGB
fill(255, 0, 0, 127);   // RGBA
fill('#ff0000');        // Hex
fill('red');            // Named
```

**Klint**:
```javascript
K.fillColor(255, 0, 0);        // RGB
K.fillColor(255, 0, 0, 0.5);   // RGBA (0-1 for alpha)
K.fillColor('#ff0000');        // Hex
K.fillColor('red');            // Named
K.fillColor('rgb(255, 0, 0)'); // CSS syntax
```

### 4. Canvas Creation

**p5.js**:
```javascript
function setup() {
  createCanvas(800, 600);
}
```

**Klint**:
```tsx
<Klint context={context} draw={draw} width={800} height={600} />
```

### 5. Mouse Interaction

**p5.js**:
```javascript
function draw() {
  circle(mouseX, mouseY, 50);
  if (mouseIsPressed) {
    fill(0);
  }
}
```

**Klint**:
```tsx
const { context, KlintMouse } = useKlint();
const mouse = KlintMouse();

const draw = (K) => {
  K.circle(mouse.x, mouse.y, 50);
  if (mouse.pressed) {
    K.fillColor('black');
  }
};
```

## Common Patterns

### Animation

**p5.js**:
```javascript
function draw() {
  let x = width/2 + sin(frameCount * 0.01) * 100;
  circle(x, height/2, 50);
}
```

**Klint**:
```javascript
const draw = (K) => {
  const x = K.width/2 + Math.sin(K.time * 0.001) * 100;
  K.circle(x, K.height/2, 50);
};
```

### Loops and Patterns

**p5.js**:
```javascript
function draw() {
  background(0);
  for (let i = 0; i < 10; i++) {
    fill(i * 25);
    circle(i * 80, height/2, 50);
  }
}
```

**Klint**:
```javascript
const draw = (K) => {
  K.background('#000');
  for (let i = 0; i < 10; i++) {
    K.fillColor(i * 25, i * 25, i * 25);
    K.circle(i * 80, K.height/2, 50);
  }
};
```

### Transformations

**p5.js**:
```javascript
push();
translate(width/2, height/2);
rotate(PI/4);
rect(0, 0, 100, 100);
pop();
```

**Klint**:
```javascript
K.push();
K.translate(K.width/2, K.height/2);
K.rotate(Math.PI/4);
K.rectangle(0, 0, 100, 100);
K.pop();
```

### Loading Images

**p5.js**:
```javascript
let img;

function preload() {
  img = loadImage('image.jpg');
}

function draw() {
  image(img, 0, 0);
}
```

**Klint**:
```javascript
const preload = async (K) => {
  const img = await K.loadImage('image.jpg');
  return { img };
};

const draw = (K, assets) => {
  K.image(assets.img, 0, 0);
};
```

## Feature Comparison

| Feature | p5.js | Klint |
|---------|-------|-------|
| 3D Graphics | ✅ (WEBGL mode) | ❌ (2D only) |
| Sound | ✅ (p5.sound) | ❌ (Use Web Audio API) |
| DOM Manipulation | ✅ (p5.dom) | Use React |
| React Integration | Via wrapper | Native |
| TypeScript | Community types | Built-in |
| Performance | Good | Better (direct canvas) |
| Bundle Size | ~800KB | ~50KB |

## Quick Reference

### Setup Structure

**p5.js global mode**:
```javascript
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
```

**Klint**:
```tsx
import { useKlint, Klint } from '@shopify/klint';

function App() {
  const { context } = useKlint();
  
  const setup = (K) => {
    // Setup code
  };
  
  const draw = (K) => {
    K.background('#dcdcdc');
  };
  
  return <Klint 
    context={context} 
    setup={setup} 
    draw={draw}
    width={400}
    height={400}
  />;
}
```

### Variables and State

**p5.js**:
```javascript
let x = 0;

function draw() {
  x += 1;
  circle(x, height/2, 50);
}
```

**Klint**:
```tsx
const { context, useStorage } = useKlint();
const state = useStorage({ x: 0 });

const draw = (K) => {
  state.x += 1;
  K.circle(state.x, K.height/2, 50);
};
```

## Migration Checklist

1. ✅ Replace `createCanvas()` with `<Klint>` component props
2. ✅ Add `K.` prefix to all drawing functions
3. ✅ Change `fill()` to `K.fillColor()`
4. ✅ Change `stroke()` to `K.strokeColor()`
5. ✅ Change `strokeWeight()` to `K.strokeWidth()`
6. ✅ Replace `mouseX/mouseY` with `mouse.x/mouse.y`
7. ✅ Use `K.time` instead of `frameCount`
8. ✅ Convert global variables to `useStorage()`
9. ✅ Wrap sketch in React component

## Getting Help

- [Quick Start](../1-getting-started/quick-start) - Get up and running
- [API Reference](./api-reference) - Complete function list
- [Examples](/experiments) - See Klint in action