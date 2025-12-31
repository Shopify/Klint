# rectangle

```ts
rectangle(
  x: number, 
  y: number, 
  width: number, 
  height?: number
) => void
```

Draws a rectangle on the canvas.

## Parameters
- `x`: The x-coordinate (position depends on rectangle origin setting)
- `y`: The y-coordinate (position depends on rectangle origin setting)
- `width`: The width of the rectangle
- `height`: Optional. The height of the rectangle (defaults to width for a square)

## Example
```tsx
// Basic rectangle
K.rectangle(50, 50, 100, 80)

// Square (height defaults to width)
K.rectangle(200, 50, 60)

// Styled rectangle
K.fillColor("coral")
K.strokeColor("navy")
K.strokeWidth(2)
K.rectangle(50, 150, 100, 80)

// Rectangle drawn from center
K.setRectOrigin("center")
K.rectangle(200, 200, 150, 100) // Drawn from center point

// For rounded corners, use roundedRectangle
K.roundedRectangle(50, 300, 100, 15, 80) // width=100, radius=15, height=80

// In JSX component
const draw = (K: KlintContext) => {
  // Responsive container
  K.fillColor("#222")
  K.strokeColor("#555")
  K.strokeWidth(1)
  K.rectangle(20, 20, K.width - 40, K.height - 40)
  
  // Progress bar
  const progress = (K.time * 0.5) % 1 // 0 to 1 over 2 seconds
  K.fillColor("green")
  K.noStroke()
  K.rectangle(30, K.height - 60, (K.width - 60) * progress, 20)
}
```

## Notes
- Default origin is "corner" (top-left), can be changed with `K.setRectOrigin("center")`
- If width and height are equal or the height is not provided, it will draw a square
- For rounded corners, use `K.roundedRectangle()`