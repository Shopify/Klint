# Coordinate Conversion

## screenToWorld

```ts
screenToWorld(x: number, y: number) => { x: number, y: number }
```

Converts screen coordinates (like mouse position) to world coordinates by inverting the current canvas transform matrix. This is essential for knowing where the user clicked or hovered in your transformed scene.

:::important
**Call this after your transforms are applied.** `screenToWorld` reads the current transform matrix via `getTransform()`, so it must be called inside the same `push()`/`pop()` block where your `translate`, `scale`, and `rotate` calls live — otherwise the matrix won't reflect your scene transforms.
:::

### Parameters
- `x`: Screen x coordinate (e.g. `K.mouseX`)
- `y`: Screen y coordinate (e.g. `K.mouseY`)

### Example
```tsx
const draw = (K: KlintContext) => {
  K.background("#222")

  K.push()
  // Apply scene transforms
  K.translate(K.width / 2, K.height / 2)
  K.scale(2)
  K.rotate(K.time * 0.1)

  // Now screenToWorld knows about all three transforms
  const world = K.screenToWorld(K.mouseX, K.mouseY)

  // Draw something at the mouse position in world space
  K.fillColor("white")
  K.circle(world.x, world.y, 10)

  // Draw some content in world space
  K.fillColor("rgba(255,255,255,0.1)")
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      K.circle(i * 60, j * 60, 8)
    }
  }
  K.pop()
}
```

---

## worldToScreen

```ts
worldToScreen(x: number, y: number) => { x: number, y: number }
```

Converts world coordinates to screen coordinates by applying the current canvas transform matrix. Useful for positioning HTML overlays, tooltips, or UI elements on top of transformed content.

:::important
**Call this after your transforms are applied.** Same as `screenToWorld`, this reads the current matrix — it needs to be called after `translate`, `scale`, `rotate` etc. so the matrix reflects your scene.
:::

### Parameters
- `x`: World x coordinate
- `y`: World y coordinate

### Example
```tsx
const draw = (K: KlintContext) => {
  K.background("#222")

  K.push()
  K.translate(K.width / 2, K.height / 2)
  K.scale(1.5)

  // Draw a point in world space
  const wx = 100, wy = -50
  K.fillColor("red")
  K.circle(wx, wy, 10)

  // Get its screen position (e.g. for a label)
  const screen = K.worldToScreen(wx, wy)
  K.pop()

  // Draw label in screen space (outside the push/pop)
  K.fillColor("white")
  K.text(`(${wx}, ${wy})`, screen.x + 15, screen.y)
}
```

---

## getVisibleBounds

```ts
getVisibleBounds() => {
  left: number, top: number,
  right: number, bottom: number,
  width: number, height: number
}
```

Returns the visible area of the canvas in world coordinates by projecting the four viewport corners through the inverse transform matrix. Works correctly even with rotation — the bounds are the axis-aligned bounding box of the visible area in world space.

:::important
**Call this after your transforms are applied.** The bounds are computed from the current matrix, so they'll only be accurate if your `translate`, `scale`, and `rotate` calls have already been made.
:::

### Example
```tsx
const draw = (K: KlintContext) => {
  K.background("#222")

  K.push()
  K.translate(K.width / 2, K.height / 2)

  // Zoom with mouse wheel or animate
  const zoom = 1 + Math.sin(K.time * 0.3) * 0.5
  K.scale(zoom)

  // Only draw what's visible — great for large worlds
  const bounds = K.getVisibleBounds()

  K.strokeColor("rgba(255,255,255,0.15)")
  K.strokeWidth(1)

  const step = 50
  const startX = Math.floor(bounds.left / step) * step
  const startY = Math.floor(bounds.top / step) * step

  for (let x = startX; x <= bounds.right; x += step) {
    K.line(x, bounds.top, x, bounds.bottom)
  }
  for (let y = startY; y <= bounds.bottom; y += step) {
    K.line(bounds.left, y, bounds.right, y)
  }

  K.pop()
}
```

## How it works

These functions leverage `CanvasRenderingContext2D.getTransform()`, which returns the current cumulative `DOMMatrix`. Calling `.inverse()` on it gives the reverse mapping. `DOMMatrix.transformPoint()` then converts coordinates in either direction. This means any combination of `translate`, `scale`, `rotate`, and `applyTransform` is automatically accounted for — no separate camera state needed.

## Notes
- All three functions respect the `canvasOrigin` setting (`"center"` or `"corner"`)
- `screenToWorld` and `worldToScreen` are inverses of each other
- Works with any combination of transforms, including nested `push()`/`pop()` blocks
- `getVisibleBounds` is ideal for culling — skip drawing objects outside the visible area
- Mouse coordinates (`K.mouseX`, `K.mouseY`) are already in screen space, so pass them directly to `screenToWorld`
