---
sidebar_position: 2
---

# Bezier

`Bezier` provides quadratic and cubic Bézier construction, measurement, splitting, offsets, outlines, intersections, arc approximation, and Klint drawing helpers.

```ts
import {Bezier} from '@shopify/klint/plugins/Bezier';

const curve = Bezier.cubic(
  {x: 40, y: 200},
  {x: 120, y: 20},
  {x: 280, y: 380},
  {x: 360, y: 200},
);

const midpoint = curve.get(0.5);
const tangent = curve.derivative(0.5);
const bounds = curve.bbox();
const length = curve.length();
```

The constructor also accepts point or numeric coordinate arrays:

```ts
new Bezier([p0, control, p1]);
new Bezier([x0, y0, cx, cy, x1, y1]);
```

## Analyze and transform

```ts
curve.get(t);
curve.derivative(t);
curve.dderivative(t);
curve.normal(t);
curve.curvature(t);
curve.inflections();
curve.extrema();
curve.project({x, y});

const {left, right} = curve.split(0.5);
const section = curve.split(0.2, 0.8);
const simpleSegments = curve.reduce();
const parallelCurves = curve.offset(20);
const outline = curve.outline(10);
const hits = curve.intersects(otherCurve);
const arcs = curve.arcs(0.5);
```

`offset(t, distance)` returns one offset point; `offset(distance)` returns offset curve segments.

## Render

Convert the curve without binding it to a Klint context:

```ts
const path = curve.toPath2D();
const d = curve.toSVG();

K.stroke(path);
```

Or provide a context to the constructor/static factory and use drawing helpers:

```ts
const curve = Bezier.cubic(p0, c1, c2, p1, K);
curve.draw();
curve.drawSkeleton(4);
curve.drawNormals(20, 15);
curve.drawOutline(12);
curve.drawArcs(0.5);
```

Without a bound context, pass `K` to the draw method: `curve.draw(K)`.

For the combined export, use `import {Bezier} from '@shopify/klint/plugins'`.
