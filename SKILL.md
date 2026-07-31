# Klint Canvas Library

Klint 0.5 is a compact immediate-mode Canvas 2D toolkit for React and vanilla JavaScript. It extends a real `CanvasRenderingContext2D` with creative-coding helpers, elements, lifecycle state, and optional plugins.

## Packages and imports

```tsx
import {Klint, useKlint, useProps, useStorage} from '@shopify/klint';
import type {KlintContext, KlintCanvasOptions} from '@shopify/klint';

import {createKlint} from '@shopify/klint/native';

import {Bezier, Polyline, FontParser} from '@shopify/klint/plugins';
```

React and React DOM are optional peers. Importing `@shopify/klint/native` does not load React.

## React quick start

```tsx
import {Klint, useKlint, type KlintContext} from '@shopify/klint';

function Sketch() {
  const {context, KlintMouse} = useKlint();
  const {mouse} = KlintMouse();

  const draw = (K: KlintContext) => {
    K.background('#111');
    K.fillColor(mouse.isPressed ? '#ff6b6b' : '#fff');
    K.circle(mouse.x, mouse.y, 20);
  };

  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

A basic `<Klint draw={draw} />` works without `useKlint()`. Pass its context bridge when using the React input/resource factories.

## Lifecycle

```tsx
<Klint
  context={context}
  preload={async (K) => {/* load resources once */}}
  setup={async (K) => {/* initialize once */}}
  draw={(K) => {/* synchronous frame callback */}}
  onReady={(K) => {}}
  onResize={(K) => {}}
  onVisible={(K, visible) => {}}
  onError={(error) => {}}
  loadingComponent={<p>Loading…</p>}
  errorComponent={(error) => <p>{error.message}</p>}
/>
```

Klint preserves one canvas/context across React rerenders and reads current callbacks from refs. Options are initialization settings; remount to change them. The loop pauses while hidden and resets timing when resumed.

## Coordinates, time, and DPR

```ts
K.width;      // logical CSS-pixel width
K.height;     // logical CSS-pixel height
K.dpr;        // backing-store density
K.frame;      // rendered frame count
K.time;       // elapsed drawn time in seconds
K.deltaTime;  // milliseconds since the previous rendered frame
```

Drawing, pointer input, offscreens, and region pixel reads use logical pixels. `K.canvas.width` and `K.canvas.height` expose the DPR-scaled backing store. Never multiply normal drawing coordinates by DPR.

`origin: 'corner'` puts `(0, 0)` at the top-left. `origin: 'center'` puts it at the canvas center.

## Canvas options

```tsx
<Klint
  draw={draw}
  options={{
    alpha: true,
    willreadfrequently: false,
    autoplay: true,
    ignoreResize: false,
    noloop: false,
    static: false,
    nocanvas: false,
    ignoreFunctions: false,
    unsafemode: false,
    fps: 60,
    dpr: 'default',
    maxDpr: 3,
    origin: 'corner',
  }}
/>
```

Boolean options use booleans. Legacy string booleans are accepted only as a migration aid. `static` and `noloop` draw one frame and keep the canvas/context mounted. `autoplay: false` starts paused.

## Context functions

The context includes the native Canvas 2D API plus these Klint helpers.

### Lifecycle and canvas

- `saveCanvas()`, `fullscreen()`, `play()`, `pause()`, `redraw()`
- `describe(text)`
- `background(color?)`, `clear()`, `reset()`
- `resizeCanvas(width, height)` (offscreen contexts)
- `toBase64(type?, quality?)`
- `createOffscreen(id, width, height, options?, callback?)`, `getOffscreen(id)`
- `extend(name, value, enforceReplace?)`
- `saveConfig(from?)`, `restoreConfig(config)`, `withConfig(config, callback)`

### Drawing and paths

- `point`, `line`, `circle`, `disk`, `rectangle`, `roundedRectangle`, `polygon`
- `beginShape`, `vertex`, `bezierVertex`, `quadraticVertex`, `arcVertex`
- `beginContour`, `endContour`, `endShape`
- `clipTo(callback, fillRule?)`

### Styling, text, and images

- `fillColor`, `strokeColor`, `noFill`, `noStroke`, `strokeWidth`, `strokeJoin`, `strokeCap`
- `fillRule`, `opacity`, `blend`, `smooth`, `noSmooth`
- `gradient`, `radialGradient`, `conicGradient`, `addColorStop`
- `textFont`, `textSize`, `textStyle`, `textWeight`, `textQuality`
- `textSpacing`, `textLeading`, `alignText`, `textWidth`, `text`, `paragraph`
- `image`, `scaleTo`
- `setCanvasOrigin`, `setImageOrigin`, `setRectOrigin`

### Math and coordinate helpers

- Constants: `PI`, `TWO_PI`, `TAU`
- `constrain`, `lerp`, `fract`, `distance`, `squareDistance`, `dot`, `remap`
- `bezierLerp`, `bezierTangent`
- `screenToWorld`, `worldToScreen`, `getVisibleBounds`

### Filters

- `canIuseFilter`, `blur`, `dropShadow`, `grayscale`, `hue`, `invert`, `filterOpacity`, `SVGfilter`

## Elements

Every context installs:

- `K.Color`
- `K.createVector()` and `K.Vector`
- `K.Easing`
- `K.Text`
- `K.Grid`
- `K.Strip`
- `K.Noise`
- `K.Hotspot`
- `K.Quadtree`
- `K.Pixels`
- `K.Timeline`

### Pixels

```ts
const imageData = K.Pixels.load(); // full DPR-scaled backing store
K.Pixels.update(imageData.data);
const rgba = K.Pixels.read(x, y, width?, height?); // logical coordinates
```

### Timeline

```ts
const animation = K.Timeline.create((timeline) => ({
  x: timeline.track((keyframes) => {
    keyframes.start(0).then(100, 0.5, (t) => K.Easing.out(t, 3)).then(0, 0.5);
  }),
}));

