# strokeWidth

```ts
strokeWidth(width: number) => void
```

Sets the width of lines and shape outlines.

## Parameters
- `width`: Line thickness in pixels. Values ≤ 0 set to minimum thickness (`EPSILON`).

## Example
```tsx
// Basic usage
K.strokeWidth(5)
K.line(10, 10, 90, 90)

// In JSX component
const draw = (K: KlintContext) => {
  K.strokeWidth(3)
  K.circle(K.width/2, K.height/2, 100)
}

return <Klint draw={draw} />
```

## Notes
- Affects all subsequent stroke operations (lines, shape outlines, stroke text)
- Use `K.noStroke()` to disable stroke completely
- Default is typically 1px