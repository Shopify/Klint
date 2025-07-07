# createOffscreen

```ts
createOffscreen(
  id: string, 
  width: number, 
  height: number, 
  options?: KlintCanvasOptions,
  callback?: (ctx: KlintOffscreenContext) => void
) => KlintOffscreenContext | HTMLImageElement
```

Creates an offscreen canvas for drawing operations outside the main canvas.

## Parameters
- `id`: Unique identifier for accessing the offscreen canvas later
- `width`: Width of the offscreen canvas
- `height`: Height of the offscreen canvas
- `options`: Optional configuration
  - `alpha`: Boolean, enable alpha channel (default: true)
  - `willReadFrequently`: Boolean, optimize for frequent pixel reads (default: false)
  - `ignoreFunctions`: Boolean, don't add Klint functions to context
  - `origin`: "corner" | "center", coordinate system origin
  - `static`: "true" | undefined, convert to image after creation
- `callback`: Optional function to initialize the offscreen canvas

## Returns
- `KlintOffscreenContext | HTMLImageElement`: The created offscreen context or image (if static)

## Example
```tsx
// Basic usage
const offscreen = createOffscreen("buffer", 200, 200)
offscreen.fillColor("red")
offscreen.circle(100, 100, 50)

// Draw to offscreen in callback
createOffscreen("text", 300, 100, {}, (ctx) => {
  ctx.fillColor("black")
  ctx.textSize(48)
  ctx.text("Hello World", 10, 50)
})

// Static offscreen for performance
createOffscreen("static", 400, 400, { static: "true" }, (ctx) => {
  ctx.fillColor("blue")
  ctx.rectangle(0, 0, 400, 400)
})

// Use offscreen in draw function
const draw = (K: KlintContext) => {
  const buffer = K.getOffscreen("buffer")
  K.image(buffer, 100, 100)
}

// In JSX component
const preload = (K: KlintContext) => {
  K.createOffscreen("buffer", 200, 200, {}, (O) => {
    O.textFont("Inter")
    O.textSize(36)
    O.fillColor("white")
    O.text("Offscreen Text", 10, 100)
  })
}

return <Klint preload={preload} draw={draw} />
```

## Notes
- Access created offscreens with `getOffscreen(id)`
- Static offscreens convert to images and can't be modified after creation
- Offscreens inherit the device pixel ratio from main canvas
- Useful for caching complex drawings or pre-rendering content
- In static mode, returns an HTMLImageElement instead of a context 