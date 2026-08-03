import KlintVisualExample from '@site/src/components/Documentation/KlintVisualExample';

# line

```ts
line(x1: number, y1: number, x2: number, y2: number) => void
```

Draws a straight line between two points.

<KlintVisualExample scene="lines" />

## Parameters
- `x1`: First point x-coordinate
- `y1`: First point y-coordinate
- `x2`: Second point x-coordinate
- `y2`: Second point y-coordinate

## Example
```tsx
// Basic line
K.line(10, 10, 90, 90)

// Styled line
K.strokeColor("red")
K.strokeWidth(5)
K.line(100, 200, 300, 100)

// In JSX component
const draw = (K: KlintContext) => {
  K.strokeColor("blue")
  K.strokeWidth(3)
  K.line(50, 50, K.width-50, K.height-50)
}
```

## Notes
- Uses current stroke style and width
- No effect if stroke is disabled via `K.noStroke()`
- For best performance with many lines or lines that needs to make shapes, use `K.beginShape()` and `K.vertex()` 