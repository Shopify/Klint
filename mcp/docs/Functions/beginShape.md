# beginShape

```ts
beginShape() => void
```

Starts a new custom shape definition.

## Related Functions

```ts
vertex(x: number, y: number) => void                                    // Add a line point to the shape
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number,   // Add a bezier curve to the shape
             x: number, y: number) => void
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void // Add a quadratic curve to the shape
arcVertex(x1: number, y1: number, x2: number, y2: number,              // Add an arc to the shape
          radius: number) => void
beginContour() => void                                                  // Start a hole in the shape
endContour(forceRevert?: boolean) => void                              // End the current hole
endShape(close?: boolean) => void                                       // Complete the shape
```

## Example
```tsx
// Simple polygon with straight lines
K.beginShape()
K.vertex(30, 20)
K.vertex(85, 20)
K.vertex(85, 75)
K.vertex(30, 75)
K.endShape(true) // closed shape

// Curved shape using bezier curves
K.beginShape()
K.vertex(50, 50)
K.bezierVertex(75, 25, 125, 25, 150, 50)
K.bezierVertex(175, 75, 175, 125, 150, 150)
K.bezierVertex(125, 175, 75, 175, 50, 150)
K.bezierVertex(25, 125, 25, 75, 50, 50)
K.endShape(true)

// Mixed curve types in one shape
K.beginShape()
K.vertex(100, 100)
K.quadraticVertex(150, 50, 200, 100)    // Quadratic curve
K.arcVertex(250, 100, 250, 150, 25)     // Arc corner
K.vertex(200, 200)                      // Straight line
K.bezierVertex(150, 250, 50, 250, 100, 200) // Bezier curve
K.endShape(true)

// Shape with curved hole
K.beginShape()
// Outer shape (clockwise)
K.vertex(100, 100)
K.vertex(300, 100)
K.vertex(300, 300)
K.vertex(100, 300)
// Curved hole (counter-clockwise)
K.beginContour()
K.vertex(200, 150)
K.quadraticVertex(250, 175, 250, 200)
K.quadraticVertex(250, 225, 200, 250)
K.quadraticVertex(150, 225, 150, 200)
K.quadraticVertex(150, 175, 200, 150)
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
- Use `K.vertex()` to add straight line segments to the shape
- Use `K.bezierVertex()`, `K.quadraticVertex()`, or `K.arcVertex()` to add curved segments
- You can mix different curve types within the same shape
- Use `K.beginContour()` and `K.endContour()` to create holes
- Close the shape with `K.endShape(true)` or leave open with `K.endShape(false)`
- For complex paths with holes, contours should have opposite winding direction from the main shape (typically main shape clockwise, holes counter-clockwise) 
- All curve functions work within contours as well as the main shape 