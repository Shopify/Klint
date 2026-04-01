# Changelog

## v0.4.0 (Unreleased)

### Added

### Changed
- **FontParser plugin**: Refactored to lazy-loaded `.mjs` bundle (~13 KB / ~5 KB gzipped), no longer inlined in the main plugins bundle
- **Build**: Added `tsup.config.ts`, simplified build scripts in `package.json`
- **FontParser tests**: Expanded test coverage with real font fixtures (Inter Variable, Jost Regular)

### Fixed

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
