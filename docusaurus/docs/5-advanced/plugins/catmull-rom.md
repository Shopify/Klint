---
sidebar_position: 4
---

# CatmullRom

Create smooth curves through control points using Catmull-Rom spline interpolation.

## Basic Interpolation

```tsx
import { CatmullRom } from '@shopify/klint/plugins';

const draw = (K) => {
  const points = [
    { x: 100, y: 100 },
    { x: 200, y: 50 },
    { x: 300, y: 150 },
    { x: 400, y: 100 }
  ];

  CatmullRom.draw(K, points, {
    tension: 0.5,      // 0 = straight, 1 = loose
    segments: 20,      // points per segment
    closed: false,
    strokeStyle: '#fff',
    lineWidth: 2
  });
};
```

## Get Interpolated Points

```tsx
const points = [
  { x: 100, y: 100 },
  { x: 200, y: 200 },
  { x: 300, y: 100 }
];

const smooth = CatmullRom.interpolate(points, 0.5, 20);

smooth.forEach(point => {
  K.circle(point.x, point.y, 3);
});
```

## As Path2D

```tsx
const path = CatmullRom.toPath2D(points, {
  tension: 0.5,
  segments: 20,
  closed: true
});

K.stroke(path);
K.fill(path);
```
