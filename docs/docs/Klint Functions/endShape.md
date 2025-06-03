# endShape

```ts
endShape(close?: boolean) => void
```

Completes and renders the current shape being constructed with `beginShape()`.

## Parameters
- `close`: Optional boolean. If `true`, closes the shape by drawing a line from the last vertex back to the first vertex. Default is `false`.

## Related Functions

```ts
beginShape() => void                      // Start a new shape
vertex(x: number, y: number) => void     // Add a line segment
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void // Add a bezier curve
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void // Add a quadratic curve
arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number) => void // Add an arc
beginContour() => void                    // Start a hole in the shape
endContour(forceRevert?: boolean) => void // End the current hole
```

## Example
```tsx
// Closed triangle
K.beginShape()
K.vertex(100, 50)
K.vertex(150, 150)
K.vertex(50, 150)
K.endShape(true) // Closed shape

// Open path
K.beginShape()
K.vertex(50, 100)
K.vertex(100, 50)
K.vertex(150, 100)
K.vertex(200, 50)
K.endShape(false) // Open shape - no line back to start

// Closed curved shape
K.beginShape()
K.vertex(100, 100)
K.bezierVertex(150, 50, 200, 50, 250, 100)
K.quadraticVertex(275, 150, 250, 200)
K.arcVertex(200, 225, 150, 200, 25)
K.vertex(100, 200)
K.endShape(true) // Curves and lines are connected in a closed shape

// Shape with contours
K.beginShape()
// Outer shape
K.vertex(50, 50)
K.vertex(250, 50)
K.vertex(250, 250)
K.vertex(50, 250)

// Add a hole
K.beginContour()
K.vertex(100, 100)
K.vertex(200, 100)
K.vertex(200, 200)
K.vertex(100, 200)
K.endContour()

K.endShape(true) // Completes shape with hole

// Conditional closing based on user input
const draw = (K: KlintContext) => {
  const shouldClose = K.frame % 120 < 60 // Alternates every 2 seconds at 60fps
  
  K.beginShape()
  K.vertex(100, 100)
  K.vertex(200, 100)
  K.vertex(200, 200)
  K.vertex(100, 200)
  K.endShape(shouldClose) // Sometimes closed, sometimes open
}
```

## Notes
- Must be preceded by `beginShape()` and at least one vertex/curve function
- Automatically handles any open contours by calling `endContour()` internally
- When `close = true`, connects the last point back to the first point with a straight line
- When `close = false`, leaves the path open
- Renders the shape using current fill and stroke styles
- Cleans up internal shape state after rendering
- Can handle complex shapes with multiple holes/contours
- Works with any combination of vertex types (line, bezier, quadratic, arc)
- If no vertices were added, the function returns early without rendering 