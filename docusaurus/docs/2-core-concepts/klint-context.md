---
sidebar_position: 2
---

# The Klint Context (K)

The Klint Context, typically named `K` in the documentation, is the enhanced canvas context that provides all drawing and utility functions. All the functions, patterns and plugins in Klint always reference this context, so you can always use any functions in any situations as long as you can reference it.

## What is the Klint Context Object?

The `K` parameter passed to your `setup`, `draw`, and `preload` functions is an enhanced version of the HTML Canvas 2D context. It includes:

- All standard Canvas 2D API methods
- Klint's creative coding functions
- Canvas properties (width, height)
- Animation properties (time, frame, deltaTime)
- [Elements](/docs/elements/Color) (Color, Vector, Easing, Noise, etc.)
- Anything attached to it with the [useStorage or useProps](/docs/getting-started/useKlint-pattern) hook
- (Most) of the [plugins](/docs/plugins)

## Enhanced 2D context

When available and to prevent duplicates, Klint will use the default 2D canvas API, one noticeable change is that the actions are harmonized to functions. In example, `ctx.font = "fontName"` becomes `K.textFont(fontName)` but since we cannot override the API, the `ctx.fill="#fff"` had to be adjusted to `K.fillColor('#fff')`.

Since it's `just` a 2D context, you can pick and choose which patterns you prefer. The 2D API being natively imperative, we don't really update the context in real-time (like in webGL/GPU) but we make the values available for the next frame.

```tsx
const draw = (K) => {
  K.background('#000');        // Klint function
  K.fillStyle = 'red';        // Native canvas property
  K.circle(100, 100, 50);     // Klint function
  K.fillRect(200, 200, 50, 50); // Native canvas method
};
```

## Canvas Properties

| Property | Type | Description |
|----------|------|-------------|
| `K.width` | number | Logical canvas width in CSS pixels |
| `K.height` | number | Logical canvas height in CSS pixels |
| `K.time` | number | Elapsed time in **seconds** since start |
| `K.deltaTime` | number | Time since last frame in **milliseconds** |
| `K.frame` | number | Frame count since start |
| `K.dpr` | number | Device pixel ratio |

With `origin: "center"`, `(0,0)` is the canvas center. `K.width`/`K.height` remain logical CSS pixels; only `K.canvas.width`/`K.canvas.height` expose the DPR-scaled backing store. The visible X range spans from `-K.width / 2` to `K.width / 2`.

```tsx
const draw = (K) => {
  // Canvas dimensions
  const centerX = K.width / 2;
  const centerY = K.height / 2;

  // K.time is in seconds — use directly for animation
  const x = centerX + Math.sin(K.time) * 100;
  K.circle(x, centerY, 30);

  // Frame-independent movement using deltaTime (in ms)
  const speed = 100; // pixels per second
  position.x += speed * (K.deltaTime / 1000);
};
```

## What's Available on K

The Klint context organizes its API into several categories. Each has its own detailed documentation:

- **[Drawing functions](/docs/functions/drawing/circle)** — `circle`, `rectangle`, `line`, `point`, `polygon`, `disk`, etc.
- **[Styling](/docs/functions/styling/fillColor)** — `fillColor`, `strokeColor`, `strokeWidth`, `noFill`, `noStroke`, `opacity`, `blend`
- **[Transforms](/docs/functions/transforms/push)** — `push`, `pop`, `translate`, `rotate`, `scale`, `screenToWorld`, `worldToScreen`
- **[Paths](/docs/functions/paths/beginShape)** — `beginShape`, `vertex`, `bezierVertex`, `endShape`, `clipTo`
- **[Text](/docs/functions/text/)** — `text`, `paragraph`, `textFont`, `textSize`, `alignText`
- **[Gradients](/docs/functions/gradients/gradient)** — `gradient`, `radialGradient`, `conicGradient`
- **[Images](/docs/functions/images/image)** — `image`, `createOffscreen`, and `K.Pixels`
- **[Canvas control](/docs/klintfunctions-canvas)** — `background`, `clear`, `reset`, `setCanvasOrigin`
- **[Math utilities](/docs/functions/utilities/math-utils)** — `lerp`, `remap`, `constrain`, `distance`, `fract`
- **[Time](/docs/klintfunctions-time)** — `K.time`, `K.deltaTime`, `K.frame`

### Elements (accessed as K.ElementName)

