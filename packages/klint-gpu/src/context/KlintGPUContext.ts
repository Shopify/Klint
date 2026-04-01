/**
 * KlintGPUContext — mirrors KlintContext/KlintOffscreenContext but GPU-backed.
 * The draw function receives a KlintGPUContext and uses the same API as Klint.
 */

import { WebGPURenderer, KlintGPUSurface } from '../renderer/WebGPURenderer';
import { AaMethod, AlphaMode } from '../renderer/WebGPURenderer';

// ─── Gradient builder (Klint-compatible API) ──────────────────────────────────
// Mirrors Canvas2D gradient object pattern: gradient() → addColorStop() → fillColor()

export interface GradientStop { offset: number; color: string }

export class KlintGPUGradient {
  readonly __klintGradient = true as const;
  readonly type: 'linear' | 'radial' | 'conic';
  readonly params: number[]; // linear:[x1,y1,x2,y2]  radial:[cx,cy,r0,r1]  conic:[cx,cy,angle]
  stops: GradientStop[] = [];

  constructor(type: 'linear' | 'radial' | 'conic', params: number[]) {
    this.type = type;
    this.params = params;
  }
  addColorStop(offset: number, color: string) {
    this.stops.push({ offset, color });
    this.stops.sort((a, b) => a.offset - b.offset);
    return this;
  }
}

function isGradient(v: unknown): v is KlintGPUGradient {
  return typeof v === 'object' && v !== null && (v as KlintGPUGradient).__klintGradient === true;
}

// Hidden Canvas2D for rasterizing multi-stop gradients to sample endpoint colors
let _gradCanvas: HTMLCanvasElement | null = null;
let _gradCtx2d: CanvasRenderingContext2D | null = null;

function getGradCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!_gradCanvas) {
    _gradCanvas = document.createElement('canvas');
    _gradCanvas.width = 256; _gradCanvas.height = 1;
    _gradCtx2d = _gradCanvas.getContext('2d');
  }
  return _gradCtx2d;
}

