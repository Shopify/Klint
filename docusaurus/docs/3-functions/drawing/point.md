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
A point is a one pixel long line. It's technically more efficient that drawing a circle, or a square with the appropriate stroke end, but it's less customizable and won't work with some functions like `Klint.clip` and scaling it will most likely create alliasing. It's more suited for particle system where you have to draw a lot.


## Notes
- Points use the current stroke color (not fill color)
- For very small points, use size 1 (default), which will draw a one pixel dot.
- For larger points, consider using `K.circle()` with `K.noStroke()`
- Useful for particle systems, stars, or data visualization
- For many points, consider batch rendering for better performance 