# scale

```ts
K.scale(x: number, y: number): void
```

Scales the current coordinate system. This is the native Canvas 2D method, so both arguments are required.

```tsx
K.push();
K.scale(2, 2); // uniform 2× scale
K.circle(50, 50, 20);
K.pop();
```

For uniform animated scaling, compute once and pass the value twice:

```tsx
const amount = 1 + Math.sin(K.time * 2) * 0.25;
K.push();
K.translate(K.width / 2, K.height / 2);
K.scale(amount, amount);
K.circle(0, 0, 40);
K.pop();
```

Use different values for non-uniform scaling:

```ts
K.scale(2, 0.5);
```

Scaling accumulates with the current transform. Use `K.push()`/`K.pop()` to isolate it. Negative values mirror the coordinate system.
