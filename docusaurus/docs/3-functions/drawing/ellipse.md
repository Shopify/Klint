# ellipse

Klint draws an ellipse through the fourth argument of `circle()`:

```ts
K.circle(
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
): void
```

The two size values are radii, not full width and height.

```tsx
K.fillColor('purple');
K.strokeColor('orange');
K.strokeWidth(3);
K.circle(200, 200, 100, 50);
```

For a rotated or partial ellipse, use the native Canvas 2D path API and then fill/stroke it:

```tsx
K.beginPath();
K.ellipse(
  200,
  200,
  100,
  50,
  Math.PI / 4, // rotation
  0,
  Math.PI * 2,
);
K.fill();
K.stroke();
```

`K.ellipse()` itself is the native Canvas method. It requires rotation, start angle, and end angle, and only adds to the current path; it is not Klint's four-argument drawing helper.
