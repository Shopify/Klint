---
sidebar_position: 2
---

# Klint Hooks

`useKlint()` creates the stable bridge shared by `<Klint>` and the optional input/resource hook factories.

```tsx
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

The aliases `useMouse`, `useScroll`, `useGesture`, `useKeyboard`, `useWindow`, and `useImage` are also available.

Call each factory unconditionally at the top level of your component, like any other React hook. Pass `context` to `<Klint>` so the factory can attach to the current canvas.

## Mouse and pointer input

```tsx
const {mouse, onClick, onMouseIn, onMouseOut, onMouseDown, onMouseUp} =
  KlintMouse();
```

`mouse` contains `x`, `y`, previous coordinates `px`, `py`, velocity `vx`, `vy`, movement `angle`, `isPressed`, and `isHover`. Coordinates are logical canvas pixels and account for CSS scaling and the configured canvas origin.

Handlers receive `(K, PointerEvent)`. Pointer capture keeps a press active when the pointer moves outside the canvas.

## Scroll input

```tsx
const {scroll, onScroll} = KlintScroll();

onScroll((K, state, event) => {
  console.log(state.distance, state.velocity);
});
```

Wheel line/page deltas are normalized to logical pixel values. The listener is intentionally non-passive so scrolling over the sketch does not also scroll the page.

## Gestures

```tsx
const {
  gesture,
  onTap,
  onSwipe,
  onPinch,
  onRotate,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
} = KlintGesture();
```

The gesture state includes the current scale and rotation, per-event `deltaX`/`deltaY`, full-gesture `totalX`/`totalY`, velocity, touch lists, and timing values. Gesture callbacks receive `(K, TouchEvent, gesture)`; `onSwipe` also receives a direction.

## Keyboard input

Keyboard events are attached to the focusable canvas, not the whole document. Clicking or pressing the canvas focuses it.

```tsx
const {
  keyboard,
  keyPressed,
  keyReleased,
  keyCombo,
  isPressed,
  arePressed,
  clearCallbacks,
} = KlintKeyboard();

keyPressed('Space', (K, event) => K.pause());
keyCombo(['Ctrl', 's'], (K, event) => {
  event.preventDefault();
  K.saveCanvas();
});
```

`keyboard.pressedKeys` is a `Set`; modifier state, the last key, and its timestamp are also available. `Space`, `Ctrl`, and `Esc` use normalized names.

## Images

```tsx
const {
  images,
  loadImage,
  loadImages,
  getImage,
  hasImage,
  clearImages,
} = KlintImage();

await loadImages({logo: '/img/logo.png'});
K.image(images.logo, 0, 0);
```

`images.key`, `images['key']`, and `images.get('key')` are supported. Loading defaults to `crossOrigin: 'anonymous'`; pass `{crossOrigin}` to override it.

## Window lifecycle

```tsx
const {onResize, onBlur, onFocus, onVisibilityChange} = KlintWindow();
```

Callbacks attach after the canvas context exists and receive that context. Automatic canvas sizing itself is handled by `<Klint>`'s `ResizeObserver`.

## Play and pause

```tsx
const {togglePlay} = useKlint();

togglePlay();      // toggle
togglePlay(true);  // play
togglePlay(false); // pause
```

Inside lifecycle callbacks, the equivalent context methods are `K.play()`, `K.pause()`, and `K.redraw()`.

## useStorage

`useStorage` keeps mutable sketch state in a ref without triggering React renders.

```tsx
const particles = useStorage({items: [] as Particle[]});

particles.get('items');
particles.set('items', nextItems);
particles.has('items');
particles.remove('items');
```

The current backing object is also exposed as `store`. Mutating it is appropriate for frame-local creative-coding state, but it does not update React UI.

## useProps

`useProps` lets a long-running draw callback read the latest React props without recreating the canvas.

```tsx
const values = useProps(props);

const draw = (K: KlintContext) => {
  K.circle(0, 0, values.get('radius'));
};
```

Use `get(key)` for the current value and `has(key)` for presence. The `props` field is the render-time snapshot; prefer `get()` inside lifecycle callbacks.

## Development refreshes

`useDev()` opts a sketch into re-enabling drawing after development renders. Call it unconditionally alongside the other factories when your editor/HMR integration needs it.

## Cleanup

All listeners use abortable subscriptions and are detached when the component unmounts or the underlying canvas changes. Input refs remain stable across React rerenders.
