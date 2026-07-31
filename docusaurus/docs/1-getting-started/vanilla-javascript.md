---
sidebar_position: 5
---

# Vanilla JavaScript

Klint 0.5 includes a framework-independent runtime. Importing `@shopify/klint/native` does not load React.

```js
import {createKlint} from '@shopify/klint/native';

const sketch = createKlint({
  container: '#sketch',
  setup(K) {
    K.setCanvasOrigin('center');
  },
  draw(K) {
    K.background('#111');
    K.fillColor('#ff6b6b');
    K.circle(0, 0, 40 + Math.sin(K.time * 2) * 10);
  },
});

await sketch.ready;
```

The native adapter uses the same context, logical-pixel sizing, DPR handling, lifecycle, animation loop, and drawing functions as the React component.

## Choose a canvas or container

Pass an existing canvas:

```js
const canvas = document.querySelector('canvas');
const sketch = createKlint({canvas, draw});
```

Or pass an element/selector as `container`; Klint creates and appends a canvas. If neither is provided, it appends one to `document.body`.

```js
const sketch = createKlint({
  container: document.querySelector('#sketch'),
  width: 640,  // optional fixed logical width
  height: 360, // optional fixed logical height
  draw,
});
```

Without fixed dimensions, a `ResizeObserver` tracks the container. Set `ignoreResize: true` to resize manually.

## Lifecycle

`preload`, `setup`, and `draw` follow the React lifecycle. `ready` resolves after preload and setup, or rejects if either fails.

```js
const sketch = createKlint({
  async preload(K) {
    // Load resources before drawing starts.
  },
  async setup(K) {
    // One-time initialization; async setup is supported.
  },
  draw(K) {
    // Frame callback.
  },
  onReady(K) {},
  onError(error) {},
  onResize(K) {},
  onVisible(K, visible) {},
});
```

## Controller

```js
sketch.canvas;
sketch.context;
sketch.mouse;
sketch.scroll;
sketch.keyboard;

sketch.pause();
sketch.play();
sketch.redraw();
sketch.resize(800, 600);
sketch.setDraw(nextDraw);
sketch.destroy();
```

Call `destroy()` to stop the loop, remove listeners and observers, clear offscreens, and remove a canvas created by Klint. A caller-owned canvas remains in the document.

## Input

The controller exposes mutable input state and optional callbacks:

```js
const sketch = createKlint({
  container: '#sketch',
  draw(K) {
    if (K.mouse?.isPressed) {
      K.circle(K.mouse.x, K.mouse.y, 8);
    }
  },
  onPointer(K, mouse, event) {},
  onWheel(K, scroll, event) {},
  onKey(K, keyboard, event) {},
});
```

Pointer coordinates are logical canvas pixels. Keyboard input is scoped to the canvas, which receives focus on pointer down.

## Canvas attributes and options

Use `canvasAttributes` for HTML attributes:

```js
createKlint({
  container: '#sketch',
  canvasAttributes: {
    'aria-label': 'Interactive particle sketch',
    class: 'canvas',
  },
  dpr: 'default',
  maxDpr: 3,
  alpha: true,
  fps: 60,
  origin: 'corner',
  draw,
});
```

All [canvas options](../reference/klint-component#canvas-options) are shared with the React component.
