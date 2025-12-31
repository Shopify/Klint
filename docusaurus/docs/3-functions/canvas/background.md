# background

```ts
background(color?: string) => void
```
Clears the canvas and sets its background color.

## Parameters
- `color`: CSS color string or Klint color functions. If omitted or "transparent", only clears the canvas.

## Example
```tsx
// Basic usage
background("#FFF")
background("rgba(0, 0, 0, 0.5)")
background() // clear canvas

// In JSX component
const draw = (K: KlintContext) => {
  K.background("#1a1a1a")
  // Draw other elements...
}

return <Klint draw={draw} />
```

## Notes
- Resets transformation before filling
- Restores transformation afterward 
- If canvas origin is "center", applies appropriate translation after filling
- Often used as the first operation in draw loops 