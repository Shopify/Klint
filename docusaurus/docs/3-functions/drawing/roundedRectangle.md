# roundedRectangle

```ts
roundedRectangle(
  x: number, 
  y: number, 
  width: number, 
  radius: number | number[],
  height?: number
) => void
```

Draws a rectangle with rounded corners on the canvas.

## Parameters
- `x`: The x-coordinate (position depends on rectangle origin setting)
- `y`: The y-coordinate (position depends on rectangle origin setting)
- `width`: The width of the rectangle
- `radius`: Radius for rounded corners. Can be:
  - A single number (all corners equally rounded)
  - An array of 4 numbers [topLeft, topRight, bottomRight, bottomLeft]
- `height`: Optional. The height of the rectangle (defaults to width for a square)

## Returns
- `void`

## Related Functions

```ts
rectangle(x: number, y: number, width: number, height?: number) => void // Rectangle without rounded corners
setRectOrigin(type: "center" | "corner") => void // Set rectangle origin point
```

## Example
```tsx
// Basic rounded rectangle
K.roundedRectangle(50, 50, 100, 15, 80)

// Rounded square (height defaults to width)
K.roundedRectangle(200, 50, 80, 10)

// Different corner radii
K.fillColor("purple")
K.roundedRectangle(50, 200, 150, [0, 20, 40, 10], 100)

// Styled rounded rectangle
K.fillColor("coral")
K.strokeColor("navy")
K.strokeWidth(2)
K.roundedRectangle(250, 150, 120, 25, 80)

// Rounded rectangle from center
K.setRectOrigin("center")
K.roundedRectangle(200, 200, 150, 20, 100)

// In JSX component
const draw = (K: KlintContext) => {
  // Modern UI card
  K.fillColor("#ffffff")
  K.strokeColor("#e0e0e0")
  K.strokeWidth(1)
  K.roundedRectangle(50, 50, K.width - 100, 12, 200)
  
  // Dynamic corner radius
  const radius = 5 + Math.sin(K.time) * 15
  K.fillColor("rgba(0, 150, 255, 0.8)")
  K.noStroke()
  K.roundedRectangle(100, 300, 200, radius, 60)
  
  // Button-like element
  K.fillColor("#007bff")
  K.roundedRectangle(150, 400, 100, 8, 40)
  K.fillColor("white")
  K.alignText("center", "middle")
  K.text("Button", 200, 420)
}
```

## Notes
- Follow the same origin as the `rectangle`. The default origin is "corner" (top-left), can be changed with `Klint.setRectOrigin("center")`
- When using the array form for radius, the order is [topLeft, topRight, bottomRight, bottomLeft]
- If width and height are equal, creates a rounded square
- Perfect for modern UI elements, cards, and buttons
- For rectangles without rounded corners, use `K.rectangle()` instead 