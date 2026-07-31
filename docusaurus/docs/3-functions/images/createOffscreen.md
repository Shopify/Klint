# createOffscreen

```ts
createOffscreen(
  id: string,
  width: number,
  height: number,
  options?: KlintCanvasOptions,
  callback?: (O: KlintOffscreenContext) => void,
): KlintOffscreenContext
```

Creates a canvas-backed Klint context for caching and layered rendering. Public dimensions and drawing coordinates use logical pixels.

## Parameters

- `id`: Unique key used by `getOffscreen(id)`.
- `width`, `height`: Finite, non-negative logical dimensions.
- `options`: Canvas options for this context.
  - `alpha`: Request an alpha-enabled context.
  - `willreadfrequently`: Optimize for frequent pixel reads.
  - `ignoreFunctions`: Skip Klint functions/elements on the offscreen context.
  - `origin`: `'corner'` or `'center'`.
  - `dpr`, `maxDpr`: Override backing-store density.
- `callback`: Optional initializer called after Klint installs the context.

The offscreen inherits the main context's DPR unless `options.dpr` is provided. It always remains canvas-backed and mutable; `static` does not convert it to an image.

## Example

```tsx
const preload = (K: KlintContext) => {
  K.createOffscreen('label', 300, 100, {}, (O) => {
    O.background('transparent');
    O.textFont('Inter');
    O.textSize(36);
    O.fillColor('white');
    O.text('Offscreen Text', 10, 60);
  });
};

const draw = (K: KlintContext) => {
  const label = K.getOffscreen('label');
  K.image(label, 100, 100);
};
```

You can also keep and update the returned context:

```ts
const buffer = K.createOffscreen('buffer', 200, 200);
buffer.background('coral');
buffer.circle(100, 100, 50);
```

## Notes

- Calling `createOffscreen()` again with the same ID replaces the stored entry.
- `getOffscreen()` throws when the ID does not exist.
- Rendering a cached offscreen is cheap; redrawing complex content into it every frame has the same drawing cost as drawing directly.
- Offscreen contexts expose drawing functions but not main-loop controls such as `play()`, `pause()`, or nested `createOffscreen()`.
