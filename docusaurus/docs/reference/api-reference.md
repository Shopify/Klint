---
sidebar_position: 3
---

# API Reference

Quick reference for all Klint functions. Click any function name for detailed docs with examples.

## Canvas Properties

| Property | Type | Description |
|----------|------|-------------|
| `K.width` | number | Canvas width in device pixels |
| `K.height` | number | Canvas height in device pixels |
| `K.time` | number | Elapsed time in seconds |
| `K.deltaTime` | number | Time since last frame in milliseconds |
| `K.frame` | number | Frame count since start |
| `K.dpr` | number | Device pixel ratio |

## [Drawing Functions](../3-functions/drawing/circle)

| Function | Signature |
|----------|-----------|
| [`circle`](../3-functions/drawing/circle) | `(x, y, radius, radius2?) => void` |
| [`rectangle`](../3-functions/drawing/rectangle) | `(x, y, width, height?) => void` |
| [`roundedRectangle`](../3-functions/drawing/roundedRectangle) | `(x, y, width, radius, height?) => void` |
| [`line`](../3-functions/drawing/line) | `(x1, y1, x2, y2) => void` |
| [`point`](../3-functions/drawing/point) | `(x, y) => void` |
| [`polygon`](../3-functions/drawing/polygon) | `(x, y, radius, sides, radius2?, rotation?) => void` |
| [`disk`](../3-functions/drawing/disk) | `(x, y, radius, startAngle?, endAngle?, closed?) => void` |
| [`ellipse`](../3-functions/drawing/ellipse) | `(x, y, radiusX, radiusY) => void` |

## [Styling Functions](../3-functions/styling/fillColor)

| Function | Signature |
|----------|-----------|
| [`fillColor`](../3-functions/styling/fillColor) | `(color: string \| CanvasGradient) => void` |
| [`strokeColor`](../3-functions/styling/strokeColor) | `(color: string \| CanvasGradient) => void` |
| [`strokeWidth`](../3-functions/styling/strokeWidth) | `(width: number) => void` |
| [`strokeCap`](../3-functions/styling/strokeCap) | `(cap: CanvasLineCap) => void` |
| [`strokeJoin`](../3-functions/styling/strokeJoin) | `(join: CanvasLineJoin) => void` |
| [`noFill`](../3-functions/styling/noFill) | `() => void` |
| [`noStroke`](../3-functions/styling/noStroke) | `() => void` |
| [`opacity`](../3-functions/styling/opacity) | `(value: number) => void` |
| [`blend`](../3-functions/styling/blend) | `(mode: GlobalCompositeOperation \| "default") => void` |

## [Transform Functions](../3-functions/transforms/push)

| Function | Signature |
|----------|-----------|
| [`push`](../3-functions/transforms/push) | `() => void` |
| [`pop`](../3-functions/transforms/pop) | `() => void` |
| [`translate`](../3-functions/transforms/translate) | `(x, y) => void` |
| [`rotate`](../3-functions/transforms/rotate) | `(angle) => void` |
| [`scale`](../3-functions/transforms/scale) | `(x, y) => void` — **requires 2 args** |
| [`resetTransform`](../3-functions/transforms/resetTransform) | `() => void` |
| [`screenToWorld`](../3-functions/transforms/coordinates) | `(x, y) => { x, y }` — call **after** transforms |
| [`worldToScreen`](../3-functions/transforms/coordinates) | `(x, y) => { x, y }` — call **after** transforms |
| [`getVisibleBounds`](../3-functions/transforms/coordinates) | `() => { left, top, right, bottom, width, height }` |

## [Path Functions](../3-functions/paths/beginShape)

| Function | Signature |
|----------|-----------|
| [`beginShape`](../3-functions/paths/beginShape) | `() => void` |
| [`endShape`](../3-functions/paths/endShape) | `(close?) => void` |
| [`vertex`](../3-functions/paths/vertex) | `(x, y) => void` |
| [`bezierVertex`](../3-functions/paths/bezierVertex) | `(cp1x, cp1y, cp2x, cp2y, x, y) => void` |
| [`quadraticVertex`](../3-functions/paths/quadraticVertex) | `(cpx, cpy, x, y) => void` |
| [`arcVertex`](../3-functions/paths/arcVertex) | `(x1, y1, x2, y2, radius) => void` |
| [`beginContour`](../3-functions/paths/beginContour) | `() => void` |
| [`endContour`](../3-functions/paths/endContour) | `(forceRevert?) => void` |
| [`clipTo`](../3-functions/paths/clipTo) | `(callback, fillRule?) => void` |

## [Text Functions](../3-functions/text/text)

| Function | Signature |
|----------|-----------|
| [`text`](../3-functions/text/text) | `(text, x, y, maxWidth?) => void` |
| [`paragraph`](../3-functions/text/paragraph) | `(text, x, y, width, options?) => void` |
| `textFont` | `(font: string) => void` |
| `textSize` | `(size: number) => void` |
| `textStyle` | `(style: string) => void` |
| `textWeight` | `(weight: string) => void` |
| `alignText` | `(horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => void` |
| `textLeading` | `(spacing: number) => number` |
| `textWidth` | `(text: string) => number` |

