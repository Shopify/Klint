# resetTransform

```ts
resetTransform() => void
```

Resets the current transformation matrix to the identity matrix, removing all transformations (translate, rotate, scale) applied to the canvas.

## What Gets Reset

- **Translation** - Returns origin to (0, 0)
- **Rotation** - Removes all rotation
- **Scale** - Returns to 1:1 scaling
- **Skew** - Removes any skew transformations

## Example

```tsx
// Reset after multiple transformations
K.translate(100, 100)
K.rotate(Math.PI / 4)
K.scale(2, 2)
K.circle(0, 0, 20) // Drawn with all transformations

K.resetTransform() // Reset to identity matrix
K.circle(0, 0, 20) // Drawn at (0, 0) with no transformations

// Reset before drawing background
const draw = (K: KlintContext) => {
  // Reset to ensure background covers entire canvas
  K.resetTransform()
  K.background("#222")
  
  // Now apply transformations for content
  K.translate(K.width/2, K.height/2)
  K.rotate(K.time)
  K.fillColor("yellow")
  K.rectangle(-25, -25, 50, 50)
}

// Compare with push/pop
const draw = (K: KlintContext) => {
  K.background("#333")
  
  // Method 1: Using push/pop (preserves state)
  K.push()
  K.translate(100, 100)
  K.rotate(Math.PI / 4)
  K.fillColor("red")
  K.rectangle(0, 0, 50, 50)
  K.pop() // Restores previous state
  
  // Method 2: Using resetTransform (destructive)
  K.translate(200, 200)
  K.rotate(Math.PI / 4)
  K.fillColor("blue")
  K.rectangle(0, 0, 50, 50)
  K.resetTransform() // Removes ALL transformations
  
  // Now at origin with no transformations
  K.fillColor("green")
  K.rectangle(0, 0, 50, 50) // Drawn at (0, 0)
}
```

## When to Use

### Use `resetTransform()` when:
- Drawing backgrounds that should cover the entire canvas
- Starting a new drawing phase with a clean slate
- Debugging transformation issues
- Ensuring absolute positioning

### Use `push()`/`pop()` when:
- Temporarily applying transformations
- Nested transformations
- Preserving previous transformation state
- Isolating drawing operations

## Common Patterns

### Clean Background Drawing

```tsx
const draw = (K: KlintContext) => {
  // Always reset before background to ensure full coverage
  K.resetTransform()
  K.background("#f0f0f0")
  
  // Now apply your coordinate system
  if (K.__canvasOrigin === "center") {
    K.translate(K.width/2, K.height/2)
  }
  
  // Draw your content
  K.fillColor("blue")
  K.circle(0, 0, 50)
}
```

### Resetting Between Scenes

```tsx
const drawScene1 = (K: KlintContext) => {
  K.translate(100, 100)
  K.rotate(K.time)
  K.fillColor("red")
  K.circle(0, 0, 30)
}

const drawScene2 = (K: KlintContext) => {
  K.translate(300, 200)
  K.scale(1.5)
  K.fillColor("blue")
  K.rectangle(0, 0, 40, 40)
}

const draw = (K: KlintContext) => {
  K.resetTransform()
  K.background("white")
  
  drawScene1(K)
  
  K.resetTransform() // Clean slate for scene 2
  drawScene2(K)
}
```

### Debugging Transformations

```tsx
const draw = (K: KlintContext) => {
  // Draw coordinate axes at origin
  K.resetTransform()
  K.strokeColor("red")
  K.strokeWidth(2)
  K.line(0, 0, 100, 0) // X-axis
  K.line(0, 0, 0, 100) // Y-axis
  
  // Apply transformations
  K.translate(200, 150)
  K.rotate(Math.PI / 4)
  
  // Draw transformed axes
  K.strokeColor("blue")
  K.line(0, 0, 100, 0)
  K.line(0, 0, 0, 100)
  
  // Reset to see original axes again
  K.resetTransform()
  K.strokeColor("green")
  K.circle(50, 50, 10) // At original origin
}
```

## Notes

- `resetTransform()` is destructive - it removes ALL transformations
- Unlike `pop()`, `resetTransform()` doesn't restore previous state
- Useful for ensuring backgrounds cover the entire canvas
- Can be combined with `push()`/`pop()` for complex scenarios
- Native Canvas API method - no Klint wrapper needed
- Resets to identity matrix: `[1, 0, 0, 1, 0, 0]`
- Does not affect fill/stroke styles, only transformations

