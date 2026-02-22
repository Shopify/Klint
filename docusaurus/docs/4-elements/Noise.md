# Noise

The Noise element provides seedable noise generation — Perlin (1-4D), Simplex (1-4D), Hash (1-4D), and Gaussian random.

## Access

```tsx
const draw = (K) => {
  const value = K.Noise.perlin(x * 0.01, y * 0.01);
};
```

## Methods

### seed(s?)

Set the seed for reproducible noise. Called without arguments, it generates a random seed.

```ts
seed(s?: number) => void
```

```tsx
const setup = (K) => {
  K.Noise.seed(42);
};
```

### perlin(x, y?, z?, w?)

Classic improved Perlin noise. Returns values roughly in the range [-1, 1]. Supports 1D through 4D.

```ts
perlin(x: number) => number
perlin(x: number, y: number) => number
perlin(x: number, y: number, z: number) => number
perlin(x: number, y: number, z: number, w: number) => number
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.strokeColor("white");
  K.noFill();

  K.beginShape();
  for (let x = 0; x < K.width; x += 2) {
    const y = K.height / 2 + K.Noise.perlin(x * 0.005, K.time) * 150;
    K.vertex(x, y);
  }
  K.endShape();
};
```

### simplex(x, y?, z?, w?)

Simplex noise. Faster gradients, fewer directional artifacts than Perlin. Same return range and overloads.

```ts
simplex(x: number) => number
simplex(x: number, y: number) => number
simplex(x: number, y: number, z: number) => number
simplex(x: number, y: number, z: number, w: number) => number
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.noStroke();

  const grid = K.Grid.rect(0, 0, K.width, K.height, 40, 30);
  for (const pt of grid) {
    const n = K.Noise.simplex(pt.x * 0.008, pt.y * 0.008, K.time);
    const size = 2 + (n * 0.5 + 0.5) * 10;
    K.fillColor(`hsl(${n * 180 + 200}, 70%, 60%)`);
    K.circle(pt.x, pt.y, size);
  }
};
```

### hash(x, y?, z?, w?)

Fast pseudo-random hash. Returns values in [0, 1]. Deterministic for the same inputs + seed.

```ts
hash(x: number) => number
hash(x: number, y: number) => number
hash(x: number, y: number, z: number) => number
hash(x: number, y: number, z: number, w: number) => number
```

```tsx
const setup = (K) => {
  K.Noise.seed(123);
};

const draw = (K) => {
  K.background("#222");
  K.noStroke();

  for (let i = 0; i < 200; i++) {
    const x = K.Noise.hash(i, 0) * K.width;
    const y = K.Noise.hash(i, 1) * K.height;
    const r = K.Noise.hash(i, 2) * 10 + 2;
    K.fillColor(`hsl(${K.Noise.hash(i, 3) * 360}, 70%, 60%)`);
    K.circle(x, y, r);
  }
};
```

### gaussianRandom(mean?, stddev?)

Returns a normally-distributed random number using the Box-Muller transform. Seeded via `seed()`.

```ts
gaussianRandom(mean?: number, stddev?: number) => number  // defaults: mean=0, stddev=1
```

```tsx
const draw = (K) => {
  K.background("rgba(0, 0, 0, 0.05)");
  K.fillColor("rgba(255, 255, 255, 0.3)");
  K.noStroke();

  for (let i = 0; i < 10; i++) {
    const x = K.width / 2 + K.Noise.gaussianRandom(0, 80);
    const y = K.height / 2 + K.Noise.gaussianRandom(0, 80);
    K.circle(x, y, 2);
  }
};
```

## Perlin vs Simplex vs Hash

| | Perlin | Simplex | Hash |
|---|---|---|---|
| **Range** | ~[-1, 1] | ~[-1, 1] | [0, 1] |
| **Smooth** | Yes | Yes | No (discrete) |
| **Speed** | Fast | Faster (higher D) | Fastest |
| **Artifacts** | Some directional | Fewer | None (random) |
| **Use for** | Terrain, flow fields, organic motion | Same, better at 3D+ | Scattering, static randomness |

## Notes

- Always scale your input coordinates (`x * 0.01`) — feeding raw pixel positions produces very high-frequency noise
- Use the Z or W dimension with `K.time` for animated noise
- `seed()` affects all noise types including `gaussianRandom`
- Hash is deterministic — same inputs always produce the same output for a given seed
