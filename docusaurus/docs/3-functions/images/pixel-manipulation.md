---
sidebar_position: 6
id: klintfunctions-pixels
title: Manipulating Pixels
slug: /klintfunctions-pixels
---

# Pixel Manipulation

Pixel access lives on the `K.Pixels` element.

## Load the full backing store

```ts
K.Pixels.load(): ImageData
```

`load()` returns the full backing-store `ImageData`. Its width and height are `K.canvas.width` and `K.canvas.height`, which include DPR scaling.

```ts
const imageData = K.Pixels.load();
const data = imageData.data;
```

## Update the full backing store

```ts
K.Pixels.update(pixels: Uint8ClampedArray | number[]): void
```

The array must contain RGBA values for the full backing store.

```ts
const imageData = K.Pixels.load();
for (let i = 0; i < imageData.data.length; i += 4) {
  imageData.data[i] = 255 - imageData.data[i];
  imageData.data[i + 1] = 255 - imageData.data[i + 1];
  imageData.data[i + 2] = 255 - imageData.data[i + 2];
}
K.Pixels.update(imageData.data);
```

## Read a logical region

```ts
K.Pixels.read(x: number, y: number, width = 1, height = 1): number[]
```

`read()` accepts logical canvas coordinates and multiplies them by `K.dpr` internally. At DPR 2, reading one logical pixel returns the RGBA values for a 2 × 2 backing-store region.

```ts
const values = K.Pixels.read(100, 100);
const region = K.Pixels.read(100, 100, 10, 10);
```

## Performance

- Create the context with `willreadfrequently: true` when reads dominate your workload.
- Pixel operations are backing-store operations, so their cost grows with DPR squared.
- Prefer `read()` for small regions and `load()` when you will process most of the canvas.
- Avoid allocating and processing full-frame pixel buffers on every animation frame when a canvas filter or cached offscreen can produce the same result.
