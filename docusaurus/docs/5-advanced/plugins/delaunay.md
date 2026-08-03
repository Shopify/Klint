---
sidebar_position: 5
---

# Delaunay

Delaunay triangulation and earcut polygon triangulation with holes support.

```tsx
import { Delaunay } from '@shopify/klint/plugins';
```

## Point Cloud Triangulation (Bowyer-Watson)

Compute a Delaunay triangulation from a set of points.

```tsx
const draw = (K) => {
  const points = Array.from({ length: 50 }, () => ({
    x: Math.random() * K.width,
    y: Math.random() * K.height,
  }));

  const triangles = Delaunay.triangulate(points);

  Delaunay.drawTriangles(K, triangles, {
    fill: true,
    stroke: true,
    fillStyle: '#ffffff20',
    strokeStyle: '#ffffff',
  });
};
```

Every triangle in the result satisfies the Delaunay condition: no point lies inside any triangle's circumcircle.

## Polygon Triangulation with Holes (Earcut)

Triangulate a polygon contour with optional holes punched through it.

### High-level API

```tsx
const outer = [
  { x: 0, y: 0 },
  { x: 400, y: 0 },
  { x: 400, y: 400 },
  { x: 0, y: 400 },
];

const hole = [
  { x: 100, y: 100 },
  { x: 300, y: 100 },
  { x: 300, y: 300 },
  { x: 100, y: 300 },
];

const triangles = Delaunay.triangulatePolygon(outer, [hole]);
Delaunay.drawTriangles(K, triangles);
```

### One-liner: triangulate + draw

```tsx
const triangles = Delaunay.drawPolygon(K, outer, [hole], {
  fillStyle: '#ff006640',
  strokeStyle: '#ffffff80',
});
```

### Low-level earcut API

For maximum control, use the flat-array interface directly. The `earcut` method takes a flat coordinate array and returns vertex indices (every 3 consecutive indices form a triangle).

```tsx
// Convert {x,y} arrays to flat format
const { vertices, holes } = Delaunay.flatten([outer, hole1, hole2]);

// Returns index array: [i0, i1, i2, i3, i4, i5, ...]
const indices = Delaunay.earcut(vertices, holes);

// Use indices to draw or process triangles
for (let i = 0; i < indices.length; i += 3) {
  const ax = vertices[indices[i] * 2];
  const ay = vertices[indices[i] * 2 + 1];
  const bx = vertices[indices[i + 1] * 2];
  const by = vertices[indices[i + 1] * 2 + 1];
  const cx = vertices[indices[i + 2] * 2];
  const cy = vertices[indices[i + 2] * 2 + 1];
  // draw triangle (ax,ay) (bx,by) (cx,cy)
}
```

### Checking triangulation quality

```tsx
const { vertices, holes } = Delaunay.flatten([outer, hole]);
const indices = Delaunay.earcut(vertices, holes);
const deviation = Delaunay.deviation(vertices, holes, 2, indices);
// 0 = perfect coverage, > 0 = triangles don't perfectly tile the polygon
```

## Voronoi Diagram

Generate Voronoi edges from a Delaunay triangulation. Each edge connects circumcenters of adjacent triangles.

```tsx
const triangles = Delaunay.triangulate(points);
const edges = Delaunay.voronoi(triangles);

K.strokeColor('#4ecdc4');
for (const e of edges) {
  K.line(e.x1, e.y1, e.x2, e.y2);
}
```

## Triangle Utilities

```tsx
const triangles = Delaunay.triangulate(points);

for (const tri of triangles) {
  // Circumcenter — equidistant from all 3 vertices
  const center = Delaunay.circumcenter(tri);
  K.circle(center.x, center.y, 3);

  // Point-in-circumcircle test
  if (Delaunay.inCircumcircle({ x: mouse.x, y: mouse.y }, tri)) {
    // highlight this triangle
  }
}
```

## API Reference

### Earcut (polygon triangulation)

| Method | Signature | Description |
|--------|-----------|-------------|
| `earcut` | `(vertices: number[], holes?: number[], dim?: number) => number[]` | Low-level earcut. Flat coords in, index array out |
| `flatten` | `(rings: Point[][]) => { vertices, holes, dimensions }` | Convert `{x,y}` arrays to flat earcut format |
| `deviation` | `(data, holes, dim, triangles) => number` | Triangulation quality (0 = perfect) |
| `triangulatePolygon` | `(outer: Point[], holes?: Point[][]) => Triangle[]` | High-level polygon triangulation |
| `drawPolygon` | `(ctx, outer, holes?, options?) => Triangle[]` | Triangulate and draw in one call |

### Delaunay (point cloud)

| Method | Signature | Description |
|--------|-----------|-------------|
| `triangulate` | `(points: Point[]) => Triangle[]` | Bowyer-Watson Delaunay triangulation |
| `drawTriangles` | `(ctx, triangles, options?) => void` | Render triangle array |
| `circumcenter` | `(triangle: Triangle) => Point` | Circumcenter of a triangle |
| `inCircumcircle` | `(point, triangle) => boolean` | Point-in-circumcircle test |
| `voronoi` | `(triangles: Triangle[]) => Edge[]` | Voronoi edges from Delaunay triangles |

### Draw options

```tsx
{
  fill?: boolean;       // default: true
  stroke?: boolean;     // default: true
  fillStyle?: string;   // override fill color
  strokeStyle?: string; // override stroke color
}
```

### Types

```tsx
import type { Triangle } from '@shopify/klint/plugins';

interface Triangle {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}
```
