---
sidebar_position: 5
---

# Delaunay

Perform Delaunay triangulation on point sets.

## Basic Triangulation

```tsx
import { Delaunay } from '@shopify/klint/plugins';

const draw = (K) => {
  const points = Array.from({ length: 50 }, () => ({
    x: Math.random() * K.width,
    y: Math.random() * K.height
  }));

  const triangles = Delaunay.triangulate(points);

  Delaunay.drawTriangles(K, triangles, {
    fill: true,
    stroke: true,
    fillStyle: '#ffffff20',
    strokeStyle: '#ffffff'
  });
};
```

## Triangle Utilities

```tsx
const triangles = Delaunay.triangulate(points);

triangles.forEach(triangle => {
  const center = Delaunay.circumcenter(triangle);
  K.circle(center.x, center.y, 5);

  const point = { x: K.mouseX, y: K.mouseY };
  if (Delaunay.inCircumcircle(point, triangle)) {
    // highlight this triangle
  }
});
```

## Example: Voronoi Diagram

```tsx
const draw = (K) => {
  const points = Array.from({ length: 30 }, () => ({
    x: Math.random() * K.width,
    y: Math.random() * K.height
  }));

  const triangles = Delaunay.triangulate(points);

  K.strokeColor('#ffffff40');
  Delaunay.drawTriangles(K, triangles, {
    fill: false,
    stroke: true
  });

  triangles.forEach(tri => {
    const center = Delaunay.circumcenter(tri);
    K.fillColor('#ff006680');
    K.circle(center.x, center.y, 3);
  });

  points.forEach(p => {
    K.fillColor('#fff');
    K.circle(p.x, p.y, 5);
  });
};
```
