# paragraph

```ts
paragraph(
  text: string | number,
  x: number,
  y: number,
  width: number,
  options?: {
    justification?: "left" | "center" | "right" | "justified";
    overflow?: number;
    break?: "words" | "letters";
  }
) => void
```

Draws text that automatically wraps to fit within a specified width, creating a paragraph with proper line breaks and justification options.

## Parameters

- `text`: The text string or number to draw
- `x`: The x-coordinate for the paragraph (left edge)
- `y`: The y-coordinate for the top of the paragraph
- `width`: Maximum width for text wrapping
- `options.justification`: Text alignment - "left" (default), "center", "right", or "justified"
- `options.overflow`: Maximum height in pixels - text beyond this height is clipped
- `options.break`: How to break lines - "words" (default) or "letters"

## Example

```tsx
// Basic paragraph with word wrapping
const draw = (K: KlintContext) => {
  K.background("#f0f0f0");
  K.fillColor("black");
  K.textSize(16);
  
  const longText = "This is a long paragraph that will automatically wrap to fit within the specified width. Each line will break at word boundaries to maintain readability.";
  
  K.paragraph(longText, 50, 50, 300);
}

// Justified text
const draw = (K: KlintContext) => {
  K.background("white");
  K.fillColor("black");
  K.textSize(14);
  
  const text = "This paragraph uses justified alignment, spreading words evenly across each line for a clean, professional look.";
  
  K.paragraph(text, 50, 50, 400, {
    justification: "justified"
  });
}

// Centered paragraph with overflow limit
const draw = (K: KlintContext) => {
  K.background("#222");
  K.fillColor("white");
  K.textSize(18);
  
  const text = "This is a very long paragraph that will be truncated if it exceeds the overflow height. Only the first few lines will be visible.";
  
  K.paragraph(text, 100, 100, 300, {
    justification: "center",
    overflow: 150 // Limit to ~150px height
  });
}

// Letter-by-letter breaking (for special effects)
const draw = (K: KlintContext) => {
  K.background("#333");
  K.fillColor("cyan");
  K.textSize(20);
  
  const text = "This text breaks at individual letters rather than words, creating a unique visual effect.";
  
  K.paragraph(text, 50, 50, 200, {
    break: "letters"
  });
}
```

## Justification Options

### Left (default)
```tsx
K.paragraph(text, x, y, width, { justification: "left" });
// Lines align to the left edge
```

### Center
```tsx
K.paragraph(text, x, y, width, { justification: "center" });
// Lines are centered within the width
```

### Right
```tsx
K.paragraph(text, x, y, width, { justification: "right" });
// Lines align to the right edge
```

### Justified
```tsx
K.paragraph(text, x, y, width, { justification: "justified" });
// Words are spaced evenly across each line (except the last line)
```

## Break Modes

### Words (default)
Breaks at word boundaries, maintaining readability:
```tsx
K.paragraph(text, x, y, width, { break: "words" });
```

### Letters
Breaks at any character, useful for special effects:
```tsx
K.paragraph(text, x, y, width, { break: "letters" });
```

## Overflow Handling

The `overflow` option limits the paragraph height:

```tsx
K.paragraph(longText, x, y, width, {
  overflow: 200 // Only show first ~200px of text
});
```

## Notes

- Uses current text styling (font, size, weight, etc.)
- Line height is controlled by `textLeading()` or defaults to 1.2x font size
- Justified text only justifies lines with multiple words
- The last line in justified text is left-aligned
- Overflow clipping is pixel-based, not line-based
- For simple multi-line text without wrapping, use `text()` with `\n` characters
- Performance: More expensive than `text()` due to word measurement and wrapping calculations

