# endContour

```ts
endContour(forceRevert?: boolean) => void
```

Ends the current contour (hole) within the shape being constructed with `beginShape()`.

## Parameters
- `forceRevert`: Optional boolean. If `true` (default), reverses the contour vertices for proper hole rendering. If `false`, keeps the original vertex order.

## Related Functions

```ts
beginShape() => void                      // Start a new shape
beginContour() => void                    // Start a new contour (hole)
vertex(x: number, y: number) => void     // Add a line segment to the contour
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void // Add a bezier curve to the contour
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void // Add a quadratic curve to the contour
arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number) => void // Add an arc to the contour
endShape(close?: boolean) => void         // Complete the shape
```

## Example
```tsx
// Basic contour usage
K.beginShape()
// Outer rectangle
K.vertex(50, 50)
K.vertex(250, 50)
K.vertex(250, 250)
K.vertex(50, 250)

// Square hole
K.beginContour()
K.vertex(100, 100)
K.vertex(200, 100)
K.vertex(200, 200)
K.vertex(100, 200)
K.endContour() // Ends the hole and adds it to the shape
K.endShape(true)

// Multiple contours
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

// Second hole with curves
K.beginContour()
K.vertex(250, 125)
K.quadraticVertex(275, 100, 300, 125)
K.quadraticVertex(275, 150, 250, 125)
K.endContour()
K.endShape(true)

// Manual winding control
K.beginShape()
// Outer clockwise rectangle
K.vertex(50, 50)
K.vertex(250, 50)
K.vertex(250, 250)
K.vertex(50, 250)

// Hole with original winding (needs manual counter-clockwise)
K.beginContour()
K.vertex(100, 100)  // Start
K.vertex(100, 200)  // Go down (counter-clockwise)
K.vertex(200, 200)  // Go right
K.vertex(200, 100)  // Go up
K.endContour(false) // Don't reverse - keep counter-clockwise
K.endShape(true)

// Complex curved contour
K.beginShape()
// Heart-shaped outer
K.vertex(150, 130)
K.bezierVertex(150, 100, 180, 70, 210, 100)
K.bezierVertex(240, 130, 240, 160, 210, 190)
K.bezierVertex(180, 220, 150, 220, 150, 190)
K.bezierVertex(120, 160, 120, 130, 150, 100)
K.bezierVertex(180, 70, 210, 100, 150, 130)

// Curved hole
K.beginContour()
K.vertex(150, 140)
K.bezierVertex(170, 130, 180, 140, 170, 160)
K.bezierVertex(160, 170, 140, 170, 130, 160)
K.bezierVertex(120, 140, 130, 130, 150, 140)
K.endContour() // Automatically reversed for proper hole
K.endShape(true)

// Conditional contour ending
const draw = (K: KlintContext) => {
  K.beginShape()
  K.vertex(100, 100)
  K.vertex(300, 100)
  K.vertex(300, 300)
  K.vertex(100, 300)
  
  K.beginContour()
  K.vertex(150, 150)
  K.vertex(250, 150)
  
  // Only complete the contour under certain conditions
  if (K.frame % 120 > 60) {
    K.vertex(250, 250)
    K.vertex(150, 250)
    K.endContour()
  }
  
  K.endShape(true)
}

// Letter 'O' shape
K.beginShape()
// Outer circle
const centerX = 150, centerY = 150
const outerRadius = 60, innerRadius = 30
const steps = 20

for (let i = 0; i < steps; i++) {
  const angle = (i * Math.PI * 2) / steps
  const x = centerX + outerRadius * Math.cos(angle)
  const y = centerY + outerRadius * Math.sin(angle)
  K.vertex(x, y)
}

// Inner hole
K.beginContour()
for (let i = 0; i < steps; i++) {
  const angle = (i * Math.PI * 2) / steps
  const x = centerX + innerRadius * Math.cos(angle)
  const y = centerY + innerRadius * Math.sin(angle)
  K.vertex(x, y)
}
K.endContour() // Creates the hole in the center
K.endShape(true)
```

## Notes
- Must be preceded by `beginContour()` and at least one vertex/curve function
- By default (`forceRevert = true`), reverses vertex order for proper hole rendering. If you already took care of this, do not add it or it will swap the order and break the fillrule. Use this in apps or tools when accessing this part is tricky for the user.
- Use `forceRevert = false` when you've manually created counter-clockwise contours
- Automatically called by `endShape()` if there's an open contour
- Contours are always rendered as closed paths regardless of the outer shape's close setting
- Multiple contours can be created within a single shape
- All vertex and curve functions work the same within contours