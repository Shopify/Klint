# translate

```ts
translate(x: number, y: number) => void
```

Translates (moves) the coordinate system origin by the specified amounts.

## Parameters
- `x`: The horizontal distance to translate
- `y`: The vertical distance to translate

## Returns
- `void`

## Related Functions

```ts
rotate(angle: number) => void             // Rotate the coordinate system
scale(x: number, y?: number) => void      // Scale the coordinate system
push() => void                            // Save current transformation state
pop() => void                             // Restore previous transformation state
resetTransform() => void                  // Reset all transformations
```

## Example
```tsx
// Basic translation
K.translate(100, 50)
K.rectangle(0, 0, 50, 50) // Drawn at (100, 50) due to translation

// Multiple translations accumulate
K.translate(100, 100)
K.translate(50, 25)
K.circle(0, 0, 20) // Drawn at (150, 125)

// Use push/pop to isolate transformations
K.push()
K.translate(200, 200)
K.fillColor("red")
K.rectangle(0, 0, 50, 50) // Red rectangle at (200, 200)
K.pop()

K.fillColor("blue")
K.rectangle(0, 0, 50, 50) // Blue rectangle at (0, 0) - translation reset

// Animated translation
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // Moving object
  const x = Math.sin(K.time * 0.5) * 100
  const y = Math.cos(K.time * 0.3) * 50
  
  K.push()
  K.translate(K.width/2 + x, K.height/2 + y)
  K.fillColor("yellow")
  K.circle(0, 0, 20)
  K.pop()
  
  // Grid of translated shapes
  K.fillColor("rgba(255, 255, 255, 0.1)")
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      K.push()
      K.translate(i * 80 + 40, j * 80 + 40)
      K.rotate(K.time * 0.2 + i + j)
      K.rectangle(-10, -10, 20, 20)
      K.pop()
    }
  }
}

// Coordinate system visualization
const draw = (K: KlintContext) => {
  // Original coordinate system
  K.strokeColor("red")
  K.strokeWidth(2)
  K.line(0, 0, 100, 0) // X-axis
  K.line(0, 0, 0, 100) // Y-axis
  
  // Translated coordinate system
  K.push()
  K.translate(200, 150)
  K.strokeColor("blue")
  K.line(0, 0, 100, 0) // Translated X-axis
  K.line(0, 0, 0, 100) // Translated Y-axis
  
  K.fillColor("blue")
  K.circle(50, 50, 10) // Circle in translated space
  K.pop()
}
```

## Notes
- Translation affects all subsequent drawing operations until reset or popped
- Translations are cumulative - multiple `translate()` calls add together
- Use `push()` and `pop()` to save and restore transformation state
- Translation happens before drawing, not after
- Useful for moving groups of objects together
- Combined with rotation and scaling for complex transformations
- Does not affect the canvas size, only the coordinate system origin
- To reset all transformations, use `resetTransform()` 