---
sidebar_position: 3
id: klintfunctions-core
title: Core Klint Functions
slug: /klintfunctions-core
---

# Core Functions

Klint provides core functions for controlling canvas behavior and lifecycle.

## saveCanvas

```ts
saveCanvas() => void
```

Saves the canvas as a PNG file.

```tsx
// Save current canvas state to file
saveCanvas()
```

## fullscreen

```ts
fullscreen() => void
```

Requests fullscreen mode for the canvas.

```tsx
// Go fullscreen when clicked
onClick(() => {
  fullscreen()
})
```

## play

```ts
play() => void
```

Starts or resumes the animation loop.

```tsx
// Resume animation
play()
```

## pause

```ts
pause() => void
```

Pauses the animation loop.

```tsx
// Pause animation
pause()
```

## passImage

```ts
passImage(element: HTMLImageElement) => HTMLImageElement | null
```

Validates an image is loaded before using.

```tsx
const img = document.getElementById("my-img") as HTMLImageElement
const validImg = passImage(img)
if (validImg) {
  image(validImg, 0, 0)
}
```

## passImages

```ts
passImages(elements: HTMLImageElement[]) => (HTMLImageElement | null)[]
```

Validates multiple images are loaded.

```tsx
const imgElements = [img1, img2, img3]
const validImgs = passImages(imgElements)
```

## describe

```ts
describe(description: string) => void
```

Sets a description of the canvas content.

```tsx
// Add description for accessibility
describe("An abstract visualization of data points as circles")
```

## getOffscreen

```ts
getOffscreen(id: string) => KlintOffscreenContext | HTMLImageElement
```

Retrieves a previously created offscreen canvas.

```tsx
// Get buffer and draw it
const buffer = getOffscreen("buffer")
image(buffer, 0, 0)
```

## extend

```ts
extend(name: string, data: unknown, enforceReplace?: boolean) => void
```

Extends Klint with custom functionality.

```tsx
// Add a custom property
extend("grid", new GridSystem())

// Use your extension
K.grid.draw(10, 10)
```

## saveConfig

```ts
saveConfig(from?: KlintContexts) => KlintConfig
```

Saves current canvas configuration.

```tsx
const savedConfig = saveConfig()
```

## restoreConfig

```ts
restoreConfig(config: KlintConfig) => void
```

Restores a saved canvas configuration.

```tsx
// Save config
const savedConfig = saveConfig()

// Later restore it
restoreConfig(savedConfig)
```

## Example

```tsx
const draw = (K: KlintContext) => {
  // Draw content
  K.background("#333")
  K.fillColor("white")
  K.circle(K.width/2, K.height/2, 100)
  
  // Save config to restore later
  const config = K.saveConfig()
  
  // Draw UI
  const buffer = K.getOffscreen("ui-buffer")
  K.image(buffer, 0, 0)
  
  // Handle keyboard shortcuts  
  if (K.keyPressed && K.key === "s") {
    // Save canvas when 's' is pressed
    K.saveCanvas()
  } else if (K.keyPressed && K.key === " ") {
    // Toggle play/pause on spacebar
    if (K.isPlaying) {
      K.pause()
    } else {
      K.play()
    }
  }
  
  // Add description for accessibility
  K.describe("A white circle on dark background")
  
  // Restore original config
  K.restoreConfig(config)
}
```

## Notes

- Use `saveCanvas()` with care as it triggers a file download
- `fullscreen()` must be triggered by a user gesture (click/tap)
- `play()`/`pause()` control the animation loop but not audio/video elements
- `extend()` is powerful for creating custom functionality and libraries
- `describe()` helps make your canvas more accessible
- `passImage()`/`passImages()` help prevent errors from unloaded images 