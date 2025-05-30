# circle

```ts
circle(
  x: number, 
  y: number, 
  diameter: number
) => void
```

Draws a circle on the canvas.

## Parameters
- `x`: The x-coordinate of the center of the circle
- `y`: The y-coordinate of the center of the circle
- `diameter`: The diameter of the circle

## Returns
- `void`

## Example
```tsx
// Basic circle
K.circle(100, 100, 50)

// Styled circle
K.fillColor("yellow")
K.strokeColor("black")
K.strokeWidth(2)
K.circle(200, 150, 80)

// In JSX component
const draw = (K: KlintContext) => {
  // Animated circle that follows mouse
  const size = 30 + Math.sin(K.frameCount * 0.1) * 10
  
  K.fillColor("rgba(255, 0, 150, 0.7)")
  K.strokeColor("white")
  K.strokeWidth(2)
  K.circle(K.mouseX, K.mouseY, size)

  // Add some smaller circles
  K.fillColor("rgba(100, 200, 255, 0.5)")
  K.noStroke()
  for (let i = 0; i < 5; i++) {
    const angle = K.frameCount * 0.05 + i * Math.PI * 2 / 5
    const x = K.mouseX + Math.cos(angle) * 50
    const y = K.mouseY + Math.sin(angle) * 50
    K.circle(x, y, size / 2)
  }
}
```

## Notes
- Circle is drawn from its center point
- For an oval shape, use `K.ellipse()` instead
- The diameter is the full width/height of the circle
- For a circle without fill, use `K.noFill()` before drawing
- For high-performance applications with many circles, consider batching similar circles together 