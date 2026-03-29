# Text

The Text element provides advanced text layout, measurement, and typography features for complex text rendering.

## Access

```tsx
const draw = (K: KlintContext) => {
  // Access the Text element
  const size = K.Text.findTextSize("Hello World", 300);
  const letters = K.Text.splitTo("Text", "letters");
}
```

## Measurement Functions

### getTextMetrics(text)

```ts
getTextMetrics(text: string) => { width: number, height: number, baseline: number }
```

Returns detailed metrics for text rendering.

```tsx
const metrics = K.Text.getTextMetrics("Hello World")
console.log(metrics.width)    // Text width in pixels
console.log(metrics.height)   // Text height in pixels  
console.log(metrics.baseline) // Baseline offset
```

### textBounds(text)

```ts
textBounds(text: string) => { x: number, y: number, width: number, height: number }
```

Returns the bounding box for text rendering.

```tsx
const bounds = K.Text.textBounds("Sample Text")
K.strokeColor("red")
K.strokeWidth(1)
K.rectangle(bounds.x, bounds.y, bounds.width, bounds.height)
```

### findTextSize(text, distance, estimate?, direction?)

```ts
findTextSize(text: string, dist: number, estimate?: number, direction?: "x" | "y") => number
```

Finds the optimal text size to fit within specified dimensions using binary search.

```tsx
// Find size to fit text in 300px width
const size = K.Text.findTextSize("Long text string", 300, 50, "x")
K.textSize(size)
K.text("Long text string", 100, 200)

// Find size to fit text in 100px height
const vSize = K.Text.findTextSize("Tall Text", 100, 72, "y")
K.textSize(vSize)
K.text("Tall Text", 200, 200)
```

## Text Layout Functions

### splitTo(text, kind, options?)

```ts
splitTo(
  text: string, 
  kind: "letters" | "words" | "lines" | "all",
  options?: {
    maxWidth?: number,
    lineSpacing?: number,
    letterSpacing?: number,
    wordSpacing?: number
  }
) => Array<{
  char: string,
  x: number,
  y: number,
  metrics: { width: number, height: number, baseline: number },
  letterIndex?: number,
  wordIndex?: number,
  lineIndex?: number
}>
```

Splits text into individual components with positioning data for advanced layout.

```tsx
// Split into letters for animation
const letters = K.Text.splitTo("ANIMATE", "letters")
letters.forEach((letter, i) => {
  const offset = Math.sin(K.time * 5 + i * 0.5) * 20
  K.fillColor(`hsl(${i * 40}, 70%, 60%)`)
  K.text(letter.char, letter.x, letter.y + offset)
})

// Split into words with spacing
const words = K.Text.splitTo("Split these words", "words", {
  wordSpacing: 20
})
words.forEach((letter, i) => {
  if (letter.char !== " ") {
    K.fillColor("white")
    K.text(letter.char, letter.x + 100, letter.y + 300)
  }
})

// Multi-line text with custom spacing
const lines = K.Text.splitTo("Line one\nLine two\nLine three", "lines", {
  lineSpacing: 30
})
lines.forEach((letter) => {
  K.fillColor("cyan")
  K.text(letter.char, letter.x + 200, letter.y + 400)
})

// Get all metadata for complex layouts
const allData = K.Text.splitTo("Complex layout", "all")
allData.forEach((letter) => {
  const hue = (letter.letterIndex || 0) * 20
  K.fillColor(`hsl(${hue}, 60%, 70%)`)
  K.text(letter.char, letter.x + 300, letter.y + 500)
})
```

### circularText(text, radius?, fill?, offset?, arc?)

```ts
circularText(
  text: string,
  radius?: number,
  fill?: "fill" | "kerned" | "words",
  offset?: number,
  arc?: number
) => void
```

Renders text along a circular path with different layout modes.

```tsx
// Basic circular text
K.Text.circularText("CIRCULAR TEXT", 100)

// Kerned (proper character spacing)
K.Text.circularText("BETTER SPACING", 150, "kerned", Math.PI/4)

// Words distributed evenly
K.Text.circularText("WORD BASED LAYOUT", 200, "words", 0, Math.PI)

// Partial circle with offset
K.Text.circularText("PARTIAL ARC", 120, "fill", K.time, Math.PI * 1.5)
```

## Animation Examples

### Letter-by-Letter Animation

```tsx
const draw = (K: KlintContext) => {
  K.background("#222")
  
  const text = "STAGGERED REVEAL"
  const letters = K.Text.splitTo(text, "letters")
  
  K.textSize(48)
  K.alignText("center", "middle")
  
  letters.forEach((letter, i) => {
    // Staggered fade-in
    const delay = i * 0.1
    const progress = Math.max(0, (K.time * 3 - delay) % 2)
    const alpha = K.Easing.out(Math.min(1, progress))
    
    if (letter.char !== " ") {
      K.fillColor(`rgba(255, 255, 255, ${alpha})`)
      
      // Add bounce effect
      const bounce = Math.sin(progress * Math.PI) * 10
      K.text(letter.char, letter.x + K.width/2, letter.y + K.height/2 - bounce)
    }
  })
}
```

