# transform

```ts
K.transform(a: number, b: number, c: number, d: number, e: number, f: number): void
```

Multiplies the current transform by a 2D affine matrix. This is the native Canvas 2D method.

```text
[a  c  e]
[b  d  f]
[0  0  1]
```

```tsx
// Translate by (100, 50)
K.transform(1, 0, 0, 1, 100, 50);

// Uniform 2× scale
K.transform(2, 0, 0, 2, 0, 0);

// Rotate 45 degrees
const angle = Math.PI / 4;
K.transform(
  Math.cos(angle),
  Math.sin(angle),
  -Math.sin(angle),
  Math.cos(angle),
  0,
  0,
);
```

Transforms accumulate. Use `K.push()` and `K.pop()` to isolate custom matrices.

To replace rather than multiply the current transform, use native `K.setTransform()`. Remember that Klint's base transform includes DPR and possibly a centered origin, so replacing it directly also replaces those conventions. Prefer `push()`/`pop()` for normal sketch transforms.
