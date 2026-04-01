# KlintGPU — Deferred Ideas (post-session-3)

## Highest Impact

- **GPU-driven animation + opaque blend**: GPUParticleSystem with AlphaMode.Opaque
  → No CPU upload (compute shader) + no dst read (opaque blend) → expected ~2000fps at N=50k!
  Implementation: `GPUParticleSystem` + renderer `alphaMode: AlphaMode.Opaque`
  This combination eliminates BOTH major bottlenecks.

- **Compute-based rendering** (Vello-style tile-based):
  Instead of fragment shader per shape, use compute shader per tile.
  Each tile tests only the ~210 shapes that cover it (vs all 50k).
  Expected: 10-100× less compute for sparse scenes (typical creative coding).

## Medium Impact Features

- **Multi-stop gradient LUT**: 256×1 texture, up to 8 color stops.
  Store gradient_row_index in stat buffer, sample texture in shader.
  
- **Conic gradient with stops**: Current implementation is 2-stop only.

- **EvenOdd fill rule**: Modify ear-clip triangulation to handle self-intersecting polygons.

- **Bitmap font rendering**: Canvas2D glyph → GPUTexture atlas → image pipeline.
  Build atlas lazily from measured glyphs. Useful for high-performance text.

- **SVG paths** via Vello's WASM compute renderer as an alternative backend.

## Technical Debt / Fixes

- **Polygon fill approximation**: Currently uses ear-clip triangulation with VBO.
  Need to test correctness for concave polygons and polygons with holes.

- **Image pipeline**: verify UV flipping behavior for different texture orientations.

- **GPUParticleSystem sort**: particles not sorted by type → uses fallback pipeline.
  Sort initial particle types to enable 4-way specialized pipeline dispatch.

## Confirmed Dead Ends (don't retry)
- mapAsync double-buffer: same speed as writeBuffer on Apple Silicon
- u16 packed positions: same speed (not upload-bound, fragment-bound)
- MSAA 4×: 2× slower (4× memory writes + resolve)
- WGSL override constants: crashes Chrome Dawn  
- Flat vertex-to-fragment interpolants: same speed (L2 cache near-free)
- storeOp='discard' for offscreen: 0.04ms savings, below noise
- Async pipeline creation: no runtime benefit
- L-inf rect SDF: below noise (rects=25%)
- Uniform circles test: 244fps (SLOWER than mixed due to uniform overdraw pattern)

## Done (session 2 resume)
- ✅ Multi-stop gradient LUT: 256×64 texture, writeTexture direct, premultiplied RGBA
- ✅ clipTo stencil: stencil8 write+test, push()/pop() save clip scope
- ✅ Text bridge (Canvas2D overlay) — all text functions
- ✅ Semi-transparent background (trails effect)
- ✅ Ear-clip polygon tessellation

## Known Limitations
- clipTo z-ordering: clipped content always renders after non-clipped content
- textSpacing: letterSpacing/wordSpacing not set on 2d context yet (easy fix)

## Done (session 3)
- ✅ Gradient coordinate transform through current matrix (CSS→device px)
- ✅ First-frame DPR scale consistency
- ✅ strokeW/cornerR device-px scaling via cached transform.scaleX()
- ✅ blur radius DPR scaling
- ✅ toBase64 fixed (was clearing canvas before snapshot)
- ✅ Pre-allocated CPU staging buffers (no per-frame GC at N=50k)
- ✅ Cached image uniform buffers (no createBuffer per image draw)
- ✅ Cached filter uniform buffer (no createBuffer per filter pass)

## Remaining high-value work
- clipTo z-ordering: clips always render after non-clipped — fix by tagging commands in-order
- textSpacing letterSpacing value stored but may need ctx flush
- KlintGPU useProps/useStorage utilities: test if they work correctly with closures

## Done (session 4)
- ✅ Gradient coordinate transform through current matrix (CSS px fix)
- ✅ StrokeW/cornerR device-px scaling via _cachedScale
- ✅ 6-way Fast pipeline (add line + point specialized shaders)
- ✅ DrawCommand object pool (eliminate per-frame allocations)
- ✅ Pre-allocated staging buffers (zero GC in steady state)
- ✅ O(N) counting sort for 4-bit sort key
- ✅ Sort cache bug fix (Int32Array.length != valid count)
- ✅ Gradient LUT persistent cache with LRU eviction
- ✅ O(1) flags for hasAdditiveBlend and hasClips
- ✅ Image/filter uniform buffer caching
- ✅ Array.length=0 reuse (zero per-frame array allocation)
- ✅ Fan triangulation for convex polygon()
- ✅ textQuality() → Canvas2D textRendering hint
- ✅ createOffscreen() CSS px coordinate system fix

## Remaining (known limitations)
- clipTo z-ordering: clips render after non-clipped content
- Quality mode mixed-blend: uses global pipeline (not per-shape)
- screenToWorld/worldToScreen: inverse of DPR-scaled transform (quirky for edge cases)

## Done (session 7)
- ✅ Proper push()/pop() drawing state save/restore (full Canvas2D parity)
- ✅ Text state in drawStateStack (textFont/Size/Style/Weight/Leading/Align)
- ✅ clipIdStack as proper renderer field
- ✅ _ctxStateStack as context closure variable  
- ✅ Text-only frame fix (text flush in early-return path)
- ✅ Text overlay uniform buffer cached
- ✅ Paragraph API: options object {justification, overflow, break}
- ✅ KlintGradient._stops as typed interface field
- ✅ CanvasRenderingContext2DExtended type for wordSpacing/textRendering
- ✅ Clean casts: _bgSemiTransparent, _currentClipId, _cachedScale exposed publicly

## Remaining
- clipTo z-ordering
- Quality mode mixed-blend
- gradient positions when transform changes after fillColor() (known quirk)
