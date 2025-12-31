# noFill

```ts
noFill() => void
```

Disables filling for shapes and text.

## Example
```tsx
// Only draw shape outlines
noFill()
strokeColor("blue")
strokeWidth(2)
rectangle(100, 100, 200, 150)
circle(300, 300, 75)

// In JSX component
const draw = (K: KlintContext) => {
  K.noFill()
  K.strokeColor("white")
  K.strokeWidth(2)
  K.circle(K.width/2, K.height/2, 100)
  K.rectangle(K.width/2-50, K.height/2-50, 100, 100)
}
```

## Notes
- Equivalent to setting `fillColor("transparent")`
- Affects all subsequent drawing operations until `fillColor()` is called
- Useful for creating outlined shapes
- Can be combined with `strokeWidth()` to control outline thickness 
- A shape with transparent `fill` and `stroke` is ignored