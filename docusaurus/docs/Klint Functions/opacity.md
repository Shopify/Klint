# opacity

```ts
opacity(value: number) => void
```

Sets the global opacity for all drawing operations.

## Parameters
- `value`: Opacity value between 0 (transparent) and 1 (opaque)

## Example
```tsx
// Shapes with different opacities
fillColor("blue")
opacity(1.0) // Fully opaque
circle(100, 100, 50)

opacity(0.7) // 70% opaque
circle(150, 150, 50)

opacity(0.3) // 30% opaque
circle(200, 200, 50)

// In JSX component
const draw = (K: KlintContext) => {
  K.fillColor("red")
  for (let i = 0; i < 10; i++) {
    K.opacity(0.1 + i * 0.1)
    K.circle(100 + i * 50, K.height/2, 40)
  }
}
```

## Notes
- Equivalent to `globalAlpha` in canvas API
- Values < 0 are clamped to 0, values > 1 are clamped to 1
- Affects both fill and stroke operations
- Cumulative with alpha values in colors (e.g., "rgba(255,0,0,0.5)" with opacity 0.5 = 0.25 effective opacity)
- Reset to 1.0 (fully opaque) with `opacity(1)` 