# text

```ts
text(text: string, x: number, y: number) => void
```

Draws text on the canvas at the specified position.

## Parameters
- `text`: The text string to draw
- `x`: The x-coordinate for the text
- `y`: The y-coordinate for the text

## Returns
- `void`

## Related Functions

```ts
textFont(font: string) => void           // Set text font
textSize(size: number) => void           // Set text size
textAlign(horizontal: string, vertical?: string) => void // Set text alignment
textWidth(text: string) => number        // Get text width
textStyle(style: string) => void         // Set text style (normal, italic, etc)
textWeight(weight: string) => void       // Set text weight (normal, bold, etc)
```

## Example
```tsx
// Basic text
K.fillColor("black")
K.text("Hello World", 100, 100)

// Styled text
K.textFont("Arial")
K.textSize(24)
K.textWeight("bold")
K.fillColor("blue")
K.text("Bold Blue Text", 50, 150)

// Centered text
K.textAlign("center", "middle")
K.fillColor("red")
K.text("Centered", K.width/2, K.height/2)

// Multiple lines
K.textAlign("left", "top")
K.fillColor("black")
K.text("Line 1", 50, 50)
K.text("Line 2", 50, 80)
K.text("Line 3", 50, 110)

// In JSX component with dynamic content
const draw = (K: KlintContext) => {
  const { mouse } = KlintMouse()
  
  K.background("#f0f0f0")
  
  // Mouse position display
  K.fillColor("black")
  K.textSize(16)
  K.textAlign("left", "top")
  K.text(`Mouse: ${Math.round(mouse.x)}, ${Math.round(mouse.y)}`, 20, 20)
  
  // Time display
  const timeText = `Time: ${K.time.toFixed(1)}s`
  K.text(timeText, 20, 50)
  
  // Dynamic text following mouse
  K.fillColor("red")
  K.textAlign("center", "middle")
  K.textSize(20)
  K.text("Follow Me!", mouse.x, mouse.y - 30)
  
  // Animated text
  const wave = Math.sin(K.time * 2) * 20
  K.fillColor("blue")
  K.text("Wavy Text", K.width/2, K.height/2 + wave)
}

// Text with stroke
const draw = (K: KlintContext) => {
  K.background("white")
  
  // Outlined text
  K.textSize(48)
  K.textAlign("center", "middle")
  K.textWeight("bold")
  
  K.strokeColor("black")
  K.strokeWidth(3)
  K.fillColor("yellow")
  
  K.text("OUTLINED", K.width/2, K.height/2)
}
```

## Notes
- Text position depends on the current text alignment settings
- Default alignment is "left" horizontal, "alphabetic" vertical
- Text uses the current fill color for the text itself
- Text can also use stroke color if stroke is enabled
- Font, size, weight, and style must be set before drawing
- Text coordinates represent the baseline position for default alignment
- Use `textWidth()` to measure text before drawing for layout calculations
- Text wrapping is not automatic - use multiple `text()` calls for multiline text
- For better performance with frequently changing text, consider using offscreen canvas 