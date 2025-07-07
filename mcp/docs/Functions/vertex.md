# vertex

```ts
vertex(x: number, y: number) => void
```

Adds a straight line segment to the current shape being constructed with `beginShape()`.

## Parameters
- `x`: X coordinate of the vertex point
- `y`: Y coordinate of the vertex point

## Related Functions

```ts
beginShape() => void                      // Start a new shape
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void // Add a bezier curve
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void // Add a quadratic curve
arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number) => void // Add an arc
endShape(close?: boolean) => void         // Complete the shape
```

## Example
```tsx
// Simple triangle
K.beginShape()
K.vertex(100, 50)
K.vertex(150, 150)
K.vertex(50, 150)
K.endShape(true)

// Open path
K.beginShape()
K.vertex(50, 100)
K.vertex(100, 50)
K.vertex(150, 100)
K.vertex(200, 50)
K.endShape(false) // Open shape

// Complex polygon
K.beginShape()
K.vertex(100, 100)
K.vertex(200, 120)
K.vertex(180, 200)
K.vertex(120, 220)
K.vertex(80, 180)
K.vertex(60, 140)
K.endShape(true)

// Mixing with curve functions
K.beginShape()
K.vertex(50, 100)                         // Straight line start
K.vertex(100, 100)                        // Straight line
K.bezierVertex(125, 75, 175, 75, 200, 100) // Bezier curve
K.vertex(250, 100)                        // Straight line
K.quadraticVertex(275, 125, 250, 150)     // Quadratic curve
K.vertex(200, 150)                        // Straight line
K.arcVertex(175, 150, 175, 125, 25)       // Arc
K.vertex(50, 125)                         // Straight line back
K.endShape(true)

// Star shape
K.beginShape()
const centerX = 150, centerY = 150
const outerRadius = 60, innerRadius = 25
const points = 5

for (let i = 0; i < points * 2; i++) {
  const angle = (i * Math.PI) / points
  const radius = i % 2 === 0 ? outerRadius : innerRadius
  const x = centerX + radius * Math.cos(angle)
  const y = centerY + radius * Math.sin(angle)
  K.vertex(x, y)
}
K.endShape(true)

// Shape with holes using vertex
K.beginShape()
// Outer square
K.vertex(50, 50)
K.vertex(250, 50)
K.vertex(250, 250)
K.vertex(50, 250)

// Inner triangle hole
K.beginContour()
K.vertex(125, 100)
K.vertex(175, 100)
K.vertex(150, 150)
K.endContour()
K.endShape(true)

// In JSX component
const draw = (K: KlintContext) => {
  K.fillColor("red")
  K.strokeColor("white")
  K.strokeWidth(2)
  
  K.beginShape()
  K.vertex(K.width/4, K.height/4)
  K.vertex(K.width*3/4, K.height/4)
  K.vertex(K.width*3/4, K.height*3/4)
  K.vertex(K.width/4, K.height*3/4)
  K.endShape(true)
}
```

## Notes
- Must be used within a `beginShape()` / `endShape()` block
- Creates straight line segments between points
- The first `vertex()` call establishes the starting point
- Subsequent `vertex()` calls create lines from the previous point
- Can be freely mixed with curve functions (`bezierVertex()`, `quadraticVertex()`, `arcVertex()`)
- Works within both main shapes and contours (holes)
- Use current fill and stroke styles
- Essential building block for any custom shape or path
- Perfect for creating polygons, stars, and geometric shapes 