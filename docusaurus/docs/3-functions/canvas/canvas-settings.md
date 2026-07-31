---
sidebar_position: 2
id: klintfunctions-canvas
title: Canvas Settings
slug: /klintfunctions-canvas
---

# Canvas Settings Functions

Klint provides functions for configuring canvas behavior and origin settings.

## setCanvasOrigin

```ts
setCanvasOrigin(type: "center" | "corner") => void
```

Sets the coordinate system origin for the canvas.

- `type`: "corner" (default, top-left) or "center" (center of canvas)

```tsx
setCanvasOrigin("center") // (0,0) is center of canvas
```

## setImageOrigin

```ts
setImageOrigin(type: "center" | "corner") => void
```

Sets the reference point for image placement.

- `type`: "corner" (default, top-left) or "center" (center of image)

```tsx
setImageOrigin("center") // Images positioned from their center
```

## setRectOrigin

```ts
setRectOrigin(type: "center" | "corner") => void
```

Sets the reference point for rectangle placement.

- `type`: "corner" (default, top-left) or "center" (center of rectangle)

```tsx
setRectOrigin("center") // Rectangles positioned from their center
```

## background

```ts
background(color?: string) => void
```

Sets the canvas background color or clears the canvas.

```tsx
background("#FFFFFF") // White background
background("transparent") // Clear canvas
background() // Clear canvas
```

## smooth

```ts
smooth() => void
```

Enables image smoothing (anti-aliasing) for image and canvas rendering. This is the default behavior.

```tsx
smooth() // Enable anti-aliasing (default)
```

## noSmooth

```ts
noSmooth() => void
```

Disables image smoothing (anti-aliasing). Useful for pixel art, retro aesthetics, or when scaling offscreen canvases where you want crisp pixel edges.

```tsx
noSmooth() // Disable anti-aliasing for crisp pixels
```

## reset

```ts
reset() => void
```

Clears canvas and resets the transformation matrix.

```tsx
reset() // Clear everything and reset transforms
```

## clear

```ts
clear() => void
```

Clears the canvas without resetting transformations.

```tsx
clear() // Just clear pixels, keep transforms
```

## resizeCanvas

! Offscreen canvas only !

```ts
resizeCanvas(width: number, height: number) => void
```

Resizes the canvas dimensions.


```tsx
resizeCanvas(800, 600) // Change canvas size
```

## toBase64

```ts
toBase64(type?: string, quality?: number) => string
```

Converts canvas to a base64 encoded data URL.

- `type`: MIME type (default: "image/png")
- `quality`: Compression quality for JPEGs (0-1)

```tsx
const dataUrl = toBase64("image/jpeg", 0.85)
```

## Example

```tsx
const setup = (K: KlintContext) => {
  // Set up canvas with centered coordinates
  K.setCanvasOrigin("center")
  K.setImageOrigin("center")
  K.setRectOrigin("center")
}

const draw = (K: KlintContext) => {
  // With center origin, (0,0) is center of canvas
  K.background("#222")
  
  // Draw at origin (center of canvas)
  K.fillColor("red")
  K.rectangle(0, 0, 100, 100)
  
  // Draw image from its center
  const img = images.logo // from KlintImage()
  if (img) {
    K.image(img, 0, -150)
  }
  
  // Export canvas to base64 on first frame
  if (K.frame === 1) {
    const dataUrl = K.toBase64("image/png")
    console.log(dataUrl)
  }
}
```

## Notes

- Most often, you'll want all three origin settings to match for consistency
- The `background()` function automatically respects canvas origin settings
- `reset()` and `clear()` are useful when redrawing the entire canvas
- `resizeCanvas()` only works with offscreen canvases, not the main canvas
- Origin settings affect all subsequent drawing operations
- `noSmooth()` is especially useful when drawing scaled offscreen canvases or pixel art