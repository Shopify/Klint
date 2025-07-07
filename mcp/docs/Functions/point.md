# point

```ts
point(
  x: number, 
  y: number, 
  size?: number
) => void
```

Draws a point (dot) on the canvas.

## Parameters
- `x`: The x-coordinate of the point
- `y`: The y-coordinate of the point
- `size` (optional): The size of the point in pixels (default: 1)

## Returns
- `void`

## Example
```tsx
// Single point
K.point(100, 100)

// Larger point with color
K.strokeColor("red")
K.point(200, 150, 5)

// In JSX component
const draw = (K: KlintContext) => {
  // Random point cloud
  K.strokeColor("rgba(0, 100, 255, 0.7)")
  
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * K.width
    const y = Math.random() * K.height
    const size = Math.random() * 3 + 1
    K.point(x, y, size)
  }
  
  // Highlight point under mouse
  K.strokeColor("yellow")
  K.point(K.mouseX, K.mouseY, 8)
}
```

## Notes
- Points use the current stroke color (not fill color)
- For very small points, use size 1 (default)
- For larger points, consider using `K.circle()` with `K.noStroke()`
- Useful for particle systems, stars, or data visualization
- For many points, consider batch rendering for better performance 