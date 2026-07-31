---
sidebar_position: 3
---

# API Reference

Quick reference for all Klint functions. Click any function name for detailed docs with examples.

## Canvas Properties

| Property | Type | Description |
|----------|------|-------------|
| `K.width` | number | Logical canvas width in CSS pixels |
| `K.height` | number | Logical canvas height in CSS pixels |
| `K.time` | number | Elapsed time in seconds |
| `K.deltaTime` | number | Time since last frame in milliseconds |
| `K.frame` | number | Frame count since start |
| `K.dpr` | number | Device pixel ratio |

## [Drawing Functions](/docs/functions/drawing/circle)

| Function | Signature |
|----------|-----------|
| [`circle`](/docs/functions/drawing/circle) | `(x, y, radius, radius2?) => void` |
| [`rectangle`](/docs/functions/drawing/rectangle) | `(x, y, width, height?) => void` |
| [`roundedRectangle`](/docs/functions/drawing/roundedRectangle) | `(x, y, width, radius, height?) => void` |
| [`line`](/docs/functions/drawing/line) | `(x1, y1, x2, y2) => void` |
| [`point`](/docs/functions/drawing/point) | `(x, y) => void` |
| [`polygon`](/docs/functions/drawing/polygon) | `(x, y, radius, sides, radius2?, rotation?) => void` |
| [`disk`](/docs/functions/drawing/disk) | `(x, y, radius, startAngle?, endAngle?, closed?) => void` |
| [`ellipse`](/docs/functions/drawing/ellipse) | Use `circle(x, y, radiusX, radiusY)` or the full native Canvas ellipse path API |

## [Styling Functions](/docs/functions/styling/fillColor)

| Function | Signature |
|----------|-----------|
| [`fillColor`](/docs/functions/styling/fillColor) | `(color: string \| CanvasGradient) => void` |
| [`strokeColor`](/docs/functions/styling/strokeColor) | `(color: string \| CanvasGradient) => void` |
| [`strokeWidth`](/docs/functions/styling/strokeWidth) | `(width: number) => void` |
| [`strokeCap`](/docs/functions/styling/strokeCap) | `(cap: CanvasLineCap) => void` |
| [`strokeJoin`](/docs/functions/styling/strokeJoin) | `(join: CanvasLineJoin) => void` |
| [`noFill`](/docs/functions/styling/noFill) | `() => void` |
| [`noStroke`](/docs/functions/styling/noStroke) | `() => void` |
| [`opacity`](/docs/functions/styling/opacity) | `(value: number) => void` |
| [`blend`](/docs/functions/styling/blend) | `(mode: GlobalCompositeOperation \| "default") => void` |

## [Transform Functions](/docs/functions/transforms/push)

| Function | Signature |
|----------|-----------|
| [`push`](/docs/functions/transforms/push) | `() => void` |
| [`pop`](/docs/functions/transforms/pop) | `() => void` |
| [`translate`](/docs/functions/transforms/translate) | `(x, y) => void` |
| [`rotate`](/docs/functions/transforms/rotate) | `(angle) => void` |
| [`scale`](/docs/functions/transforms/scale) | `(x, y) => void` — **requires 2 args** |
| [`resetTransform`](/docs/functions/transforms/resetTransform) | `() => void` |
| [`screenToWorld`](/docs/functions/transforms/coordinates) | `(x, y) => { x, y }` — call **after** transforms |
| [`worldToScreen`](/docs/functions/transforms/coordinates) | `(x, y) => { x, y }` — call **after** transforms |
| [`getVisibleBounds`](/docs/functions/transforms/coordinates) | `() => { left, top, right, bottom, width, height }` |

## [Path Functions](/docs/functions/paths/beginShape)

| Function | Signature |
|----------|-----------|
| [`beginShape`](/docs/functions/paths/beginShape) | `() => void` |
| [`endShape`](/docs/functions/paths/endShape) | `(close?) => void` |
| [`vertex`](/docs/functions/paths/vertex) | `(x, y) => void` |
| [`bezierVertex`](/docs/functions/paths/bezierVertex) | `(cp1x, cp1y, cp2x, cp2y, x, y) => void` |
| [`quadraticVertex`](/docs/functions/paths/quadraticVertex) | `(cpx, cpy, x, y) => void` |
| [`arcVertex`](/docs/functions/paths/arcVertex) | `(x1, y1, x2, y2, radius) => void` |
| [`beginContour`](/docs/functions/paths/beginContour) | `() => void` |
| [`endContour`](/docs/functions/paths/endContour) | `(forceRevert?) => void` |
| [`clipTo`](/docs/functions/paths/clipTo) | `(callback, fillRule?) => void` |

## [Text Functions](/docs/functions/text/)

