# Klint API Reference

## Complete Element Reference

### Color Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `rgb` | `(r, g, b)` | RGB color (0-255) |
| `rgba` | `(r, g, b, a)` | RGBA with alpha (0-1) |
| `hsl` | `(h, s, l)` | HSL color (h: 0-360, s/l: 0-100) |
| `hsla` | `(h, s, l, a)` | HSLA with alpha |
| `gray` | `(value, alpha?)` | Grayscale (0-255) |
| `lch` | `(l, c, h)` | LCH color space |
| `oklch` | `(l, c, h)` | OKLCH perceptually uniform |
| `oklab` | `(l, a, b)` | OKLAB color space |
| `blendColors` | `(colorA, colorB, factor, mode?)` | Blend colors (mode: oklch, hsl) |
| `createPalette` | `(base, steps?)` | Generate color palette |
| `complementary` | `(color)` | Opposite on color wheel |
| `analogous` | `(color, angle?)` | Adjacent colors |
| `triadic` | `(color)` | Three evenly spaced |
| `saturate` | `(color, amount)` | Increase saturation |
| `lighten` | `(color, amount)` | Mix with white |
| `darken` | `(color, amount)` | Mix with black |

### Vector Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `add(v)` | `this` | Add vector |
| `sub(v)` | `this` | Subtract vector |
| `mult(n)` | `this` | Multiply by scalar |
| `div(n)` | `this` | Divide by scalar |
| `rotate(angle)` | `this` | Rotate (radians) |
| `normalize()` | `this` | Set length to 1 |
| `mag()` | `number` | Get magnitude |
| `dist(v)` | `number` | Distance to vector |
| `dot(v)` | `number` | Dot product |
| `cross(v)` | `Vector` | Cross product |
| `angle()` | `number` | Angle in radians |
| `copy()` | `Vector` | Clone vector |
| `set(x, y, z?)` | `this` | Set coordinates |
| `slerp(v, t)` | `this` | Spherical lerp |
| `lookAt(target)` | `this` | Point toward target |

Static: `Vector.fromAngle(center, angle, radius)`

### Easing Functions

All take `t` (0-1), return eased value (0-1):

- Linear: `linear`
- Quadratic: `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- Cubic: `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- Quartic: `easeInQuart`, `easeOutQuart`, `easeInOutQuart`
- Quintic: `easeInQuint`, `easeOutQuint`, `easeInOutQuint`
- Sine: `easeInSine`, `easeOutSine`, `easeInOutSine`
- Exponential: `easeInExpo`, `easeOutExpo`, `easeInOutExpo`
- Circular: `easeInCirc`, `easeOutCirc`, `easeInOutCirc`
- Back: `easeInBack`, `easeOutBack`, `easeInOutBack`
- Elastic: `easeInElastic`, `easeOutElastic`, `easeInOutElastic`
- Bounce: `easeInBounce`, `easeOutBounce`, `easeInOutBounce`

## Canvas Options Reference

```tsx
interface KlintCanvasOptions {
  alpha?: string;              // 'true' | 'false' - transparent background
  willreadfrequently?: string; // 'true' - optimize for pixel reads
  autoplay?: string;           // 'true' - auto start animation
  ignoreResize?: string;       // 'true' - don't respond to resize
  noloop?: string;             // 'true' - single frame, no animation
  ignoreFunctions?: string;    // 'true' - skip adding Klint functions
  static?: string;             // 'true' - render once, convert to image
  nocanvas?: string;           // 'true' - hide canvas element
  fps?: number;                // Target framerate (default: 60)
  unsafemode?: string;         // 'true' - allow re-running setup/preload
  dpr?: number | 'default';    // Device pixel ratio
  origin?: 'corner' | 'center';// Canvas coordinate origin
}
```

## Hook Reference

### useKlint Return Value

```tsx
{
  context: KlintContextWrapper,   // Pass to <Klint>
  KlintMouse: () => MouseHook,    // Mouse input
  KlintScroll: () => ScrollHook,  // Scroll input
  KlintGesture: () => GestureHook,// Touch gestures
  KlintKeyboard: () => KeyboardHook,
  KlintWindow: () => WindowHook,  // Resize, focus, visibility
  KlintImage: () => ImageHook,    // Image loading
  KlintTimeline: () => TimelineHook,
  KlintPerformance: () => PerformanceHook,
  togglePlay: (playing?: boolean) => void,
  useDev: () => void,             // HMR support
}
```

### KlintImage Hook

```tsx
const { images, loadImage, loadImages, getImage, hasImage, clearImages } = KlintImage();

// In preload:
await loadImage('key', 'url');
await loadImages({ bg: 'bg.jpg', sprite: 'sprite.png' });

// In draw:
const img = getImage('key');
K.image(img, 0, 0);
```

### KlintTimeline Hook

```tsx
const { Timeline } = KlintTimeline();

const anim = Timeline.create((t) => ({
  x: t.track((kf) => {
    kf.start(0)
      .then(100, 0.5, K.Easing.easeOutCubic)
      .then(0, 0.5);
  }),
  scale: t.track((kf) => kf.start(1).then(2, 1)),
}));

// In draw:
anim.update(K.time % 1);
K.circle(anim.x.current, 100, anim.scale.current * 20);
```

## Context Internal Properties

Access via `K.__property`:

| Property | Type | Description |
|----------|------|-------------|
| `__dpr` | `number` | Device pixel ratio |
| `__isPlaying` | `boolean` | Animation running |
| `__canvasOrigin` | `'corner'\|'center'` | Coordinate origin |
| `__imageOrigin` | `'corner'\|'center'` | Image draw origin |
| `__rectangleOrigin` | `'corner'\|'center'` | Rect draw origin |
| `__textFont` | `string` | Current font family |
| `__textSize` | `number` | Font size (px) |
| `__textLeading` | `number` | Line height |
| `__offscreens` | `Map` | Offscreen buffers |

## Filters

```tsx
K.blur(radius)
K.grayscale(amount)           // 0-1
K.hue(angle)                  // radians
K.invert(amount)              // 0-1
K.filterOpacity(amount)       // 0-1
K.dropShadow(x, y, blur, color)
K.SVGfilter('url(#filterId)')
```

Note: Check `K.canIuseFilter()` for browser support.

## Performance Tips

1. **Avoid setup in draw** - Initialize in `setup`, not `draw`
2. **Use offscreen buffers** - Pre-render static content
3. **Batch similar operations** - Group by fill/stroke color
4. **Use `push/pop` sparingly** - State changes have cost
5. **Prefer `noStroke/noFill`** - When not needed
6. **Use integer coordinates** - Avoids sub-pixel rendering
7. **Text is expensive** - Cache text on offscreen canvas

## Blend Modes

```tsx
K.blend('source-over')    // Default
K.blend('multiply')
K.blend('screen')
K.blend('overlay')
K.blend('darken')
K.blend('lighten')
K.blend('color-dodge')
K.blend('color-burn')
K.blend('hard-light')
K.blend('soft-light')
K.blend('difference')
K.blend('exclusion')
K.blend('hue')
K.blend('saturation')
K.blend('color')
K.blend('luminosity')
```
