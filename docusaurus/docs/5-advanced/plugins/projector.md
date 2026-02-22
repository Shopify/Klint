---
sidebar_position: 7
---

# Projector

3D-to-2D projection for pseudo-3D canvas drawing. Uses `DOMMatrix` for transforms and custom perspective division for depth foreshortening.

## Setup

```tsx
import { Projector } from '@shopify/klint/plugins';

const projector = new Projector({
  perspective: 2,  // 0 = orthographic, higher = stronger foreshortening
  radius: 200      // output scale — how far from center projected points spread
});
```

## Interfaces

### Point3D

```tsx
interface Point3D {
  x: number;
  y: number;
  z: number;
}
```

### ProjectedPoint

```tsx
interface ProjectedPoint {
  x: number;  // screen X (centered at 0,0)
  y: number;  // screen Y
  z: number;  // transformed depth (use for sorting)
  scale: number; // perspective foreshortening factor (use for sizing)
}
```

### Transform3D

Available inside the transform callback:

```tsx
interface Transform3D {
  rotateX(radians: number): void;
  rotateY(radians: number): void;
  rotateZ(radians: number): void;
  translate(x: number, y: number, z: number): void;
  scale(x: number, y?: number, z?: number): void;
}
```

## project()

Project a single 3D point:

```tsx
const p = projector.project(
  { x: 1, y: 0, z: -1 },
  (t) => {
    t.rotateX(K.time * 0.5);
    t.rotateY(K.time * 0.3);
  }
);

K.circle(K.width / 2 + p.x, K.height / 2 + p.y, 10 * p.scale);
```

## projectAll()

Project an array of points with the same transform (matrix built once):

```tsx
const cubeVertices = [
  { x: -1, y: -1, z: -1 },
  { x:  1, y: -1, z: -1 },
  { x:  1, y:  1, z: -1 },
  { x: -1, y:  1, z: -1 },
  { x: -1, y: -1, z:  1 },
  { x:  1, y: -1, z:  1 },
  { x:  1, y:  1, z:  1 },
  { x: -1, y:  1, z:  1 },
];

const projected = projector.projectAll(cubeVertices, (t) => {
  t.rotateX(K.time);
  t.rotateY(K.time * 0.7);
});

projected.forEach(p => {
  K.fillColor('#fff');
  K.circle(K.width / 2 + p.x, K.height / 2 + p.y, 6 * p.scale);
});
```

## projectSorted()

Project and depth-sort points back-to-front. Each result includes `index` — the original position in the input array:

```tsx
const colors = ['#ff0000', '#00ff00', '#0000ff', /* ... */];

const sorted = projector.projectSorted(points, (t) => {
  t.rotateX(K.time);
});

sorted.forEach(p => {
  K.fillColor(colors[p.index]);
  K.circle(K.width / 2 + p.x, K.height / 2 + p.y, 10 * p.scale);
});
```

## Example: Rotating Cube

```tsx
function CubeSketch() {
  const projector = useMemo(() => new Projector({ perspective: 2, radius: 150 }), []);

  const vertices = [
    { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
    { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
    { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 },
  ];

  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
  ];

  const draw = (K) => {
    K.background('#000');

    const projected = projector.projectAll(vertices, (t) => {
      t.rotateX(K.time * 0.5);
      t.rotateY(K.time * 0.3);
    });

    const cx = K.width / 2;
    const cy = K.height / 2;

    K.strokeColor('#fff');
    edges.forEach(([a, b]) => {
      K.line(
        cx + projected[a].x, cy + projected[a].y,
        cx + projected[b].x, cy + projected[b].y
      );
    });

    projected.forEach(p => {
      K.fillColor('#00ff88');
      K.circle(cx + p.x, cy + p.y, 5 * p.scale);
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint draw={draw} />
    </div>
  );
}
```
