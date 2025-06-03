# arcVertex

```ts
arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number) => void
```

Adds an arc segment to the current shape being constructed with `beginShape()`. Creates a circular arc that connects the current point to a target point with a specified radius.

## Parameters
- `x1`: X coordinate of the first control point
- `y1`: Y coordinate of the first control point
- `x2`: X coordinate of the second control point
- `y2`: Y coordinate of the second control point
- `radius`: Radius of the arc

## Related Functions

```ts
beginShape() => void                      // Start a new shape
vertex(x: number, y: number) => void     // Add a line segment
bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void // Add a bezier curve
quadraticVertex(cpx: number, cpy: number, x: number, y: number) => void // Add a quadratic curve
endShape(close?: boolean) => void         // Complete the shape
```

## Example
```tsx
// Rounded rectangle using arcVertex
K.beginShape()
const w = 200, h = 100, r = 20
K.vertex(r, 0)
K.vertex(w - r, 0)
K.arcVertex(w, 0, w, r, r)        // Top-right corner
K.vertex(w, h - r)
K.arcVertex(w, h, w - r, h, r)    // Bottom-right corner
K.vertex(r, h)
K.arcVertex(0, h, 0, h - r, r)    // Bottom-left corner
K.vertex(0, r)
K.arcVertex(0, 0, r, 0, r)        // Top-left corner
K.endShape(true)

// Rounded path with varying radii
K.beginShape()
K.vertex(50, 100)
K.vertex(150, 100)
K.arcVertex(200, 100, 200, 150, 25) // Large radius corner
K.vertex(200, 200)
K.arcVertex(200, 250, 150, 250, 10) // Small radius corner
K.vertex(100, 250)
K.arcVertex(50, 250, 50, 200, 50)   // Very large radius corner
K.endShape(true)

// Mixing with other curve types
K.beginShape()
K.vertex(50, 100)
K.arcVertex(100, 50, 150, 100, 30)         // Arc
K.quadraticVertex(200, 75, 250, 100)       // Quadratic curve
K.bezierVertex(275, 125, 275, 175, 250, 200) // Bezier curve
K.vertex(100, 200)                         // Straight line
K.endShape(true)

// Creating a gear-like shape
K.beginShape()
const centerX = 150, centerY = 150
const innerRadius = 60, outerRadius = 80
const teeth = 8
const arcRadius = 5

for (let i = 0; i < teeth; i++) {
  const angle1 = (i * Math.PI * 2) / teeth
  const angle2 = ((i + 0.3) * Math.PI * 2) / teeth
  const angle3 = ((i + 0.7) * Math.PI * 2) / teeth
  const angle4 = ((i + 1) * Math.PI * 2) / teeth
  
  const x1 = centerX + innerRadius * Math.cos(angle1)
  const y1 = centerY + innerRadius * Math.sin(angle1)
  const x2 = centerX + outerRadius * Math.cos(angle2)
  const y2 = centerY + outerRadius * Math.sin(angle2)
  const x3 = centerX + outerRadius * Math.cos(angle3)
  const y3 = centerY + outerRadius * Math.sin(angle3)
  const x4 = centerX + innerRadius * Math.cos(angle4)
  const y4 = centerY + innerRadius * Math.sin(angle4)
  
  if (i === 0) K.vertex(x1, y1)
  K.arcVertex(x1 + 10, y1, x2, y2, arcRadius)
  K.vertex(x3, y3)
  K.arcVertex(x3, y3 + 10, x4, y4, arcRadius)
}
K.endShape(true)

// Arc in contours (holes)
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

// Rounded hole
K.beginContour()
K.vertex(120, 100)
K.vertex(180, 100)
K.arcVertex(200, 100, 200, 120, 20)
K.vertex(200, 180)
K.arcVertex(200, 200, 180, 200, 20)
K.vertex(120, 200)
K.arcVertex(100, 200, 100, 180, 20)
K.vertex(100, 120)
K.arcVertex(100, 100, 120, 100, 20)
K.endContour()
K.endShape(true)

// In JSX component with dynamic radius
const draw = (K: KlintContext) => {
  K.fillColor("cyan")
  K.strokeColor("white")
  K.strokeWidth(2)
  
  const dynamicRadius = 10 + Math.sin(K.time * 0.5) * 15
  
  K.beginShape()
  const w = 150, h = 100
  K.vertex(dynamicRadius, 0)
  K.vertex(w - dynamicRadius, 0)
  K.arcVertex(w, 0, w, dynamicRadius, dynamicRadius)
  K.vertex(w, h - dynamicRadius)
  K.arcVertex(w, h, w - dynamicRadius, h, dynamicRadius)
  K.vertex(dynamicRadius, h)
  K.arcVertex(0, h, 0, h - dynamicRadius, dynamicRadius)
  K.vertex(0, dynamicRadius)
  K.arcVertex(0, 0, dynamicRadius, 0, dynamicRadius)
  K.endShape(true)
}
```

## Notes
- Must be used within a `beginShape()` / `endShape()` block
- Creates circular arc segments with precise radius control
- The arc connects the current point to the end point defined by the control points
- Perfect for creating rounded corners and mechanical shapes
- More precise than bezier or quadratic curves for circular arcs
- Works within both main shapes and contours (holes)
- Can be mixed with `vertex()`, `bezierVertex()`, and `quadraticVertex()` in the same shape
- Use current fill and stroke styles
- Ideal for UI elements, buttons, and geometric shapes requiring precise circular arcs
- The two control points define the tangent lines that the arc connects
``` 