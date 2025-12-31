# circle

```ts
circle(
  x: number, 
  y: number, 
  radius: number,
  radius2?: number
) => void
```

Draws a circle or an ellipse on the canvas.

## Parameters
- `x`: The x-coordinate of the center of the circle
- `y`: The y-coordinate of the center of the circle
- `radius`: The radius of the circle (or radius for x-axis if radius2 is provided)
- `radius2`: Optional. The radius for the y-axis, creating an ellipse

## Returns
- `void`

## Example
```tsx
// Basic circle
K.circle(100, 100, 25)

// Styled circle
K.fillColor("yellow")
K.strokeColor("black")
K.strokeWidth(2)
K.circle(200, 150, 40)

// Ellipse using two radii
K.fillColor("purple")
K.circle(300, 200, 50, 30) // 50px radius horizontally, 30px vertically

// In JSX component
const draw = (K: KlintContext) => {
  // Animated circle that follows mouse
  const size = 15 + Math.sin(K.time * 2) * 5
  
  K.fillColor("rgba(255, 0, 150, 0.7)")
  K.strokeColor("white")
  K.strokeWidth(2)
  K.circle(mouse.x, mouse.y, size)

  // Add some smaller circles
  K.fillColor("rgba(100, 200, 255, 0.5)")
  K.noStroke()
  for (let i = 0; i < 5; i++) {
    const angle = K.time * 0.5 + i * Math.PI * 2 / 5
    const x = mouse.x + Math.cos(angle) * 50
    const y = mouse.y + Math.sin(angle) * 50
    K.circle(x, y, size / 2)
  }
}
```

## Notes
- Circle is drawn from its center point
- The radius is the distance from center to edge (not diameter)
- If radius2 is provided, creates an ellipse with different x and y radii