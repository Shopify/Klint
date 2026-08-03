# Pixels

The Pixels element provides pixel-level read/write access to the canvas.

## Access

```tsx
const draw = (K) => {
  const imageData = K.Pixels.load();
  const [r, g, b, a] = K.Pixels.read(100, 100);
};
```

## Methods

### load()

Read all pixels from the canvas as `ImageData`.

```ts
load() => ImageData
```

```tsx
const draw = (K) => {
  K.background("white");
  K.fillColor("red");
  K.circle(K.width / 2, K.height / 2, 100);

  const imageData = K.Pixels.load();
  // imageData.data is a Uint8ClampedArray of RGBA values
  // imageData.width, imageData.height give dimensions
};
```

### update(pixels)

Write pixel data back to the canvas. Accepts a `Uint8ClampedArray` or a plain `number[]` of RGBA values.

```ts
update(pixels: Uint8ClampedArray | number[]) => void
```

```tsx
const draw = (K) => {
  const imageData = K.Pixels.load();
  const data = imageData.data;

  // Invert all colors
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];       // R
    data[i + 1] = 255 - data[i + 1]; // G
    data[i + 2] = 255 - data[i + 2]; // B
    // data[i + 3] is Alpha — leave unchanged
  }

  K.Pixels.update(data);
};
```

### read(x, y, w?, h?)

Read pixel values at a position. Returns a flat array of `[r, g, b, a, ...]` values (0-255).

```ts
read(x: number, y: number, w?: number, h?: number) => number[]
```

For a single pixel:

```tsx
const [r, g, b, a] = K.Pixels.read(100, 100);
```

For a region:

```tsx
const region = K.Pixels.read(50, 50, 10, 10);
// region.length === 10 * 10 * 4 (400 values)
```

## Examples

### Color picker

```tsx
const draw = (K) => {
  // Draw something colorful
  K.background("#222");
  for (let i = 0; i < 360; i++) {
    K.fillColor(`hsl(${i}, 80%, 60%)`);
    K.rectangle(i * (K.width / 360), 0, K.width / 360 + 1, K.height);
  }

  // Read color under mouse
  const [r, g, b] = K.Pixels.read(Math.floor(mouse.x), Math.floor(mouse.y));

  K.fillColor(`rgb(${r}, ${g}, ${b})`);
  K.circle(mouse.x, mouse.y - 40, 20);
};
```

### Pixel displacement

```tsx
const draw = (K) => {
  K.background("#111");
  K.fillColor("white");
  K.alignText("center", "middle");
  K.textSize(80);
  K.text("PIXELS", K.width / 2, K.height / 2);

  const imageData = K.Pixels.load();
  const data = imageData.data;
  const w = K.width;

  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % w;
    const py = Math.floor(i / 4 / w);
    const shift = Math.sin(py * 0.02 + K.time * 3) * 10;
    const srcIdx = (py * w + ((px + Math.floor(shift)) % w)) * 4;

    data[i] = data[srcIdx] || 0;
    data[i + 1] = data[srcIdx + 1] || 0;
    data[i + 2] = data[srcIdx + 2] || 0;
  }

  K.Pixels.update(data);
};
```

## Notes

- Pixel manipulation is expensive — avoid calling `load()` + `update()` every frame on large canvases if possible
- Consider using `willreadfrequently: true` in canvas options if you read pixels often
- `read()` returns device-pixel coordinates, so multiply by `K.dpr` if needed
- For heavy pixel work, consider using an offscreen canvas via `K.createOffscreen()`