- **[K.Color](/docs/elements/Color)** — Color creation and manipulation (`K.Color.hsl()`, `K.Color.oklch()`, `K.Color.blendColors()`)
- **[K.Easing](/docs/elements/Easing)** — Animation easing functions (`K.Easing.in()`, `K.Easing.bounceOut()`, `K.Easing.spring()`)
- **[K.Vector](/docs/elements/Vector)** — 3D vector math (`K.createVector(x, y)` or `new K.Vector(x, y)`)
- **[K.Noise](/docs/elements/Noise)** — Seedable noise generation (`K.Noise.perlin()`, `K.Noise.simplex()`, `K.Noise.hash()`)
- **[K.Text](/docs/elements/Text)** — Advanced text layout (`K.Text.splitTo()`, `K.Text.circularText()`)
- **[K.Grid](/docs/elements/Grid)** — Grid generators (`K.Grid.rect()`, `K.Grid.radial()`, `K.Grid.hex()`, `K.Grid.triangle()`)
- **[K.Hotspot](/docs/elements/Hotspot)** — Hit testing (`K.Hotspot.circle()`, `K.Hotspot.rect()`, `K.Hotspot.polygon()`)
- **[K.Strip](/docs/elements/Strip)** — Triangle/quad strips, hulls, and ribbons from point arrays
- **[K.Pixels](/docs/elements/Pixels)** — Pixel-level read/write (`K.Pixels.load()`, `K.Pixels.update()`, `K.Pixels.read()`)
- **[K.Quadtree](/docs/elements/Quadtree)** — Spatial partitioning
- **[K.Timeline](/docs/core-concepts/timeline)** — Keyframe-based animation with tracks and stagger

## Accessing Native Canvas

The Klint object extends the native Canvas 2D context, so all standard methods are available:

```tsx
const draw = (K) => {
  // Klint way
  K.fillColor('red');
  K.circle(100, 100, 50);

  // Native canvas way (also works)
  K.fillStyle = 'blue';
  K.beginPath();
  K.arc(200, 100, 50, 0, Math.PI * 2);
  K.fill();

  // Mix and match as needed
  K.save();
  K.globalAlpha = 0.5;
  K.fillColor('green');
  K.rectangle(150, 150, 100, 100);
  K.restore();
};
```

## Context State Management

The context maintains drawing state that can be saved and restored. Think of it as printing on the canvas — unless you clear it and reset the transformation matrix, whatever you put on it will remain there.

```tsx
const draw = (K) => {
  K.fillColor('red');
  K.strokeWidth(2);
  K.opacity(0.5);

  K.push();   // Save state
  K.fillColor('blue');
  K.strokeWidth(5);
  K.opacity(1);
  K.rectangle(100, 100, 50, 50);
  K.pop();    // Restore previous state

  // Back to red, width 2, opacity 0.5
  K.circle(200, 100, 25);
};
```

## Custom Properties: useProps() vs useStorage()

You can access custom props passed to the Klint component using the `useProps()` hook. We try our hardest not to re-render, but sometimes we can't avoid it so we update an object that will then make the updated props available to the draw loop. It's different from `useStorage()` as storage is pseudo-global state and expects you to update the values within the sketch, and will not trigger a re-render.

```tsx
function MySketch({ particleCount, color }) {
  const { context } = useKlint();
  const props = useProps({ particleCount, color });

  const draw = (K) => {
    K.fillColor(props.color);
    for (let i = 0; i < props.particleCount; i++) {
      // Draw particles
    }
  };

  return <Klint context={context} draw={draw} />;
}
```

See [useStorage and useProps](./react-integration) for more details on data management patterns.

## Drawing Efficiency

The rule of thumb in terms of efficiency on the 2D canvas is:
**Images > Strokes > Shapes > Text**

- An image is extremely cheap to render. If you can, draw on an offscreen canvas and render it.
- A stroke is cheaper than a shape. If you need to draw circles or rectangles in batch, use short lines with a thick stroke.
- A shape is more flexible but generally more expensive, especially in large quantities.
- Text is the most expensive. Unless you need to animate your text, draw it to a texture and render that texture. For fast text, consider rasterized text using the [FontParser plugin](/docs/advanced/plugins/font-parser).

## Best Practices

1. **Prefer Klint functions** — They're optimized, consistent across main and offscreen context, and more readable than their vanilla version.
2. **Batch operations** — Set styles once, draw many times when you can.
3. **Use push/pop** — Isolate transformations and style changes.
4. **Access props via useProps and update stored values with useStorage** — For dynamic component properties.

## Next Steps

- [Lifecycle Functions](./lifecycle) — Understanding setup, draw, and preload
- [React Integration](./react-integration) — Using Klint with React
- [Function Reference](/docs/functions/drawing/circle) — Explore all K functions
