# radialGradient

```ts
radialGradient(
  x1?: number, 
  y1?: number, 
  r1?: number, 
  x2?: number, 
  y2?: number, 
  r2?: number
) => CanvasGradient
```

Creates a radial gradient for fills or strokes.

## Parameters
- `x1`: Inner circle center x-coordinate (default: canvas width/2)
- `y1`: Inner circle center y-coordinate (default: canvas height/2)
- `r1`: Inner circle radius (default: 0)
- `x2`: Outer circle center x-coordinate (default: canvas width/2)
- `y2`: Outer circle center y-coordinate (default: canvas height/2)
- `r2`: Outer circle radius (default: min(canvas width, canvas height))

## Returns
- `CanvasGradient`: Gradient object to use with `K.fillColor()` or `K.strokeColor()`

## Example
```tsx
// Simple radial gradient
const grad1 = K.radialGradient()
K.addColorStop(grad1, 0, "white")
K.addColorStop(grad1, 1, "blue")
K.fillColor(grad1)
K.rectangle(0, 0, 400, 400)

// Offset gradient for spotlight effect
const grad2 = K.radialGradient(200, 150, 10, 200, 150, 100)
K.addColorStop(grad2, 0, "yellow")
K.addColorStop(grad2, 0.7, "orange")
K.addColorStop(grad2, 1, "transparent")
K.fillColor(grad2)
K.circle(200, 150, 100)

// In JSX component
const draw = (K: KlintContext) => {
  // Glow effect
  const grad = K.radialGradient(K.width/2, K.height/2, 0, K.width/2, K.height/2, K.width*0.4)
  K.addColorStop(grad, 0, "rgba(255, 255, 255, 0.8)")
  K.addColorStop(grad, 0.5, "rgba(255, 200, 100, 0.4)")
  K.addColorStop(grad, 1, "rgba(255, 100, 0, 0)")
  K.fillColor(grad)
  K.circle(K.width/2, K.height/2, K.width*0.4)
}
```

## Notes
- Must add color stops with `K.addColorStop(gradient, offset, color)`
- Use with `K.fillColor()` or `K.strokeColor()`
- When inner and outer circles have different centers, creates a cone-like gradient
- Useful for creating spotlight, glow, and highlight effects
- For simple center-to-edge gradients, keep x1,y1 same as x2,y2 and set r1 to 0 