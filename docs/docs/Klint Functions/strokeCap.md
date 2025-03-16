# strokeCap

```ts
strokeCap(cap: CanvasLineCap) => void
```

Sets the style of line endpoints.

## Parameters
- `cap`: End cap style - "butt" (default), "round", or "square"

## Example
```tsx
// Different stroke cap styles
strokeWidth(20)
strokeColor("blue")

strokeCap("butt") // Default, flat ends
line(50, 50, 150, 50)

strokeCap("round") // Rounded ends
line(50, 100, 150, 100)

strokeCap("square") // Extended flat ends
line(50, 150, 150, 150)

// In JSX component
const draw = (K: KlintContext) => {
  K.strokeWidth(25)
  K.strokeColor("white")
  K.strokeCap("round")
  K.line(100, K.height/2, K.width-100, K.height/2)
}
```

## Notes
- Only affects the endpoints of lines and open shapes
- "butt" ends the line exactly at the endpoint
- "round" adds a semicircle to the endpoint
- "square" extends the line by half the line width
- Most visible with thick stroke widths
- No effect on closed shapes like circles and rectangles 