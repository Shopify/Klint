# Grid

The Grid element generates arrays of points in various spatial arrangements — rectangular, radial, hexagonal, and triangular.

## Access

```tsx
const draw = (K) => {
  const points = K.Grid.rect(0, 0, K.width, K.height, 10, 10);
};
```

## Methods

### rect(x, y, width, height, countX, countY, options?)

Creates a rectangular grid of evenly spaced points.

```ts
rect(x: number, y: number, width: number, height: number, countX: number, countY: number, options?: {
  origin?: 'corner' | 'center'  // default: 'corner'
}) => GridPoint[]
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.fillColor("white");
  K.noStroke();

  const grid = K.Grid.rect(50, 50, K.width - 100, K.height - 100, 12, 8);
  for (const point of grid) {
    K.circle(point.x, point.y, 3);
  }
};
```

### radial(x, y, radius, count, ringCount, ringSpace, options?)

Creates concentric rings of points around a center.

```ts
radial(x: number, y: number, radius: number, count: number, ringCount: number, ringSpace: number, options?: {
  perStepCount?: number  // extra points added per ring (default: 0)
}) => GridPoint[]
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.fillColor("white");

  const grid = K.Grid.radial(K.width / 2, K.height / 2, 200, 8, 5, 40);
  for (const point of grid) {
    K.circle(point.x, point.y, 3);
  }
};
```

With `perStepCount`, outer rings get progressively more points:

```tsx
const grid = K.Grid.radial(K.width / 2, K.height / 2, 200, 6, 5, 40, {
  perStepCount: 3
});
```

### hex(x, y, width, height, size, options?)

Creates a hexagonal grid pattern.

```ts
hex(x: number, y: number, width: number, height: number, size: number, options?: {
  origin?: 'corner' | 'center',  // default: 'corner'
  pointy?: boolean                // default: true (pointy-topped)
}) => GridPoint[]
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.noFill();
  K.strokeColor("white");

  const grid = K.Grid.hex(50, 50, K.width - 100, K.height - 100, 20);
  for (const point of grid) {
    K.circle(point.x, point.y, 18);
  }
};
```

Flat-topped hexagons:

```tsx
const grid = K.Grid.hex(50, 50, 400, 300, 20, { pointy: false });
```

### triangle(x, y, width, height, size, options?)

Creates a triangular grid pattern.

```ts
triangle(x: number, y: number, width: number, height: number, size: number, options?: {
  origin?: 'corner' | 'center'  // default: 'corner'
}) => GridPoint[]
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.fillColor("white");

  const grid = K.Grid.triangle(50, 50, K.width - 100, K.height - 100, 30);
  for (const point of grid) {
    K.circle(point.x, point.y, 2);
  }
};
```

## GridPoint

Every method returns an array of `GridPoint` objects:

| Property | Type | Description |
|----------|------|-------------|
| `x` | number | X position |
| `y` | number | Y position |
| `i` | number | Column index |
| `j` | number | Row index (or ring index for radial) |
| `id` | number | Unique identifier |

## Examples

### Animated grid

```tsx
const draw = (K) => {
  K.background("#111");
  K.noStroke();

  const grid = K.Grid.rect(50, 50, K.width - 100, K.height - 100, 20, 15);

  for (const point of grid) {
    const d = K.distance(point.x, point.y, K.width / 2, K.height / 2);
    const wave = Math.sin(d * 0.02 - K.time * 3) * 0.5 + 0.5;
    const size = 2 + wave * 8;

    K.fillColor(`hsl(${d * 0.5 + K.time * 50}, 70%, 60%)`);
    K.circle(point.x, point.y, size);
  }
};
```

### Grid with noise displacement

```tsx
const draw = (K) => {
  K.background("#222");
  K.fillColor("white");
  K.noStroke();

  const grid = K.Grid.rect(50, 50, K.width - 100, K.height - 100, 15, 12);

  for (const point of grid) {
    const nx = K.Noise.perlin(point.x * 0.005, point.y * 0.005, K.time);
    const ny = K.Noise.perlin(point.x * 0.005 + 100, point.y * 0.005, K.time);

    K.circle(point.x + nx * 30, point.y + ny * 30, 3);
  }
};
```
