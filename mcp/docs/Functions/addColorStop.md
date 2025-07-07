# addColorStop

```ts
addColorStop(gradient: CanvasGradient, offset: number, color: string) => void
```

Adds a color stop to a gradient.

## Parameters
- `gradient`: Gradient object from `gradient()`, `radialGradient()`, or `conicGradient()`
- `offset`: Position of the color stop (0 to 1)
- `color`: CSS color string

## Example
```tsx
// Linear gradient with multiple color stops
const grad = gradient(0, 0, 400, 0)
addColorStop(grad, 0, "red")
addColorStop(grad, 0.25, "yellow")
addColorStop(grad, 0.5, "green")
addColorStop(grad, 0.75, "blue")
addColorStop(grad, 1, "purple")
fillColor(grad)
rectangle(0, 0, 400, 100)

// Radial gradient with transparency
const glow = radialGradient(200, 200, 0, 200, 200, 150)
addColorStop(glow, 0, "rgba(255, 255, 255, 1)")
addColorStop(glow, 0.7, "rgba(255, 200, 0, 0.5)")
addColorStop(glow, 1, "rgba(255, 0, 0, 0)")
fillColor(glow)
circle(200, 200, 150)

// In JSX component
const draw = (K: KlintContext) => {
  const grad = K.gradient(0, 0, 0, K.height)
  K.addColorStop(grad, 0, "black")
  K.addColorStop(grad, 0.5, "blue")
  K.addColorStop(grad, 1, "cyan")
  K.fillColor(grad)
  K.rectangle(0, 0, K.width, K.height)
}
```

## Notes
- Must be used after creating a gradient with one of the gradient functions
- The offset value is between 0 and 1, representing position along the gradient
- For linear gradients: 0 is start point, 1 is end point
- For radial gradients: 0 is inner circle, 1 is outer circle
- For conic gradients: values represent angle (0 to 1 = 0° to 360°)
- Adding multiple stops at the same position creates a hard color transition
- Adding stops with transparency creates fade effects 