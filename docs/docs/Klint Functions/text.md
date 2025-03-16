# text

```ts
text(text: string | number | undefined, x: number, y: number, maxWidth?: number) => void
```

Draws text on the canvas.

## Parameters
- `text`: The text to display
- `x`: X-coordinate for text position
- `y`: Y-coordinate for text position
- `maxWidth`: Optional maximum width (may scale/wrap text)

## Example
```tsx
// Basic text
K.text("Hello Klint", 100, 100)

// Styled text
K.textFont("Arial")
K.textSize(24)
K.textWeight("bold")
K.fillColor("blue")
K.text("Styled Text", 100, 150)

// In JSX component
const draw = (K: KlintContext) => {
  K.textFont("Inter")
  K.textSize(36)
  K.alignText("center", "middle")
  K.fillColor("white") 
  K.text("Centered Text", K.width/2, K.height/2)
}

return <Klint draw={draw} />
```

## Notes
- Position affected by `K.alignText()` settings:
  - Horizontal: "left" (default), "center", "right"
  - Vertical: "top" (default), "middle", "bottom", "alphabetic", "hanging", "ideographic"
- Configure with `K.textFont()`, `K.textSize()`, `K.textStyle()`, `K.textWeight()`
- Rendered using current fill and stroke styles
- Use `K.textWidth()` to measure text dimensions 