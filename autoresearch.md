# Autoresearch: KlintGPU — WebGPU rendering backend for Klint

## Objective
Build and optimize `@shopify/klint-gpu` — a WebGPU-powered rendering backend for the Klint creative coding library.
Klint currently uses Canvas 2D. This new package provides the same API surface (`background`, `fillColor`, `circle`,
`rectangle`, `line`, `push`/`pop`, `translate`/`rotate`/`scale`) but renders via WebGPU using a GPU compute-friendly
SDF batch renderer — inspired by Vello's architecture.

Key innovations over Canvas 2D:
- **Multi-canvas native**: one `GPUDevice` → many `GPUCanvasContext` surfaces simultaneously
- **Batch rendering**: all draw calls collected per frame, uploaded as a single storage buffer, dispatched in one draw call
- **SDF shapes**: circle, rect (rounded), line, point — all rendered GPU-side via signed distance functions with AA
- **Zero CPU rasterization**: geometry is procedural (6 verts/instance, no VBO), shapes are pure SDF in fragment shader

## Metrics
- **Primary**: `fps` (frames/second, higher is better) — median FPS of 500-shape animated scene, 60 frames measured after 30 warmup
- **Secondary**: none yet (can add shape_count, frame_time_ms)

## How to Run
```bash
./autoresearch.sh
```
Outputs `METRIC fps=<value>`. Uses Playwright (headless:false for real Metal GPU on Apple Silicon).

## Files in Scope
- `packages/klint-gpu/src/renderer/WebGPURenderer.ts` — core renderer: SDF pipeline, buffer management, multi-canvas
- `packages/klint-gpu/src/context/KlintGPUContext.ts` — GPU context type mirroring KlintContext API
- `packages/klint-gpu/src/KlintGPU.tsx` — React component (mirrors Klint.tsx)
- `packages/klint-gpu/src/useKlintGPU.tsx` — React hook (mirrors useKlint.tsx)
- `packages/klint-gpu/src/index.ts` — exports
- `packages/klint-gpu/benchmark/index.html` — **benchmark page** (self-contained, no build step)
- `packages/klint-gpu/benchmark/run.mjs` — Playwright runner

## Off Limits
- `packages/klint/` — original Klint package, do not modify
- `docusaurus/` — docs, do not modify
- `package.json` (root) — do not modify workspaces list without careful thought

## Constraints
- Must maintain the Klint API contract: `draw(K)` receives a context with `K.circle()`, `K.rectangle()`, etc.
- All rendering must go through WebGPU (no Canvas 2D fallback in the hot path)
- Benchmark must use real GPU (Playwright headed mode → Metal on Apple Silicon)
- TypeScript strict mode — no `any` abuse

## Architecture Notes
### Renderer pipeline
```
Frame start → beginFrame() clears command list + resets transform stack
User draw() → pushes DrawCommands (pos, size, fill, stroke, type)
Frame end → render():
  1. writeBuffer() — upload all shapes as packed Float32Array to storage buffer
  2. render pass: draw(6, N) — 6 verts × N instances (procedural quad)
  3. Fragment shader: SDF dispatch by shape_type, AA via fwidth()
```

### Multi-canvas
```
renderer = WebGPURenderer.init()          // one GPUDevice
surfaceA  = renderer.addCanvas(canvasA)   // separate GPUCanvasContext
surfaceB  = renderer.addCanvas(canvasB)   // same device, different surface
// render() iterates all surfaces, or render(surfaceA) for targeted
```

### Transform stack
CPU-side 2×3 affine matrix. `push()/pop()`, `translate()`, `rotate()`, `scale()`.
Points are transformed on CPU before being written to the draw command list.
This avoids per-instance matrix uploads (saves 64 bytes/shape).

## What's Been Tried
*(updated each run)*

### Baseline
- Initial implementation: SDF batch renderer, 500 animated circles/rects, Playwright headed mode
- Shapes: circles (type 0) and rects (type 1), no stroke, opacity 1.0
- WGSL inlined in HTML benchmark (no build step needed for benchmark)

## Ideas Backlog
- Try `premultiplied` vs `opaque` alpha mode — opaque is faster but no transparency
- Sort commands by shape_type to reduce shader divergence
- Use `writeBuffer` with a mapped ring buffer instead of new ArrayBuffer each frame
- Try f16 for color data (halves color payload: 4×f32 → 4×f16)
- `GPUBuffer.mapAsync` + staging buffer for larger batches
- MSAA anti-aliasing (4x) via multisampling instead of fwidth() SDF AA
- Add `image()` via sampled texture + instanced UV
- Add gradient fills: radial/linear gradient as texture LUT
- Offscreen rendering: render scene to intermediate texture, apply post-processing
- Worker thread rendering via OffscreenCanvas (once wgpu WASM supports it)
