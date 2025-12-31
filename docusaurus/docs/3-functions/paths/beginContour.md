# beginContour

```ts
beginContour() => void
```

Starts a new contour (hole) within the current shape being constructed with `beginShape()`.

## Related Functions

```ts
beginShape() => void                      // Start a new shape
endContour(forceRevert?: boolean) => void // End the current contour
vertex(x: number, y: number) => void     // Add a line segment to the contour
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void // Add a bezier curve to the contour
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void // Add a quadratic curve to the contour
arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number) => void // Add an arc to the contour
endShape(close?: boolean) => void         // Complete the shape
```

## Example
```tsx
// Simple rectangle with circular hole
K.beginShape()
// Outer rectangle
K.vertex(50, 50)
K.vertex(250, 50)
K.vertex(250, 250)
K.vertex(50, 250)

// Circular hole in the center
K.beginContour()
const centerX = 150, centerY = 150, radius = 40
const steps = 16
for (let i = 0; i < steps; i++) {
  const angle = (i * Math.PI * 2) / steps
  const x = centerX + radius * Math.cos(angle)
  const y = centerY + radius * Math.sin(angle)
  K.vertex(x, y)
}
K.endContour()
K.endShape(true)

// Shape with multiple holes
K.beginShape()
// Outer shape
K.vertex(50, 50)
K.vertex(350, 50)
K.vertex(350, 250)
K.vertex(50, 250)

// First hole
K.beginContour()
K.vertex(100, 100)
K.vertex(150, 100)
K.vertex(150, 150)
K.vertex(100, 150)
K.endContour()

// Second hole
K.beginContour()
K.vertex(200, 100)
K.vertex(250, 100)
K.vertex(250, 150)
K.vertex(200, 150)
K.endContour()
K.endShape(true)

// Contour with curves
K.beginShape()
// Outer rounded rectangle
K.vertex(20, 50)
K.vertex(280, 50)
K.arcVertex(300, 50, 300, 70, 20)
K.vertex(300, 230)
K.arcVertex(300, 250, 280, 250, 20)
K.vertex(20, 250)
K.arcVertex(0, 250, 0, 230, 20)
K.vertex(0, 70)
K.arcVertex(0, 50, 20, 50, 20)

// Curved hole
K.beginContour()
K.vertex(150, 100)
K.bezierVertex(200, 100, 200, 150, 150, 150)
K.bezierVertex(100, 150, 100, 100, 150, 100)
K.endContour()
K.endShape(true)

// Heart with hole
K.beginShape()
// Heart outline
K.vertex(150, 130)
K.bezierVertex(150, 100, 180, 70, 210, 100)
K.bezierVertex(240, 130, 240, 160, 210, 190)
K.bezierVertex(180, 220, 150, 220, 150, 190)
K.bezierVertex(120, 160, 120, 130, 150, 100)
K.bezierVertex(180, 70, 210, 100, 150, 130)

// Small heart-shaped hole
K.beginContour()
K.vertex(150, 140)
K.quadraticVertex(160, 130, 170, 140)
K.quadraticVertex(180, 150, 170, 160)
K.quadraticVertex(160, 170, 150, 170)
K.quadraticVertex(140, 160, 130, 150)
K.quadraticVertex(120, 140, 130, 140)
K.quadraticVertex(140, 130, 150, 140)
K.endContour()
K.endShape(true)

// Dynamic contours
const draw = (K: KlintContext) => {
  K.beginShape()
  // Outer shape
  K.vertex(100, 100)
  K.vertex(300, 100)
  K.vertex(300, 300)
  K.vertex(100, 300)
  
  // Animated hole
  K.beginContour()
  const time = K.time * 0.5
  const size = 30 + Math.sin(time) * 20
  K.vertex(200 - size, 200 - size)
  K.vertex(200 + size, 200 - size)
  K.vertex(200 + size, 200 + size)
  K.vertex(200 - size, 200 + size)
  K.endContour()
  K.endShape(true)
}
```

## Notes
- Must be used within a `beginShape()` / `endShape()` block
- A contour that will end up outside a shape will show as solid.
- Creates holes or cutouts within the main shape
- Can only be called when not already in a contour
- All vertex and curve functions work within contours
- Contours should typically have opposite winding direction from the main shape for proper hole rendering
- Multiple contours can be created within a single shape
- Must be closed with `endContour()` or will be automatically closed by `endShape()`
- Perfect for creating complex shapes like letters, donuts, or decorative patterns