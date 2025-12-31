# strokeColor

```ts
strokeColor(color: string | CanvasGradient) => void
```

Sets the color for lines and shape outlines.

## Parameters
- `color`: CSS color string or gradient object

## Example
```tsx
// Basic stroke color
strokeColor("blue")
strokeWidth(2)
rectangle(100, 100, 80, 40)

// With gradient
const grad = gradient(0, 0, 100, 100)
addColorStop(grad, 0, "green")
addColorStop(grad, 1, "yellow")
strokeColor(grad)
strokeWidth(5)
circle(200, 200, 100)

// In JSX component
const draw = (K: KlintContext) => {
  K.strokeColor("rgba(255, 0, 0, 0.5)")
  K.strokeWidth(3)
  K.noFill()
  K.circle(K.width/2, K.height/2, 100)
}
```

## Notes
- Affects all subsequent stroke operations
- Use `noStroke()` to disable stroke completely instead of reducing the stroke to `0`
- Works with all CSS color formats
- Can accept gradient objects from `gradient()`, `radialGradient()`, or `conicGradient()` 
- Gradient on stroke will probably won't work as you expect them too.