# Thing

The Thing element provides utility functions for debugging and development purposes.

## Access

```tsx
const draw = (K: KlintContext) => {
  // Access the Thing element
  K.Thing.log();
}
```

## Methods

### log()

```ts
log() => void
```

Logs the current Klint context to the browser console for debugging purposes.

```tsx
const draw = (K: KlintContext) => {
  // Log the context for debugging
  K.Thing.log();
  
  // Continue with drawing operations
  K.background("#333");
  K.circle(100, 100, 50);
}
```

## Use Cases

The Thing element is primarily intended for:

- **Development debugging**: Inspect the current state of the Klint context
- **Performance analysis**: Check internal properties and state
- **Learning**: Understand the structure of the Klint context object

## Example Usage

```tsx
const draw = (K: KlintContext) => {
  K.background("#222");
  
  // Debug context when clicking
  const { onClick } = KlintMouse();
  onClick(() => {
    console.log("=== Klint Context Debug ===");
    K.Thing.log();
  });
  
  K.fillColor("white");
  K.textAlign("center", "middle");
  K.text("Click to debug context", K.width/2, K.height/2);
}
```

## Notes

- The `log()` function outputs the entire Klint context object
- Useful during development to understand internal state
- Should typically be removed from production code
- The logged object contains all Klint properties, methods, and internal state 