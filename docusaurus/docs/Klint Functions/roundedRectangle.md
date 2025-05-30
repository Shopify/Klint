# roundedRectangle

```ts
roundedRectangle(x: number, y: number, width: number, radius: number | number[], height?: number) => void
```

Draws a rectangle with rounded corners.

## Parameters
- `x`: X-coordinate (depends on rectangle origin mode)
- `y`: Y-coordinate (depends on rectangle origin mode)
- `width`: Width of rectangle
- `radius`: Corner radius or array of four corner radii [topLeft, topRight, bottomRight, bottomLeft]
- `height`: Optional height (if omitted, creates a square with width=height)

## Example
```tsx
// Basic rounded rectangle
roundedRectangle(50, 50, 200, 100, 20)

// Rounded square
roundedRectangle(300, 50, 150, 15)

// Different radii for each corner
roundedRectangle(50, 200, 200, [5, 15, 30, 0], 100)

// In JSX component
const draw = (K: KlintContext) => {
  K.setRectOrigin("center")
  K.fillColor("green")
  K.strokeColor("black")
  K.roundedRectangle(K.width/2, K.height/2, 200, 20, 100)
}
```

## Notes
- Origin position controlled by `setRectOrigin()`:
  - "corner" (default): x,y is top-left corner
  - "center": x,y is center of rectangle
- Uses current fill and stroke styles
- When providing an array of radii, follows CSS order: topLeft, topRight, bottomRight, bottomLeft 