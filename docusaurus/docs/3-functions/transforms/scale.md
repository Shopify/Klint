# scale

```ts
scale(x: number, y?: number) => void
```

Scales the coordinate system by the specified factors. The scale takes place around the (0,0), use `translate()` before `scale()` to rotate around a different point.

## Parameters
- `x`: The horizontal scaling factor
- `y`: Optional. The vertical scaling factor (defaults to x for uniform scaling)

## Example
```tsx
// Uniform scaling (2x larger)
K.scale(2)
K.rectangle(0, 0, 50, 50) // Drawn as 100x100 rectangle

// Non-uniform scaling
K.scale(2, 0.5) // 2x wider, 0.5x taller
K.rectangle(0, 0, 50, 50) // Drawn as 100x25 rectangle

// Scale from center point
K.push()
K.translate(200, 200) // Move to center
K.scale(1.5) // Scale up 1.5x
K.translate(-25, -25) // Center the rectangle
K.rectangle(0, 0, 50, 50)
K.pop()

// Animated scaling
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // Pulsing circle
  K.push()
  K.translate(K.width/2, K.height/2)
  const scaleValue = 1 + Math.sin(K.time * 2) * 0.3
  K.scale(scaleValue)
  K.fillColor("yellow")
  K.circle(0, 0, 30)
  K.pop()
  
  // Stretching animation
  K.push()
  K.translate(100, 100)
  K.scale(1 + Math.sin(K.time) * 0.5, 1 + Math.cos(K.time) * 0.5)
  K.fillColor("purple")
  K.rectangle(-25, -25, 50, 50)
  K.pop()
}

// Mirror effect using negative scaling
const draw = (K: KlintContext) => {
  K.background("white")
  
  // Original shape
  K.fillColor("blue")
  K.rectangle(100, 100, 50, 30)
  
  // Horizontal mirror
  K.push()
  K.translate(300, 100)
  K.scale(-1, 1) // Flip horizontally
  K.fillColor("red")
  K.rectangle(0, 0, 50, 30)
  K.pop()
  
  // Vertical mirror
  K.push()
  K.translate(100, 200)
  K.scale(1, -1) // Flip vertically
  K.fillColor("green")
  K.rectangle(0, 0, 50, 30)
  K.pop()
  
  // Both mirrors
  K.push()
  K.translate(300, 200)
  K.scale(-1, -1) // Flip both ways
  K.fillColor("orange")
  K.rectangle(0, 0, 50, 30)
  K.pop()
}

// Responsive scaling
const draw = (K: KlintContext) => {
  // Scale based on canvas size
  const baseSize = 400
  const scaleX = K.width / baseSize
  const scaleY = K.height / baseSize
  
  K.push()
  K.scale(scaleX, scaleY)
  
  // Draw at base resolution
  K.fillColor("cyan")
  K.rectangle(50, 50, 100, 80)
  K.fillColor("magenta")
  K.circle(200, 150, 40)
  
  K.pop()
}
```

## Notes
- Scaling factors multiply the size of all subsequent drawing operations
- A scale of 1 means normal size, 2 means double size, 0.5 means half size
- If only x is provided, y defaults to the same value (uniform scaling)
- Negative values flip the coordinate system (useful for mirroring)
- Scaling affects both position and size of objects
- Scale factors are cumulative - multiple `scale()` calls multiply together
- Use `push()` and `pop()` to save and restore transformation state
- Scale from a specific point by translating first
- Very small scale values (near 0) can cause rendering issues
- Use `resetTransform()` to reset all transformations 