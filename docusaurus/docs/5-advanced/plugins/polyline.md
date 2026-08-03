---
sidebar_position: 3
---

# Polyline

`Polyline` joins Bézier segments into an open or closed path and exposes path-wide sampling, measurement, projection, splitting, offsets, smoothing, simplification, intersections, and rendering.

```ts
import {Polyline} from '@shopify/klint/plugins/Polyline';

const path = Polyline.fromPoints([
  {x: 40, y: 180},
  {x: 120, y: 40},
  {x: 240, y: 260},
  {x: 360, y: 120},
]);

const point = path.get(0.5);
const tangent = path.derivative(0.5);
const length = path.length();
```

`fromPoints()` creates straight segments. Use `Polyline.smooth(points, closed?, factor?)` for a smooth path or `Polyline.simplify(points, tolerance?, closed?)` to reduce sampled data.

```ts
const smooth = Polyline.smooth(points, true, 0.4);
const reduced = Polyline.simplify(points, 2.5, false);
```

## Analyze and transform

The normalized parameter `t` runs across the full path, weighted by segment length.

```ts
path.get(t);
path.derivative(t);
path.normal(t);
path.curvature(t);
path.getLUT(100);
path.bbox();
path.project({x, y});
path.knots();

const {left, right} = path.split(0.5);
const section = path.slice(0.2, 0.8);
const offset = path.offset(12);
const outline = path.outline(8);
const reversed = path.reverse();
const joined = path.concat(otherPath);
const hits = path.intersects(otherPath);
```

## Render

```ts
const canvasPath = path.toPath2D();
const svgPath = path.toSVG();
K.stroke(canvasPath);
```

Bind a Klint context at construction time to use drawing helpers without passing `K` each time:

```ts
const path = Polyline.smooth(points, false, 0.4, K);
path.draw();
path.drawSkeleton(3);
path.drawNormals(20, 12);
path.drawOutline(10);
path.drawPoints(50, 2);
```

Otherwise call `path.draw(K)`. For the combined export, use `import {Polyline} from '@shopify/klint/plugins'`.
