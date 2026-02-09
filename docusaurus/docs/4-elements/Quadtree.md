# Quadtree

Spatial partitioning for efficient neighbor lookups and range queries. Useful for particle simulations, flocking/boids, collision broadphase, and any scenario with many spatial objects.

## Access

```tsx
const draw = (K: KlintContext) => {
  // Create from corner-based bounds (top-left + size)
  const qt = K.Quadtree.create(0, 0, K.width, K.height);
  
  particles.forEach(p => qt.insert(p));
  const nearby = qt.queryRadius(mouseX, mouseY, 100);
};
```

## Creating a Quadtree

### Quadtree.create(x, y, width, height, options?)

```ts
Quadtree.create<T>(
  x: number, 
  y: number, 
  width: number, 
  height: number,
  options?: { capacity?: number; maxDepth?: number }
) => Quadtree<T>
```

Creates a quadtree from corner-based bounds (top-left + size). Internally uses center-based representation for efficient math.

- `capacity` — Max points per node before splitting (default 4)
- `maxDepth` — Max tree depth to prevent infinite subdivision (default 8)

```tsx
const qt = K.Quadtree.create(0, 0, K.width, K.height);

// Custom capacity
const qt = K.Quadtree.create(0, 0, K.width, K.height, {
  capacity: 8,
  maxDepth: 6,
});
```

## Rectangle

Center-based rectangular bounds used for queries.

```ts
new Rectangle(x: number, y: number, w: number, h: number)
```

- `x, y` — Center position
- `w, h` — Half-extents (half-width, half-height)

```tsx
import { Rectangle } from '@shopify/klint';

// A 200x200 region centered at (100, 100), covering (0,0) to (200,200)
const range = new Rectangle(100, 100, 100, 100);
```

## Inserting Points

### insert(point)

```ts
insert(point: { x: number; y: number; [key: string]: any }) => boolean
```

Returns `true` if the point was within bounds and inserted.

```tsx
qt.insert({ x: 100, y: 200 });
qt.insert({ x: 50, y: 75, color: 'red', radius: 10 }); // extra data preserved
```

## Querying

### query(range)

```ts
query(range: Rectangle) => T[]
```

Find all points within a rectangular region.

```tsx
const found = qt.query(new Rectangle(150, 150, 100, 100));
found.forEach(p => K.circle(p.x, p.y, 3));
```

### queryRadius(cx, cy, radius)

```ts
queryRadius(cx: number, cy: number, radius: number) => T[]
```

Find all points within a circle. Uses proper circle-rectangle intersection for efficient pruning.

```tsx
const nearby = qt.queryRadius(mouse.x, mouse.y, 80);
nearby.forEach(p => {
  K.line(mouse.x, mouse.y, p.x, p.y);
});
```

## Utilities

### size

```ts
readonly size: number
```

Total number of points in the tree.

### clear()

```ts
clear() => void
```

Remove all points and reset the tree structure.

## Examples

### Particle Neighbors

```tsx
const particles = Array.from({ length: 500 }, () => ({
  x: Math.random() * K.width,
  y: Math.random() * K.height,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
}));

const draw = (K: KlintContext) => {
  K.background('#111');
  
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > K.width) p.vx *= -1;
    if (p.y < 0 || p.y > K.height) p.vy *= -1;
  });
  
  const qt = K.Quadtree.create(0, 0, K.width, K.height);
  particles.forEach(p => qt.insert(p));
  
  K.strokeColor('#ffffff30');
  particles.forEach(p => {
    const neighbors = qt.queryRadius(p.x, p.y, 50);
    neighbors.forEach(n => {
      if (n !== p) K.line(p.x, p.y, n.x, n.y);
    });
  });
  
  K.fillColor('#fff');
  particles.forEach(p => K.circle(p.x, p.y, 2));
};
```

## Performance Notes

- Rebuild the quadtree each frame for moving objects — `create` + insert loop is fast.
- `queryRadius` is much faster than checking all points when the search radius is small relative to the total area.
- For static objects, build once in `setup` and reuse.
- `capacity` of 4-8 works well for most cases.
