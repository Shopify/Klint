# KlintGPU Coverage Plan

## Session Status
- **Session 1** ✅ Starting now — Tier 2: all trivial missing functions (~85% parity)
- **Session 2** SKIP — saveConfig/restoreConfig was a Canvas2D resize workaround, not needed in GPU
- **Session 3** SKIP — Text bridge (user will ask when ready, setup already good)
- **Session 4** TODO — createOffscreen / getOffscreen (GPU render-to-texture)
- **Session 5** TODO — GPU post-process filters (blur, dropShadow, grayscale, etc.)

---

## Session 1 — Tier 2 Implementation Plan

### Batch A: Pure math + trivial state (no renderer changes)
All go directly into `KlintGPUContext.ts` as simple implementations.

| Function | Implementation |
|----------|----------------|
| `dot(x1,y1,x2,y2)` | `x1*x2 + y1*y2` |
| `squareDistance(x1,y1,x2,y2)` | `(x2-x1)²+(y2-y1)²` |
| `bezierLerp(a,b,c,d,t)` | Cubic bezier formula |
| `bezierTangent(a,b,c,d,t)` | Derivative of cubic bezier |
| `remap(n,A,B,C,D,bounded?)` | Alias for `map()` with bounded param |
| `scaleTo(ow,oh,dw,dh,cover?)` | Min/max ratio util |
| `smooth() / noSmooth()` | No-op (GPU sampler handles this) |
| `describe(text)` | Set canvas aria-label |
| `extend(name, data)` | `ctx[name] = data` — attach plugins |

### Batch B: Drawing state (context + small renderer additions)
| Function | Implementation |
|----------|----------------|
| `clear()` | Clear to transparent (sets bgColor to rgba(0,0,0,0)) |
| `reset()` | clear() + resetTransform |
| `strokeCap(cap)` | Store `__strokeCap`, affect line SDF quad expansion |
| `strokeJoin(join)` | Store `__strokeJoin` (visual effect deferred) |
| `fillRule(rule)` | Store and pass to earclip triangulation |
| `setImageOrigin(type)` | Already has `__imageOrigin`, just expose the setter |
| `setRectOrigin(type)` | Already has `__rectangleOrigin`, expose setter |
| `saveCanvas()` | Screenshot: draw to canvas surface, `canvas.toBlob()` |

### Batch C: Shape additions (renderer changes required)
| Function | Implementation |
|----------|----------------|
| `disk(x,y,r,start,end,closed)` | Tessellate arc via internal vertex array → triangle VBO |
| `arcVertex(x1,y1,x2,y2,r)` | Add arc-to tessellation in endShape() |
| `beginContour / endContour` | Reverse-winding hole polygon via ear-clip |
| `gradient() / addColorStop()` | Canvas2D gradient → 256px texture LUT → GPU sample |

### Batch D: Gradient rework (addColorStop compatibility)
The current `linearGradient(x1,y1,x2,y2,c1,c2)` is 2-stop only.
Proper approach: match Klint's Canvas2D API pattern:
```js
const g = K.gradient(0, 0, K.width, 0);  // returns GradientBuilder
K.addColorStop(g, 0, 'red');
K.addColorStop(g, 0.5, 'blue'); 
K.addColorStop(g, 1, 'green');
K.fillColor(g);  // detect GradientBuilder, rasterize to 256px texture
```
Implementation: rasterize stops into a Canvas2D offscreen → 256×1 GPUTexture → sample in shader.

---

## Session 4 — createOffscreen Plan (future)
- `createOffscreen(id, w, h)` → create a secondary `KlintGPUSurface` (the renderer already supports N surfaces!)
- `getOffscreen(id)` → return that surface's texture for use in `image()`
- The draw callback gets its own KlintGPUContext targeting that surface

## Session 5 — GPU Filters Plan (future)
Each filter is a post-process pass: render scene → intermediate GPUTexture → filter compute shader → present.
- `blur(r)` — separable Gaussian blur (2 compute passes: horizontal + vertical)
- `dropShadow(dx,dy,blur,color)` — render to texture, blur, offset-composite
- `grayscale(amount)` — simple fragment shader on the texture
- `invert(amount)` — same
- `hue(angle)` — color matrix rotation
