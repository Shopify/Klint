---
sidebar_position: 1
id: introduction
title: 👋 Getting Started
slug: /
---

# 🎨 Klint

Klint is a modern 2D canvas library for React, inspired by p5.js and Processing. It makes creative coding in React intuitive and powerful, perfect for generative art, data visualization, interactive graphics, and creative web experiences.

## ✨ What makes Klint special?

- 🎯 **React-first**: Built specifically for React with hooks and component patterns
- 🎨 **Creative coding**: p5.js-like API with modern JavaScript/TypeScript  
- 🚀 **Performance**: Direct canvas access with minimal overhead
- 🛠️ **Developer friendly**: Full TypeScript support and Monaco editor
- 🔧 **Extensible**: Plugin system and easy customization

## 🚀 Installation

Add Klint to your React project:

```bash
npm install @shopify/klint
```

## 🎮 Try the Interactive Editor

The fastest way to learn Klint is with our interactive editor. It provides a Monaco-based code editor with live preview:

```bash
npx @shopify/klint klint-create-editor my-klint-project
cd my-klint-project
npm install
npm run dev
```

This creates a complete development environment where you can:
- ✏️ Write Klint code with full TypeScript support
- 👀 See live preview as you type
- 🎨 Experiment with examples and tutorials
- 📦 Export your sketches as React components

## 📋 Basic Usage

Here's a simple Klint sketch:

```jsx
import { useKlint, Klint } from '@shopify/klint';

function MyFirstSketch() {
  const { context } = useKlint();
  
  const draw = (K) => {
    // Clear with black background
    K.background('#000');
    
    // Draw a red circle in the center
    K.fillColor('#ff6b6b');
    K.noStroke();
    K.circle(K.width/2, K.height/2, 50);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## 🎯 Core Concepts

### The Klint Context
Klint extends the standard Canvas 2D context with creative coding functions. The `K` parameter in your functions gives you access to both Klint's API and the native canvas methods.

### Lifecycle Functions
Klint follows the Processing/p5.js pattern:

- **`preload(K)`** - Load assets before setup
- **`setup(K)`** - Initialize your sketch (runs once)  
- **`draw(K)`** - Animation loop (runs every frame)

```jsx
function AnimatedSketch() {
  const { context } = useKlint();
  
  const setup = (K) => {
    K.textFont('Arial');
    K.textSize(24);
  };
  
  const draw = (K) => {
    K.background('rgba(0, 0, 0, 0.1)'); // Fade effect
    K.fillColor('#4ecdc4');
    
    // Animated circle
    const x = K.width/2 + Math.cos(K.frame * 0.02) * 100;
    const y = K.height/2 + Math.sin(K.frame * 0.02) * 100;
    K.circle(x, y, 20);
  };
  
  return <Klint context={context} setup={setup} draw={draw} />;
}
```

## 🖱️ Interactivity

Add mouse interaction with the `KlintMouse` hook:

```jsx
function InteractiveSketch() {
  const { context, KlintMouse } = useKlint();
  const mouse = KlintMouse();
  
  const draw = (K) => {
    K.background('#000');
    
    // Draw circle that follows mouse
    K.fillColor(mouse.pressed ? 'red' : 'white');
    K.circle(mouse.x, mouse.y, 30);
    
    // Draw trail when mouse is pressed
    if (mouse.pressed) {
      K.strokeColor('rgba(255, 255, 255, 0.5)');
      K.strokeWidth(2);
      K.point(mouse.x, mouse.y);
    }
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## 📚 Next Steps

- **[Klint Component](/docs/klint-introduction)** - Deep dive into how Klint works with React
- **[Functions Reference](/docs/Functions/introduction)** - Complete API documentation
- **[Examples](/experiments)** - See Klint in action with interactive demos
- **[Lifecycle](/docs/lifecycle)** - Understand setup, draw, and preload functions

## 🎨 From p5.js to Klint

If you're coming from p5.js, you'll feel right at home. Here are the key differences:

| p5.js | Klint | Notes |
|-------|-------|-------|
| `fill(255, 0, 0)` | `K.fillColor('red')` | CSS colors supported |
| `ellipse(x, y, w, h)` | `K.circle(x, y, radius)` | Radius instead of diameter |
| `stroke(255)` | `K.strokeColor('white')` | CSS colors supported |
| `createCanvas(400, 400)` | `<Klint width={400} height={400} />` | React props |

## 🔧 Advanced Features

- **Plugins**: Extend Klint with custom functionality
- **Offscreen Canvas**: Render to textures for complex effects  
- **TypeScript**: Full type safety and IDE support
- **React Integration**: Use props, state, and hooks naturally

Ready to start creating? Try the interactive editor or dive into the documentation!

```bash
npx @shopify/klint klint-create-editor my-first-project
```

