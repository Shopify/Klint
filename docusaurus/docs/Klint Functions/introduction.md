---
sidebar_position: 1
id: klintfunctions-introduction
title: 👋 Klint Functions
slug: /klintfunctions-introduction
---

# Klint Functions

## Overview

Klint functions form the core API of the library, providing a streamlined interface to the HTML Canvas 2D context. These functions are designed to make creative coding more intuitive while maintaining full access to the underlying Canvas API.

All Klint functions are accessed through the Klint context object (typically named `K`) that's passed to your `draw`, `setup`, and `preload` functions:

```tsx
const draw = (K: KlintContext) => {
  K.background("#222")
  K.fillColor("red")
  K.circle(K.width/2, K.height/2, 100)
}
```

## Function Categories

Klint functions are organized into several categories:

- **Drawing Primitives**: Basic shapes like `K.circle()`, `K.rectangle()`, and `K.line()`
- **Styling**: Functions like `K.fillColor()`, `K.strokeWidth()`, and `K.blend()`
- **Transformations**: Manipulate the canvas with `K.rotate()`, `K.scale()`, and `K.translate()`
- **Text**: Render and style text with `K.text()`, `K.textFont()`, and `K.alignText()`
- **Images**: Draw images and manage resources with `K.image()` and `K.loadImage()`
- **Math & Utilities**: Helpful functions like `K.distance()`, `K.lerp()`, and `K.constrain()`
- **Time Management**: Animation control with `K.frame`, `K.time`, and `K.deltaTime`
- **State Management**: Canvas state control with `K.push()`, `K.pop()`, and `K.reset()`

## Naming Conventions

Klint function names follow consistent patterns:

- **Drawing Functions**: Named after the shape they draw (`K.circle()`, `K.rectangle()`)
- **Style Functions**: Named after what they set (`K.fillColor()`, `K.strokeWidth()`)
- **Action Functions**: Named with verbs describing what they do (`K.rotate()`, `K.translate()`)

Many Klint functions differ slightly from P5.js equivalents due to Canvas API compatibility:
- `fill()` becomes `K.fillColor()`
- `stroke()` becomes `K.strokeColor()`
- `ellipse()` becomes `K.circle()` (with optional radius2 parameter)

## Basic Usage Pattern

Klint functions follow a consistent pattern:

```tsx
// Setup styles
K.fillColor("blue")
K.strokeColor("white")
K.strokeWidth(2)

// Draw shapes
K.circle(100, 100, 50)
K.rectangle(200, 200, 150, 100)

// Apply transformations
K.push()
K.translate(300, 300)
K.rotate(Math.PI/4)
K.rectangle(0, 0, 100, 100)
K.pop()
```

## Always Use the K. Prefix

When using Klint functions, always include the `K.` prefix. This is essential both for code clarity and proper functionality, as these functions operate on the Klint context object:

```tsx
// Correct usage:
K.fillColor("red")
K.circle(100, 100, 50)

// Incorrect usage:
fillColor("red") // Will cause an error
circle(100, 100, 50) // Will cause an error
```

## Exploring the Documentation

In the following sections, you'll find detailed documentation for each Klint function, including:

- Function signatures with parameter types
- Usage examples both for standalone calls and within React components
- Notes on performance considerations and edge cases
- Creative patterns and techniques

Whether you're creating animations, visualizations, or interactive experiences, these functions provide the building blocks for your creative coding projects.