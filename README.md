# 🎨 Klint

Klint is a modern 2D canvas library for React, inspired by p5.js and Processing. It makes creative coding in React intuitive and powerful, perfect for generative art, data visualization, interactive graphics, and creative web experiences.

## ✨ Features

- 🎯 **React-first**: Built specifically for React with hooks and component patterns
- 🎨 **Creative coding**: p5.js-like API with modern JavaScript/TypeScript
- 🚀 **Performance**: Direct canvas access with minimal overhead
- 🛠️ **Developer friendly**: Full TypeScript support and great tooling
- 🔧 **Extensible**: Plugin system and easy customization

## 🚀 Quick Start

### Install Klint

```bash
npm install @shopify/klint
```

### Basic Usage

```jsx
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

## 🎮 Try the Editor

Want to experiment with Klint interactively? Create a live editor environment:

```bash
npx @shopify/klint klint-create-editor my-klint-project
cd my-klint-project
npm install
npm run dev
```

This creates a Monaco-based editor with live preview - perfect for learning and prototyping!

## 📚 Documentation

- **[Getting Started Guide](https://shopify.github.io/Klint/)** - Learn the basics
- **[API Reference](https://shopify.github.io/Klint/docs/Functions/introduction)** - Complete function reference  
- **[Examples](https://shopify.github.io/Klint/experiments)** - See Klint in action
- **[Lifecycle](https://shopify.github.io/Klint/docs/klint-introduction)** - Understand how Klint works with React

## 🌟 Examples

### Animated Circle
```jsx
function AnimatedCircle() {
  const { context } = useKlint();
  
  const draw = (K) => {
    K.background('rgba(0, 0, 0, 0.1)');
    K.fillColor('#4ecdc4');
    const x = K.width/2 + Math.cos(K.frame * 0.02) * 100;
    const y = K.height/2 + Math.sin(K.frame * 0.02) * 100;
    K.circle(x, y, 20);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

### Interactive Drawing
```jsx
function InteractiveDrawing() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  
  const draw = (K) => {
    if (mouse.pressed) {
      K.fillColor('red');
      K.circle(mouse.x, mouse.y, 10);
    }
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## 🛠️ Development

**For contributors** who want to work on Klint itself:

```bash
git clone https://github.com/Shopify/klint.git
cd klint
npm install
npm run build
```
See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License
MIT

---

**Ready to create?** Start with `npx @shopify/klint klint-create-editor my-project` 🎨