animation.update(K.time / 2);
K.circle(animation.x.current, 100, 20);
```

Use `start`, `at`, `then`, and `loop`; reuse definitions with `keyframes`; create delayed tracks with `stagger`. Register global callbacks with `K.Timeline.onStart`, `onLoop`, and `onEnd`.

## React hooks

```ts
const {
  context,
  KlintMouse,
  KlintScroll,
  KlintGesture,
  KlintKeyboard,
  KlintWindow,
  KlintImage,
  togglePlay,
  useDev,
} = useKlint();
```

Aliases `useMouse`, `useScroll`, `useGesture`, `useKeyboard`, `useWindow`, and `useImage` are also available.

- `KlintMouse()`: `mouse`, `onClick`, `onMouseIn`, `onMouseOut`, `onMouseDown`, `onMouseUp`
- `KlintScroll()`: `scroll`, `onScroll`
- `KlintGesture()`: `gesture`, `onTap`, `onSwipe`, `onPinch`, `onRotate`, touch callbacks
- `KlintKeyboard()`: `keyboard`, `keyPressed`, `keyReleased`, `keyCombo`, `isPressed`, `arePressed`, `clearCallbacks`
- `KlintWindow()`: `onResize`, `onBlur`, `onFocus`, `onVisibilityChange`
- `KlintImage()`: `images`, `loadImage`, `loadImages`, `getImage`, `hasImage`, `clearImages`

Keyboard events are scoped to the focusable canvas. Pointer and gesture coordinates are logical pixels relative to the configured origin.

## Mutable state and current props

```tsx
const storage = useStorage({particles: [] as Particle[]});
storage.get('particles');
storage.set('particles', next);
storage.has('particles');
storage.remove('particles');

const current = useProps(props);
current.get('radius');
current.has('radius');
```

These ref-backed helpers do not trigger React renders. Prefer `useProps().get()` inside draw callbacks.

## Vanilla JavaScript

```js
import {createKlint} from '@shopify/klint/native';

const sketch = createKlint({
  container: '#app',
  async preload(K) {},
  setup(K) {},
  draw(K) {
    K.background('#111');
    K.circle(K.width / 2, K.height / 2, 30);
  },
});

await sketch.ready;
sketch.pause();
sketch.play();
sketch.redraw();
sketch.resize();
sketch.setDraw(nextDraw);
sketch.destroy();
```

The controller exposes `canvas`, `context`, `mouse`, `scroll`, `keyboard`, and `ready`. Options include `canvas`, `container`, fixed `width`/`height`, lifecycle callbacks, input callbacks, and `canvasAttributes`.

## Plugins

```ts
import {
  Bezier,
  Polyline,
  FontParser,
  Delaunay,
  CatmullRom,
  Sprites,
  Projector,
} from '@shopify/klint/plugins';
```

### FontParser

```ts
const parser = new FontParser();
const font = await parser.load('/fonts/Inter.ttf');
const fontFromBuffer = await parser.loadFromBuffer(buffer);

const paths = font.toPaths('Hello', 100);
const svg = font.toSVG('Hello', 100);
const points = font.toPoints('Hello', 100, {sampling: 0.3});
```

The universal parser detects TTF, OTF, WOFF, or WOFF2 from binary magic. TTF/OTF deep parsers are synchronous; WOFF/WOFF2 are asynchronous.

```ts
import {parseTTF} from '@shopify/klint/plugins/FontParser/ttf';
import {parseOTF} from '@shopify/klint/plugins/FontParser/otf';
import {parseWOFF} from '@shopify/klint/plugins/FontParser/woff';
import {parseWOFF2} from '@shopify/klint/plugins/FontParser/woff2';
```

### Curves

```ts
const curve = Bezier.cubic(p0, c1, c2, p1, K);
curve.draw();
curve.get(0.5);
curve.length();
curve.split(0.5);
curve.offset(10);
curve.toPath2D();

const path = Polyline.smooth(points, false, 0.4, K);
path.draw();
path.simplify(2.5);
path.project(point);
path.toSVG();
```

### CatmullRom

```ts
const smooth = CatmullRom.interpolate(points, 0.5, 20);
CatmullRom.draw(K, points, {tension: 0.5, segments: 20});
const path = CatmullRom.toPath2D(points);
```

## Performance rules

1. Keep frame state in refs/`useStorage`, not React state.
2. Do expensive loading and preprocessing in `preload`/`setup`.
3. Cache static layers in offscreen contexts.
4. Use `K.time` and `K.deltaTime` for frame-rate-independent animation.
5. Use `willreadfrequently: true` only when pixel reads dominate.
6. Cap DPR when fill rate matters.
7. Call `destroy()` for native sketches and clean up non-Klint resources explicitly.
