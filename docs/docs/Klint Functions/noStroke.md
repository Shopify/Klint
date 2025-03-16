# noStroke

```ts
noStroke() => void
```

Disables stroke (outlines) for shapes and text.

## Example
```tsx
// Only draw filled shapes without outlines
noStroke()
fillColor("blue")
rectangle(100, 100, 200, 150)
fillColor("red")
circle(300, 300, 75)

// In JSX component
const draw = (K: KlintContext) => {
  K.noStroke()
  K.fillColor("purple")
  K.circle(K.width/2, K.height/2, 100)
  K.fillColor("yellow")
  K.rectangle(K.width/2-25, K.height/2-25, 50, 50)
}
```

## Notes
- Equivalent to setting `strokeColor("transparent")`
- Affects all subsequent drawing operations until `strokeColor()` is called
- Useful for creating clean filled shapes without outlines
- Common in designs that need a flat, minimal appearance 