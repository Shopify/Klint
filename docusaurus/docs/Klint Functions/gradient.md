# gradient

```ts
gradient(x1?: number, y1?: number, x2?: number, y2?: number) => CanvasGradient
```

Creates a linear gradient for fills or strokes.

## Parameters
- `x1`: Start x-coordinate (default: 0)
- `y1`: Start y-coordinate (default: 0)
- `x2`: End x-coordinate (default: canvas width)
- `y2`: End y-coordinate (default: canvas width)

## Returns
- `CanvasGradient`: Gradient object to use with `fillColor()` or `strokeColor()`

## Example
```tsx
// Horizontal gradient
const grad = K.gradient(0, 0, 400, 0)
K.addColorStop(grad, 0, "red")
K.addColorStop(grad, 0.5, "green")
K.addColorStop(grad, 1, "blue")
K.fillColor(grad)
K.rectangle(0, 0, 400, 200)

// In JSX component
const draw = (K: KlintContext) => {
  const grad = K.gradient(0, 0, 0, K.height)
  K.addColorStop(grad, 0, "yellow")
  K.addColorStop(grad, 1, "purple")
  K.fillColor(grad)
  K.circle(K.width/2, K.height/2, 100)
}

return <Klint draw={draw} />
```

## Notes
- Must add color stops with `K.addColorStop(gradient, offset, color)`
- Use with `K.fillColor()` or `K.strokeColor()`
- Also see `K.radialGradient()` and `K.conicGradient()` 