**Important**: Text alignment is `alignText` (NOT `textAlign`).

## [Gradient Functions](../3-functions/gradients/gradient)

| Function | Signature |
|----------|-----------|
| [`gradient`](../3-functions/gradients/gradient) | `(x1?, y1?, x2?, y2?) => CanvasGradient` |
| [`radialGradient`](../3-functions/gradients/radialGradient) | `(x1?, y1?, r1?, x2?, y2?, r2?) => CanvasGradient` |
| [`conicGradient`](../3-functions/gradients/conicGradient) | `(angle?, x1?, y1?) => CanvasGradient` |
| [`addColorStop`](../3-functions/gradients/addColorStop) | `(gradient, offset, color) => void` |

## [Image Functions](../3-functions/images/image)

| Function | Signature |
|----------|-----------|
| [`image`](../3-functions/images/image) | `(img, x, y, ...args) => void` |
| [`createOffscreen`](../3-functions/images/createOffscreen) | `(width, height) => KlintOffscreenContext` |
| `loadPixels` | `() => ImageData` |
| `updatePixels` | `(pixels) => void` |
| `readPixels` | `(x, y, w?, h?) => number[]` |
| `scaleTo` | `(origW, origH, destW, destH, cover?) => number` |

## [Canvas Control](../3-functions/canvas/canvas-settings)

| Function | Signature |
|----------|-----------|
| [`background`](../3-functions/canvas/background) | `(color?: string) => void` |
| `clear` | `() => void` |
| `reset` | `() => void` |
| `setCanvasOrigin` | `("center" \| "corner") => void` |
| `setImageOrigin` | `("center" \| "corner") => void` |
| `setRectOrigin` | `("center" \| "corner") => void` |
| `smooth` / `noSmooth` | `() => void` |
| `toBase64` | `(type?: string, quality?: number) => string` |

## [Math Utilities](../3-functions/utilities/math-utils)

| Function | Signature |
|----------|-----------|
| `lerp` | `(A, B, mix, bounded?) => number` |
| `remap` | `(n, A, B, C, D, bounded?) => number` |
| `constrain` | `(val, floor, ceil) => number` |
| `distance` | `(x1, y1, x2, y2, mode?) => number` |
| `squareDistance` | `(x1, y1, x2, y2) => number` |
| `dot` | `(x1, y1, x2, y2) => number` |
| `fract` | `(n, mod, mode?) => number` |

## Elements

Elements are accessed as `K.ElementName` inside draw functions.

| Element | Description | Docs |
|---------|-------------|------|
| `K.Color` | Color creation and manipulation across color spaces | [Color](../4-elements/Color) |
| `K.Easing` | Animation easing functions (in, out, bounce, spring, etc.) | [Easing](../4-elements/Easing) |
| `K.Vector` | 3D vector math (`K.createVector(x, y)` or `new K.Vector(x, y)`) | [Vector](../4-elements/Vector) |
| `K.Noise` | Seedable noise: Perlin, Simplex, Hash (1-4D), Gaussian random | [Noise](../4-elements/Noise) |
| `K.Text` | Advanced text layout (splitTo, circularText, findTextSize) | [Text](../4-elements/Text) |
| `K.Quadtree` | Spatial partitioning for efficient queries | [Quadtree](../4-elements/Quadtree) |
| `K.Hotspot` | Hit testing (circle, rect, ellipse, polygon, path) | [Hotspot](../4-elements/Hotspot) |
| `K.Grid` | Grid generators (rect, radial, hex, triangle) | [Grid](../4-elements/Grid) |
| `K.Strip` | Triangle/quad strip, hull, and ribbon rendering | [Strip](../4-elements/Strip) |
| `K.Pixels` | Pixel-level read/write (load, update, read) | [Pixels](../4-elements/Pixels) |
| `K.Timeline` | Keyframe-based animation with tracks and stagger | [Timeline](../2-core-concepts/timeline) |

## Common Pitfalls

- **Option names**: `dpr` not `pixelRatio`, `origin` not `canvasOrigin`
- **Text alignment**: `K.alignText()` not `K.textAlign()`
- **Scale needs 2 args**: `K.scale(2, 2)` not `K.scale(2)` (native canvas API)
- **Canvas fills container**: Set container size, not canvas size — there are no `width`/`height` props
- **Device pixels**: `K.width`/`K.height` are device pixels = CSS pixels × DPR
- **Boolean options are strings**: `alpha: "true"` not `alpha: true`
- **K.time is in seconds**: Not milliseconds — `Math.sin(K.time)` oscillates with a ~6.28s period
- **K.deltaTime is in milliseconds**: Convert with `K.deltaTime / 1000` for seconds
- **Color functions live on K.Color**: Use `K.Color.hsl()`, not `K.hsl()`
- **Noise lives on K.Noise**: Use `K.Noise.perlin()`, not `K.noise()`

## Next Steps

- [Quick Start](../1-getting-started/quick-start) — Get started
- [Klint Component](./klint-component) — Component props reference
- [Klint Hooks](./klint-hooks) — Hook reference
