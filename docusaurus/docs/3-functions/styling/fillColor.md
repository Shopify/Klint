# fillColor

```ts
fillColor(color: string | CanvasGradient) => void
```

Sets the fill color for shapes and text.

## Parameters
- `color`: CSS color string or gradient object.
- `gradient`: A Canvas gradient.

## Example
```tsx
// Basic usage
fillColor("#FF5733")
rectangle(100, 100, 80, 40)

// With gradient
const grad = gradient(0, 0, 100, 100)
addColorStop(grad, 0, "red")
addColorStop(grad, 1, "blue")
fillColor(grad)
rectangle(0, 0, 100, 100)

// In JSX component
const draw = (K: KlintContext) => {
  K.fillColor("rgba(255, 0, 0, 0.5)")
  K.circle(K.width/2, K.height/2, 50)
}

return <Klint draw={draw} />
```

## Notes
- Affects all subsequent fill operations
- Nestable using `push()` and `pop()`
- Use `noFill()` to disable filling
- Can accept gradient objects from `gradient()`, `radialGradient()`, or `conicGradient()` 