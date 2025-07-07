# ellipse

```ts
ellipse(
  x: number, 
  y: number, 
  width: number, 
  height: number
) => void
```

Draws an ellipse (oval) on the canvas.

## Parameters
- `x`: The x-coordinate of the center of the ellipse
- `y`: The y-coordinate of the center of the ellipse
- `width`: The width of the ellipse
- `height`: The height of the ellipse

## Returns
- `void`

## Example
```tsx
// Basic ellipse
K.ellipse(200, 200, 100, 50)

// Styled ellipse with rotation
K.fillColor("purple")
K.strokeColor("orange")
K.strokeWidth(3)
K.rotate(Math.PI / 4)
K.ellipse(200, 200, 150, 75)

// In JSX component
const draw = (K: KlintContext) => {
  // Animated pulsing ellipse
  const pulse = Math.sin(K.frameCount * 0.05) * 20 + 50
  K.fillColor("rgba(0, 150, 255, 0.6)")
  K.strokeColor("rgba(0, 0, 255, 0.8)")
  K.strokeWidth(2)
  K.ellipse(K.width/2, K.height/2, pulse*1.5, pulse)
}
```

## Notes
- If width and height are equal, it will draw a circle
- Use `K.push()` and `K.pop()` when applying transformations like rotation
- For efficient animation, prefer changing width/height over recreating the ellipse
- Ellipses are drawn from center point, unlike rectangles which are drawn from top-left 