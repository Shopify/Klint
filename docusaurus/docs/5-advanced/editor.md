---
sidebar_position: 5
id: klint-editor
title: 🎮 Interactive Editor
---

# 🎮 Klint Interactive Editor

The Klint Interactive Editor is the fastest way to learn, experiment, and prototype with Klint. It provides a Monaco-based code editor with live preview, perfect for creative coding and educational purposes.

## 🚀 Quick Start

Create a new editor project:

```bash
npx @shopify/klint create-editor my-klint-project
cd my-klint-project
npm install
npm run dev
```

This creates a complete development environment that opens at [http://localhost:5173](http://localhost:5173).

## ✨ Features

- **📝 Monaco Editor**: Full TypeScript support with IntelliSense
- **👀 Live Preview**: See your changes instantly as you type
- **🎨 Klint API**: Full access to all Klint functions and hooks
- **🔄 Hot Reload**: No refresh needed - changes appear immediately  
- **🎯 Ready-to-use**: No configuration required
- **📦 Exportable**: Copy your code into any React project

## 🎯 What You Get

The scaffolded editor includes:

```
my-klint-project/
├── src/
│   ├── App.tsx          # Main editor component
│   └── main.tsx         # React entry point
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── index.html           # HTML template
└── README.md           # Getting started guide
```

## 🎨 Default Template

The editor starts with this example code:

```javascript
function preload(K) {
  console.log(K, "Welcome to Klint Editor! 🎨✨");
}

function setup(K) {
  K.textFont("Inter");
  K.textSize(64);
  K.noStroke();
  K.alignText("center", "middle");
}

function draw(K) {
  K.background('rgba(125, 0, 255, 255)');
  K.fillColor("#FFF");
  
  // Mouse is available directly on K after being extended in preload
  const mouseX = K.mouse ? K.mouse.x : K.width * 0.5;
  const mouseY = K.mouse ? K.mouse.y : K.height * 0.5;
  K.circle(mouseX, mouseY + Math.sin(K.frame * 0.03) * 100, 50);
}
```

## 🔧 Editor Interface

The editor interface is split into two panels:

### Left Panel: Code Editor
- **Language**: JavaScript with Klint API support
- **Features**: Syntax highlighting, auto-completion, error detection
- **Theme**: Dark theme optimized for creative coding
- **Shortcuts**: Standard Monaco editor shortcuts (Ctrl+S, Ctrl+Z, etc.)

### Right Panel: Live Preview  
- **Real-time rendering**: Your Klint sketch renders as you type
- **Full interaction**: Mouse events and animations work normally
- **Console output**: Logs appear in browser developer tools

## 🎮 Using the Editor

### 1. Writing Code
Write your Klint code using the standard lifecycle functions:

```javascript
function preload(K) {
  // Load assets, set up extensions
}

function setup(K) {
  // Initialize your sketch (runs once)
  K.textFont("Arial"); 
  K.textSize(24);
}

function draw(K) {
  // Animation loop (runs every frame)
  K.background('#000');
  K.fillColor('white');
  K.circle(K.width/2, K.height/2, 50);
}
```

### 2. Running Your Code
Click the **"Run"** button or use `Ctrl+Enter` to execute your code.

### 3. Clearing the Canvas
Click **"Clear"** to reset both the editor and canvas.

### 4. Console Output
Open browser developer tools (`F12`) to see console logs and errors.

## 🎨 Example Projects

### Animated Circles
```javascript
function setup(K) {
  K.noStroke();
}

function draw(K) {
  K.background('rgba(0, 0, 0, 0.1)');
  
  for (let i = 0; i < 5; i++) {
    K.fillColor(`hsl(${(K.frame + i * 60) % 360}, 70%, 60%)`);
    const x = K.width/2 + Math.cos(K.frame * 0.01 + i) * 100;
    const y = K.height/2 + Math.sin(K.frame * 0.01 + i) * 100;
    K.circle(x, y, 20);
  }
}
```

### Interactive Drawing
```javascript
function preload(K) {
  // Mouse is automatically available after preload
}

function setup(K) {
  K.strokeWidth(3);
  K.strokeColor('white');
}

function draw(K) {
  if (K.mouse && K.mouse.isPressed) {
    K.line(K.mouse.prevX || K.mouse.x, K.mouse.prevY || K.mouse.y, K.mouse.x, K.mouse.y);
  }
}
```

### Generative Pattern
```javascript
function setup(K) {
  K.strokeWidth(1);
  K.noFill();
}

function draw(K) {
  K.background('#000');
  K.translate(K.width/2, K.height/2);
  
  for (let i = 0; i < 100; i++) {
    K.strokeColor(`hsl(${i * 3.6}, 70%, 60%)`);
    K.rotate(0.1);
    K.circle(0, 0, i * 2);
  }
}
```

## 📤 Exporting Your Work

To use your editor code in a React project:

1. Copy the functions from the editor
2. Create a React component:

```jsx
import { useKlint, Klint } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();
  
  // Paste your functions here
  const setup = (K) => {
    // Your setup code
  };
  
  const draw = (K) => {
    // Your draw code  
  };
  
  return <Klint context={context} setup={setup} draw={draw} />;
}
```

## ⚙️ Configuration

The editor uses Vite for fast development. You can customize:

### Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Add your custom configuration
});
```

### TypeScript Configuration (`tsconfig.json`)
The editor includes full TypeScript support. Modify `tsconfig.json` for custom type checking rules.

## 🔧 Troubleshooting

### Common Issues

**Editor not loading:**
- Ensure you ran `npm install`
- Check the terminal for error messages
- Try `npm run dev` again

**Code not running:**
- Check the browser console for JavaScript errors
- Ensure your code syntax is correct
- Try the "Clear" button to reset

**TypeScript errors:**
- The editor supports JavaScript - TypeScript errors won't prevent execution
- Fix TypeScript issues for better development experience

### Getting Help

- 📚 [Function Reference](/docs/reference/api-reference) - Complete API documentation
- 🎯 [Examples](/experiments) - Working examples and demos  
- 💬 [GitHub Issues](https://github.com/Shopify/Klint/issues) - Report bugs or request features

## 🎉 Next Steps

Ready to move beyond the editor?
- **[Basic Usage](/docs/getting-started/quick-start)** - Learn to use Klint in React projects
- **[Lifecycle Functions](/docs/core-concepts/lifecycle)** - Understand setup, draw, and preload
- **[Mouse Interaction](/docs/reference/klint-hooks)** - Add interactivity to your sketches
- **[Function Reference](/docs/reference/api-reference)** - Explore all available functions

Happy creative coding! 🎨 