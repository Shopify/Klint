import KlintVisualExample from '@site/src/components/Documentation/KlintVisualExample';

# polygon

```ts
polygon(x: number, y: number, radius: number, sides: number, radius2?: number, rotation?: number) => void
```

Draws a regular polygon centered at the specified coordinates.

<KlintVisualExample scene="polygons" />

## Parameters
- `x`: Center x-coordinate
- `y`: Center y-coordinate
- `radius`: Radius (distance from center to vertices)
- `sides`: Number of sides
- `radius2`: Optional secondary radius to create non-regular polygons
- `rotation`: Optional rotation angle in radians (default: 0)

## Example
```tsx
// Triangle
polygon(100, 100, 50, 3)

// Square
polygon(250, 100, 50, 4, null, Math.PI/4) // Rotated 45 degrees

// Hexagon
polygon(400, 100, 50, 6)

// Star-like shape with different radii
polygon(250, 250, 100, 5, 50, 0)

// In JSX component
const draw = (K: KlintContext) => {
  K.fillColor("purple")
  K.strokeColor("white")
  K.polygon(K.width/2, K.height/2, 100, 8, null, K.time)
}
```

## Notes
- Do not animate the `rotation` parameter directly, prefer the `rotation` function.
- Setting `radius2` creates shapes similar to stars or flower petals
- With `sides = 4` and `rotation = Math.PI/4`, creates a diamond shape
- Increasing `sides` to large values (>20) approximates a circle, but prefer the `circle` unless you have a good reason
