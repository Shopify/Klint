---
sidebar_position: 1
id: klint
title: 👋 Hello World
slug: /klint-introduction
---

# Klint: Modern Canvas Creation for React

Klint is a modern 2D canvas library designed to work seamlessly with React while providing a powerful, flexible API for creative coding. It builds upon the standard Canvas API with a more intuitive interface inspired by Processing and P5.js, but engineered for production React applications.

## Core Idea

Klint extends the standard canvas context directly, supercharging it with additional functionality while preserving access to all native canvas methods. This approach enables several benefits:

1. **React Integration** - Klint is designed for React's component model and lifecycle, making heavy use of React patterns like `useRef`. This integration allows your canvas animations to properly respond to React state changes and props.

2. **Extended Context** - By leveraging JavaScript's dynamic nature, Klint directly extends the Canvas 2D context with new properties and methods. This means you can still access any native canvas API function alongside Klint's enhanced functionality.

3. **Developer Experience** - Klint harmonizes many frustrating canvas patterns (such as defining font styles as concatenated strings) into more intuitive function calls like `K.textSize()` and `K.textFont()`.

4. **Extensibility** - The architecture makes it easy to add functionality through plugins or the built-in `K.extend()` method.

## From P5.js to Klint

Klint is heavily inspired by P5.js and Processing, with influences from Three.js and other creative coding libraries. If you're familiar with P5.js, you'll find Klint's API very familiar:

```jsx
// P5.js sketch
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  fill(255, 0, 0);
  noStroke();
  ellipse(width/2, height/2, 100, 100);
}

// Klint equivalent in React
function MySketch() {
  /* preload is not mandatory */
  /* setup is not needed, Klint will create and side the canvas to its container */
  const draw = (K) => {
    K.background(220);
    K.fillColor("red");
    K.noStroke();
    K.circle(K.width/2, K.height/2, 100);
  };
  
  return <Klint draw={draw} />;
}
```

The similarities make it easy to port existing P5.js sketches, but Klint offers better performance, React integration, and a more robust architecture for complex projects.

## Performance

Klint assumes you know what you're doing. Unlike beginner-focused libraries that include extensive guardrails, error checking, and runtime validations, Klint prioritizes performance and flexibility:

- **Fewer Guardrails** - Klint has fewer safety checks and friendly error messages compared to P5.js. This means you can crash your application if you don't follow the proper lifecycle or use invalid values.
  
- **TypeScript Support** - Klint includes TypeScript definitions to help catch errors at compile time rather than runtime.

- **Resource Management** - Klint provides more direct control over resource loading, rendering cycles, and memory usage.

This philosophy allows Klint to scale better for complex applications while providing the tools for experienced developers to optimize performance when needed.

## Getting Started

To start using Klint, check out our [Lifecycle](/docs/lifecycle) documentation to understand how Klint integrates with React's component model. Then explore the function reference below to familiarize yourself with the API.

Remember that Klint gives you access to both its enhanced API and the standard Canvas API, so you can leverage your existing canvas knowledge alongside Klint's improvements.

## A Note on Function Names

Due to compatibility with the underlying Canvas API, some function names in Klint differ from what you might expect in vanilla WebCanvas but also in P5.js:

- `fill()` becomes `K.fillColor()`
- `stroke()` becomes `K.strokeColor()`
- Text functions are prefixed with `text` (e.g., `K.textSize()`, `K.textFont()`)

These naming differences ensure that Klint's functions don't collide with native Canvas API methods.

## Share Your Work

Klint is meant to be a tool for creative expression. We encourage you to experiment, build amazing things, and share your work with the community. Tag your projects with #MadeWithKlint on social media or contribute examples to our repository.

Happy coding!