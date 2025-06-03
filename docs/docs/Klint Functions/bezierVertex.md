# bezierVertex

```ts
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void
```

Adds a cubic Bézier curve segment to the current shape being constructed with `beginShape()`.

## Parameters
- `cp1x`: X coordinate of the first control point
- `cp1y`: Y coordinate of the first control point
- `cp2x`: X coordinate of the second control point
- `cp2y`: Y coordinate of the second control point
- `x`: X coordinate of the end point
- `y`: Y coordinate of the end point

## Related Functions

```ts
beginShape() => void                      // Start a new shape
vertex(x: number, y: number) => void     // Add a line segment
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void // Add a quadratic curve
arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number) => void // Add an arc
endShape(close?: boolean) => void         // Complete the shape
```

## Example
```tsx
// Simple S-curve
K.beginShape()
K.vertex(50, 150)
K.bezierVertex(50, 50, 150, 50, 150, 150)
K.endShape()

// Heart shape using bezier curves
K.beginShape()
K.vertex(100, 130)
K.bezierVertex(100, 100, 130, 70, 160, 100)
K.bezierVertex(190, 130, 190, 160, 160, 190)
K.bezierVertex(130, 220, 100, 220, 100, 190)
K.bezierVertex(70, 160, 70, 130, 100, 100)
K.bezierVertex(130, 70, 160, 100, 100, 130)
K.endShape(true)

// Mixed with other curve types
K.beginShape()
K.vertex(50, 100)
K.bezierVertex(50, 50, 100, 50, 150, 100)   // Bezier curve
K.quadraticVertex(200, 75, 250, 100)        // Quadratic curve
K.vertex(250, 150)                          // Straight line
K.arcVertex(225, 175, 200, 150, 25)         // Arc
K.endShape(true)

// Bezier curves in contours (holes)
K.beginShape()
// Outer rectangle
K.vertex(50, 50)
K.vertex(250, 50)
K.vertex(250, 250)
K.vertex(50, 250)

// Curved hole
K.beginContour()
K.vertex(150, 100)
K.bezierVertex(175, 100, 200, 125, 200, 150)
K.bezierVertex(200, 175, 175, 200, 150, 200)
K.bezierVertex(125, 200, 100, 175, 100, 150)
K.bezierVertex(100, 125, 125, 100, 150, 100)
K.endContour()
K.endShape(true)

// In JSX component with animation
const draw = (K: KlintContext) => {
  K.fillColor("purple")
  K.strokeColor("white")
  K.strokeWidth(2)
  
  const t = K.time * 0.5
  K.beginShape()
  K.vertex(100, 150)
  K.bezierVertex(
    100 + Math.sin(t) * 30, 
    50 + Math.cos(t) * 20,
    200 + Math.sin(t * 0.7) * 30, 
    50 + Math.cos(t * 0.9) * 20,
    200, 150
  )
  K.vertex(200, 200)
  K.vertex(100, 200)
  K.endShape(true)
}
```

## Notes
- Must be used within a `beginShape()` / `endShape()` block
- Creates smooth curves using two control points for maximum flexibility
- The curve starts from the previous vertex and ends at the specified `(x, y)` point
- Control points determine the curve's shape but are not part of the final path
- Works within both main shapes and contours (holes)
- Can be mixed with `vertex()`, `quadraticVertex()`, and `arcVertex()` in the same shape
- Use current fill and stroke styles
- More computationally intensive than `quadraticVertex()` but offers greater control 