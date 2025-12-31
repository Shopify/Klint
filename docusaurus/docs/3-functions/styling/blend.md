# blend

```ts
blend(mode: GlobalCompositeOperation) => void
```

Sets the blend mode for how new shapes interact with existing content.

## Parameters
- `mode`: Canvas compositing operation (e.g., "source-over", "multiply", "screen", etc.)

## Example
```tsx
// Normal drawing
background("#333")
fillColor("red")
circle(100, 100, 70)

// Additive blending (light effect)
blend("screen")
fillColor("blue")
circle(150, 100, 70)

// In JSX component
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // Normal drawing first
  K.fillColor("rgba(255, 0, 0, 0.8)")
  K.circle(K.width/2 - 50, K.height/2, 100)
  
  // Overlapping circle with blend mode
  K.blend("multiply")
  K.fillColor("rgba(0, 0, 255, 0.8)")
  K.circle(K.width/2 + 50, K.height/2, 100)
}
```

## Common Blend Modes
- `"source-over"`: Default, draws on top
- `"multiply"`: Multiplies colors, darkens
- `"screen"`: Opposite of multiply, lightens
- `"overlay"`: Mix of multiply and screen
- `"darken"`: Keeps the darker of two colors
- `"lighten"`: Keeps the lighter of two colors
- `"color-dodge"`: Brightens base color
- `"color-burn"`: Darkens base color
- `"difference"`: Subtracts colors
- `"exclusion"`: Similar to difference but lower contrast
- `"xor"`: Exclusive OR

## Notes
- Changes how new shapes interact with existing canvas content
- Powerful for creating lighting effects, shadows, and color interactions
- Does not match 1:1 the blending options you are most likely familiar with. 
- Some modes may perform poorly on older browsers
- Reset to normal drawing with `blend("default")` 