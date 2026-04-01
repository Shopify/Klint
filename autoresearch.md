# Autoresearch: KlintGPU — API Coverage & Feature Parity

## Objective
Implement missing KlintFunctions in `@shopify/klint-gpu` to achieve parity with the Canvas2D
Klint library. Each session targets a tier of functions, verified by TypeScript clean compile
AND no fps regression in the benchmark.

## Current Session
**Session 1 — COMPLETE ✅** All 28 Tier 2 functions implemented, zero fps regression.
**Now: Session 4 — createOffscreen / getOffscreen (GPU render-to-texture)**

## Metrics
- **Primary**: `fps` (must stay ≥ 370fps — no regression from API additions)
- **Secondary**: `ts_errors` (TypeScript compile errors — must be 0)

## How to Run
```bash
./autoresearch.sh
```

## Files in Scope
- `packages/klint-gpu/src/context/KlintGPUContext.ts` — main target: add all missing function types + implementations
- `packages/klint-gpu/src/renderer/WebGPURenderer.ts` — renderer: only if shape/gradient work needed
- `packages/klint-gpu/src/useKlintGPU.tsx` — hook additions if needed
- `packages/klint-gpu/benchmark/index.html` — DO NOT change (benchmark stability)

## Off Limits
- `packages/klint/` — original Klint package, do not modify
- Benchmark HTML/shader code — preserve for accurate fps measurement

## Session 1 Batch Plan

### ✅ ALL TIER 2 COMPLETE (run #92)
- ✅ Batch A: dot, squareDistance, bezierLerp/Tangent, remap, scaleTo, smooth/noSmooth, describe, extend
- ✅ Batch B: clear, reset, strokeCap/Join, fillRule, setImageOrigin/RectOrigin, saveCanvas
- ✅ Batch C: disk (proper arc tessellation), arcVertex, beginContour/endContour
- ✅ Batch D: gradient()+addColorStop() → KlintGPUGradient builder pattern (2-stop now, LUT pending)

## Session 4 — createOffscreen / getOffscreen Plan

The renderer ALREADY supports multiple surfaces (`addCanvas()`). `createOffscreen` is:
1. `createOffscreen(id, w, h, options, callback?)` → create a GPUTexture surface, run callback with its own KlintGPUContext
2. `getOffscreen(id)` → retrieve as a drawable source for `image()`

### Implementation approach
- `createOffscreen(id, w, h, cb?)` → create a `GPUTexture` (RENDER_ATTACHMENT + TEXTURE_BINDING + COPY_SRC)
  - Create a GPUCanvasContext-like surface (but targeting the texture, not a canvas)
  - Create a new KlintGPUContext pointing at that texture surface
  - Run `cb(offscreenCtx)` if provided
  - Store the texture + bind group in a Map keyed by id
- `getOffscreen(id)` → retrieve stored texture key, usable by `image(key, x, y, w, h)`
  - The image pipeline already handles GPUTexture via bind groups

Key detail: the image pipeline in the renderer uses `imgBgl` (sampler + texture_2d). We just need:
  1. A way to create a GPUTexture of arbitrary size (not from a canvas)
  2. Render passes targeting that texture  
  3. Store the texture's bind group by id, accessible from `image()` calls

This is ~50 lines of renderer changes + ~20 lines of context changes.

## What's Been Tried
*(updated each run)*

## Performance Baseline (from previous sessions)
- alpha: 385-417fps at N=50k
- GPU compute: 435fps
- opaque: 1111fps
