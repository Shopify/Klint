# pop

```ts
pop() => void
```

Restores the most recently saved drawing state from the stack.

## Example
```tsx
// Basic usage
push()
translate(100, 100)
rotate(45 * Math.PI/180)
rectangle(0, 0, 50, 50)
pop() // Restore previous state

// Multiple nested states
push()
  fillColor("red")
  circle(100, 100, 50)
  
  push()
    fillColor("blue")
    circle(150, 150, 30)
  pop() // Restores red fill
  
  circle(200, 100, 50) // Still uses red fill
pop()

// In JSX component
const draw = (K: KlintContext) => {
  K.push()
  K.translate(K.width/2, K.height/2)
  K.fillColor("purple")
  K.circle(0, 0, 50)
  K.pop() // Restore original state
}

return <Klint draw={draw} />
```

## Notes
- Restores the drawing state (transformations, styles, etc.) saved by the last `push()`
- Must have a preceding `push()` call
- Similar to `restore()` in canvas API, but with a more intuitive name
- Helps manage drawing state in complex renderings 