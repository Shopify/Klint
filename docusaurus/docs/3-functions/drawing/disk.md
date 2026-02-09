# disk

```ts
disk(x: number, y: number, radius: number, startAngle?: number, endAngle?: number, closed?: boolean) => void
```

Draws a circle or arc with optional sector closing.

## Parameters
- `x`: Center x-coordinate
- `y`: Center y-coordinate
- `radius`: Circle radius
- `startAngle`: Start angle in radians (default: 0)
- `endAngle`: End angle in radians (default: 2π, full circle)
- `closed`: Whether to close the arc to center (default: true)

## Example
```tsx
// Full circle (equivalent to circle())
disk(100, 100, 50)

// Half circle
disk(200, 200, 75, 0, Math.PI)

// Quarter circle pie slice
disk(300, 300, 100, 0, Math.PI/2, true)

// Open arc (not connected to center)
disk(400, 400, 50, Math.PI/4, Math.PI*1.75, false)

// In JSX component
const draw = (K: KlintContext) => {
  K.fillColor("orange")
  K.disk(K.width/2, K.height/2, 100, 0, Math.PI*1.5, true)
}
```

## Notes
- When `closed` is true, adds lines to center to create a pie/pizza slice shape
- When `closed` is false, creates only the arc without connecting to center
- Uses current fill and stroke styles
- Useful for pie charts, gauges, and partial circular shapes 