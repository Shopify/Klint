---
sidebar_position: 6
id: klintfunctions-pixels
title: Manipulating Pixels
slug: /klinfunctions-pixels
---

# Pixel Manipulation Functions

Klint provides functions for direct pixel access and manipulation.

## loadPixels

```ts
loadPixels() => ImageData
```

Gets the current canvas pixel data.

```tsx
const pixelData = loadPixels()
```

## updatePixels

```ts
updatePixels(pixels: Uint8ClampedArray | number[]) => void
```

Updates canvas with modified pixel data.

```tsx
const pixelData = loadPixels()
// Modify pixelData values
updatePixels(pixelData.data)
```

## readPixels

```ts
readPixels(x: number, y: number, w?: number, h?: number) => number[]
```

Reads pixel values from a region of the canvas.

```tsx
// Read a single pixel at (100, 100)
const [r, g, b, a] = readPixels(100, 100)

// Read a 10x10 region
const pixels = readPixels(100, 100, 10, 10)
```

## Example

```tsx
const draw = (K: KlintContext) => {
  // Draw something
  K.background(255)
  K.fillColor("red")
  K.circle(K.width/2, K.height/2, 100)
  
  // Basic pixel effects
  const pixels = K.loadPixels()
  const data = pixels.data
  
  // Invert colors
  for (let i = 0; i < data.length; i += 4) {
    // Invert RGB values
    data[i] = 255 - data[i]       // R
    data[i + 1] = 255 - data[i + 1] // G
    data[i + 2] = 255 - data[i + 2] // B
    // Alpha remains unchanged
  }
  
  // Update canvas with modified pixels
  K.updatePixels(data)
  
  // Read and use pixel data
  const centerColor = K.readPixels(K.width/2, K.height/2)
  console.log(`Center pixel: RGBA(${centerColor.join(', ')})`)
}
```

## Performance Considerations

```tsx
// Efficient pixel manipulation for grayscale
const draw = (K: KlintContext) => {
  K.background("#FFF")
  
  // Draw an image
  const img = K.images["photo"]
  if (img) {
    K.image(img, 0, 0, K.width, K.height)
    
    // Get pixel data
    const pixels = K.loadPixels()
    const data = pixels.data
    
    // Convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = data[i + 1] = data[i + 2] = avg
    }
    
    // Update canvas
    K.updatePixels(data)
  }
}
```

## Notes

- Pixel manipulation is computationally expensive - use sparingly
- Each pixel consists of 4 consecutive values: Red, Green, Blue, Alpha (0-255)
- Image data structure: `width * height * 4` bytes (RGBA for each pixel)
- Accessing: `data[(y * width + x) * 4]` for red at position (x,y)
- If you only need to read a few pixels, use `readPixels()` rather than `loadPixels()`
- In Klint, pixel coordinates match the canvas coordinate system
- For better performance, consider using offscreen canvases or WebGL shaders for complex effects 