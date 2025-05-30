# push

```ts
push() => void
```

Saves the current drawing state (transformations, styles, etc.) to the stack.

## Example
```tsx
// Basic usage
push()
translate(100, 100)
rotate(45 * Math.PI/180)
rectangle(0, 0, 50, 50)
pop() // Restore previous state

// In JSX component
const draw = (K: KlintContext) => {
  K.push()
  K.translate(K.width/2, K.height/2)
  K.fillColor("purple")
  K.circle(0, 0, 50)
  K.pop()
}

return <Klint draw={draw} />
```

## Notes
- Saves current transformation matrix, clipping region, and style attributes
- Must be balanced with a corresponding `pop()` call
- Useful for creating isolated drawing contexts
- Similar to `save()` in canvas API, but with a more intuitive name 