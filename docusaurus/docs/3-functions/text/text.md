# text

```ts
text(text: string | number, x: number, y: number, maxWidth?: number) => void
```

Draws text on the canvas at the specified position. Supports multi-line text using `\n` line breaks with proper alignment and spacing.

## Parameters
- `text`: The text string or number to draw
- `x`: The x-coordinate for the text
- `y`: The y-coordinate for the text  
- `maxWidth`: Optional maximum width for text fitting

! The `maxWidth` option will try to fit the text in the width by scaling it, if you want proper line breaks, use `paragraph()` instead ! 

## Multi-line Text Support

Text automatically supports line breaks using `\n` characters, if you want proper line breaks, use `paragraph()` instead :

```tsx
// Multi-line text with line breaks
K.text("Line 1\nLine 2\nLine 3", 100, 100)

// Dynamic multi-line content
const gameState = `Score: ${score}\nLevel: ${level}\nLives: ${lives}`
K.text(gameState, 20, 20)
```

## Related Functions

```ts
textFont(font: string) => void                    // Set text font
textSize(size: number) => void                    // Set text size
textLeading(spacing: number) => void              // Set line height spacing
alignText(horizontal: string, vertical?: string) => void // Set text alignment
textWidth(text: string) => number                 // Get text width
textStyle(style: string) => void                  // Set text style (normal, italic, etc)
textWeight(weight: string) => void                // Set text weight (normal, bold, etc)
```

## Alignment with Multi-line Text

Multi-line text respects both horizontal and vertical alignment:

```tsx
// Left-aligned, top-anchored (default)
K.alignText("left", "top")
K.text("Line 1\nLine 2\nLine 3", 100, 100)

// Center-aligned, middle-anchored
K.alignText("center", "middle") 
K.text("Centered\nText Block\nThree Lines", K.width/2, K.height/2)

// Right-aligned, bottom-anchored
K.alignText("right", "bottom")
K.text("Right\nAligned\nText", 400, 300)
```

## Line Height Control

Use `textLeading()` to control spacing between lines:

```tsx
// Default line height (1.2x font size)
K.textSize(20)
K.text("Normal\nSpacing\nText", 100, 100)

// Custom line height
K.textSize(20)
K.textLeading(30)  // 30px between lines
K.text("Custom\nSpacing\nText", 200, 100)

// Tight spacing
K.textSize(20)
K.textLeading(18)  // Tight spacing
K.text("Tight\nSpacing\nText", 300, 100)
```

## Examples

### Basic Multi-line Text
```tsx
const draw = (K: KlintContext) => {
  K.background("#f0f0f0")
  
  // Simple multi-line text
  K.fillColor("black")
  K.textSize(16)
  K.alignText("left", "top")
  K.text("Welcome to Klint!\nA creative coding library\nfor React applications", 20, 20)
}
```

### Game UI with Multi-line Stats
```tsx
const draw = (K: KlintContext) => {
  const { mouse } = KlintMouse()
  
  K.background("#222")
  
  // Player stats in top-right corner
  K.fillColor("white")
  K.textSize(18)
  K.alignText("right", "top")
  K.textLeading(25)
  const stats = `Score: 1,500\nLevel: 3\nLives: ❤️❤️❤️\nTime: 2:30`
  K.text(stats, K.width - 20, 20)
  
  // Centered title
  K.fillColor("yellow")
  K.textSize(32)
  K.alignText("center", "middle")
  K.textLeading(40)
  K.text("SPACE\nINVADER\nREMIX", K.width/2, K.height/2)
}
```

### Dynamic Content with Animation
```tsx
const draw = (K: KlintContext) => {
  const { mouse } = KlintMouse()
  
  K.background("white")
  
  // Animated multi-line text
  const time = K.time
  const wave = Math.sin(time * 2) * 20
  
  K.fillColor(`hsl(${time * 50}, 70%, 50%)`)
  K.textSize(24)
  K.alignText("center", "middle")
  K.textLeading(35)
  
  const animatedText = `Frame: ${K.frame}\nTime: ${time.toFixed(1)}s\nMouse: ${Math.round(mouse.x)}, ${Math.round(mouse.y)}`
  K.text(animatedText, K.width/2, K.height/2 + wave)
}
```

### Text with Stroke and Custom Alignment
```tsx
const draw = (K: KlintContext) => {
  K.background("#333")
  
  // Multi-line outlined text
  K.textSize(48)
  K.textWeight("bold")
  K.alignText("center", "middle")
  K.textLeading(55)
  
  K.strokeColor("white")
  K.strokeWidth(3)
  K.fillColor("red")
  
  K.text("BOLD\nOUTLINED\nTEXT", K.width/2, K.height/2)
}
```

### Mixed Line Lengths with Different Alignments
```tsx
const draw = (K: KlintContext) => {
  K.background("#f5f5f5")
  K.fillColor("black")
  K.textSize(20)
  K.textLeading(28)
  
  // Left-aligned mixed lengths
  K.alignText("left", "top")
  K.text("Short\nThis is a much longer line\nMedium\nA", 50, 100)
  
  // Center-aligned mixed lengths  
  K.alignText("center", "top")
  K.text("Short\nThis is a much longer line\nMedium\nA", K.width/2, 100)
  
  // Right-aligned mixed lengths
  K.alignText("right", "top") 
  K.text("Short\nThis is a much longer line\nMedium\nA", K.width - 50, 100)
}
```

## Notes

- **Multi-line Support**: Use `\n` characters for line breaks with automatic alignment
- **Vertical Alignment**: `"top"`, `"middle"`, and `"bottom"` align the entire text block
- **Horizontal Alignment**: `"left"`, `"center"`, and `"right"` align each line within the block
- **Line Height**: Use `textLeading()` to control spacing; defaults to 1.2x font size
- **Performance**: For frequently changing multi-line text, consider using offscreen canvas
- **Empty Lines**: `\n\n` creates empty lines with proper spacing
- **Dynamic Content**: Perfect for game UIs, dashboards, and real-time displays. If you need something like an FPS counter, prefer to pipe the data outside of the component and use HTML text on top of the canvas instead.
- **Alignment Consistency**: All alignment settings work intuitively with multi-line text
- Text uses the current fill color and stroke settings
- Font, size, weight, and style settings apply to the entire text block, for granular control, use multiple text blocks.
- Use `textWidth()` for measuring individual lines for advanced layouts

```ts
textFont(font: string) => void           // Set text font
textSize(size: number) => void           // Set text size
alignText(horizontal: string, vertical?: string) => void // Set text alignment
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
K.alignText("center", "middle")
K.fillColor("red")
K.text("Centered", K.width/2, K.height/2)

// Multiple lines
K.alignText("left", "top")
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
  K.alignText("left", "top")
  K.text(`Mouse: ${Math.round(mouse.x)}, ${Math.round(mouse.y)}`, 20, 20)
  
  // Time display
  const timeText = `Time: ${K.time.toFixed(1)}s`
  K.text(timeText, 20, 50)
  
  // Dynamic text following mouse
  K.fillColor("red")
  K.alignText("center", "middle")
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
  K.alignText("center", "middle")
  K.textWeight("bold")
  
  K.strokeColor("black")
  K.strokeWidth(3)
  K.fillColor("yellow")
  
  K.text("OUTLINED", K.width/2, K.height/2)
}
``` 