### Word Wave Effect

```tsx
const draw = (K: KlintContext) => {
  K.background("#111")
  
  const sentence = "WAVES OF TEXT"
  const letters = K.Text.splitTo(sentence, "all", { wordSpacing: 40 })
  
  K.textSize(32)
  K.alignText("center", "middle")
  
  letters.forEach((letter) => {
    if (letter.char !== " ") {
      const wordOffset = (letter.wordIndex || 0) * 0.8
      const letterOffset = (letter.letterIndex || 0) * 0.2
      const wave = Math.sin(K.time * 4 + wordOffset + letterOffset) * 30
      
      const hue = ((letter.wordIndex || 0) * 60) % 360
      K.fillColor(`hsl(${hue}, 80%, 70%)`)
      
      K.text(letter.char, letter.x + K.width/2, letter.y + K.height/2 + wave)
    }
  })
}
```

### Responsive Text Sizing

```tsx
const draw = (K: KlintContext) => {
  K.background("#333")
  
  // Text that always fits the canvas width
  const availableWidth = K.width - 100
  const dynamicText = "RESPONSIVE TEXT SIZING"
  
  const optimalSize = K.Text.findTextSize(dynamicText, availableWidth, 72, "x")
  K.textSize(optimalSize)
  K.alignText("center", "middle")
  K.fillColor("yellow")
  K.text(dynamicText, K.width/2, K.height/2)
  
  // Show bounds for debugging
  const bounds = K.Text.textBounds(dynamicText)
  K.strokeColor("red")
  K.strokeWidth(2)
  K.rectangle(
    K.width/2 + bounds.x, 
    K.height/2 + bounds.y, 
    bounds.width, 
    bounds.height
  )
}
```

### Circular Text Animation

```tsx
const draw = (K: KlintContext) => {
  K.background("#000")
  
  K.push()
  K.translate(K.width/2, K.height/2)
  
  // Animated circular text
  K.textSize(24)
  K.fillColor("cyan")
  
  // Rotating text with changing radius
  const radius = 100 + Math.sin(K.time * 2) * 30
  const offset = K.time * 5
  
  K.Text.circularText("SPINNING AROUND", radius, "kerned", offset)
  
  // Multiple rings
  K.fillColor("magenta")
  K.Text.circularText("INNER RING", 60, "fill", -offset * 1.5, Math.PI)
  
  K.fillColor("yellow")
  K.Text.circularText("OUTER SPACE", 180, "words", offset * 0.7, Math.PI * 1.8)
  
  K.pop()
}
```

### Multi-line Layout

```tsx
const draw = (K: KlintContext) => {
  K.background("#444")
  
  const poem = `Typography is the craft
of endowing human language
with a durable visual form`
  
  const lines = K.Text.splitTo(poem, "lines", {
    lineSpacing: 20
  })
  
  K.textSize(28)
  K.alignText("center", "top")
  
  lines.forEach((letter, i) => {
    // Color-code each line
    const lineColor = letter.lineIndex === 0 ? "lightblue" :
                     letter.lineIndex === 1 ? "lightgreen" : "lightcoral"
    
    // Add typewriter effect
    const lineProgress = (K.time * 2 - (letter.lineIndex || 0) * 1.5) % 4
    const charIndex = letter.letterIndex || 0
    const shouldShow = charIndex < lineProgress * 20
    
    if (shouldShow) {
      K.fillColor(lineColor)
      K.text(letter.char, letter.x + K.width/2, letter.y + 200)
    }
  })
}
```

## Layout Options

The `splitTo` function accepts these options:

- **maxWidth**: Maximum line width for automatic wrapping
- **lineSpacing**: Additional space between lines (pixels)
- **letterSpacing**: Additional space between letters (pixels)  
- **wordSpacing**: Additional space between words (pixels)

## CircularText Fill Modes

- **"fill"**: Evenly distributes characters around the circle
- **"kerned"**: Uses actual character widths for natural spacing
- **"words"**: Distributes words evenly, maintaining word integrity

## Best Practices

- Use `findTextSize()` for responsive text that must fit specific dimensions
- Leverage `splitTo()` for character-level animations and effects
- Use `textBounds()` for precise positioning and collision detection
- `circularText()` with "kerned" mode provides the most natural appearance
- Combine with `K.Time` and `K.Easing` for smooth text animations
- Cache `splitTo()` results when text doesn't change to improve performance

## Notes

- All positioning respects current `alignText` settings
- Text metrics include actual character dimensions, not just CSS font metrics
- `findTextSize()` uses binary search for efficient size calculation (max 16 iterations)
- Circular text automatically handles rotation and positioning
- Letter spacing and word spacing are additive to default browser spacing
- Performance scales with text length - consider caching for static text 