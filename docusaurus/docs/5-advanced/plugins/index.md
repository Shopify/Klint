---
sidebar_position: 1
id: plugins-overview
title: Plugins
slug: /plugins
---

# Plugins

Klint's plugin system extends the core library with specialized functionality for common creative coding tasks. Plugins are imported from `@shopify/klint/plugins`.

## Installation

Plugins are included in the main Klint package:

```bash
npm install @shopify/klint
```

Import plugins as needed:

```tsx
import {
  Bezier,
  Polyline,
  FontParser,
  Sprites,
  CatmullRom,
  Delaunay,
  Projector,
} from '@shopify/klint/plugins';
```

## Available Plugins

| Plugin | Description | Docs |
|--------|-------------|------|
| **Bezier** | Construct, analyze, offset, intersect, and render quadratic/cubic curves | [Bezier](/docs/advanced/plugins/bezier) |
| **Polyline** | Build, smooth, simplify, analyze, and render multi-segment paths | [Polyline](/docs/advanced/plugins/polyline) |
| **FontParser** | Load TTF, OTF, WOFF, and WOFF2 fonts; convert text to vector paths or point arrays | [FontParser](/docs/advanced/plugins/font-parser) |
| **Sprites** | Sprite sheet loading, frame drawing, and animation | [Sprites](/docs/advanced/plugins/sprites) |
| **CatmullRom** | Smooth curve interpolation through control points | [CatmullRom](/docs/advanced/plugins/catmull-rom) |
| **Delaunay** | Delaunay triangulation, earcut polygon triangulation with holes, Voronoi | [Delaunay](/docs/advanced/plugins/delaunay) |
| **Projector** | 3D to 2D projection for pseudo-3D canvas drawing | [Projector](/docs/advanced/plugins/projector) |

## Creating Your Own

Plugins are static utility classes that manage their own state and accept `KlintContext` only for drawing. See [Creating Custom Plugins](/docs/advanced/plugins/custom-plugins) for the architecture guide and templates.

## Type Imports

```tsx
import type {
  BezierPoint,
  BBox,
  FontPathsResult,
  FontPointsResult,
  FontTextOptions,
  Triangle,
  SpriteConfig,
  Spritesheet,
  Point3D,
  ProjectedPoint,
  Transform3D,
} from '@shopify/klint/plugins';
```

## Best Practices

- **Load assets during initialization** — fonts and sprites belong in `useEffect` or `preload`, not in `draw`
- **Cache results** — pre-compute expensive operations outside the draw loop
- **Clean up on unmount** — call `.clear()` or `.destroy()` in your cleanup function

```tsx
useEffect(() => {
  return () => {
    Sprites.clear();
  };
}, []);
```
