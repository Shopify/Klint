# beginShape

```ts
beginShape() => void
```

Starts a new custom shape definition.

## Related Functions

```ts
vertex(x: number, y: number) => void      // Add a point to the shape
beginContour() => void                    // Start a hole in the shape
endContour(forceRevert?: boolean) => void // End the current hole
endShape(close?: boolean) => void         // Complete the shape
```

## Example
```tsx
// Simple polygon
K.beginShape()
K.vertex(30, 20)
K.vertex(85, 20)
K.vertex(85, 75)
K.vertex(30, 75)
K.endShape(true) // closed shape

// Shape with a hole
K.beginShape()
// Outer shape (clockwise)
K.vertex(100, 100)
K.vertex(300, 100)
K.vertex(300, 300)
K.vertex(100, 300)
// Hole (counter-clockwise)
K.beginContour()
K.vertex(150, 150)
K.vertex(150, 250)
K.vertex(250, 250)
K.vertex(250, 150)
K.endContour()
K.endShape(true)

// In JSX component
const draw = (K: KlintContext) => {
  K.fillColor("blue")
  K.strokeColor("white")
  K.strokeWidth(2)
  
  K.beginShape()
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5 - Math.PI/2
    const r = 100
    const x = K.width/2 + r * Math.cos(angle)
    const y = K.height/2 + r * Math.sin(angle)
    K.vertex(x, y)
  }
  K.endShape(true)
}
```

## Notes
- Used to create complex shapes not available as built-in functions
- More efficient than drawing individual lines for complex shapes
- Use `K.vertex()` to add points to the shape
- Use `K.beginContour()` and `K.endContour()` to create holes
- Close the shape with `K.endShape(true)` or leave open with `K.endShape(false)`
- For complex paths with holes, contours should have opposite winding direction from the main shape (typically main shape clockwise, holes counter-clockwise) 