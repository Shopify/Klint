# Changelog

## v0.5.0 (2026-08-01)

### Compatibility and migration
- The React adapter now requires React and React DOM 18 or 19. Use `@shopify/klint/native` for vanilla JavaScript without React; both React peer dependencies are optional for native-only consumers.
- The published package requires Node.js 18 or newer. Repository development and release automation require Node.js 20.19 or newer.
- Canvas option types now use booleans instead of `"true"`/`"false"` strings. Legacy strings are still normalized at runtime for migration safety.
- Canvas, pointer, offscreen, text, and pixel coordinates are now consistently expressed in logical CSS pixels. Code that previously compensated manually for `devicePixelRatio` should remove that compensation.
- The old `klint-create-editor` and `klint-create-sandbox` executable names are replaced by `klint create-editor`, `klint create-sandbox`, and the direct `create-editor`/`create-sandbox` binaries.

### Added
- **Vanilla JavaScript runtime** — `createKlint()` is available from `@shopify/klint/native` without loading React.
- **Bezier plugin** — full Bézier curve construction, evaluation, splitting, offsets, outlines, intersections, and arc approximation.
- **Polyline plugin** — multi-segment curve paths with smooth and simplify operations.
- **Delaunay expansion** — Bowyer-Watson triangulation, Voronoi generation, and Earcut polygon triangulation with holes.
- Auto-detecting TTF, OTF, WOFF, and WOFF2 parsing from binary signatures, plus format-specific tree-shakeable exports.
- Public deep exports for Bezier, Polyline, FontParser formats, Catmull, Delaunay, Sprites, and Projector.
- Canvas loading/error components, lifecycle callbacks, canvas attributes, grouped `options`, `ResizeObserver` sizing, and focused keyboard input. Flattened canvas options remain supported.
- Root/package MIT licenses and third-party notices.

### Changed
- The React adapter keeps one canvas/context across prop rerenders, updates callbacks through refs, and pauses timing while hidden or paused.
- Font decoders now live directly in TypeScript under the FontParser plugin. The universal `FontParser.loadFromBuffer()` is asynchronous and lazy-loads the detected decoder; TTF/OTF deep imports retain synchronous parsing.
- Internal context, function, runtime, type, and native modules are consolidated under `src/core` without changing the public root or `@shopify/klint/native` imports.
- Tests now import production code and include React lifecycle, input, DPR, native-adapter, timeline, path, offscreen, all four real font formats, and packed-artifact coverage.
- Release builds are minified and code-split, with ESM/CommonJS/type exports checked in CI.

### Fixed
- CommonJS no longer contains raw `import.meta`; FontParser chunks resolve in ESM, CommonJS, and browser production builds.
- Fixed negative exact multiples in `fract()`, invalid units in approximate `distance()`, stale draw closures, terminal pause behavior, resize/remount context reuse, and resume timing jumps.
- Fixed path/contour state leaks, `clipTo()` restoration on errors, logical offscreen sizing, static data-URL conversion, pixel DPR access, text sizing/font shorthand, paragraph line breaks, color transformations, and timeline loops/callbacks.
- Pointer capture/cancellation, wheel delta normalization, gesture totals/rotation, keyboard focus scoping, and input listener reattachment now behave consistently.
- Extension collisions now warn unless replacement is explicitly requested.

### Removed
- Physics scaffolds and MatterPhysics. Physics remains a future roadmap item and no throwing placeholder ships in 0.5.
- The experimental WebGPU and web-component implementations.
- The obsolete external `@shopify/klint-plugins` CLI installation flow.

---

## v0.3.0

### Added
- `paragraph()` - Multi-line text with alignment and line breaks
- `clip()` - Clipping regions for masking
- `strip()` - Triangle and quad strip rendering (Strip element)
- `filters` - Canvas filter support
- 3D vector operations - Vector with cross/slerp/lookAt/relativeTo/fromAngle/toScreen
- Grid element - Rectangular and radial grids (Grid.rect(), Grid.radial())
- Noise element - Perlin/Simplex noise with seeding, fbm, turbulence, ridge, cellular
- Hotspot element - Hit-testing for circles, rectangles, ellipses, polygons
- Easing element - Easing functions including overshoot, bounce, elastic
- Strip element - Triangle/quad strips with customizable rendering
- Performance element - FPS widget, offscreen caching, leak detection, text metric cache
- Catmull-Rom plugin - Smooth curve interpolation
- Sprites plugin - Spritesheet loading and rendering
- FontParser plugin - TTF parsing to paths/points
- Delaunay plugin - Triangulation
- CLI scaffolds - klint-create-editor, klint-create-sandbox
- useGestures hook - Touch and mouse gesture support
- PI and TWO_PI constants

### Fixed
- RoundedRect argument order corrected
- Line breaks in text() / paragraph breaks
- Vite hot reload slowdown (useDev refactor)
- Window resize inconsistency
- Event listeners refactored to AbortController
- Transforms docs updated (push/pop/resetTransform/applyTransform)
- Fill-rule handling (nonzero | evenodd)
- K.blend('default') now resets to default blend mode

### Changed
- Monorepo structure with workspaces
- Packages now scoped as @shopify/klint and @shopify/klint-plugins
- ESM by default, requires Node ≥18
- Keyboard listener added
