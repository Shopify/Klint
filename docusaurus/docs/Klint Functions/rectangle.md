# rectangle

```ts
rectangle(
  x: number, 
  y: number, 
  width: number, 
  height: number,
  radius?: number | number[]
) => void
```

Draws a rectangle on the canvas, with optional rounded corners.

## Parameters
- `x`: The x-coordinate of the top-left corner
- `y`: The y-coordinate of the top-left corner
- `width`: The width of the rectangle
- `height`: The height of the rectangle
- `radius` (optional): Radius for rounded corners. Can be:
  - A single number (all corners equally rounded)
  - An array of 4 numbers [topLeft, topRight, bottomRight, bottomLeft]

## Returns
- `void`

## Example
```tsx
// Basic rectangle
K.rectangle(50, 50, 100, 80)

// Rounded rectangle
K.fillColor("coral")
K.strokeColor("navy")
K.strokeWidth(2)
K.rectangle(50, 150, 100, 80, 15)

// Rectangle with different corner radii
K.rectangle(200, 50, 150, 100, [0, 20, 40, 10])

// In JSX component
const draw = (K: KlintContext) => {
  // Responsive container with rounded corners
  K.fillColor("#222")
  K.strokeColor("#555")
  K.strokeWidth(1)
  K.rectangle(20, 20, K.width - 40, K.height - 40, 8)
  
  // Progress bar
  const progress = (K.frameCount % 100) / 100
  K.fillColor("green")
  K.noStroke()
  K.rectangle(30, K.height - 60, (K.width - 60) * progress, 20, 5)
}
```

## Notes
- If width and height are equal, it will draw a square
- When using the array form for radius, the order is [topLeft, topRight, bottomRight, bottomLeft]
- For better performance, reuse rectangles by changing properties rather than creating new ones
- Rectangles are drawn from top-left corner, unlike ellipses which are drawn from center
- For a rectangle without fill, use `K.noFill()` before drawing