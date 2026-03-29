/**
 * KlintGPUContext — mirrors KlintContext/KlintOffscreenContext but GPU-backed.
 * The draw function receives a KlintGPUContext and uses the same API as Klint.
 */

import { WebGPURenderer, KlintGPUSurface } from '../renderer/WebGPURenderer';

export interface KlintGPUOptions {
  alpha?: boolean;
  dpr?: number | 'default';
  origin?: 'corner' | 'center';
  fps?: number;
  noloop?: boolean;
}

export const DEFAULT_GPU_OPTIONS: Required<KlintGPUOptions> = {
  alpha: true,
  dpr: 'default',
  origin: 'corner',
  fps: 60,
  noloop: false,
};

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

  // ── Drawing API ──────────────────────────────────────────────────
  background(color?: string): void;
  fillColor(color: string): void;
  strokeColor(color: string): void;
  noFill(): void;
  noStroke(): void;
  strokeWidth(w: number): void;
  opacity(value: number): void;

  // Shapes
  circle(x: number, y: number, r: number, r2?: number): void;
  disk(x: number, y: number, r: number): void;
  rectangle(x: number, y: number, w: number, h?: number): void;
  roundedRectangle(x: number, y: number, w: number, h: number, r: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  point(x: number, y: number): void;

  // Transform stack
  push(): void;
  pop(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(s: number, sy?: number): void;

  // Utils (same as Klint)
  PI: number;
  TWO_PI: number;
  TAU: number;
  lerp(a: number, b: number, t: number): number;
  constrain(v: number, lo: number, hi: number): number;
  fract(v: number): number;
  distance(x1: number, y1: number, x2: number, y2: number): number;
  map(v: number, in1: number, in2: number, out1: number, out2: number): number;
  random(min?: number, max?: number): number;
  randomSeed(seed: number): void;
  noise(x: number, y?: number, z?: number): number;

  // Playback
  play(): void;
  pause(): void;

  // Multi-canvas
  createSurface(canvas: HTMLCanvasElement): KlintGPUSurface;
}

/** Builds a KlintGPUContext from a renderer and surface */
export function buildKlintGPUContext(
  canvas: HTMLCanvasElement,
  renderer: WebGPURenderer,
  surface: KlintGPUSurface,
  options: Required<KlintGPUOptions>,
): KlintGPUContext {
  let _bgColor = '#000000';

  // Simple Mulberry32 seeded PRNG
  let _seed = Date.now() >>> 0;
  const mulberry32 = () => {
    _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
    let t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  // Very basic value noise (non-perlin, but fast)
  const hash = (n: number) => {
    n = Math.sin(n) * 43758.5453123;
    return n - Math.floor(n);
  };
  const noise1 = (x: number) => {
    const xi = Math.floor(x);
    const xf = x - xi;
    const u = xf * xf * (3 - 2 * xf);
    return hash(xi) * (1 - u) + hash(xi + 1) * u;
  };

  const ctx: KlintGPUContext = {
    canvas,
    width: surface.width,
    height: surface.height,
    frame: 0,
    time: 0,
    deltaTime: 0,
    fps: options.fps,
    __isPlaying: true,
    __isReadyToDraw: false,
    __dpr: surface.dpr,
    __canvasOrigin: options.origin,
    __renderer: renderer,
    __surface: surface,

    // ── State API ───────────────────────────────────────────────────
    background(color = '#000') {
      _bgColor = color;
      renderer.setBackground(color);
    },
    fillColor(color) { renderer.setFill(color); },
    strokeColor(color) { renderer.setStroke(color); },
    noFill() { renderer.setNoFill(); },
    noStroke() { renderer.setNoStroke(); },
    strokeWidth(w) { renderer.setStrokeWidth(w); },
    opacity(v) { renderer.setOpacity(v); },

    // ── Shapes ──────────────────────────────────────────────────────
    circle(x, y, r, r2) { renderer.circle(x, y, r, r2); },
    disk(x, y, r) {
      renderer.setNoStroke();
      renderer.circle(x, y, r);
    },
    rectangle(x, y, w, h) {
      const rh = h ?? w;
      if (options.origin === 'center') {
        renderer.rect(x - w / 2, y - rh / 2, w, rh);
      } else {
        renderer.rect(x, y, w, rh);
      }
    },
    roundedRectangle(x, y, w, h, r) { renderer.rect(x, y, w, h, r); },
    line(x1, y1, x2, y2) { renderer.line(x1, y1, x2, y2); },
    point(x, y) { renderer.point(x, y); },

    // ── Transforms ──────────────────────────────────────────────────
    push() { renderer.transform.push(); },
    pop() { renderer.transform.pop(); },
    translate(x, y) { renderer.transform.translate(x, y); },
    rotate(a) { renderer.transform.rotate(a); },
    scale(s, sy) { renderer.transform.scale(s, sy); },

    // ── Utils ────────────────────────────────────────────────────────
    PI: Math.PI,
    TWO_PI: Math.PI * 2,
    TAU: Math.PI * 2,
    lerp: (a, b, t) => a + (b - a) * t,
    constrain: (v, lo, hi) => Math.min(hi, Math.max(lo, v)),
    fract: (v) => v - Math.floor(v),
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    map: (v, in1, in2, out1, out2) => out1 + (v - in1) / (in2 - in1) * (out2 - out1),
    random(min, max) {
      const r = mulberry32();
      if (min === undefined) return r;
      if (max === undefined) return r * min;
      return min + r * (max - min);
    },
    randomSeed(seed) { _seed = seed >>> 0; },
    noise(x, y = 0, _z = 0) { return noise1(x + y * 100); },

    // ── Playback ─────────────────────────────────────────────────────
    play() { ctx.__isPlaying = true; },
    pause() { ctx.__isPlaying = false; },

    // ── Multi-canvas ─────────────────────────────────────────────────
    createSurface(canvas) {
      return renderer.addCanvas(canvas, ctx.__dpr);
    },
  };

  // Apply center origin offset if needed
  if (options.origin === 'center') {
    renderer.transform.translate(surface.width / 2, surface.height / 2);
  }

  return ctx;
}