function rasterizeGradient(g: KlintGPUGradient): [string, string] {
  if (g.stops.length === 0) return ['#000', '#000'];
  if (g.stops.length === 1) return [g.stops[0].color, g.stops[0].color];
  if (g.stops.length === 2) return [g.stops[0].color, g.stops[1].color];

  // Multi-stop: rasterize through Canvas2D and sample at t=0 and t=1
  // This correctly handles all intermediate stops, giving accurate endpoint colors.
  const ctx2d = getGradCtx();
  if (!ctx2d) return [g.stops[0].color, g.stops[g.stops.length - 1].color];

  const grad = ctx2d.createLinearGradient(0, 0, 255, 0);
  for (const s of g.stops) grad.addColorStop(Math.max(0, Math.min(1, s.offset)), s.color);

  ctx2d.clearRect(0, 0, 256, 1);
  ctx2d.fillStyle = grad;
  ctx2d.fillRect(0, 0, 256, 1);

  // Sample at t=0 and t=1
  const px0 = ctx2d.getImageData(0,   0, 1, 1).data;
  const px1 = ctx2d.getImageData(255, 0, 1, 1).data;
  const toHex = (r: number, g: number, b: number, a: number) =>
    `rgba(${r},${g},${b},${(a/255).toFixed(3)})`;
  return [toHex(px0[0],px0[1],px0[2],px0[3]), toHex(px1[0],px1[1],px1[2],px1[3])];
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface KlintGPUOptions {
  alpha?: boolean;
  dpr?: number | 'default';
  origin?: 'corner' | 'center';
  fps?: number;
  noloop?: boolean;
  /** Anti-aliasing method. Fast=fixed 1px AA (best for particles), Quality=adaptive fwidth (default). */
  aaMethod?: AaMethod;
  /** Alpha mode. Opaque=no blend reads (73% faster), Premultiplied=standard alpha (default). */
  alphaMode?: AlphaMode;
}

export const DEFAULT_GPU_OPTIONS: Required<KlintGPUOptions> = {
  alpha: true,
  dpr: 'default',
  origin: 'corner',
  fps: 60,
  noloop: false,
  aaMethod: AaMethod.Fast, // Better performance; Quality gives smoother AA at non-standard scales
  alphaMode: AlphaMode.Premultiplied,
};

// ─── Context Interface ────────────────────────────────────────────────────────

export interface KlintGPUContext {
  // Canvas info
  readonly canvas: HTMLCanvasElement;
  width: number;
  height: number;

  // Timing (same as KlintContext)
  frame: number;
  time: number;
  deltaTime: number;
  fps: number;

  // Internal
  __isPlaying: boolean;
  __isReadyToDraw: boolean;
  __dpr: number;
  __canvasOrigin: 'corner' | 'center';
  __renderer: WebGPURenderer;
  __surface: KlintGPUSurface;

  // ── Canvas lifecycle ──────────────────────────────────────────────
  play(): void;
  pause(): void;
  describe(text: string): void;
  saveCanvas(): void;
  /** No-op compat stubs — not needed in GPU (no canvas-clear-on-resize workaround needed) */
  saveConfig(): void;
  restoreConfig(): void;
  withConfig(cb: () => void): void;
  /** No-op stub — SVG filter not supported in WebGPU (use blur/grayscale/etc. instead) */
  SVGfilter(id: string): void;
  toBase64(type?: string, quality?: number): string;
  fullscreen(): void;
  redraw(): void;
  /** Attach custom data or plugin to the context (same as Klint's extend) */
  extend(name: string, data: unknown, enforceReplace?: boolean): void;
  /** Returns true — GPU always supports filters */
  canIuseFilter(): boolean;
  /** Check if fill/stroke is visible (internal utility, same as Klint) */
  checkTransparency(toCheck: 'fill' | 'stroke'): boolean;
  /**
   * Compatibility shim for Klint's internal draw helper.
   * In Canvas2D: conditionally fills/strokes the current path.
   * In KlintGPU: no-op (GPU drawing is explicit via circle/rect/etc).
   */
  drawIfVisible(): void;
  /** Resize the canvas/surface. Only affects secondary (offscreen) canvases. */
  resizeCanvas(width: number, height: number): void;

  // ── Coordinate transforms ─────────────────────────────────────────
  /** Convert screen coordinates to world (local) coordinates accounting for transforms */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number };
  /** Convert world coordinates to screen coordinates */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number };
  /** Get the visible canvas bounds in world space (accounts for transforms/scale) */
  getVisibleBounds(): { left: number; top: number; right: number; bottom: number; width: number; height: number };

  // ── Fill & stroke ─────────────────────────────────────────────────
  background(color?: string): void;
  clear(): void;
  reset(): void;
  fillColor(colorOrGradient: string | KlintGPUGradient): void;
  strokeColor(color: string): void;
  noFill(): void;
  noStroke(): void;
  strokeWidth(w: number): void;
  strokeCap(cap: 'butt' | 'round' | 'square'): void;
  strokeJoin(join: 'miter' | 'round' | 'bevel'): void;
  fillRule(rule: 'nonzero' | 'evenodd'): void;
  opacity(value: number): void;
  smooth(): void;
  noSmooth(): void;
  blendMode(mode: 'source-over' | 'add' | 'opaque'): void;
  /**
   * Klint-compatible composite operation. Maps Canvas2D globalCompositeOperation to GPU blend modes.
   * 'default' → 'source-over'. 'lighter' → additive. 'copy' → opaque.
   * Complex modes (multiply/screen/overlay etc.) fall back to 'source-over'.
   */
  blend(mode: 'default' | 'source-over' | 'add' | 'lighter' | 'copy' | 'opaque' | string): void;

  // ── GPU post-process filters ──────────────────────────────────────
  /** Gaussian blur applied to the whole frame. Radius in pixels. */
  blur(radius: number): void;
  /** Grayscale filter. amount 0=color, 1=fully gray. */
  grayscale(amount: number): void;
  /** Color invert. amount 0=normal, 1=fully inverted. */
  invert(amount: number): void;
  /** Hue rotation. angle in radians. */
  hue(angle: number): void;
  /** Filter-level opacity (0–1). Affects the whole frame. */
  filterOpacity(value: number): void;
  /** Drop shadow: offset (dx,dy), blur radius, color. */
  dropShadow(offsetX: number, offsetY: number, blurRadius: number, color: string): void;
  /** Remove all pending filters. */
  clearFilters(): void;

  // ── Gradients (Klint-compatible pattern) ──────────────────────────
  /** Create a gradient builder. Use addColorStop() then fillColor(g). */
  gradient(x1?: number, y1?: number, x2?: number, y2?: number): KlintGPUGradient;
  radialGradientBuilder(x1?: number, y1?: number, r1?: number, x2?: number, y2?: number, r2?: number): KlintGPUGradient;
  conicGradientBuilder(angle?: number, x1?: number, y1?: number): KlintGPUGradient;
  addColorStop(gradient: KlintGPUGradient, offset: number, color: string): void;
  // Convenience all-in-one (existing API kept)
  linearGradient(x1: number, y1: number, x2: number, y2: number, color1: string, color2: string): void;
  radialGradient(cx: number, cy: number, innerR: number, outerR: number, color1: string, color2: string): void;
  conicGradient(cx: number, cy: number, startAngle: number, color1: string, color2: string): void;

  // ── Shapes ────────────────────────────────────────────────────────
  circle(x: number, y: number, r: number, r2?: number): void;
  /** Arc / pie segment. startAngle=0, endAngle=2π → full circle. closed=true → pie, false → arc. */
  disk(x: number, y: number, r: number, startAngle?: number, endAngle?: number, closed?: boolean): void;
  rectangle(x: number, y: number, w: number, h?: number): void;
  roundedRectangle(x: number, y: number, w: number, h: number, r: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  point(x: number, y: number): void;
  polygon(cx: number, cy: number, radius: number, sides: number, radius2?: number, rotation?: number): void;

  // ── Shape builder ─────────────────────────────────────────────────
  beginShape(): void;
  beginContour(): void;
  vertex(x: number, y: number): void;
  bezierVertex(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  quadraticVertex(cpx: number, cpy: number, x: number, y: number): void;
  arcVertex(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  endContour(forceRevert?: boolean): void;
  endShape(close?: boolean): void;

  // ── Origin helpers ────────────────────────────────────────────────
  setCanvasOrigin(type: 'center' | 'corner'): void;
  setImageOrigin(type: 'center' | 'corner'): void;
  setRectOrigin(type: 'center' | 'corner'): void;

  // ── Transforms ───────────────────────────────────────────────────
  push(): void;
  pop(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(s: number, sy?: number): void;

  // ── Image / video ─────────────────────────────────────────────────
  loadImage(key: string, url: string): Promise<void>;
  image(key: string, x: number, y: number, w: number, h: number, opacity?: number): void;
  loadVideoTexture(key: string, video: HTMLVideoElement): void;
  updateVideoFrame(key: string, video: HTMLVideoElement): void;
  scaleTo(originWidth: number, originHeight: number, dstWidth: number, dstHeight: number, cover?: boolean): number;

  // ── GPU compute particles ─────────────────────────────────────────
  createParticles(N: number, data: import('../renderer/WebGPURenderer').ParticleInitData): import('../renderer/WebGPURenderer').GPUParticleSystem;
  drawParticles(ps: import('../renderer/WebGPURenderer').GPUParticleSystem): void;

  // ── Math utils (full Klint parity) ────────────────────────────────
  PI: number;
  TWO_PI: number;
  TAU: number;
  lerp(a: number, b: number, t: number, bounded?: boolean): number;
  constrain(v: number, lo: number, hi: number): number;
  fract(n: number, mod?: number, mode?: 'precise' | 'fast' | 'faster'): number;
  distance(x1: number, y1: number, x2: number, y2: number, mode?: 'precise' | 'fast' | 'faster'): number;
  squareDistance(x1: number, y1: number, x2: number, y2: number): number;
  dot(x1: number, y1: number, x2: number, y2: number): number;
  map(v: number, in1: number, in2: number, out1: number, out2: number): number;
  remap(n: number, A: number, B: number, C: number, D: number, bounded?: boolean): number;
  bezierLerp(a: number, b: number, c: number, d: number, t: number): number;
  bezierTangent(a: number, b: number, c: number, d: number, t: number): number;
  random(min?: number, max?: number): number;
  randomSeed(seed: number): void;
  noise(x: number, y?: number, z?: number): number;

  // ── Text (Canvas2D bridge) ────────────────────────────────────────────────
  text(str: string | number, x: number, y: number, maxWidth?: number): void;
  textFont(family: string): void;
  textSize(size: number): void;
  textStyle(style: string): void;
  textWeight(weight: string): void;
  textLeading(leading: number): void;
  textWidth(str: string): number;
  alignText(horizontal?: CanvasTextAlign, vertical?: CanvasTextBaseline): void;
  paragraph(str: string | number | undefined, x: number, y: number, width: number, options?: {
    justification?: 'left' | 'center' | 'right' | 'justified';
    overflow?: number;
    break?: 'words' | 'letters';
  }): void;
  computeFont(): void;
  /** Alias for computeFont() — matches Klint's computeTextStyle() */
  computeTextStyle(): void;
  textQuality(quality?: 'speed' | 'auto' | 'legibility' | 'precision'): void;
  textSpacing(kind: 'letter' | 'word', value: number): void;

  // ── Clip path ────────────────────────────────────────────────────
  /**
   * Apply a clip mask to all shapes drawn inside this push/pop scope.
   * The callback defines the clip region by drawing shapes.
   * @note GPU implementation uses a render-to-texture mask approach.
   * Complex shapes may have slight edge differences from Canvas2D's path-based clipping.
   */
  clipTo(callback: (K: KlintGPUContext) => void, fillRule?: 'nonzero' | 'evenodd'): void;

  // ── Offscreen render-to-texture ───────────────────────────────────
  /**
   * Create an offscreen GPU surface. Runs the optional callback with a full
   * KlintGPUContext targeting the texture. Call `image(id, x, y, w, h)` to draw it.
   */
  createOffscreen(
    id: string,
    width: number,
    height: number,
    options?: { dpr?: number; origin?: 'corner' | 'center' },
    callback?: (ctx: KlintGPUContext) => void,
  ): void;
  /** Returns the id string so it can be passed to image(). */
  getOffscreen(id: string): string;

  // ── Multi-canvas ─────────────────────────────────────────────────
  createSurface(canvas: HTMLCanvasElement): KlintGPUSurface;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function buildKlintGPUContext(
  canvas: HTMLCanvasElement,
  renderer: WebGPURenderer,
  surface: KlintGPUSurface,
  options: Required<KlintGPUOptions>,
): KlintGPUContext {

  // PRNG (Mulberry32)
  let _seed = Date.now() >>> 0;
  const mulberry32 = () => {
    _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
    let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // 2D smooth value noise (better than linear combination of 1D)
  const h11 = (xi: number, yi: number) => {
    const n = xi + yi * 1999;
    const nv = Math.sin(n) * 43758.5453123; return nv - Math.floor(nv);
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10); // Perlin quintic
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const noise2 = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = fade(xf), v = fade(yf);
    return lerp(lerp(h11(xi,yi), h11(xi+1,yi), u), lerp(h11(xi,yi+1), h11(xi+1,yi+1), u), v);
  };

  // Internal state (matches Klint's private props)
  let __imageOrigin: 'corner' | 'center' = options.origin === 'center' ? 'center' : 'corner';
  let __rectangleOrigin: 'corner' | 'center' = options.origin === 'center' ? 'center' : 'corner';
  let __fillRule: 'nonzero' | 'evenodd' = 'nonzero';
  let __strokeCap: 'butt' | 'round' | 'square' = 'round';
  let __strokeJoin: 'miter' | 'round' | 'bevel' = 'miter';

  // Context state stack for push/pop (saves __imageOrigin, etc.)
  const _ctxStateStack: Array<{io:string;ro:string;fr:string;sc:string;sj:string}> = [];

  // Active contour (for polygon holes)
  let _inContour = false;
  let _contourVerts: Array<{type: string; x?: number; y?: number; cp1x?: number; cp1y?: number; cp2x?: number; cp2y?: number; cpx?: number; cpy?: number; x1?: number; y1?: number; x2?: number; y2?: number; radius?: number}> = [];

  const ctx: KlintGPUContext = {
    canvas,
    // K.width / K.height are in CSS pixels (matching Klint Canvas2D API)
    width:  surface.width  / surface.dpr,
    height: surface.height / surface.dpr,
    frame: 0, time: 0, deltaTime: 0, fps: options.fps,
    __isPlaying: true, __isReadyToDraw: false,
    __dpr: surface.dpr, __canvasOrigin: options.origin,
    __renderer: renderer, __surface: surface,

    // ── Lifecycle ──────────────────────────────────────────────────
    play()  { ctx.__isPlaying = true; },
    pause() { ctx.__isPlaying = false; },
    redraw() {
      if (ctx.__isPlaying) return; // already playing, no-op
      // Force exactly one frame: set playing, let the rAF render it, then pause
      ctx.__isPlaying = true;
      requestAnimationFrame(() => {
        // After the next frame renders, pause again if it was paused before
        requestAnimationFrame(() => { ctx.__isPlaying = false; });
      });
    },
    describe(text) { canvas.setAttribute('aria-label', text); },
    fullscreen() { canvas.requestFullscreen?.().catch(() => {}); },
    toBase64(type = 'image/png', quality?: number) {
      // Just snapshot the current canvas content — render loop keeps it current
      return canvas.toDataURL(type, quality);
    },
    canIuseFilter() { return true; }, // GPU always supports filters
    drawIfVisible() {
      // No-op in KlintGPU: drawing happens via explicit shape calls (circle/rect/etc),
      // not by building a path then calling fill()/stroke(). Provided for API compatibility.
    },
    resizeCanvas(w, h) {
      // Only meaningful for offscreen/secondary canvases (main canvas resizes via CSS/ResizeObserver)
      const dpr = ctx.__dpr;
      surface.width  = Math.floor(w * dpr);
      surface.height = Math.floor(h * dpr);
      // CSS pixels for ctx.width/height
      ctx.width  = w;
      ctx.height = h;
    },
    checkTransparency(toCheck) {
      if (toCheck === 'fill')   return !renderer.isNoFill;
      if (toCheck === 'stroke') return !renderer.isNoStroke;
      return true;
    },
    // ── Coordinate transforms ─────────────────────────────────────────
    // The GPU renderer keeps a CPU-side 2×3 affine transform stack.
    // We expose the inverse for screen→world and forward for world→screen.
    screenToWorld(sx, sy) {
      const [a,b,c,d,tx,ty] = renderer.transform.getMatrix();
      const det = a*d - b*c;
      if (Math.abs(det) < 1e-10) return {x:sx, y:sy};
      const ia = d/det, ib = -b/det, ic = -c/det, id = a/det;
      const itx = (c*ty - d*tx)/det, ity = (b*tx - a*ty)/det;
      return { x: ia*sx + ic*sy + itx, y: ib*sx + id*sy + ity };
    },
    worldToScreen(wx, wy) {
      renderer.transform.applyXY(wx, wy, renderer._applyOut);
      return { x: renderer._applyOut.x, y: renderer._applyOut.y };
    },
    getVisibleBounds() {
      const corners = [[0,0],[ctx.width,0],[ctx.width,ctx.height],[0,ctx.height]];
      const pts = corners.map(([x,y]) => ctx.screenToWorld(x,y));
      const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
      const left = Math.min(...xs), right = Math.max(...xs);
      const top  = Math.min(...ys), bottom = Math.max(...ys);
      return { left, top, right, bottom, width: right-left, height: bottom-top };
    },
    saveConfig() { /* no-op: GPU doesn't lose state on resize */ },
    restoreConfig() { /* no-op */ },
    withConfig(cb) { cb(); },
    SVGfilter(_id) { /* no-op: use GPU blur/grayscale/etc. instead */ },
    saveCanvas() {
      // Snapshot current canvas content (render loop keeps it current)
      canvas.toBlob(blob => {
        if (!blob) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'canvas.png';
        a.click();
        URL.revokeObjectURL(a.href);
      });
    },
    extend(name, data, enforceReplace = false) {
      if (name in ctx && !enforceReplace) return;
      (ctx as unknown as Record<string, unknown>)[name] = data;
    },

    // ── Fill / stroke ──────────────────────────────────────────────
    background(color = '#000') { renderer.setBackground(color); },
    clear() {
      // Clear the canvas without resetting the transform (matches Canvas2D clearRect behaviour).
      // Set bg to transparent, render with no shapes, then restore background.
      const prevBg = renderer._bgColor;
      const prevBgSemi = renderer['_bgSemiTransparent' as keyof typeof renderer] as boolean;
      renderer.setBackground('rgba(0,0,0,0)');
      // Save current commands and render empty frame to clear
      const savedCmds = renderer.commands.slice();
      renderer.commands.length = 0;
      renderer.render(surface);
      // Restore commands and background
      for (const c of savedCmds) renderer.commands.push(c);
      renderer._bgColor = prevBg;
      renderer._bgSemiTransparent = prevBgSemi;
    },
    reset() {
      ctx.clear();
      renderer.transform.reset();
    },
    fillColor(colorOrGradient) {
      if (isGradient(colorOrGradient)) {
        const g = colorOrGradient;
        const [c1, c2] = rasterizeGradient(g);
        // Transform gradient positions from user-space (CSS px) to device-space.
        // Mirrors Canvas2D: gradients live in the same transform space as shapes.
        const t = renderer.transform;
        const o = renderer._applyOut; // reuse for zero-alloc transform
        const sf = t.scaleX(); // includes dpr × user scale
        if (g.type === 'linear') {
          t.applyXY(g.params[0], g.params[1], o); const tx1=o.x, ty1=o.y;
          t.applyXY(g.params[2], g.params[3], o);
          renderer.setLinearGradient(tx1, ty1, o.x, o.y, c1, c2, g.stops);
        } else if (g.type === 'radial') {
          t.applyXY(g.params[0], g.params[1], o);
          const tcx=o.x, tcy=o.y;
          const r0 = g.params[2] * sf;
          const r1 = (g.params.length >= 6 ? g.params[5] : g.params[3]) * sf;
          renderer.setRadialGradient(tcx, tcy, r0, r1, c1, c2, g.stops);
        } else if (g.type === 'conic') {
          t.applyXY(g.params[0], g.params[1], o);
          renderer.setConicGradient(o.x, o.y, g.params[2], c1, c2, g.stops);
        }
      } else {
        renderer.setFill(colorOrGradient);
      }
    },
    strokeColor(color) { renderer.setStroke(color); },
    noFill()   { renderer.setNoFill(); },
    noStroke() { renderer.setNoStroke(); },
    strokeWidth(w) { renderer.setStrokeWidth(w); },
    strokeCap(cap)  { __strokeCap = cap; /* visual effect: future line SDF cap variants */ },
    strokeJoin(join){ __strokeJoin = join; },
    fillRule(rule)  { __fillRule = rule; /* passed to earclip triangulation */ },
    opacity(v) { renderer.setOpacity(v); },
    smooth()   { /* no-op: GPU sampler handles quality */ },
    noSmooth() { /* no-op */ },
    blendMode: (mode) => renderer.setBlendMode(mode),
    blend(mode) {
      // Map Klint/Canvas2D composite operations to GPU-supported blend modes
      switch (mode) {
        case 'default':
        case 'source-over': renderer.setBlendMode('source-over'); break;
        case 'add':
        case 'lighter':     renderer.setBlendMode('add');         break;
        case 'copy':
        case 'opaque':      renderer.setBlendMode('opaque');      break;
        default:
          // Complex operations (multiply/screen/overlay etc.) not natively supported;
          // fall back to source-over to avoid visual artifacts
          renderer.setBlendMode('source-over');
      }
    },

    // ── GPU post-process filters ──────────────────────────────────────
    blur(radius) {
      if (radius <= 0) return;
      // Scale radius to device pixels (filter texture is in device px)
      renderer.addFilter(5, radius * ctx.__dpr);
    },
    grayscale(amount)    { renderer.addFilter(1, ctx.constrain(amount, 0, 1)); },
    invert(amount)       { renderer.addFilter(2, ctx.constrain(amount, 0, 1)); },
    hue(angle)           { renderer.addFilter(3, angle); },
    filterOpacity(value) { renderer.addFilter(4, ctx.constrain(value, 0, 1)); },
    dropShadow(_dx, _dy, blurRadius, _color) {
      // Simplified: full Gaussian blur approximation (proper shadow compositing is a future upgrade)
      // Note: _dx, _dy offset and _color tinting are not yet implemented
      if (blurRadius > 0) renderer.addFilter(5, blurRadius * ctx.__dpr); // mode 5 = full H+V blur
    },
    clearFilters() { renderer.clearFilters(); },

    // ── Gradients (Klint-compatible builder pattern) ───────────────
    gradient(x1 = 0, y1 = 0, x2?: number, y2?: number) {
      return new KlintGPUGradient('linear', [x1, y1, x2 ?? ctx.width, y2 ?? ctx.height]);
    },
    radialGradientBuilder(x1 = ctx.width/2, y1 = ctx.height/2, r1 = 0, x2 = ctx.width/2, y2 = ctx.height/2, r2?: number) {
      return new KlintGPUGradient('radial', [x1, y1, r1, x2, y2, r2 ?? Math.min(ctx.width, ctx.height)]);
    },
    conicGradientBuilder(angle = 0, x1 = ctx.width/2, y1 = ctx.height/2) {
      return new KlintGPUGradient('conic', [x1, y1, angle]);
    },
    addColorStop(gradient, offset, color) { gradient.addColorStop(offset, color); },
    // All-in-one convenience methods kept for direct use
    linearGradient(x1, y1, x2, y2, c1, c2) {
      const o = renderer._applyOut;
      renderer.transform.applyXY(x1, y1, o); const tx1=o.x, ty1=o.y;
      renderer.transform.applyXY(x2, y2, o);
      renderer.setLinearGradient(tx1, ty1, o.x, o.y, c1, c2);
    },
    radialGradient(cx, cy, r0, r1, c1, c2) {
      renderer.transform.applyXY(cx, cy, renderer._applyOut);
      const sf = renderer._cachedScale;
      renderer.setRadialGradient(renderer._applyOut.x, renderer._applyOut.y, r0 * sf, r1 * sf, c1, c2);
    },
    conicGradient(cx, cy, angle, c1, c2)    {
      renderer.transform.applyXY(cx, cy, renderer._applyOut);
      renderer.setConicGradient(renderer._applyOut.x, renderer._applyOut.y, angle, c1, c2);
    },

    // ── Shapes ────────────────────────────────────────────────────
    circle(x, y, r, r2) { renderer.circle(x, y, r, r2); },

    disk(x, y, r, startAngle = 0, endAngle = Math.PI * 2, closed = true) {
      // Tessellate arc segment into vertices (pie slice or arc)
      const span = endAngle - startAngle;
      const steps = Math.max(6, Math.ceil(Math.abs(span) / (Math.PI / 24)));
      renderer.beginShape();
      if (closed) renderer.vertex(x, y); // center for pie/closed disk
      for (let i = 0; i <= steps; i++) {
        const a = startAngle + (i / steps) * span;
        renderer.vertex(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      renderer.endShape(closed);
    },

    rectangle(x, y, w, h) {
      const rh = h ?? w;
      if (__rectangleOrigin === 'center') renderer.rect(x - w/2, y - rh/2, w, rh);
      else renderer.rect(x, y, w, rh);
    },
    roundedRectangle(x, y, w, h, r) {
      const ox = __rectangleOrigin === 'center' ? x - w/2 : x;
      const oy = __rectangleOrigin === 'center' ? y - h/2 : y;
      renderer.rect(ox, oy, w, h, r);
    },
    line(x1, y1, x2, y2) { renderer.line(x1, y1, x2, y2); },
    point(x, y) { renderer.point(x, y); },
    polygon(cx, cy, radius, sides, radius2, rot = 0) { renderer.polygon(cx, cy, sides, radius, radius2, rot); },

    // ── Shape builder ─────────────────────────────────────────────
    beginShape() {
      _inContour = false;
      (_contourVerts.length = 0, _contourVerts);
      renderer.beginShape();
    },
    beginContour() {
      // Start collecting a hole contour
      _inContour = true;
      (_contourVerts.length = 0, _contourVerts);
    },
    vertex(x, y) {
      if (_inContour) { _contourVerts.push({type:'line', x, y}); }
      else { renderer.vertex(x, y); }
    },
    bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y) {
      if (_inContour) { _contourVerts.push({type:'bezier', cp1x, cp1y, cp2x, cp2y, x, y}); }
      else { renderer.bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y); }
    },
    quadraticVertex(cpx, cpy, x, y) {
      if (_inContour) { _contourVerts.push({type:'quadratic', cpx, cpy, x, y}); }
      else { renderer.quadraticVertex(cpx, cpy, x, y); }
    },
    arcVertex(x1, y1, x2, y2, radius) {
      // Proper arcTo tessellation — all in device px
      const prev = renderer['_shapeRaw'] as number[];
      if (!prev || prev.length < 2) { renderer.vertex(x2, y2); return; }
      const px = prev[prev.length-2], py = prev[prev.length-1]; // already device px

      // Transform CSS px control points → device px for consistent geometry
      const [tx1,ty1] = renderer.transform.apply(x1, y1);
      const [tx2,ty2] = renderer.transform.apply(x2, y2);
      // Scale radius to device px
      const tr = radius * renderer._cachedScale;

      if (tr <= 0) { renderer.vertex(x1, y1); renderer.vertex(x2, y2); return; }

      // Direction vectors (all in device px)
      const d1x = px - tx1, d1y = py - ty1;
      const d2x = tx2 - tx1, d2y = ty2 - ty1;
      const l1 = Math.hypot(d1x, d1y), l2 = Math.hypot(d2x, d2y);
      if (l1 < 1e-6 || l2 < 1e-6) { renderer.vertex(x2, y2); return; }

      // Normalize
      const u1x = d1x/l1, u1y = d1y/l1;
      const u2x = d2x/l2, u2y = d2y/l2;

      // Cross product to determine arc direction, dot for angle
      const cross = u1x*u2y - u1y*u2x;
      const dot   = u1x*u2x + u1y*u2y;
      const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

      if (Math.abs(angle) < 1e-6 || Math.abs(cross) < 1e-6) {
        renderer.vertex(x1, y1); renderer.vertex(x2, y2); return;
      }

      // Tangent length from corner to tangent points (device px)
      const tl = tr / Math.tan(angle / 2);

      // Tangent points (device px)
      const t1x = tx1 + u1x*tl, t1y = ty1 + u1y*tl;
      const t2x = tx1 + u2x*tl, t2y = ty1 + u2y*tl;

      // Arc center perpendicular to u1 at t1 (device px)
      const perpSign = cross < 0 ? 1 : -1;
      const cx2 = t1x + (-u1y)*perpSign*tr;
      const cy2 = t1y + ( u1x)*perpSign*tr;

      const startA = Math.atan2(t1y - cy2, t1x - cx2);
      const endA   = Math.atan2(t2y - cy2, t2x - cx2);
      let span = endA - startA;
      if (cross < 0 && span > 0) span -= Math.PI * 2;
      if (cross > 0 && span < 0) span += Math.PI * 2;

      // Push to _shapeRaw directly (already in device px, skip double-transform)
      const raw = renderer['_shapeRaw'] as number[];
      if (_inContour) _contourVerts.push({type:'device_line', x: t1x, y: t1y});
      else raw.push(t1x, t1y);
      const STEPS = Math.max(4, Math.ceil(Math.abs(span) / (Math.PI / 12)));
      for (let i = 1; i <= STEPS; i++) {
        const a = startA + (i/STEPS)*span;
        const vx = cx2 + Math.cos(a)*tr, vy = cy2 + Math.sin(a)*tr;
        if (_inContour) _contourVerts.push({type:'device_line', x: vx, y: vy}); // already device px
        else raw.push(vx, vy);
      }
    },
    endContour(forceRevert = true) {
      if (!_inContour || _contourVerts.length === 0) return;
      // Add contour as reversed vertices to create a hole in the polygon
      const verts = forceRevert ? [..._contourVerts].reverse() : _contourVerts;
      const raw = renderer['_shapeRaw'] as number[];
      for (const v of verts) {
        if (v.type === 'line' && v.x !== undefined && v.y !== undefined) renderer.vertex(v.x, v.y);
        else if (v.type === 'device_line' && v.x !== undefined && v.y !== undefined) raw.push(v.x, v.y); // already device px
        else if (v.type === 'bezier' && v.cp1x !== undefined) renderer.bezierVertex(v.cp1x, v.cp1y!, v.cp2x!, v.cp2y!, v.x!, v.y!);
        else if (v.type === 'quadratic' && v.cpx !== undefined) renderer.quadraticVertex(v.cpx, v.cpy!, v.x!, v.y!);
      }
      _inContour = false;
      (_contourVerts.length = 0, _contourVerts);
    },
    endShape(close = false) {
      if (_inContour) ctx.endContour();
      renderer.endShape(close);
    },

    // ── Origin helpers ────────────────────────────────────────────
    setCanvasOrigin(type) { ctx.__canvasOrigin = type; },
    setImageOrigin(type)  { __imageOrigin = type; },
    setRectOrigin(type)   { __rectangleOrigin = type; },

    // ── Transforms ────────────────────────────────────────────────
    push() {
      renderer.transform.push();
      renderer.pushDrawState();
      // Save clip state on the renderer's clip ID stack
      renderer.clipIdStack.push(renderer._currentClipId);
      // Save context-level drawing state (imageOrigin, rectOrigin, etc.)
      _ctxStateStack.push({io:__imageOrigin, ro:__rectangleOrigin, fr:__fillRule, sc:__strokeCap, sj:__strokeJoin});
    },
    pop() {
      renderer.transform.pop();
      renderer.popDrawState();
      const savedId = renderer.clipIdStack.length > 0 ? renderer.clipIdStack.pop()! : -1;
      renderer.setClipId(savedId);
      renderer.cacheScale();
      // Restore context-level state
      if (_ctxStateStack.length > 0) {
        const s = _ctxStateStack.pop()!;
        __imageOrigin = s.io as 'corner'|'center';
        __rectangleOrigin = s.ro as 'corner'|'center';
        __fillRule = s.fr as 'nonzero'|'evenodd';
        __strokeCap = s.sc as 'butt'|'round'|'square';
        __strokeJoin = s.sj as 'miter'|'round'|'bevel';
      }
    },
    translate(x, y)     { renderer.transform.translate(x, y); },
    rotate(a)           { renderer.transform.rotate(a); renderer.cacheScale(); },
    scale(s, sy)        { renderer.transform.scale(s, sy); renderer.cacheScale(); },

    // ── Image / video ─────────────────────────────────────────────
    loadImage: (key, url) => renderer.loadImage(key, url),
    image(key, x, y, w, h, op = 1) {
      const ox = __imageOrigin === 'center' ? x - w/2 : x;
      const oy = __imageOrigin === 'center' ? y - h/2 : y;
      renderer.drawImage(key, ox, oy, w, h, op);
    },
    loadVideoTexture: (key, video) => renderer.loadVideoTexture(key, video),
    updateVideoFrame: (key, video) => renderer.updateVideoFrame(key, video),
    scaleTo(ow, oh, dw, dh, cover = false) {
      const wr = dw / ow, hr = dh / oh;
      return cover ? Math.max(wr, hr) : Math.min(wr, hr);
    },

    // ── GPU compute particles ─────────────────────────────────────
    createParticles: (N, data) => renderer.createParticleSystem(N, data, ctx.__dpr),
    drawParticles: (ps) => renderer.renderParticles(ps),

    // ── Math utils ────────────────────────────────────────────────
    PI: Math.PI, TWO_PI: Math.PI * 2, TAU: Math.PI * 2,

    lerp(a, b, t, bounded = true) {
      const tt = bounded ? Math.min(1, Math.max(0, t)) : t;
      return a + (b - a) * tt;
    },
    constrain: (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
    fract(n, mod = 1, mode = 'precise') {
      if (mode === 'faster') return n - ((n / mod) >> 0) * mod;
      if (mode === 'fast')   return n - ~~(n / mod) * mod;
      if (n >= 0) return n % mod;
      return mod - (-n % mod);
    },
    distance: (x1, y1, x2, y2, mode = 'precise') => {
      if (mode === 'faster') { const dx=Math.abs(x2-x1),dy=Math.abs(y2-y1); return dx+dy-Math.min(dx,dy)*0.3; }
      if (mode === 'fast')   return Math.sqrt(ctx.squareDistance(x1,y1,x2,y2)) * Math.SQRT1_2;
      return Math.hypot(x2-x1, y2-y1);
    },
    squareDistance: (x1, y1, x2, y2) => (x2-x1)**2 + (y2-y1)**2,
    dot: (x1, y1, x2, y2) => x1*x2 + y1*y2,
    map: (v, in1, in2, out1, out2) => out1 + (v - in1) / (in2 - in1) * (out2 - out1),
    remap(n, A, B, C, D, bounded = true) {
      return ctx.lerp(C, D, (n - A) / (B - A), bounded);
    },
    bezierLerp(a, b, c, d, t) {
      const u = 1 - t;
      return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d;
    },
    bezierTangent(a, b, c, d, t) {
      const u = 1 - t;
      return 3*d*t*t - 3*c*t*t + 6*c*u*t - 6*b*u*t + 3*b*u*u - 3*a*u*u;
    },
    random(min, max) {
      const r = mulberry32();
      if (min === undefined) return r;
      if (max === undefined) return r * min;
      return min + r * (max - min);
    },
    randomSeed(seed) { _seed = seed >>> 0; },
    noise(x, y = 0, z = 0) {
      // 2D value noise (proper 2D, not 1D hack); z support via layered offset
      return noise2(x + z * 317, y + z * 149);
    },

    // ── Text (Canvas2D bridge) ──────────────────────────────────────────────
    computeFont() { renderer.computeFont(); },
    computeTextStyle() { renderer.computeFont(); }, // Klint alias
    textFont(family) { renderer._textFont = family; renderer.computeFont(); },
    textSize(size) { renderer._textSize = size * ctx.__dpr; renderer.computeFont(); },
    textStyle(style) { renderer._textStyle = style || 'normal'; renderer.computeFont(); },
    textWeight(weight) { renderer._textWeight = weight || 'normal'; renderer.computeFont(); },
    textLeading(leading) { renderer._textLeading = leading * ctx.__dpr; }, // scale to device px like textSize
    textWidth(str) { return renderer.measureTextWidth(str) / ctx.__dpr; }, // convert device px → CSS px
    textQuality(q = 'auto') {
      if (!renderer._text2d) return;
      const map = {speed:'optimizeSpeed',auto:'auto',legibility:'optimizeLegibility',precision:'geometricPrecision'};
      renderer._text2d.textRendering = (map[q as keyof typeof map] ?? 'auto') as CanvasTextRendering;
    },
    textSpacing(kind, value) {
      if (kind === 'letter') renderer._textLetterSpacing = value;
      else renderer._textWordSpacing = value;
    },
    alignText(h = 'left', v = 'alphabetic') {
      renderer._textAlignH = h;
      renderer._textAlignV = v;
    },
    text(str, x, y, maxWidth) {
      if (str === undefined || str === null) return;
      renderer._ensureTextCanvas(surface.width, surface.height);
      // Apply center origin if needed
      // Convert CSS px to device px for Canvas2D text canvas
      const dpr = ctx.__dpr;
      const ox = ctx.__canvasOrigin === 'center'
        ? (x + ctx.width  / 2) * dpr
        : x * dpr;
      const oy = ctx.__canvasOrigin === 'center'
        ? (y + ctx.height / 2) * dpr
        : y * dpr;
      const strVal = String(str);

      // Handle \n line breaks
      if (strVal.includes('\n')) {
        const lines = strVal.split('\n');
        renderer._ensureTextCanvas(surface.width, surface.height);
        renderer.computeFont();
        const leading = renderer._textLeading > 0 ? renderer._textLeading : renderer._textSize * 1.2;
        const totalH = lines.length * leading;
        let startY = oy;
        if (renderer._textAlignV === 'middle') startY = oy - totalH / 2;
        else if (renderer._textAlignV === 'bottom') startY = oy - totalH;
        const mw = maxWidth !== undefined ? maxWidth * dpr : undefined;
        lines.forEach((line, i) => {
          renderer.renderText(line, ox, startY + i * leading,
            renderer._fill, renderer._stroke, renderer._strokeW, renderer._opacity, mw);
        });
      } else {
        const mw = maxWidth !== undefined ? maxWidth * dpr : undefined;
        renderer.renderText(strVal, ox, oy,
          renderer._fill, renderer._stroke, renderer._strokeW, renderer._opacity, mw);
      }
    },
    paragraph(str, x, y, width, options) {
      if (str === undefined || str === null) return;
      const strVal = String(str);
      renderer._ensureTextCanvas(surface.width, surface.height);
      renderer.computeFont();
      const leading = renderer._textLeading > 0 ? renderer._textLeading : renderer._textSize * 1.2;
      const dpr2 = ctx.__dpr;
      const ox = ctx.__canvasOrigin === 'center' ? (x + ctx.width/2) * dpr2 : x * dpr2;
      const oy = ctx.__canvasOrigin === 'center' ? (y + ctx.height/2) * dpr2 : y * dpr2;
      const justification = options?.justification ?? 'left';
      const breakMode = options?.break ?? 'words';
      const widthDev = width * dpr2;

      // Save and apply justification alignment
      const prevAlignH = renderer._textAlignH;
      if (justification === 'center') renderer._textAlignH = 'center';
      else if (justification === 'right') renderer._textAlignH = 'right';
      else renderer._textAlignH = 'left';

      // Tokenize
      const tokens = breakMode === 'letters' ? strVal.split('') : strVal.split(' ');
      const lines: string[] = [];
      let current = '';
      for (const token of tokens) {
        const sep = breakMode === 'letters' ? '' : ' ';
        const test = current ? `${current}${sep}${token}` : token;
        if (renderer.measureTextWidth(test) > widthDev && current) {
          lines.push(current); current = token;
        } else { current = test; }
      }
      if (current) lines.push(current);

      // Render lines
      const lineX = justification === 'center' ? ox + widthDev/2 :
                    justification === 'right' ? ox + widthDev : ox;
      lines.forEach((line, i) => {
        let rx = lineX;
        // Justified: set letter/word spacing so line fills width (except last)
        if (justification === 'justified' && i < lines.length - 1) {
          const lineW = renderer.measureTextWidth(line);
          const gap = (widthDev - lineW) / Math.max(1, line.split(' ').length - 1);
          renderer._text2d!.wordSpacing = `${gap}px`;
        } else if (justification === 'justified') {
          renderer._text2d!.wordSpacing = '0px';
        }
        renderer.renderText(line, rx, oy + i * leading,
          renderer._fill, renderer._stroke, renderer._strokeW, renderer._opacity);
      });

      // Restore
      renderer._textAlignH = prevAlignH;
      if (justification === 'justified') {
        renderer._text2d!.wordSpacing = '0px';
      }
    },

    // ── Clip path ────────────────────────────────────────────────
    clipTo(callback, _fillRule) {
      // GPU stencil-based clip masking.
      // The callback defines the clip region; all subsequent shapes (until pop())
      // are clipped to that region via a stencil write+test render pass pair.
      const clipId = renderer.beginClipMask();
      callback(ctx);            // record mask commands (tagged isClipMask=true)
      renderer.endClipMask(clipId); // subsequent shapes tagged clipId=clipId
    },

    // ── Offscreen render-to-texture ───────────────────────────────
    createOffscreen(id, width, height, opts = {}, callback) {
      const dpr = opts.dpr ?? ctx.__dpr;
      const offSurface = renderer.createOffscreenSurface(id, width, height, dpr);

      if (callback) {
        // Build a temporary context targeting the offscreen surface
        const offOpts = { ...options, origin: opts.origin ?? options.origin };
        const offCtx = buildKlintGPUContext(
          canvas, // share same canvas reference (not actually used by offscreen)
          renderer,
          // Fake a KlintGPUSurface-like object for the offscreen
          { canvas: null as unknown as HTMLCanvasElement, gpuCtx: null as unknown as GPUCanvasContext,
            width: offSurface.width, height: offSurface.height, dpr },
          offOpts,
        );
        // CSS pixel dimensions (not device px)
        offCtx.width  = offSurface.width  / dpr;
        offCtx.height = offSurface.height / dpr;

        // Draw the callback's commands to the offscreen surface
        // Apply the same CSS px coordinate system as the main canvas
        renderer.beginFrame();
        renderer.transform.scale(dpr, dpr);
        renderer.cacheScale();
        if (offOpts.origin === 'center') renderer.transform.translate(offCtx.width / 2, offCtx.height / 2);
        callback(offCtx);
        renderer.renderOffscreen(id);
      }
    },
    getOffscreen(id) { return id; }, // id string is passed to image()

    // ── Multi-canvas ──────────────────────────────────────────────
    createSurface(c) { return renderer.addCanvas(c, ctx.__dpr); },
  };

  // Note: DPR scale + center origin are applied every frame by the render loop
  // (renderer.transform.reset() on beginFrame → scale(dpr) → translate for center)
  return ctx;
}
