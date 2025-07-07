---
sidebar_position: 7
id: klintfunctions-text-styling
title: Styling Text
slug: /klinfunctions-text-styling
---

# Text Styling Functions

Klint provides various functions for styling and rendering text.

## textFont

```ts
textFont(font: string) => void
```

Sets the font family for text rendering.

```tsx
textFont("Arial")
textFont("Georgia, serif")
```

## textSize

```ts
textSize(size: number) => void
```

Sets the font size in pixels.

```tsx
textSize(24)
```

## textStyle

```ts
textStyle(style: string) => void
```

Sets the font style.

```tsx
textStyle("normal")
textStyle("italic")
```

## textWeight

```ts
textWeight(weight: string) => void
```

Sets the font weight.

```tsx
textWeight("normal")
textWeight("bold")
textWeight("700")
```

## textQuality

```ts
textQuality(quality: "speed" | "auto" | "legibility" | "precision") => void
```

Sets text rendering optimization mode.

```tsx
textQuality("legibility") // Optimize for reading
textQuality("speed") // Optimize for performance
```

## textSpacing

```ts
textSpacing(kind: "letter" | "word", value: number) => void
```

Sets letter or word spacing.

```tsx
textSpacing("letter", 2) // 2px letter spacing
textSpacing("word", 10) // 10px word spacing
```

## alignText

```ts
alignText(horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => void
```

Sets text alignment.

- `horizontal`: "left" (default), "center", "right", "start", "end"
- `vertical`: "top" (default), "middle", "bottom", "alphabetic", "hanging", "ideographic"

```tsx
alignText("center", "middle") // Center aligned
alignText("right") // Right aligned, top baseline
```

## textLeading

```ts
textLeading(spacing: number) => void
```

Sets line height for multi-line text.

```tsx
textLeading(32) // 32px line height
```

## textWidth

```ts
textWidth(text: string) => number
```

Measures the width of text string in pixels.

```tsx
const width = textWidth("Hello World")
```

## Example

```tsx
const draw = (K: KlintContext) => {
  // Setup text styles
  K.background("#222")
  K.textFont("Arial, sans-serif")
  K.textSize(32)
  K.textWeight("bold")
  K.textStyle("italic")
  K.alignText("center", "middle")
  
  // Draw centered text
  K.fillColor("white")
  K.text("Hello Klint", K.width/2, K.height/2)
  
  // Draw measured text
  const message = "Dynamic Width Text"
  K.textSize(24)
  K.textStyle("normal")
  const msgWidth = K.textWidth(message)
  
  // Draw box behind text
  K.fillColor("rgba(0,0,255,0.5)")
  K.rectangle(K.width/2 - msgWidth/2 - 10, K.height/2 + 50 - 30, msgWidth + 20, 60)
  
  // Draw text
  K.fillColor("white")
  K.text(message, K.width/2, K.height/2 + 50)
}
```

## Notes

- Text styles can be combined for various effects
- Use `computeFont()` to manually update the font string if needed
- For pixel-perfect text measurement, use `textWidth()` before placing text
- For multi-line text, use `textLeading()` to control line spacing
- For best text legibility, use `textQuality("legibility")` 