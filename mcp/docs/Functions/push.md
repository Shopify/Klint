# push

```ts
push() => void
```

Saves the current drawing state (transformations, styles, etc.) to the stack.

## Returns
- `void`

## Related Functions

```ts
pop() => void                             // Restore saved state
resetTransform() => void                  // Reset all transformations
translate(x: number, y: number) => void  // Translate coordinate system
rotate(angle: number) => void             // Rotate coordinate system
scale(x: number, y?: number) => void      // Scale coordinate system
```

## Example
```tsx
// Basic usage
K.push()
K.translate(100, 100)
K.rotate(Math.PI / 4)
K.fillColor("red")
K.rectangle(0, 0, 50, 50)
K.pop() // Restore previous state

// Nested transformations
K.push()
  K.translate(K.width/2, K.height/2)
  K.fillColor("blue")
  K.circle(0, 0, 50)
  
  K.push()
    K.rotate(K.time)
    K.fillColor("yellow")
    K.rectangle(-25, -25, 50, 50)
  K.pop() // Restore to centered state
  
  K.fillColor("green")
  K.circle(100, 0, 25)
K.pop() // Restore to original state

// In JSX component with complex transformations
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // Save original state
  K.push()
  
  // Apply global transformation
  K.translate(K.width/2, K.height/2)
  K.scale(1 + Math.sin(K.time) * 0.2)
  
  // Draw multiple objects with individual transformations
  for (let i = 0; i < 8; i++) {
    K.push() // Save current state for each object
    
    const angle = (i / 8) * Math.PI * 2
    K.rotate(angle)
    K.translate(100, 0)
    K.rotate(K.time * 2)
    
    K.fillColor(`hsl(${i * 45}, 70%, 60%)`)
    K.rectangle(-15, -15, 30, 30)
    
    K.pop() // Restore state before next iteration
  }
  
  K.pop() // Restore original state
}
```

## What Gets Saved

The `push()` function saves:
- **Transformation matrix** (translate, rotate, scale operations)
- **Fill style** (color, gradient, pattern)
- **Stroke style** (color, gradient, pattern)
- **Line width**
- **Line cap and join styles**
- **Global alpha** (opacity)
- **Global composite operation** (blending mode)
- **Clipping region**
- **Font settings**
- **Text alignment**

## Performance Considerations

```tsx
// Efficient: Minimize push/pop calls
const draw = (K: KlintContext) => {
  K.fillColor("red")
  
  // Draw many similar objects without push/pop
  for (let i = 0; i < 100; i++) {
    K.circle(i * 10, 100, 5)
  }
  
  // Use push/pop only when needed
  K.push()
  K.fillColor("blue")
  K.translate(50, 50)
  K.circle(0, 0, 20)
  K.pop()
}

// Less efficient: Unnecessary push/pop in loop
const draw = (K: KlintContext) => {
  for (let i = 0; i < 100; i++) {
    K.push() // Expensive in tight loops
    K.fillColor("red")
    K.circle(i * 10, 100, 5)
    K.pop()
  }
}
```

## Common Patterns

### Isolated Transformations

```tsx
// Draw object without affecting global state
K.push()
K.translate(x, y)
K.rotate(angle)
K.scale(size)
drawComplexObject(K)
K.pop() // Everything returns to normal
```

### Style Isolation

```tsx
// Temporarily change drawing style
K.push()
K.fillColor("red")
K.strokeColor("black")
K.strokeWidth(3)
K.circle(100, 100, 50)
K.pop() // Previous fill/stroke restored
```

### Nested UI Elements

```tsx
const drawButton = (K, x, y, width, height, text) => {
  K.push()
  K.translate(x, y)
  
  // Button background
  K.fillColor("#4a90e2")
  K.roundedRectangle(0, 0, width, 8, height)
  
  // Button text
  K.fillColor("white")
  K.textAlign("center", "middle")
  K.text(text, width/2, height/2)
  
  K.pop()
}

const draw = (K: KlintContext) => {
  K.background("#f5f5f5")
  
  // Draw multiple buttons without interference
  drawButton(K, 50, 100, 120, 40, "Button 1")
  drawButton(K, 200, 100, 120, 40, "Button 2")
  drawButton(K, 350, 100, 120, 40, "Button 3")
}
```

## Notes
- Every `push()` must be balanced with a corresponding `pop()`
- Saves current state to a stack - multiple `push()` calls create nested saves
- Use `push()` and `pop()` to isolate transformations and style changes
- Similar to `save()` in the Canvas API, but with more intuitive naming
- Canvas state stack has a limit (typically 32-64 levels) - avoid excessive nesting
- For simple style changes, consider setting properties directly instead of push/pop
- Essential for complex drawings with multiple coordinate systems 