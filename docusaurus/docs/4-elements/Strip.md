# Strip

The Strip element creates strips of triangles, quads, or hulls from an array of point pairs. Points are expected in pairs — alternating "top" and "bottom" positions that form a ribbon-like structure.

## Access

```tsx
const draw = (K) => {
  K.Strip.triangles(points, (triangle) => {
    return `hsl(${triangle.id * 30}, 70%, 50%)`;
  });
};
```

## Point Layout

Strip methods expect points in paired order:

```
0 - 2 - 4 - 6 ...   (even indices = top edge)
|   |   |   |
1 - 3 - 5 - 7 ...   (odd indices = bottom edge)
```

A typical way to build these points:

```tsx
const points = [];
for (let i = 0; i < 20; i++) {
  const x = 50 + i * 30;
  points.push({ x, y: 200 + Math.sin(i * 0.3) * 30 });  // top
  points.push({ x, y: 350 + Math.cos(i * 0.3) * 30 });  // bottom
}
```

## Methods

### triangles(points, draw?)

Tessellates the point pairs into triangles and draws them. The optional callback receives each triangle and can return a fill color string.

```ts
triangles(points: Array<{ x: number; y: number }>, draw?: (triangle: StripTriangle) => string | void) => void
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.noStroke();

  const points = [];
  for (let i = 0; i < 20; i++) {
    const x = 50 + i * 35;
    points.push({ x, y: 150 + Math.sin(i * 0.4 + K.time) * 40 });
    points.push({ x, y: 350 + Math.cos(i * 0.4 + K.time) * 40 });
  }

  K.Strip.triangles(points, (tri) => {
    return `hsl(${tri.id * 15 + K.time * 30}, 70%, 55%)`;
  });
};
```

The `StripTriangle` object:

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Triangle index |
| `center` | `{ x, y }` | Centroid of the triangle |
| `points` | `[p1, p2, p3]` | The three vertices |

### quads(points, draw?)

Connects point pairs into quadrilaterals. Each quad uses two consecutive pairs of points.

```ts
quads(points: Array<{ x: number; y: number }>, draw?: (quad: StripQuad) => string | void) => void
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.noStroke();

  const points = [];
  for (let i = 0; i < 20; i++) {
    const x = 50 + i * 35;
    const wave = Math.sin(i * 0.3 + K.time * 2) * 50;
    points.push({ x, y: 200 + wave });
    points.push({ x, y: 350 - wave });
  }

  K.Strip.quads(points, (quad) => {
    return `hsl(${quad.id * 20}, 80%, 50%)`;
  });
};
```

The `StripQuad` object:

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Quad index |
| `center` | `{ x, y }` | Center of the quad |
| `points` | `[p1, p2, p3, p4]` | The four vertices |

### hull(points, draw?)

Connects all points into a single closed shape following the winding order: top edge forward, then bottom edge backward.

```ts
hull(points: Array<{ x: number; y: number }>, draw?: (hull: StripHull) => void) => void
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.fillColor("rgba(100, 200, 255, 0.5)");
  K.strokeColor("white");
  K.strokeWidth(2);

  const points = [];
  for (let i = 0; i < 20; i++) {
    const x = 50 + i * 35;
    points.push({ x, y: 180 + Math.sin(i * 0.5 + K.time) * 40 });
    points.push({ x, y: 380 + Math.cos(i * 0.5 + K.time) * 40 });
  }

  K.Strip.hull(points, (hull) => {
    K.fillColor("red");
    K.circle(hull.center.x, hull.center.y, 3);
  });
};
```

### ribbon(points, width, draw?)

Creates a ribbon/tape shape from a line of center points, with configurable width. The offset is computed from perpendicular normals at each point.

```ts
ribbon(points: Array<{ x: number; y: number }>, width: number, draw?: (segment: { id: number; center: { x: number; y: number } }) => string | void) => void
```

```tsx
const draw = (K) => {
  K.background("#222");
  K.fillColor("rgba(255, 100, 150, 0.8)");
  K.noStroke();

  const centerPoints = [];
  for (let i = 0; i < 30; i++) {
    centerPoints.push({
      x: 50 + i * 25,
      y: K.height / 2 + Math.sin(i * 0.3 + K.time * 2) * 80
    });
  }

  K.Strip.ribbon(centerPoints, 40, (seg) => {
    return `hsl(${seg.id * 10 + K.time * 40}, 70%, 55%)`;
  });
};
```

## Notes

- Strip uses the current fill and stroke settings when no callback color is returned
- The draw callback is optional — without it, strips use the current `fillColor` / `strokeColor`
- Returning a string from the callback overrides the fill color for that triangle/quad/segment
- `hull` and `ribbon` are great for creating flowing, organic shapes from a set of points
- Points should be in the paired layout described above for `triangles`, `quads`, and `hull`
- `ribbon` takes a single line of center points (not pairs) and computes the width from normals