| Function | Signature |
|----------|-----------|
| [`text`](/docs/functions/text/) | `(text, x, y, maxWidth?) => void` |
| [`paragraph`](/docs/functions/text/paragraph) | `(text, x, y, width, options?) => void` |
| `textFont` | `(font: string) => void` |
| `textSize` | `(size: number) => void` |
| `textStyle` | `(style: string) => void` |
| `textWeight` | `(weight: string) => void` |
| `alignText` | `(horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => void` |
| `textLeading` | `(spacing: number) => number` |
| `textWidth` | `(text: string) => number` |

**Important**: Text alignment is `alignText` (NOT `textAlign`).

## [Gradient Functions](/docs/functions/gradients/gradient)

| Function | Signature |
|----------|-----------|
| [`gradient`](/docs/functions/gradients/gradient) | `(x1?, y1?, x2?, y2?) => CanvasGradient` |
| [`radialGradient`](/docs/functions/gradients/radialGradient) | `(x1?, y1?, r1?, x2?, y2?, r2?) => CanvasGradient` |
| [`conicGradient`](/docs/functions/gradients/conicGradient) | `(angle?, x1?, y1?) => CanvasGradient` |
| [`addColorStop`](/docs/functions/gradients/addColorStop) | `(gradient, offset, color) => void` |

## [Image Functions](/docs/functions/images/image)

| Function | Signature |
|----------|-----------|
| [`image`](/docs/functions/images/image) | `(img, x, y, ...args) => void` |
| [`createOffscreen`](/docs/functions/images/createOffscreen) | `(id, width, height, options?, callback?) => KlintOffscreenContext` |
| `K.Pixels.load` | `() => ImageData` |
| `K.Pixels.update` | `(pixels) => void` |
| `K.Pixels.read` | `(x, y, w?, h?) => number[]` |
| `scaleTo` | `(origW, origH, destW, destH, cover?) => number` |

## [Canvas Control](/docs/klintfunctions-canvas)

| Function | Signature |
|----------|-----------|
| [`background`](/docs/functions/canvas/background) | `(color?: string) => void` |
| `clear` | `() => void` |
| `reset` | `() => void` |
| `setCanvasOrigin` | `("center" \| "corner") => void` |
| `setImageOrigin` | `("center" \| "corner") => void` |
| `setRectOrigin` | `("center" \| "corner") => void` |
| `smooth` / `noSmooth` | `() => void` |
| `toBase64` | `(type?: string, quality?: number) => string` |

## [Math Utilities](/docs/functions/utilities/math-utils)

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
| `K.Color` | Color creation and manipulation across color spaces | [Color](/docs/elements/Color) |
| `K.Easing` | Animation easing functions (in, out, bounce, spring, etc.) | [Easing](/docs/elements/Easing) |
| `K.Vector` | 3D vector math (`K.createVector(x, y)` or `new K.Vector(x, y)`) | [Vector](/docs/elements/Vector) |
| `K.Noise` | Seedable noise: Perlin, Simplex, Hash (1-4D), Gaussian random | [Noise](/docs/elements/Noise) |
| `K.Text` | Advanced text layout (splitTo, circularText, findTextSize) | [Text](/docs/elements/Text) |
| `K.Quadtree` | Spatial partitioning for efficient queries | [Quadtree](/docs/elements/Quadtree) |
| `K.Hotspot` | Hit testing (circle, rect, ellipse, polygon, path) | [Hotspot](/docs/elements/Hotspot) |
| `K.Grid` | Grid generators (rect, radial, hex, triangle) | [Grid](/docs/elements/Grid) |
| `K.Strip` | Triangle/quad strip, hull, and ribbon rendering | [Strip](/docs/elements/Strip) |
| `K.Pixels` | Pixel-level read/write (load, update, read) | [Pixels](/docs/elements/Pixels) |
| `K.Timeline` | Keyframe-based animation with tracks and stagger | [Timeline](/docs/core-concepts/timeline) |

## Common Pitfalls

- **Option names**: `dpr` not `pixelRatio`, `origin` not `canvasOrigin`
- **Text alignment**: `K.alignText()` not `K.textAlign()`
- **Scale needs 2 args**: `K.scale(2, 2)` not `K.scale(2)` (native canvas API)
- **Canvas fills container**: Set container size, not canvas size — there are no `width`/`height` props
- **Logical pixels**: `K.width`/`K.height` and drawing/input coordinates are CSS pixels; `K.canvas.width`/`height` are the DPR-scaled backing store
- **Boolean options use booleans**: `alpha: true`, `static: true`, and `ignoreResize: false`
- **K.time is in seconds**: Not milliseconds — `Math.sin(K.time)` oscillates with a ~6.28s period
- **K.deltaTime is in milliseconds**: Convert with `K.deltaTime / 1000` for seconds
- **Color functions live on K.Color**: Use `K.Color.hsl()`, not `K.hsl()`
- **Noise lives on K.Noise**: Use `K.Noise.perlin()`, not `K.noise()`

## Next Steps

- [Quick Start](/docs/getting-started/quick-start) — Get started
- [Klint Component](./klint-component) — Component props reference
- [Klint Hooks](./klint-hooks) — Hook reference
