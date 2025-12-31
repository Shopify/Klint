# applyTransform

```ts
applyTransform(a: number, b: number, c: number, d: number, e: number, f: number) => void
```

Applies a custom transformation matrix to the current transformation matrix. This is the low-level way to apply transformations using a 2D transformation matrix.

## Transformation Matrix

The transformation matrix has 6 parameters representing a 2x3 matrix:

```
[a  c  e]
[b  d  f]
[0  0  1]
```

Where:
- `a`, `b`, `c`, `d`: Scale, rotation, and skew
- `e`, `f`: Translation (x, y)

## Parameters

- `a`: Horizontal scaling/rotation component
- `b`: Vertical skew/rotation component  
- `c`: Horizontal skew/rotation component
- `d`: Vertical scaling/rotation component
- `e`: Horizontal translation
- `f`: Vertical translation

## Example

```tsx
// Equivalent to translate(100, 50)
K.applyTransform(1, 0, 0, 1, 100, 50)

// Equivalent to scale(2, 2)
K.applyTransform(2, 0, 0, 2, 0, 0)

// Equivalent to rotate(Math.PI / 4)
const angle = Math.PI / 4
const cos = Math.cos(angle)
const sin = Math.sin(angle)
K.applyTransform(cos, sin, -sin, cos, 0, 0)

// Combined transformation
K.applyTransform(2, 0, 0, 2, 100, 50) // Scale 2x and translate
K.circle(0, 0, 20) // Drawn at (100, 50) with 2x size
```

## Common Transformations

### Translation

```tsx
// translate(x, y) equivalent
function translate(x: number, y: number) {
  K.applyTransform(1, 0, 0, 1, x, y)
}
```

### Scaling

```tsx
// scale(sx, sy) equivalent
function scale(sx: number, sy: number) {
  K.applyTransform(sx, 0, 0, sy, 0, 0)
}
```

### Rotation

```tsx
// rotate(angle) equivalent
function rotate(angle: number) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  K.applyTransform(cos, sin, -sin, cos, 0, 0)
}
```

### Skew

```tsx
// Skew horizontally
K.applyTransform(1, 0, Math.tan(angle), 1, 0, 0)

// Skew vertically
K.applyTransform(1, Math.tan(angle), 0, 1, 0, 0)
```

## Advanced Usage

### Custom Matrix Transformations

```tsx
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // Create a custom transformation
  // This combines rotation, scale, and translation
  const angle = K.time * 0.5
  const scale = 1 + Math.sin(K.time) * 0.5
  const tx = K.width / 2
  const ty = K.height / 2
  
  const cos = Math.cos(angle) * scale
  const sin = Math.sin(angle) * scale
  
  K.applyTransform(cos, sin, -sin, cos, tx, ty)
  
  K.fillColor("cyan")
  K.rectangle(-25, -25, 50, 50)
}
```

### Matrix Composition

```tsx
// Apply multiple transformations in sequence
const draw = (K: KlintContext) => {
  K.background("white")
  
  // First transformation: translate and rotate
  const angle1 = Math.PI / 6
  const cos1 = Math.cos(angle1)
  const sin1 = Math.sin(angle1)
  K.applyTransform(cos1, sin1, -sin1, cos1, 100, 100)
  
  // Second transformation: scale
  K.applyTransform(2, 0, 0, 2, 0, 0)
  
  // Result: rotated, scaled, and translated
  K.fillColor("red")
  K.rectangle(-10, -10, 20, 20)
}
```

### Reflection/Mirroring

```tsx
// Mirror horizontally
K.applyTransform(-1, 0, 0, 1, K.width, 0)

// Mirror vertically
K.applyTransform(1, 0, 0, -1, 0, K.height)

// Mirror both axes
K.applyTransform(-1, 0, 0, -1, K.width, K.height)
```

## When to Use

### Use `applyTransform()` when:
- You need precise control over the transformation matrix
- Combining multiple transformations into one operation
- Creating custom transformation effects (skew, reflection)
- Working with matrix math or transformations from other libraries
- Performance optimization (single matrix operation vs multiple calls)

### Use helper functions when:
- Simple transformations (translate, rotate, scale)
- Readability is more important than performance
- Learning or prototyping

## Performance Considerations

```tsx
// More efficient: Single matrix operation
K.applyTransform(cos, sin, -sin, cos, x, y)

// Less efficient: Multiple operations
K.translate(x, y)
K.rotate(angle)
```

## Notes

- Matrix multiplication is applied from right to left
- Transformations accumulate - each `applyTransform()` multiplies with current matrix
- Use `resetTransform()` to start fresh
- Use `push()`/`pop()` to save/restore transformation state
- Native Canvas API method - no Klint wrapper needed
- Matrix values are applied in the order: scale/rotate → translate
- For most use cases, `translate()`, `rotate()`, and `scale()` are more intuitive

