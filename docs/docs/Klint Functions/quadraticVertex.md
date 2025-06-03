# quadraticVertex

```ts
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void
```

Adds a quadratic Bézier curve segment to the current shape being constructed with `beginShape()`.

## Parameters
- `cpx`: X coordinate of the control point
- `cpy`: Y coordinate of the control point
- `x`: X coordinate of the end point
- `y`: Y coordinate of the end point

## Related Functions

```ts
beginShape() => void                      // Start a new shape
vertex(x: number, y: number) => void     // Add a line segment
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void // Add a bezier curve
arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number) => void // Add an arc
endShape(close?: boolean) => void         // Complete the shape
```

## Example
```tsx
// Simple curve
K.beginShape()
K.vertex(50, 150)
K.quadraticVertex(100, 50, 150, 150)
K.endShape()

// Flower petals using quadratic curves
K.beginShape()
const center = { x: 150, y: 150 }
const petals = 6
const radius = 50
for (let i = 0; i < petals; i++) {
  const angle = (i * Math.PI * 2) / petals
  const nextAngle = ((i + 1) * Math.PI * 2) / petals
  
  const x1 = center.x + radius * Math.cos(angle)
  const y1 = center.y + radius * Math.sin(angle)
  const x2 = center.x + radius * Math.cos(nextAngle)
  const y2 = center.y + radius * Math.sin(nextAngle)
  
  // Control point further out for petal shape
  const cpx = center.x + radius * 1.5 * Math.cos(angle + Math.PI / petals)
  const cpy = center.y + radius * 1.5 * Math.sin(angle + Math.PI / petals)
  
  if (i === 0) K.vertex(x1, y1)
  K.quadraticVertex(cpx, cpy, x2, y2)
}
K.endShape(true)

// Speech bubble
K.beginShape()
K.vertex(50, 100)
K.quadraticVertex(50, 50, 100, 50)    // Top-left corner
K.vertex(200, 50)
K.quadraticVertex(250, 50, 250, 100)  // Top-right corner
K.vertex(250, 150)
K.quadraticVertex(250, 200, 200, 200) // Bottom-right corner
K.vertex(120, 200)
K.vertex(100, 220)                    // Tail point
K.vertex(80, 200)
K.quadraticVertex(50, 200, 50, 150)   // Bottom-left corner
K.endShape(true)

// Mixing with other curve types
K.beginShape()
K.vertex(50, 100)
K.quadraticVertex(100, 50, 150, 100)      // Quadratic curve
K.bezierVertex(175, 75, 200, 125, 225, 100) // Bezier curve
K.arcVertex(250, 100, 250, 150, 25)       // Arc
K.vertex(200, 200)                        // Straight line
K.endShape(true)

// Quadratic curves in contours
K.beginShape()
// Outer shape
K.vertex(50, 50)
K.vertex(250, 50)
K.vertex(250, 250)
K.vertex(50, 250)

// Rounded hole using quadratic curves
K.beginContour()
K.vertex(150, 100)
K.quadraticVertex(200, 100, 200, 150)
K.quadraticVertex(200, 200, 150, 200)
K.quadraticVertex(100, 200, 100, 150)
K.quadraticVertex(100, 100, 150, 100)
K.endContour()
K.endShape(true)

// In JSX component with animation
const draw = (K: KlintContext) => {
  K.fillColor("orange")
  K.strokeColor("white")
  K.strokeWidth(2)
  
  const t = K.time * 0.3
  K.beginShape()
  K.vertex(100, 150)
  K.quadraticVertex(
    150 + Math.sin(t) * 50, 
    100 + Math.cos(t) * 30,
    200, 150
  )
  K.vertex(200, 200)
  K.vertex(100, 200)
  K.endShape(true)
}
```

## Notes
- Must be used within a `beginShape()` / `endShape()` block
- Creates smooth curves using a single control point
- The curve starts from the previous vertex and ends at the specified `(x, y)` point
- The control point determines the curve's shape but is not part of the final path
- More efficient than `bezierVertex()` but with less control flexibility
- Perfect for simple curves like rounded corners or gentle arcs
- Works within both main shapes and contours (holes)
- Can be mixed with `vertex()`, `bezierVertex()`, and `arcVertex()` in the same shape
- Use current fill and stroke styles
- Ideal for organic shapes and UI elements with rounded edges 