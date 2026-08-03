# resetTransform

```ts
K.resetTransform(): void
```

`resetTransform()` is the native Canvas 2D method. It resets to the backing-store identity matrix, which also removes Klint's DPR scale and centered-origin translation. It is therefore rarely the right reset operation inside a Klint sketch.

Prefer `push()`/`pop()` for temporary transforms:

```tsx
K.push();
K.translate(100, 100);
K.rotate(Math.PI / 4);
K.scale(2, 2);
K.circle(0, 0, 20);
K.pop();
```

Use `K.reset()` when you intentionally want to clear the canvas and restore Klint's logical-pixel base transform.

```tsx
K.reset();
// Drawing coordinates are logical pixels again and the configured origin is restored.
```

If you call `resetTransform()` for a raw backing-store operation, isolate and restore it:

```tsx
K.push();
K.resetTransform();
// Work in physical backing-store pixels here.
K.pop();
```
