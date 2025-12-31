# strip

The `Strip` element creates strips of triangles, quads, or hulls from arrays of points. Access it via `K.Strip` on the Klint context.

## Methods

### triangles

```ts
K.Strip.triangles(
  points: Array<{ x: number; y: number }>,
  draw?: (triangle: StripTriangle) => string | void
) => void
```

Creates a strip of triangles from points connected in a zigzag pattern.

```tsx
const draw = (K: KlintContext) => {
  K.background("#222");
  
  // Create wave of points
  const points = [];
  for (let i = 0; i < 20; i++) {
    points.push({
      x: 50 + i * 30,
      y: 200 + Math.sin(i * 0.5) * 50
    });
  }
  
  // Draw triangle strip with custom colors
  K.Strip.triangles(points, (triangle) => {
    // Return color string to set fill for this triangle
    return `hsl(${triangle.id * 20}, 70%, 60%)`;
  });
}
```

### quads

```ts
K.Strip.quads(
  points: Array<{ x: number; y: number }>,
  draw?: (quad: StripQuad) => string | void
) => void
```

Creates a strip of quads from points connected in a grid pattern.

```tsx
const draw = (K: KlintContext) => {
  K.background("white");
  
  // Create grid of points
  const points = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      points.push({
        x: 100 + x * 40,
        y: 100 + y * 40 + Math.sin(x + y) * 20
      });
    }
  }
  
  // Draw quad strip
  K.Strip.quads(points, (quad) => {
    // Custom drawing per quad
    K.strokeColor("rgba(0,0,0,0.2)");
    K.strokeWidth(1);
    return `hsl(${quad.id * 5}, 50%, 70%)`;
  });
}
```

### hull

```ts
K.Strip.hull(
  points: Array<{ x: number; y: number }>,
  draw?: (hull: StripHull) => void
) => void
```

Creates a single hull shape from points following a winding order.

```tsx
const draw = (K: KlintContext) => {
  K.background("#f0f0f0");
  
  // Create points around a shape
  const points = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    points.push({
      x: K.width/2 + Math.cos(angle) * 100,
      y: K.height/2 + Math.sin(angle) * 100
    });
  }
  
  // Draw hull
  K.fillColor("rgba(100, 150, 255, 0.5)");
  K.strokeColor("blue");
  K.strokeWidth(2);
  K.Strip.hull(points);
}
```

## Example: Animated Terrain

```tsx
const draw = (K: KlintContext) => {
  K.background("#87CEEB"); // Sky blue
  
  // Generate terrain points
  const terrainPoints = [];
  for (let x = 0; x <= K.width; x += 20) {
    terrainPoints.push({
      x: x,
      y: K.height/2 + Math.sin(x * 0.01 + K.time) * 30 + 
         Math.sin(x * 0.03) * 20
    });
  }
  
  // Draw terrain as triangle strip
  K.Strip.triangles(terrainPoints, (triangle) => {
    // Color based on height
    const avgY = triangle.points.reduce((sum, p) => sum + p.y, 0) / 3;
    const heightRatio = avgY / K.height;
    return `hsl(${120 + heightRatio * 60}, 70%, ${40 + heightRatio * 20}%)`;
  });
}
```

## Notes

- Triangle strips require even number of points for complete triangles
- Quad strips connect points in a grid pattern
- Hull creates a single closed shape from all points
- The `draw` callback can return a color string to set fill color
- Points are connected automatically - you don't need to define edges
- Efficient for rendering surfaces, terrains, and meshes
- Use with `push()`/`pop()` to isolate transformations

