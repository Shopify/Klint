# conicGradient

```ts
conicGradient(angle?: number, x1?: number, y1?: number) => CanvasGradient
```

Creates a conic (angular) gradient for fills or strokes.

## Parameters
- `angle`: Starting angle in radians (default: 0)
- `x1`: Center x-coordinate (default: canvas width/2)
- `y1`: Center y-coordinate (default: canvas height/2)

## Returns
- `CanvasGradient`: Gradient object to use with `fillColor()` or `strokeColor()`

## Example
```tsx
// Basic conic gradient (color wheel)
const grad1 = conicGradient(0, 200, 200)
addColorStop(grad1, 0, "red")
addColorStop(grad1, 0.17, "orange")
addColorStop(grad1, 0.33, "yellow")
addColorStop(grad1, 0.5, "green")
addColorStop(grad1, 0.67, "blue")
addColorStop(grad1, 0.83, "indigo")
addColorStop(grad1, 1, "violet")
fillColor(grad1)
circle(200, 200, 150)

// Pie chart style gradient
const grad2 = conicGradient(0, 350, 200)
addColorStop(grad2, 0, "blue")
addColorStop(grad2, 0.25, "blue")
addColorStop(grad2, 0.25, "red")
addColorStop(grad2, 0.5, "red")
addColorStop(grad2, 0.5, "green")
addColorStop(grad2, 0.75, "green")
addColorStop(grad2, 0.75, "yellow")
addColorStop(grad2, 1, "yellow")
fillColor(grad2)
circle(350, 200, 150)

// In JSX component
const draw = (K: KlintContext) => {
  const grad = K.conicGradient(K.time, K.width/2, K.height/2)
  K.addColorStop(grad, 0, "red")
  K.addColorStop(grad, 0.25, "yellow")
  K.addColorStop(grad, 0.5, "green")
  K.addColorStop(grad, 0.75, "blue")
  K.addColorStop(grad, 1, "red")
  K.fillColor(grad)
  K.circle(K.width/2, K.height/2, Math.min(K.width, K.height) * 0.4)
}
```

## Notes
- Must add color stops with `addColorStop(gradient, offset, color)`
- Use with `fillColor()` or `strokeColor()`
- Colors transition around the center point
- Offset values represent positions around the circle (0 to 1 = 0 to 360 degrees)
- Perfect for color wheels, pie charts, and radial indicators
- Less supported in older browsers compared to linear and radial gradients 