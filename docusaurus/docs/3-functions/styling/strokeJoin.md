# strokeJoin

```ts
strokeJoin(join: CanvasLineJoin) => void
```

Sets the style of joints where lines meet.

## Parameters
- `join`: Joint style - "miter" (default), "round", or "bevel"

## Example
```tsx
// Different stroke join styles
strokeWidth(10)
strokeColor("blue")

strokeJoin("miter") // Default, sharp corners
rectangle(50, 50, 100, 100)

strokeJoin("round") // Rounded corners
rectangle(200, 50, 100, 100)

strokeJoin("bevel") // Flattened corners
rectangle(350, 50, 100, 100)

// In JSX component
const draw = (K: KlintContext) => {
  K.strokeWidth(15)
  K.strokeColor("white")
  K.noFill()
  K.strokeJoin("round")
  K.rectangle(K.width/2-100, K.height/2-100, 200, 200)
}
```

## Notes
- Only affects corners where lines meet
- "miter" creates sharp corners
- "round" creates rounded corners
- "bevel" creates flattened (cut off) corners
- Most visible with thick stroke widths 
- Won't affect the end of the strokes, see `strokeCap`