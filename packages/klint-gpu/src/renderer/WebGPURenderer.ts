/**
 * KlintGPU WebGPU Renderer — full-featured batch 2D renderer
 *
 * Architecture:
 *  - Split dynamic/static buffers for per-frame efficiency
 *  - 4-way specialized SDF pipelines (circle/rect × stroke/no-stroke) — AaMethod.Fast
 *  - Unified SDF pipeline for Quality mode and fallback shapes (line/point)
 *  - Multiple blend modes: source-over, additive, opaque
 *  - Post-process filter chain (Gaussian blur, color matrix)
 *  - Image/video texture pipeline
 *  - Triangle VBO for polygon / beginShape fills
 *  - GPU compute particle system
 *  - Offscreen render-to-texture surfaces
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Extended Canvas2D context type (workaround for some TS versions missing font properties) */
type CanvasRenderingContext2DExtended = CanvasRenderingContext2D & {
  textRendering?: CanvasTextRendering | string;
  wordSpacing?: string;
};

export const enum AaMethod {
  /** Fast AA: fixed 0.5px coverage ramp. Best for particles and simple scenes. */
  Fast = 0,
  /** Quality AA: adaptive fwidth. Best for general use (default). */
  Quality = 1,
}

export const enum AlphaMode {
  /** Premultiplied alpha blending (standard, default). */
  Premultiplied = 0,
  /** No dst read — 73%+ faster on TBDR (Apple Silicon). For fully-opaque scenes. */
  Opaque = 1,
}

/** Blend group per draw command (0=source-over, 1=add) */
export type BlendGroup = 0 | 1;

// ─── Sizes & constants ────────────────────────────────────────────────────────

/** Dynamic shape data: pos.xy + size.xy = 4 f32 = 16 bytes */
const DYN_STRIDE = 16;
/** Static shape data: fill(4) + stroke(4) + fill2(4) + strokeW+cornerR+type+opacity(4) +
 *  gradType+pad+gradDir(2)+gradStart(2)(4) + blendGroup+pad(2) = 24 f32 = 96 bytes */
const STAT_STRIDE = 96;
const INITIAL_CAPACITY = 2048;

export const SHAPE_TYPE = { CIRCLE: 0, RECT: 1, LINE: 2, POINT: 3 } as const;
/** Reusable zero-vector for noFill/noStroke — avoids allocations in _push() */
const _ZERO4: [number,number,number,number] = [0,0,0,0];
export type ShapeType = (typeof SHAPE_TYPE)[keyof typeof SHAPE_TYPE];

// ─── Color parser ─────────────────────────────────────────────────────────────

let _colorCanvas: HTMLCanvasElement | null = null;
let _colorCtx: CanvasRenderingContext2D | null = null;

export function parseCSSColor(css: string): [number, number, number, number] {
  if (!_colorCanvas) {
    _colorCanvas = document.createElement('canvas');
    _colorCanvas.width = _colorCanvas.height = 1;
    _colorCtx = _colorCanvas.getContext('2d')!;
  }
  if (!_colorCtx) return [0, 0, 0, 1];
  if (css === 'transparent' || css === 'none') return [0, 0, 0, 0];
  _colorCtx.clearRect(0, 0, 1, 1);
  _colorCtx.fillStyle = '#000';
  _colorCtx.fillStyle = css;
  const hex = _colorCtx.fillStyle as string;
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1), 16);
    const len = hex.length - 1;
    if (len === 6) return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255,1];
    if (len === 8) return [(n>>24&255)/255,(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];
  }
  const rgba = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgba) return [+rgba[1]/255,+rgba[2]/255,+rgba[3]/255,rgba[4]!=null?+rgba[4]:1];
  return [0,0,0,1];
}

// ─── Gradient data ────────────────────────────────────────────────────────────

export interface KlintGradient {
  type: 1 | 2 | 3; // 1=linear, 2=radial, 3=conic
  /** Linear: [x1,y1,x2,y2].  Radial: [cx,cy,r0,r1].  Conic: [cx,cy,startAngle]. */
  x1: number; y1: number; x2: number; y2: number;
  color1: [number,number,number,number];
  color2: [number,number,number,number];
  /** Multi-stop gradient stops (optional, for LUT rasterization) */
  _stops?: Array<{offset:number; color:string}>;
}

// ─── Draw command ─────────────────────────────────────────────────────────────

interface DrawCommand {
  type:       ShapeType;
  px: number; py: number; sx: number; sy: number;
  fill:       [number,number,number,number];
  stroke:     [number,number,number,number];
  strokeW:    number;
  cornerR:    number;
  opacity:    number;
  gradient:   KlintGradient | undefined;
  blendGroup: BlendGroup;
  /** ≥0: part of clip scope; -1: normal (no clip). */
  clipId:     number;
  /** If true, this command defines the clip mask (not content). */
  isClipMask: boolean;
}

// Stencil pipeline pair
interface StencilPair {
  write: GPURenderPipeline; // stencil-write (no color output)
  test:  GPURenderPipeline; // stencil-test (draw where stencil==1)
}

// ─── Surface types ────────────────────────────────────────────────────────────

export interface KlintGPUSurface {
  __offscreen?: false;
  canvas:  HTMLCanvasElement;
  gpuCtx:  GPUCanvasContext;
  width:   number;
  height:  number;
  dpr:     number;
}

export interface KlintGPUOffscreenSurface {
  __offscreen: true;
  texture: GPUTexture;
  view:    GPUTextureView;
  width:   number;
  height:  number;
  dpr:     number;
}

// ─── Image draw call ──────────────────────────────────────────────────────────

interface ImgDraw {
  key: string;
  x: number; y: number; w: number; h: number;
  opacity: number;
  blendGroup: BlendGroup;
}

// ─── Triangle VBO vertex ──────────────────────────────────────────────────────

// 6 f32 per vertex: px py fill.rgba
const TRI_STRIDE = 24;

// ─── Particle types ───────────────────────────────────────────────────────────

export interface ParticleInitData {
  /** Positions [x0,y0, x1,y1, …] */
  positions:  number[];
  /** Velocities [vx0,vy0, …] */
  velocities: number[];
  /** Per-particle radius */
  radii:      number[];
  /** Per-particle fill color (string CSS) */
  colors:     string[];
}

export class GPUParticleSystem {
  readonly N: number;
  tStep = 0;
  computePipeline:  GPUComputePipeline;
  computeBG:        GPUBindGroup;
  particleBuf:      GPUBuffer;
  dynBuf:           GPUBuffer;
  statBuf:          GPUBuffer;
  simBuf:           GPUBuffer;
  /** Bind group for SDF render: [screen uniform, dynBuf, statBuf] */
  renderBG:         GPUBindGroup;
  renderBGAdd:      GPUBindGroup;  // additive blend variant

  constructor(args: {
    N: number;
    computePipeline: GPUComputePipeline;
    computeBG: GPUBindGroup;
    particleBuf: GPUBuffer;
    dynBuf: GPUBuffer;
    statBuf: GPUBuffer;
    simBuf: GPUBuffer;
    renderBG: GPUBindGroup;
    renderBGAdd: GPUBindGroup;
  }) {
    this.N = args.N;
    this.computePipeline = args.computePipeline;
    this.computeBG = args.computeBG;
    this.particleBuf = args.particleBuf;
    this.dynBuf = args.dynBuf;
    this.statBuf = args.statBuf;
    this.simBuf = args.simBuf;
    this.renderBG = args.renderBG;
    this.renderBGAdd = args.renderBGAdd;
  }

  destroy() {
    this.particleBuf.destroy();
    this.dynBuf.destroy();
    this.statBuf.destroy();
    this.simBuf.destroy();
  }
}

// ─── TransformStack (CPU-side 2×3 affine) ────────────────────────────────────

export class TransformStack {
  private stack: Float32Array<ArrayBuffer>[] = [];
  private current: Float32Array<ArrayBuffer> = new Float32Array([1,0,0,1,0,0]);
  private _depth = 0;

  push() {
    // Reuse pre-allocated stack frames (up to 64 deep)
    if (this._depth >= this.stack.length) {
      this.stack.push(new Float32Array(new ArrayBuffer(24))); // 6 floats
    }
    const frame = this.stack[this._depth++];
    frame.set(this.current);
  }
  pop() {
    if (this._depth > 0) this.current.set(this.stack[--this._depth]);
  }
  reset() {
    this.current[0]=1; this.current[1]=0; this.current[2]=0;
    this.current[3]=1; this.current[4]=0; this.current[5]=0;
    this._depth = 0;
  }

  translate(tx: number, ty: number) {
    const [a,b,c,d,x,y] = this.current;
    this.current[4] = a*tx + c*ty + x;
    this.current[5] = b*tx + d*ty + y;
  }
  rotate(angle: number) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const [a,b,c,d,tx,ty] = this.current;
    this.current[0] = a*cos + c*sin;
    this.current[1] = b*cos + d*sin;
    this.current[2] = a*-sin + c*cos;
    this.current[3] = b*-sin + d*cos;
    this.current[4] = tx; this.current[5] = ty;
  }
  scale(sx: number, sy = sx) {
    this.current[0] *= sx; this.current[1] *= sx;
    this.current[2] *= sy; this.current[3] *= sy;
  }
  apply(px: number, py: number): [number,number] {
    const m = this.current;
    return [m[0]*px + m[2]*py + m[4], m[1]*px + m[3]*py + m[5]];
  }
  /** Apply transform, writing results to provided output slots (avoids tuple allocation) */
  applyXY(px: number, py: number, out: {x:number;y:number}) {
    const m = this.current;
    out.x = m[0]*px + m[2]*py + m[4];
    out.y = m[1]*px + m[3]*py + m[5];
  }
  scaleX() { return Math.sqrt(this.current[0]**2 + this.current[1]**2); }
  scaleY() { return Math.sqrt(this.current[2]**2 + this.current[3]**2); }
  /** Returns the current matrix as [a,b,c,d,tx,ty] */
  getMatrix(): [number,number,number,number,number,number] {
    return Array.from(this.current) as [number,number,number,number,number,number];
  }
}

// ─── WebGPURenderer ──────────────────────────────────────────────────────────

export class WebGPURenderer {
  readonly device:  GPUDevice;
  readonly aaMethod:  AaMethod;
  readonly alphaMode: AlphaMode;

  // Transform (public, accessed by context)
  readonly transform = new TransformStack();

  // Surfaces
  private surfaces: KlintGPUSurface[] = [];
  private offscreenMap = new Map<string, KlintGPUOffscreenSurface>();
  private format: GPUTextureFormat = 'bgra8unorm';

  // ── SDF pipeline state ────────────────────────────────────────────────────
  /** [screen unif, dynBuf, statBuf] bind group layout */
  private sdfBgl!: GPUBindGroupLayout;
  /** Per-frame dyn bind group (rebuilt if buf grows) */
  private sdfBG!: GPUBindGroup;
  private uniformBuf!: GPUBuffer;
  private dynBuf!: GPUBuffer;
  private statBuf!: GPUBuffer;
  private dynCapacity = INITIAL_CAPACITY;
  private statCapacity = INITIAL_CAPACITY;
  /** Frame command list */
  commands: DrawCommand[] = [];
  /** Sort key list (parallel to commands) */
  private sortKeys: Uint8Array = new Uint8Array(INITIAL_CAPACITY);
  /** Last frame's sort version (for cache) */
  private _lastSortVer = -1;
  private _lastSortN = 0;
  /** XOR hash of all sort keys in current frame (updated incrementally in _push) */
  private _sortKeyHash = 0;
  /** XOR hash from the last successful sort (for O(1) cache check) */
  private _lastSortKeyHash = -1;
  /** Hash of all per-shape style data; skip stat re-upload when unchanged */
  private _statDataHash = 0;
  private _lastStatDataHash = -1;
  /** Cached transform scaleX/Y (avoids repeated sqrt() calls). Updated on rotate/scale/pop. */
  _cachedScale  = 1; // scaleX
  private _cachedScaleY = 1; // scaleY (same as scaleX for uniform scale)
  /** Reusable output for transform.applyXY() to avoid tuple allocation in hot paths */
  readonly _applyOut = {x:0, y:0}; // exposed for context use (avoids allocation in fillColor gradient transform)
  /** True if any command this frame uses additive blend (avoids O(N) .some() in Quality mode) */
  private _hasAdditiveBlend = false;
  /** True if any command this frame has a clip (avoids O(N) .some() in render) */
  private _hasClips = false;
  private _hasGradients = false;
  /** Command object pool — avoids per-frame allocations for DrawCommand objects */
  private _cmdPool: DrawCommand[] = [];
  /** Pre-allocated CPU staging buffers (avoids per-frame GC pressure). */
  private _dynStaging:     Float32Array<ArrayBuffer> | null = null;
  /** Hash of all dynamic (position/size) data; skip dyn re-upload when unchanged */
  private _dynDataHash = 0;
  private _lastDynDataHash = -1;
  private _statStaging:    ArrayBuffer  | null = null;
  private _statStagingDV:  DataView     | null = null;
  private _statStagingF32: Float32Array<ArrayBuffer> | null = null;
  private _statStagingU32: Uint32Array<ArrayBuffer>  | null = null;
  private _stagingCapacity = 0;
  private _sortedOrder:    Int32Array = new Int32Array(INITIAL_CAPACITY);
  private _sortedOrderLen  = 0; // number of valid entries (may be < _sortedOrder.length)

  // 4-way fast pipelines: [cns, cs, rns, rs] for source-over, add, opaque
  private fastPipelines:    GPURenderPipeline[] = [];
  private fastPipelinesAdd: GPURenderPipeline[] = [];
  private fastPipelinesOpa: GPURenderPipeline[] = [];
  // Unified quality pipeline + add + opa
  private qualPipeline!:    GPURenderPipeline;
  private qualPipelineAdd!: GPURenderPipeline;
  private qualPipelineOpa!: GPURenderPipeline;

  // ── Render state ──────────────────────────────────────────────────────────
  _fill:      [number,number,number,number] = [1,1,1,1];
  _stroke:    [number,number,number,number] = [0,0,0,0];
  _strokeW    = 0;
  _cornerR    = 0;
  _opacity    = 1;
  _noFill     = false;
  _noStroke   = true;
  _gradient:  KlintGradient | undefined = undefined;
  _blendGroup: BlendGroup = 0;
  _bgColor:   {r:number;g:number;b:number;a:number} = {r:0,g:0,b:0,a:1};

  // ── Clip/stencil state ────────────────────────────────────────────────────
  _currentClipId  = -1;   // active clip ID (-1 = no clip), exposed for context use
  private _isRecordingMask = false; // true while inside clipTo(cb)
  private _nextClipId     = 0;    // counter for assigning new clip IDs
  /** Stack of saved clip IDs (parallel to transform stack) */
  readonly clipIdStack: number[] = [];
  // Stencil pipelines (lazy-created on first clipTo use)
  private _stencilTex: GPUTexture | null = null;
  private _stencilPair: StencilPair | null = null;

  get isNoFill()   { return this._noFill; }
  get isNoStroke() { return this._noStroke; }

  // ── Triangle VBO ──────────────────────────────────────────────────────────
  private triBgl!:    GPUBindGroupLayout;
  private triBG!:     GPUBindGroup;
  private triPipeline!:    GPURenderPipeline;
  private triPipelineAdd!: GPURenderPipeline;
  private triPipelineOpa!: GPURenderPipeline;
  private _triVerts: number[] = [];
  private _triVertsLen = 0; // number of ELEMENTS (not bytes) used this frame
  /** Reusable temp vertex buffer for _fanFill transform (avoids per-call allocation) */
  private _fanFillTverts = new Float32Array(128); // pre-alloc for up to 64 vertices
  /** Reusable polygon vertex array */
  private _polyVerts: number[] = [];
  /** Reusable vertex array for _earFill and index array */
  private _earPts: number[] = [];
  private _earIdx: number[] = [];
  private triVBuf!:     GPUBuffer;
  private triCapacity = 4096;
  private _triStaging: Float32Array<ArrayBuffer> = new Float32Array(new ArrayBuffer(4096 * 4));
  private _triStagingCap = 4096;
  private _shapeVerts: number[] = [];
  private _shapeBlend: BlendGroup = 0;

  // ── Image pipeline ────────────────────────────────────────────────────────
  private imgBgl!:    GPUBindGroupLayout;
  private imgUniLayout!: GPUBindGroupLayout;
  /** Cached image uniform buffers (key → {buf, bg}) — avoids per-frame createBuffer/createBindGroup */
  private _imgUniCache = new Map<string, {buf: GPUBuffer; bg: GPUBindGroup}>();
  private imgSampler!: GPUSampler;
  private imgPipeline!:    GPURenderPipeline;
  private imgPipelineAdd!: GPURenderPipeline;
  private imgPipelineOpa!: GPURenderPipeline;
  /** key → {tex, bg} */
  private imgTextures = new Map<string, {tex: GPUTexture; bg: GPUBindGroup}>();
  /** Collected image draw calls this frame */
  private _imgDraws: ImgDraw[] = [];

  // ── Filter pipeline ───────────────────────────────────────────────────────
  private filterBgl!: GPUBindGroupLayout;
  private filterUniLayout!: GPUBindGroupLayout;
  private filterSampler!: GPUSampler;
  private filterPipeline!: GPURenderPipeline;
  /** Cached filter uniform buffer (legacy, kept for compatibility) */
  private _filterUniBuf: GPUBuffer | null = null;
  private _filterUniBG:  GPUBindGroup | null = null;
  /** Pool of per-pass filter uniform buffers (max 8 passes: 2×blur+gray+opacity+etc) */
  private _filterPassUniPool: GPUBuffer[] = [];
  private _filterPassUniBGPool: GPUBindGroup[] = [];
  private _filterTex:   GPUTexture     | null = null;
  private _filterTex2:  GPUTexture     | null = null;
  private _filterView:  GPUTextureView | null = null;  // cached view for filterTex
  private _filterView2: GPUTextureView | null = null;  // cached view for filterTex2
  /** Cached bind groups: filterTex → BG, filterTex2 → BG (avoids createBindGroup per pass) */
  private _filterSrcBG:  GPUBindGroup | null = null;
  private _filterSrcBG2: GPUBindGroup | null = null;
  private _filters: Array<{mode: number; strength: number}> = [];

  // ── Multi-stop gradient LUT (256×MAX rows, one row per unique gradient per frame) ─
  static readonly MAX_GRAD_LUTS = 64;
  private _gradLUT:    GPUTexture | null = null;
  private _gradLUTSampler: GPUSampler | null = null;
  private _gradLUTCanvas: HTMLCanvasElement | null = null;
  private _gradLUT2d:  CanvasRenderingContext2D | null = null;
  private _gradMap:    Map<KlintGradient, number> = new Map();
  /** Persistent gradient hash → LUT row (avoids re-rasterization for unchanged gradients) */
  private _gradHashToRow:  Map<string, number> = new Map();
  /** Reverse: row → hash (for eviction when row is reused) */
  private _gradRowToHash:  Map<number, string> = new Map();
  private _gradNextPersistentRow = 0;
  private _gradDirtyRows: Set<number> = new Set();
  /** Reusable row buffer for gradient LUT rasterization (256 × RGBA = 1024 bytes) */
  private _gradRowBuf: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(256 * 4));

  // ── Text bridge (Canvas2D → GPUTexture) ───────────────────────────────────
  private _textCanvas:  HTMLCanvasElement | null = null;
  _text2d:      CanvasRenderingContext2DExtended | null = null;
  private _textTex:     GPUTexture | null = null;
  private _textTexBG:   GPUBindGroup | null = null;
  private _textDirty    = false;
  /** Persistent uniform buffer for text overlay (screen size + img dimensions) */
  private _textOverlayUniBuf: GPUBuffer | null = null;
  private _textOverlayUniBG:  GPUBindGroup | null = null;
  // Text style state (mirrors Klint's __text* props)
  _textFont     = 'sans-serif';
  _textSize     = 32;
  _textStyle    = 'normal';
  _textWeight   = 'normal';
  _textLeading      = 0;
  _textLetterSpacing = 0;
  _textWordSpacing   = 0;
  _textAlignH:  CanvasTextAlign     = 'left';
  _textAlignV:  CanvasTextBaseline  = 'alphabetic';
  private _computedFont = '32px sans-serif';

  _ensureTextCanvas(w: number, h: number) {
    if (!this._textCanvas || this._textCanvas.width !== w || this._textCanvas.height !== h) {
      this._textCanvas = document.createElement('canvas');
      this._textCanvas.width = w; this._textCanvas.height = h;
      this._text2d = this._textCanvas.getContext('2d')!;
    }
    if (!this._textTex || this._textTex.width !== w || this._textTex.height !== h) {
      this._textTex?.destroy();
      this._textTex = this.device.createTexture({
        size: {width: w, height: h}, format: this.format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        label: 'text-overlay',
      });
      this._textTexBG = this.device.createBindGroup({
        layout: this.imgBgl,
        entries: [{binding:0,resource:this.imgSampler},{binding:1,resource:this._textTex.createView()}],
      });
    }
  }

  computeFont() {
    this._computedFont = `${this._textWeight} ${this._textStyle} ${this._textSize}px ${this._textFont}`;
  }

  renderText(
    str: string, x: number, y: number,
    fill: [number,number,number,number],
    stroke: [number,number,number,number],
    strokeW: number,
    opacity: number,
    maxWidth?: number,
    surfW?: number, surfH?: number,
  ) {
    if (!this._text2d) return;
    const ctx = this._text2d;
    ctx.font = this._computedFont;
    ctx.textAlign = this._textAlignH;
    ctx.textBaseline = this._textAlignV;
    ctx.globalAlpha = opacity;
    // Apply letter/word spacing if supported (modern browsers)
    if (this._textLetterSpacing !== 0 && 'letterSpacing' in ctx) (ctx as unknown as {letterSpacing:string}).letterSpacing = `${this._textLetterSpacing}px`;
    if (this._textWordSpacing !== 0) ctx.wordSpacing = `${this._textWordSpacing}px`;

    if (strokeW > 0 && stroke[3] > 0) {
      ctx.lineWidth = strokeW;
      const ss = `rgba(${Math.round(stroke[0]*255)},${Math.round(stroke[1]*255)},${Math.round(stroke[2]*255)},${stroke[3]})`;
      if (ctx.strokeStyle !== ss) ctx.strokeStyle = ss;
      if (maxWidth !== undefined) ctx.strokeText(str, x, y, maxWidth);
      else ctx.strokeText(str, x, y);
    }
    if (!this._noFill && fill[3] > 0) {
      const fs = `rgba(${Math.round(fill[0]*255)},${Math.round(fill[1]*255)},${Math.round(fill[2]*255)},${fill[3]})`;
      if (ctx.fillStyle !== fs) ctx.fillStyle = fs;
      if (maxWidth !== undefined) ctx.fillText(str, x, y, maxWidth);
      else ctx.fillText(str, x, y);
    }
    ctx.globalAlpha = 1;
    this._textDirty = true;
    void surfW; void surfH;
  }

  measureTextWidth(str: string): number {
    if (!this._text2d) return 0;
    this._text2d.font = this._computedFont;
    return this._text2d.measureText(str).width;
  }

  clearTextCanvas() { this._textDirty = false; }

  private _flushTextToGPU(s: KlintGPUSurface) {
    if (!this._textDirty || !this._textCanvas || !this._textTex || !this._textTexBG) return;
    const w = s.width, h = s.height;
    try {
      this.device.queue.copyExternalImageToTexture(
        {source: this._textCanvas, flipY: false},
        {texture: this._textTex},
        [w, h],
      );
    } catch { /* silently ignore if canvas not ready */ }
    // Draw text overlay as full-canvas image using src-over blend (loadOp:'load')
    // Lazy-create persistent uniform buffer (avoids per-frame createBuffer)
    if (!this._textOverlayUniBuf) {
      this._textOverlayUniBuf = this.device.createBuffer({size:32, usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
      this._textOverlayUniBG  = this.device.createBindGroup({
        layout: this.imgUniLayout,
        entries: [{binding:0, resource:{buffer:this._textOverlayUniBuf}}],
      });
    }
    const sc = this._uniformScratch;
    sc[0]=w; sc[1]=h; sc[2]=0; sc[3]=0; sc[4]=w; sc[5]=h; sc[6]=1; sc[7]=0;
    this.device.queue.writeBuffer(this._textOverlayUniBuf!, 0, sc, 0, 8);
    const uniBG = this._textOverlayUniBG!;
    const tex = s.gpuCtx.getCurrentTexture().createView();
    const enc = this.device.createCommandEncoder();
    const pass = enc.beginRenderPass({colorAttachments:[{view:tex, loadOp:'load', storeOp:'store'}]});
    pass.setPipeline(this.imgPipeline);
    pass.setBindGroup(0, this._textTexBG!);
    pass.setBindGroup(1, uniBG);
    pass.draw(6, 1, 0, 0);
    pass.end();
    this.device.queue.submit([enc.finish()]);
  }

  // ── Particle compute pipeline ─────────────────────────────────────────────
  private particleComputeBgl!: GPUBindGroupLayout;
  private particleComputePipeline!: GPUComputePipeline;
  /** Pending particle systems to render this frame */
  private _pendingParticles: Array<{ps: GPUParticleSystem; blend: BlendGroup}> = [];

  private constructor(device: GPUDevice, aaMethod: AaMethod, alphaMode: AlphaMode) {
    this.device = device;
    this.aaMethod = aaMethod;
    this.alphaMode = alphaMode;
  }

  // ─── Static factory ───────────────────────────────────────────────────────

  static async init(opts: {aaMethod?: AaMethod; alphaMode?: AlphaMode} = {}): Promise<WebGPURenderer> {
    if (!navigator.gpu) throw new Error('WebGPU not supported');
    const adapter = await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
    if (!adapter) throw new Error('No WebGPU adapter found');
    const device = await adapter.requestDevice();
    const r = new WebGPURenderer(device, opts.aaMethod ?? AaMethod.Quality, opts.alphaMode ?? AlphaMode.Premultiplied);
    await r._buildPipelines();
    return r;
  }

  // ─── Surface management ───────────────────────────────────────────────────

  addCanvas(canvas: HTMLCanvasElement, dpr = window.devicePixelRatio || 1): KlintGPUSurface {
    const gpuCtx = canvas.getContext('webgpu') as GPUCanvasContext;
    if (!gpuCtx) throw new Error('Failed to get WebGPU context');
    this.format = navigator.gpu.getPreferredCanvasFormat();
    gpuCtx.configure({
      device: this.device,
      format: this.format,
      alphaMode: this.alphaMode === AlphaMode.Opaque ? 'opaque' : 'premultiplied',
    });
    const surface: KlintGPUSurface = {
      __offscreen: false,
      canvas, gpuCtx, dpr,
      width:  canvas.width,
      height: canvas.height,
    };
    this.surfaces.push(surface);
    return surface;
  }

  removeCanvas(canvas: HTMLCanvasElement) {
    this.surfaces = this.surfaces.filter(s => s.canvas !== canvas);
  }

  resizeSurface(surface: KlintGPUSurface, w: number, h: number, dpr: number) {
    surface.canvas.width  = Math.floor(w * dpr);
    surface.canvas.height = Math.floor(h * dpr);
    surface.canvas.style.width  = `${w}px`;
    surface.canvas.style.height = `${h}px`;
    surface.width  = surface.canvas.width;
    surface.height = surface.canvas.height;
    surface.dpr    = dpr;
  }

  createOffscreenSurface(id: string, width: number, height: number, dpr = 1): KlintGPUOffscreenSurface {
    const w = Math.floor(width * dpr), h = Math.floor(height * dpr);
    // Destroy old if re-created
    const old = this.offscreenMap.get(id);
    if (old) { old.texture.destroy(); this.offscreenMap.delete(id); }

    const texture = this.device.createTexture({
      size: {width: w, height: h},
      format: this.format,
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
      label: `offscreen-${id}`,
    });
    const view = texture.createView();
    const surface: KlintGPUOffscreenSurface = {__offscreen:true, texture, view, width:w, height:h, dpr};
    this.offscreenMap.set(id, surface);

    // Register in imgTextures so image(id,...) works
    const bg = this.device.createBindGroup({
      layout: this.imgBgl,
      entries: [
        {binding:0, resource:this.imgSampler},
        {binding:1, resource:view},
      ],
    });
    this.imgTextures.set(id, {tex: texture, bg});
    return surface;
  }

  getOffscreenSurface(id: string): KlintGPUOffscreenSurface | null {
    return this.offscreenMap.get(id) ?? null;
  }

  // ─── Render state ─────────────────────────────────────────────────────────

  private _lastFillCss = '';
  private _lastStrokeCss = '';

  // ── Drawing state stack (saved/restored by push()/pop()) ─────────────────
  // This mirrors Canvas2D ctx.save()/ctx.restore() which saves all drawing state
  private _drawStateStack: Array<{
    fill: [number,number,number,number]; stroke: [number,number,number,number];
    strokeW: number; cornerR: number; opacity: number;
    noFill: boolean; noStroke: boolean;
    gradient: KlintGradient | undefined; blendGroup: BlendGroup;
    // Text state (Canvas2D ctx.save() also saves font properties)
    textFont: string; textSize: number; textStyle: string; textWeight: string;
    textLeading: number; textAlignH: CanvasTextAlign; textAlignV: CanvasTextBaseline;
  }> = [];
  private _drawStateDepth = 0;

  /** Save all drawing state (called from context push()) */
  pushDrawState() {
    if (this._drawStateDepth >= this._drawStateStack.length) {
      this._drawStateStack.push({
        fill:[1,1,1,1], stroke:[0,0,0,0], strokeW:0, cornerR:0, opacity:1,
        noFill:false, noStroke:true, gradient:undefined, blendGroup:0,
        textFont:'sans-serif', textSize:32, textStyle:'normal', textWeight:'normal',
        textLeading:0, textAlignH:'left', textAlignV:'alphabetic',
      });
    }
    const s = this._drawStateStack[this._drawStateDepth++];
    s.fill[0]=this._fill[0]; s.fill[1]=this._fill[1]; s.fill[2]=this._fill[2]; s.fill[3]=this._fill[3];
    s.stroke[0]=this._stroke[0]; s.stroke[1]=this._stroke[1]; s.stroke[2]=this._stroke[2]; s.stroke[3]=this._stroke[3];
    s.strokeW=this._strokeW; s.cornerR=this._cornerR; s.opacity=this._opacity;
    s.noFill=this._noFill; s.noStroke=this._noStroke;
    s.gradient=this._gradient; s.blendGroup=this._blendGroup;
    // Save text state
    s.textFont=this._textFont; s.textSize=this._textSize; s.textStyle=this._textStyle;
    s.textWeight=this._textWeight; s.textLeading=this._textLeading;
    s.textAlignH=this._textAlignH; s.textAlignV=this._textAlignV;
  }
  /** Restore all drawing state (called from context pop()) */
  popDrawState() {
    if (this._drawStateDepth <= 0) return;
    const s = this._drawStateStack[--this._drawStateDepth];
    this._fill[0]=s.fill[0]; this._fill[1]=s.fill[1]; this._fill[2]=s.fill[2]; this._fill[3]=s.fill[3];
    this._stroke[0]=s.stroke[0]; this._stroke[1]=s.stroke[1]; this._stroke[2]=s.stroke[2]; this._stroke[3]=s.stroke[3];
    this._strokeW=s.strokeW; this._cornerR=s.cornerR; this._opacity=s.opacity;
    this._noFill=s.noFill; this._noStroke=s.noStroke;
    this._gradient=s.gradient; this._blendGroup=s.blendGroup;
    // Restore text state and recompute font string
    this._textFont=s.textFont; this._textSize=s.textSize; this._textStyle=s.textStyle;
    this._textWeight=s.textWeight; this._textLeading=s.textLeading;
    this._textAlignH=s.textAlignH; this._textAlignV=s.textAlignV;
    this.computeFont();
    // Invalidate CSS caches after restore
    this._lastFillCss = ''; this._lastStrokeCss = '';
  }
  setFill(css: string) {
    if (css !== this._lastFillCss) {
      const c = parseCSSColor(css);
      this._fill[0]=c[0]; this._fill[1]=c[1]; this._fill[2]=c[2]; this._fill[3]=c[3];
      this._lastFillCss = css;
    }
    this._noFill = false; this._gradient = undefined;
  }
  setNoFill()            { this._noFill = true; }
  setStroke(css: string) {
    if (css !== this._lastStrokeCss) {
      const c = parseCSSColor(css);
      this._stroke[0]=c[0]; this._stroke[1]=c[1]; this._stroke[2]=c[2]; this._stroke[3]=c[3];
      this._lastStrokeCss = css;
    }
    this._noStroke = false;
  }
  setNoStroke()          { this._noStroke = true; }
  setStrokeWidth(w: number) { this._strokeW = Math.max(0, w); if (w <= 0) this._noStroke = true; }
  setCornerRadius(r: number) { this._cornerR = r; }
  setOpacity(a: number)  { this._opacity = Math.max(0, Math.min(1, a)); }
  setBackground(css: string) {
    const [r,g,b,a] = parseCSSColor(css);
    this._bgColor = {r,g,b,a};
    // Track if background is semi-transparent for trails effect
    this._bgSemiTransparent = (a > 0.001 && a < 0.999);
  }
  _bgSemiTransparent = false; // exposed for context use (clear() save/restore)
  /** Persistent 6-vertex buffer for the bg rect (avoids per-frame allocation) */
  private _bgTriBuf: GPUBuffer | null = null;
  private _bgTriSize = 0;
  // Scratch buffer for the bg rect draw (avoids O(n) unshift on commands array)


  setLinearGradient(x1:number,y1:number,x2:number,y2:number,c1:string,c2:string, stops?: Array<{offset:number;color:string}>) {
    this._gradient = {type:1, x1,y1,x2,y2, color1:parseCSSColor(c1), color2:parseCSSColor(c2)};
    if (stops && stops.length > 2) this._gradient._stops = stops;
    this._noFill = false;
  }
  setRadialGradient(cx:number,cy:number,r0:number,r1:number,c1:string,c2:string, stops?: Array<{offset:number;color:string}>) {
    this._gradient = {type:2, x1:cx,y1:cy,x2:r0,y2:r1, color1:parseCSSColor(c1), color2:parseCSSColor(c2)};
    if (stops && stops.length > 2) this._gradient._stops = stops;
    this._noFill = false;
  }
  setConicGradient(cx:number,cy:number,angle:number,c1:string,c2:string, stops?: Array<{offset:number;color:string}>) {
    this._gradient = {type:3, x1:cx,y1:cy,x2:angle,y2:0, color1:parseCSSColor(c1), color2:parseCSSColor(c2)};
    if (stops && stops.length > 2) this._gradient._stops = stops;
    this._noFill = false;
  }

  setBlendMode(mode: 'source-over' | 'add' | 'opaque') {
    this._blendGroup = mode === 'add' ? 1 : 0;
  }

  addFilter(mode: number, strength: number) { this._filters.push({mode, strength}); }
  clearFilters() { this._filters = []; }

  // ─── Draw commands ────────────────────────────────────────────────────────

  /** Cache the current transform scaleX to avoid redundant sqrt() calls in _push(). */
  cacheScale() { this._cachedScale = this.transform.scaleX(); this._cachedScaleY = this.transform.scaleY(); }

  private _push(cmd: Pick<DrawCommand,'type'|'px'|'py'|'sx'|'sy'>) {
    // Scale strokeW and cornerR by the current transform scale (includes dpr + user scale).
    // Uses cached scale to avoid redundant Math.sqrt calls at N=50k shapes/frame.
    const s = this._cachedScale;
    const n = this.commands.length;
    // Reuse pooled object or create new
    let dc = this._cmdPool[n];
    if (!dc) {
      dc = {type:0,px:0,py:0,sx:0,sy:0,fill:[0,0,0,0],stroke:[0,0,0,0],strokeW:0,cornerR:0,opacity:1,gradient:undefined,blendGroup:0,clipId:-1,isClipMask:false};
      this._cmdPool[n] = dc;
    }
    dc.type       = cmd.type; dc.px = cmd.px; dc.py = cmd.py; dc.sx = cmd.sx; dc.sy = cmd.sy;
    const f = this._noFill   ? _ZERO4 : this._fill;
    const st= this._noStroke ? _ZERO4 : this._stroke;
    dc.fill[0]=f[0]; dc.fill[1]=f[1]; dc.fill[2]=f[2]; dc.fill[3]=f[3];
    dc.stroke[0]=st[0]; dc.stroke[1]=st[1]; dc.stroke[2]=st[2]; dc.stroke[3]=st[3];
    dc.strokeW    = this._noStroke ? 0 : this._strokeW * s;
    dc.cornerR    = this._cornerR * s;
    dc.opacity    = this._opacity;
    dc.gradient   = this._gradient;
    dc.blendGroup = this._blendGroup;
    dc.clipId     = this._currentClipId;
    dc.isClipMask = this._isRecordingMask;
    this.commands.push(dc);
    // Incrementally update hashes for O(1) cache validity checks
    const sortKey = (dc.blendGroup<<3) | ((dc.strokeW>0 && dc.stroke[3]>0)?4:0) | dc.type;
    const pos = this.commands.length;
    this._sortKeyHash ^= (sortKey * 0x9e3779b9 + pos) | 0;
    // Stat hash: mix fill color channels + opacity + stroke + gradient presence
    const fh = ((dc.fill[0]*255)|0) ^ (((dc.fill[1]*255)|0)<<8) ^ (((dc.fill[2]*255)|0)<<16) ^ (((dc.fill[3]*255)|0)<<24);
    const sh = ((dc.stroke[3]*255)|0) ^ (((dc.strokeW*8)|0)<<8);
    const gh = dc.gradient ? (dc.gradient.type * 7919) : 0;
    this._statDataHash ^= ((fh ^ sh ^ gh ^ ((dc.opacity*255)|0)) * 0x9e3779b9 + pos) | 0;
    // Dyn hash: mix position + size
    const dh = ((dc.px*4)|0) ^ (((dc.py*4)|0)<<16);
    const dh2 = ((dc.sx*8)|0) ^ (((dc.sy*8)|0)<<16);
    this._dynDataHash ^= ((dh ^ dh2) * 0x9e3779b9 + pos) | 0;
    if (this._blendGroup === 1) this._hasAdditiveBlend = true;
    if (this._currentClipId >= 0) this._hasClips = true;
    if (this._gradient) this._hasGradients = true;
  }

  /** Called by context.clipTo() — runs the mask callback, then activates the clip. */
  beginClipMask(): number {
    const id = this._nextClipId++;
    this._isRecordingMask = true;
    this._currentClipId   = id;
    return id;
  }
  endClipMask(id: number) {
    this._isRecordingMask = false;
    this._currentClipId   = id; // content will now be clipped to this id
  }
  /** Called by context.pop() to restore clip scope. */
  setClipId(id: number) { this._currentClipId = id; }

  circle(x: number, y: number, r: number, r2?: number) {
    this.transform.applyXY(x, y, this._applyOut);
    const sx = r  * this._cachedScale;
    const sy = (r2 ?? r) * this._cachedScaleY;
    this._push({type:SHAPE_TYPE.CIRCLE, px:this._applyOut.x, py:this._applyOut.y, sx, sy});
  }

  rect(x: number, y: number, w: number, h: number, cornerR?: number) {
    this.transform.applyXY(x + w/2, y + h/2, this._applyOut);
    const sx = (w/2) * this._cachedScale;
    const sy = (h/2) * this._cachedScaleY;
    if (cornerR !== undefined) this._cornerR = cornerR;
    this._push({type:SHAPE_TYPE.RECT, px:this._applyOut.x, py:this._applyOut.y, sx, sy});
    if (cornerR !== undefined) this._cornerR = 0;
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    const cx = (x1+x2)/2, cy = (y1+y2)/2;
    this.transform.applyXY(cx, cy, this._applyOut);
    const lpx = this._applyOut.x, lpy = this._applyOut.y;
    this.transform.applyXY(x1, y1, this._applyOut);
    this._push({type:SHAPE_TYPE.LINE, px:lpx, py:lpy, sx:this._applyOut.x-lpx, sy:this._applyOut.y-lpy});
  }

  point(x: number, y: number) {
    this.transform.applyXY(x, y, this._applyOut);
    this._push({type:SHAPE_TYPE.POINT, px:this._applyOut.x, py:this._applyOut.y, sx:0, sy:0});
  }

  polygon(cx: number, cy: number, sides: number, radius: number, radius2?: number, rotation = 0) {
    if (this._noFill && this._noStroke) return;
    const ry = radius2 ?? radius; // support elliptical polygon (radius2 = y-radius)
    const verts = this._polyVerts;
    verts.length = 0;
    for (let i = 0; i < sides; i++) {
      const a = rotation + (i / sides) * Math.PI * 2;
      verts.push(cx + Math.cos(a)*radius, cy + Math.sin(a)*ry);
    }
    // Regular polygon is convex → use fast fan triangulation
    if (!this._noFill) this._fanFill(verts, true);
    if (!this._noStroke && this._strokeW > 0) {
      // Transform to device px first (strokePolyline expects device px coordinates)
      const n = verts.length / 2;
      const dverts = new Array(n * 2);
      for (let i = 0; i < n; i++) {
        this.transform.applyXY(verts[i*2], verts[i*2+1], this._applyOut); const tx = this._applyOut.x, ty = this._applyOut.y;
        dverts[i*2] = tx; dverts[i*2+1] = ty;
      }
      this._strokePolyline(dverts, true);
    }
  }

  /** Fast fan triangulation from vertex 0 — O(N), correct for CONVEX polygons only */
  private _fanFill(verts: number[], transform: boolean) {
    const n = verts.length / 2;
    if (n < 3) return;
    // Use gradient midpoint color if gradient is active (triangle VBO doesn't support gradients)
    const fill = this._gradient
      ? [this._gradient.color1[0]*0.5+this._gradient.color2[0]*0.5,
         this._gradient.color1[1]*0.5+this._gradient.color2[1]*0.5,
         this._gradient.color1[2]*0.5+this._gradient.color2[2]*0.5,
         this._gradient.color1[3]*0.5+this._gradient.color2[3]*0.5] as [number,number,number,number]
      : this._fill;
    const op = this._opacity;
    const pa = fill[0]*fill[3]*op, pb = fill[1]*fill[3]*op, pc = fill[2]*fill[3]*op, pd = fill[3]*op;
    const tris = this._triVerts;
    // Transform all vertices once (avoid repeated transform per triangle)
    let pts: ArrayLike<number>;
    if (transform) {
      const need = n * 2;
      if (need > this._fanFillTverts.length) {
        this._fanFillTverts = new Float32Array(need * 2);
      }
      const tv = this._fanFillTverts;
      for (let i = 0; i < n; i++) {
        this.transform.applyXY(verts[i*2], verts[i*2+1], this._applyOut); const tx = this._applyOut.x, ty = this._applyOut.y;
        tv[i*2] = tx; tv[i*2+1] = ty;
      }
      pts = tv;
    } else {
      pts = verts;
    }
    const x0 = pts[0], y0 = pts[1];
    for (let i = 1; i < n-1; i++) {
      const x1=pts[i*2], y1=pts[i*2+1], x2=pts[(i+1)*2], y2=pts[(i+1)*2+1];
      tris.push(x0,y0,pa,pb,pc,pd, x1,y1,pa,pb,pc,pd, x2,y2,pa,pb,pc,pd);
    }
    this._shapeBlend = this._blendGroup;
  }

  // ─── Shape builder (beginShape / vertex / endShape) ───────────────────────

  private _shapeBuilding = false;
  private _shapeRaw:    number[] = [];
  private _shapeCurves: Array<{type:string;cp1x:number;cp1y:number;cp2x?:number;cp2y?:number;x:number;y:number}> = [];

  beginShape() {
    this._shapeBuilding = true;
    this._shapeRaw.length = 0;   // reuse backing array
    this._shapeCurves.length = 0;
  }

  vertex(x: number, y: number) {
    this.transform.applyXY(x, y, this._applyOut);
    this._shapeRaw.push(this._applyOut.x, this._applyOut.y);
  }

  bezierVertex(cp1x:number,cp1y:number,cp2x:number,cp2y:number,x:number,y:number) {
    // Tessellate cubic bezier — all points transformed to device px first
    const prev = this._shapeRaw;
    if (prev.length < 2) return;
    const x0 = prev[prev.length-2], y0 = prev[prev.length-1]; // already device px
    this.transform.applyXY(cp1x, cp1y, this._applyOut); const c1x=this._applyOut.x, c1y=this._applyOut.y;
    this.transform.applyXY(cp2x, cp2y, this._applyOut); const c2x=this._applyOut.x, c2y=this._applyOut.y;
    this.transform.applyXY(x, y, this._applyOut); const ex=this._applyOut.x, ey=this._applyOut.y;
    const STEPS = 16;
    for (let i = 1; i <= STEPS; i++) {
      const t = i/STEPS, u = 1-t;
      const bx = u*u*u*x0 + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*ex;
      const by = u*u*u*y0 + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*ey;
      this._shapeRaw.push(bx, by);
    }
  }

  quadraticVertex(cpx:number,cpy:number,x:number,y:number) {
    const prev = this._shapeRaw;
    if (prev.length < 2) return;
    const x0 = prev[prev.length-2], y0 = prev[prev.length-1]; // already device px
    this.transform.applyXY(cpx, cpy, this._applyOut); const cx=this._applyOut.x, cy=this._applyOut.y;
    this.transform.applyXY(x, y, this._applyOut); const ex=this._applyOut.x, ey=this._applyOut.y;
    const STEPS = 12;
    for (let i = 1; i <= STEPS; i++) {
      const t = i/STEPS, u = 1-t;
      const bx = u*u*x0 + 2*u*t*cx + t*t*ex;
      const by = u*u*y0 + 2*u*t*cy + t*t*ey;
      this._shapeRaw.push(bx, by);
    }
  }

  endShape(close = false) {
    if (!this._shapeBuilding) return;
    this._shapeBuilding = false;
    const verts = this._shapeRaw;
    if (verts.length < 4) return;
    if (close && !this._noFill) this._earFill(verts, false);
    if (!this._noStroke && this._strokeW > 0) this._strokePolyline(verts, close);
  }

  // ─── Triangle helpers ─────────────────────────────────────────────────────

  /** Simple ear-clip triangulation for convex and simple polygons */
  private _earFill(verts: number[], transform: boolean) {
    const n = verts.length / 2;
    if (n < 3) return;
    if (this._noFill) return;
    // Use gradient midpoint color if gradient is active
    const fill = this._gradient
      ? [this._gradient.color1[0]*0.5+this._gradient.color2[0]*0.5,
         this._gradient.color1[1]*0.5+this._gradient.color2[1]*0.5,
         this._gradient.color1[2]*0.5+this._gradient.color2[2]*0.5,
         this._gradient.color1[3]*0.5+this._gradient.color2[3]*0.5] as [number,number,number,number]
      : this._fill;
    const [r,g,b,a] = fill;
    const op = this._opacity;
    const pa = r*a*op, pb = g*a*op, pc = b*a*op, pd = a*op;
    const tris = this._triVerts;

    // Transform verts first if needed — reuse persistent pts array
    const pts = this._earPts;
    pts.length = n * 2;
    if (transform) {
      for (let i = 0; i < n; i++) {
        this.transform.applyXY(verts[i*2], verts[i*2+1], this._applyOut); const tx = this._applyOut.x, ty = this._applyOut.y;
        pts[i*2] = tx; pts[i*2+1] = ty;
      }
    } else {
      for (let i = 0; i < n * 2; i++) pts[i] = verts[i];
    }

    // Ear-clipping triangulation — reuse persistent index array
    const idx = this._earIdx;
    idx.length = n;
    for (let i = 0; i < n; i++) idx[i] = i;

    const cross2D = (ax:number,ay:number,bx:number,by:number,cx:number,cy:number) =>
      (bx-ax)*(cy-ay) - (by-ay)*(cx-ax);
    const pointInTriangle = (px:number,py:number,ax:number,ay:number,bx:number,by:number,cx:number,cy:number) => {
      const d1 = cross2D(ax,ay,bx,by,px,py);
      const d2 = cross2D(bx,by,cx,cy,px,py);
      const d3 = cross2D(cx,cy,ax,ay,px,py);
      const hasNeg = (d1<0)||(d2<0)||(d3<0);
      const hasPos = (d1>0)||(d2>0)||(d3>0);
      return !(hasNeg && hasPos);
    };

    // Determine winding
    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = (i+1)%n;
      area += pts[i*2]*pts[j*2+1] - pts[j*2]*pts[i*2+1];
    }
    const ccw = area > 0;

    let remaining = idx.length;
    let maxIter = remaining * 2 + 16;
    let i = 0;
    while (remaining > 3 && maxIter-- > 0) {
      const im = i % remaining;
      const a0 = idx[im];
      const b0 = idx[(im+1) % remaining];
      const c0 = idx[(im+2) % remaining];
      const ax=pts[a0*2],ay=pts[a0*2+1],bx=pts[b0*2],by=pts[b0*2+1],cx=pts[c0*2],cy=pts[c0*2+1];
      const ear = ccw ? cross2D(ax,ay,bx,by,cx,cy) > 0 : cross2D(ax,ay,bx,by,cx,cy) < 0;
      if (ear) {
        // Check no other vertex inside this triangle
        let inside = false;
        for (let k = 0; k < remaining; k++) {
          const ki = idx[k];
          if (ki===a0||ki===b0||ki===c0) continue;
          if (pointInTriangle(pts[ki*2],pts[ki*2+1],ax,ay,bx,by,cx,cy)) { inside=true; break; }
        }
        if (!inside) {
          tris.push(ax,ay,pa,pb,pc,pd, bx,by,pa,pb,pc,pd, cx,cy,pa,pb,pc,pd);
          idx.splice((im+1)%remaining, 1);
          remaining--;
          continue;
        }
      }
      i++;
    }
    // Last triangle
    if (remaining === 3) {
      const [a0,b0,c0] = idx;
      tris.push(pts[a0*2],pts[a0*2+1],pa,pb,pc,pd, pts[b0*2],pts[b0*2+1],pa,pb,pc,pd, pts[c0*2],pts[c0*2+1],pa,pb,pc,pd);
    }
    this._shapeBlend = this._blendGroup;
  }

  /** Tessellate polyline into triangle strip (for stroke) */
  private _strokePolyline(verts: number[], close: boolean) {
    if (this._noStroke) return;
    const n = verts.length / 2;
    const sw = this._strokeW * this._cachedScale * 0.5;
    const [r,g,b,a] = this._stroke;
    const op = this._opacity;
    const pa = r*a*op, pb = g*a*op, pc = b*a*op, pd = a*op;
    const tris = this._triVerts;

    for (let i = 0; i < n - (close ? 0 : 1); i++) {
      const j = i, k = (i+1)%n;
      const x1=verts[j*2],y1=verts[j*2+1],x2=verts[k*2],y2=verts[k*2+1];
      const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy);
      if (len < 0.001) continue;
      const nx=(-dy/len)*sw, ny=(dx/len)*sw;
      tris.push(
        x1-nx,y1-ny,pa,pb,pc,pd, x1+nx,y1+ny,pa,pb,pc,pd, x2+nx,y2+ny,pa,pb,pc,pd,
        x1-nx,y1-ny,pa,pb,pc,pd, x2+nx,y2+ny,pa,pb,pc,pd, x2-nx,y2-ny,pa,pb,pc,pd,
      );
    }
  }

  // ─── Image pipeline ───────────────────────────────────────────────────────

  async loadImage(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const bitmap = await createImageBitmap(img);
          const tex = this.device.createTexture({
            size: {width: bitmap.width, height: bitmap.height},
            format: this.format,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
          });
          this.device.queue.copyExternalImageToTexture(
            {source: bitmap},
            {texture: tex},
            [bitmap.width, bitmap.height],
          );
          const bg = this.device.createBindGroup({
            layout: this.imgBgl,
            entries: [{binding:0,resource:this.imgSampler},{binding:1,resource:tex.createView()}],
          });
          this.imgTextures.set(key, {tex, bg});
          resolve();
        } catch (e) { reject(e); }
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  loadVideoTexture(key: string, video: HTMLVideoElement) {
    const tex = this.device.createTexture({
      size: {width: video.videoWidth||2, height: video.videoHeight||2},
      format: this.format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const bg = this.device.createBindGroup({
      layout: this.imgBgl,
      entries: [{binding:0,resource:this.imgSampler},{binding:1,resource:tex.createView()}],
    });
    this.imgTextures.set(key, {tex, bg});
  }

  updateVideoFrame(key: string, video: HTMLVideoElement) {
    const entry = this.imgTextures.get(key);
    if (!entry || !video.videoWidth || !video.videoHeight) return;
    // Recreate texture if size changed (e.g., after video metadata loads)
    if (entry.tex.width !== video.videoWidth || entry.tex.height !== video.videoHeight) {
      entry.tex.destroy();
      entry.tex = this.device.createTexture({
        size: {width: video.videoWidth, height: video.videoHeight},
        format: this.format,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      entry.bg = this.device.createBindGroup({
        layout: this.imgBgl,
        entries: [{binding:0,resource:this.imgSampler},{binding:1,resource:entry.tex.createView()}],
      });
      // Also update cached img uniform bind group if present
      this._imgUniCache.get(key)?.buf.destroy();
      this._imgUniCache.delete(key);
    }
    this.device.queue.copyExternalImageToTexture(
      {source: video},
      {texture: entry.tex},
      [video.videoWidth, video.videoHeight],
    );
  }

  drawImage(key: string, x: number, y: number, w: number, h: number, opacity = 1) {
    if (!this.imgTextures.has(key)) return;
    this.transform.applyXY(x, y, this._applyOut);
    const sx = w * this._cachedScale;
    const sy = h * this._cachedScaleY;
    this._imgDraws.push({key, x:this._applyOut.x, y:this._applyOut.y, w:sx, h:sy, opacity, blendGroup:this._blendGroup});
  }

  // ─── GPU Particle system ──────────────────────────────────────────────────

  createParticleSystem(N: number, data: ParticleInitData, dpr = 1): GPUParticleSystem {
    // All particle data in device pixels (CSS px inputs scaled by dpr)
    const PARTICLE_FLOATS = 6;
    const particleData = new Float32Array(N * PARTICLE_FLOATS);
    for (let i = 0; i < N; i++) {
      const off = i * PARTICLE_FLOATS;
      particleData[off+0] = (data.positions[i*2]   ?? Math.random()*800) * dpr;
      particleData[off+1] = (data.positions[i*2+1] ?? Math.random()*600) * dpr;
      particleData[off+2] = (data.velocities[i*2]   ?? (Math.random()-0.5)*2) * dpr;
      particleData[off+3] = (data.velocities[i*2+1] ?? (Math.random()-0.5)*2) * dpr;
      particleData[off+4] = (data.radii[i] ?? 4) * dpr;
      particleData[off+5] = Math.random() * Math.PI * 2;
    }
    const particleBuf = this.device.createBuffer({
      size: particleData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(particleBuf, 0, particleData);

    // Dyn buffer: [pos.x, pos.y, size.x, size.y] per particle (written by compute)
    const dynBuf = this.device.createBuffer({
      size: N * DYN_STRIDE,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    // Stat buffer: fill/stroke/etc per particle
    const statData = new ArrayBuffer(N * STAT_STRIDE);
    const statView = new DataView(statData);
    for (let i = 0; i < N; i++) {
      const off = i * STAT_STRIDE;
      const [r,g,b,a] = parseCSSColor(data.colors[i] ?? '#fff');
      // fill (0-15) — premultiplied to match _uploadStat behaviour
      statView.setFloat32(off+0,  r*a, true); statView.setFloat32(off+4,  g*a, true);
      statView.setFloat32(off+8,  b*a, true); statView.setFloat32(off+12, a,   true);
      // stroke (16-31) — zero
      // fill2 (32-47) — same as fill (premultiplied)
      statView.setFloat32(off+32, r*a, true); statView.setFloat32(off+36, g*a, true);
      statView.setFloat32(off+40, b*a, true); statView.setFloat32(off+44, a,   true);
      // strokeW, cornerR, shapeType, opacity (48-63)
      statView.setFloat32(off+48, 0, true);  // strokeW
      statView.setFloat32(off+52, 0, true);  // cornerR
      statView.setUint32( off+56, SHAPE_TYPE.CIRCLE, true);
      statView.setFloat32(off+60, 1, true);  // opacity
      // gradType, pad, gradDir, gradStart (64-87)
      // blend_group (88)
    }
    const statBuf = this.device.createBuffer({
      size: statData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(statBuf, 0, statData);

    // Sim uniform: [W, H, tStep, pad]
    const simBuf = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Compute bind group
    const computeBG = this.device.createBindGroup({
      layout: this.particleComputeBgl,
      entries: [
        {binding:0, resource:{buffer:particleBuf}},
        {binding:1, resource:{buffer:dynBuf}},
        {binding:2, resource:{buffer:simBuf}},
      ],
    });

    // Render bind groups — use helper so LUT bindings (3,4) are included
    const renderBG    = this.createSdfBindGroup(dynBuf, statBuf);
    const renderBGAdd = this.createSdfBindGroup(dynBuf, statBuf);

    return new GPUParticleSystem({
      N, computePipeline: this.particleComputePipeline, computeBG,
      particleBuf, dynBuf, statBuf, simBuf, renderBG, renderBGAdd,
    });
  }

  renderParticles(ps: GPUParticleSystem) {
    this._pendingParticles.push({ps, blend: this._blendGroup});
  }

  // ─── Frame lifecycle ──────────────────────────────────────────────────────

  beginFrame() {
    this.commands.length = 0;  // reuse array
    this._triVerts.length = 0;
    this._imgDraws.length = 0;
    this._filters.length  = 0;
    this._pendingParticles.length = 0;
    this._gradient  = undefined;
    this._blendGroup = 0;
    this._currentClipId      = -1;
    this._isRecordingMask    = false;
    this._nextClipId         = 0;
    this._hasAdditiveBlend   = false;
    this._hasClips           = false;
    this._hasGradients       = false;
    this._sortKeyHash        = 0;
    this._statDataHash       = 0;
    this._dynDataHash        = 0;
    this.transform.reset();
    this._drawStateDepth = 0; // reset draw state stack (unbalanced push/pop safe)
    this.clipIdStack.length = 0; // reset clip ID stack
    // Clear text canvas for this frame
    if (this._text2d && this._textCanvas) {
      this._text2d.clearRect(0, 0, this._textCanvas.width, this._textCanvas.height);
      this._textDirty = false;
    }
  }

  render(surface?: KlintGPUSurface) {
    const targets = surface ? [surface] : this.surfaces;
    if (!targets.length) return;

    if (!this.commands.length && !this._triVerts.length && !this._imgDraws.length && !this._pendingParticles.length) {
      for (const s of targets) this._clear(s);
      // Still flush text if dirty (text-only frames)
      if (this._textDirty) {
        for (const s of targets) {
          this._ensureTextCanvas(s.width, s.height);
          this._flushTextToGPU(s);
        }
      }
      return;
    }

    // Split commands: clip vs non-clip (use O(1) flag instead of O(N) .some())
    const hasClips = this._hasClips;
    const mainCmds = hasClips ? this.commands.filter(c => c.clipId < 0) : this.commands;
    const savedCmds = this.commands;
    if (hasClips) this.commands = mainCmds;

    // Upload geometry (non-clipped)
    this._growIfNeeded();
    if (this.commands.length) {
      if (this.aaMethod === AaMethod.Fast) this._sortFast();
      this._uploadDyn();
      this._uploadStat();
    }
    this._uploadTri();
    // Separately store bg rect (avoids O(n) unshift on triVerts)
    this._uploadBgRect(targets);

    for (const s of targets) {
      this._updateUniforms(s);
      if (this._filters.length > 0) {
        this._ensureFilterTex(s.width, s.height);
        this._renderPassToView(this._filterTex!.createView(), s.width, s.height);
        this._applyFilters(s);
      } else {
        this._renderPass(s);
      }
    }

    // Process clip batches (stencil-based, renders on top of main content)
    if (hasClips) {
      this.commands = savedCmds;
      for (const s of targets) this._renderClips(s, savedCmds);
    }

    // Run particle compute + render per pending particle system
    this._runParticleRenders(targets);

    // Flush text overlay (Canvas2D → GPUTexture → image pass)
    if (this._textDirty && targets.length > 0) {
      for (const s of targets) {
        this._ensureTextCanvas(s.width, s.height);
        this._flushTextToGPU(s);
      }
    }

    this._imgDraws.length = 0;
  }

  renderOffscreen(id: string) {
    const os = this.offscreenMap.get(id);
    if (!os) return;
    this._growIfNeeded();
    if (this.commands.length) {
      if (this.aaMethod === AaMethod.Fast) this._sortFast();
      this._uploadDyn();
      this._uploadStat();
    }
    this._uploadTri();
    this._updateUniforms2(os.width, os.height, os.dpr);
    this._renderPassToView(os.view, os.width, os.height);
    this._imgDraws.length = 0;
  }

  // ─── Internal: sort ───────────────────────────────────────────────────────

  /** Sort key bits: [blendGroup(1)] [hasStroke(1)] [type(2)] = 4 bits  */
  private _sortFast() {
    const n = this.commands.length;
    if (n < 2) {
      // 0 or 1 shape: trivial sort, just set identity order
      if (this._sortedOrder.length < 1) this._sortedOrder = new Int32Array(INITIAL_CAPACITY);
      if (n === 1) this._sortedOrder[0] = 0;
      this._sortedOrderLen = n; this._lastSortN = n;
      this._lastSortKeyHash = this._sortKeyHash; this._lastStatDataHash = -1; this._lastDynDataHash = -1;
      return;
    }
    if (n === this._lastSortN && this._sortedOrderLen === n &&
        this._sortKeyHash === this._lastSortKeyHash) {
      return; // O(1) cache check: hash match means same composition → reuse sorted order
    }

    if (this.sortKeys.length < n) this.sortKeys = new Uint8Array(n * 2);
    for (let i = 0; i < n; i++) {
      const c = this.commands[i];
      const hasStroke = (c.strokeW>0 && c.stroke[3]>0) ? 1 : 0;
      this.sortKeys[i] = (c.blendGroup<<3) | (hasStroke<<2) | c.type;
    }

    // Counting sort (O(N) stable) — only 16 possible key values (4 bits)
    const counts = new Uint32Array(16);
    for (let i = 0; i < n; i++) counts[this.sortKeys[i]]++;
    // Convert to prefix sums
    for (let k = 1; k < 16; k++) counts[k] += counts[k-1];
    // Build sorted order (reverse iterate for stability)
    if (this._sortedOrder.length < n) this._sortedOrder = new Int32Array(Math.max(n * 2, INITIAL_CAPACITY));
    for (let i = n-1; i >= 0; i--) {
      const k = this.sortKeys[i];
      this._sortedOrder[--counts[k]] = i;
    }
    this._sortedOrderLen   = n;
    this._lastSortN        = n;
    this._lastSortKeyHash  = this._sortKeyHash;
    // When sort order changes, both dyn and stat buffer order changes → must re-upload
    this._lastStatDataHash = -1;
    this._lastDynDataHash  = -1;
  }

  // ─── Internal: upload ─────────────────────────────────────────────────────

  private _growIfNeeded() {
    const n = this.commands.length;
    if (n > this.dynCapacity) {
      this.dynCapacity = Math.max(n * 2, this.dynCapacity * 2);
      this.statCapacity = this.dynCapacity;
      this.dynBuf.destroy();
      this.statBuf.destroy();
      this.dynBuf  = this.device.createBuffer({size: this.dynCapacity  * DYN_STRIDE,  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST});
      this.statBuf = this.device.createBuffer({size: this.statCapacity * STAT_STRIDE, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST});
      this._rebuildSdfBG();
      this._lastStatDataHash = -1; // new buffer needs a full upload
      this._lastDynDataHash  = -1;
    }
  }

  private _ensureStaging(n: number) {
    if (n > this._stagingCapacity) {
      const cap = Math.max(n * 2, this._stagingCapacity * 2, INITIAL_CAPACITY);
      this._dynStaging     = new Float32Array(new ArrayBuffer(cap * 4 * 4));
      this._statStaging    = new ArrayBuffer(cap * STAT_STRIDE);
      this._statStagingDV  = new DataView(this._statStaging);
      this._statStagingF32 = new Float32Array(this._statStaging);
      this._statStagingU32 = new Uint32Array(this._statStaging);
      this._stagingCapacity = cap;
    }
  }

  private _uploadDyn() {
    const n = this.commands;
    const src = this.aaMethod === AaMethod.Fast ? this._sortedOrder : null;
    // Skip upload when positions are identical to last frame
    if (this._dynDataHash === this._lastDynDataHash) return;
    this._ensureStaging(n.length);
    const data = this._dynStaging!;
    for (let i = 0; i < n.length; i++) {
      const c = n[src ? src[i] : i];
      const o = i * 4;
      data[o+0] = c.px; data[o+1] = c.py;
      data[o+2] = c.sx; data[o+3] = c.sy;
    }
    this.device.queue.writeBuffer(this.dynBuf, 0, data, 0, n.length * 4);
    this._lastDynDataHash = this._dynDataHash;
  }

  private _uploadStat() {
    const n = this.commands;
    const src = this.aaMethod === AaMethod.Fast ? this._sortedOrder : null;

    // Fast path: if stat is identical to last frame AND no gradients, skip entirely
    if (this._statDataHash === this._lastStatDataHash && !this._hasGradients) {
      return; // no gradients, stat unchanged → both GPU buffers valid
    }

    // Build gradient LUT map: unique gradient object → persistent row index (0..MAX-1)
    this._gradMap.clear();
    this._gradDirtyRows.clear();
    if (this._hasGradients) {
    const MAX = WebGPURenderer.MAX_GRAD_LUTS;
    for (const c of n) {
      if (!c.gradient || !c.gradient.type || this._gradMap.has(c.gradient)) continue;
      const g = c.gradient;
      // Compute a cheap content hash: type + color components
      const stops = g._stops;
      const hash = stops ? `${g.type}:${stops.map(s=>`${s.offset}|${s.color}`).join(',')}` :
        `${g.type}:${g.color1.join(',')}:${g.color2.join(',')}`;
      let row = this._gradHashToRow.get(hash);
      if (row === undefined) {
        // New gradient — assign a row (wrap around = LRU eviction)
        row = this._gradNextPersistentRow % MAX;
        this._gradNextPersistentRow++;
        // Evict old hash → row mapping if this row was previously used
        const oldHash = this._gradRowToHash.get(row);
        if (oldHash !== undefined) this._gradHashToRow.delete(oldHash);
        this._gradHashToRow.set(hash, row);
        this._gradRowToHash.set(row, hash);
        this._gradDirtyRows.add(row); // needs rasterization
      }
      // Otherwise: row is cached and already in the LUT — no rasterization needed
      this._gradMap.set(g, row);
    }
    } // end if (_hasGradients)

    // Skip staging fill + GPU upload when style data is identical to last frame
    const statUnchanged = (this._statDataHash === this._lastStatDataHash);
    if (statUnchanged) {
      // LUT may still need rasterization for new gradients even if stat data is same
      if (this._gradDirtyRows.size > 0 && this._gradLUT2d && this._gradLUTCanvas && this._gradLUT) {
        this._rasterizeGradLUT();
      }
      return;
    }

    this._ensureStaging(n.length);
    // Pre-cached typed array views on the staging buffer (no allocation)
    const f32v = this._statStagingF32!;
    const u32v = this._statStagingU32!;
    for (let i = 0; i < n.length; i++) {
      const c = n[src ? src[i] : i];
      const fo = i * 24; // float32 offset (STAT_STRIDE/4 = 96/4 = 24 floats per shape)
      const f = c.fill, s2 = c.stroke;
      const op = c.opacity;
      // fill (floats 0-3)
      f32v[fo+ 0] = f[0]*f[3]*op; f32v[fo+ 1] = f[1]*f[3]*op;
      f32v[fo+ 2] = f[2]*f[3]*op; f32v[fo+ 3] = f[3]*op;
      // stroke (floats 4-7)
      f32v[fo+ 4] = s2[0]*s2[3]; f32v[fo+ 5] = s2[1]*s2[3];
      f32v[fo+ 6] = s2[2]*s2[3]; f32v[fo+ 7] = s2[3];
      // fill2 (floats 8-11)
      const g = c.gradient;
      if (g) {
        const g2 = g.color2;
        f32v[fo+ 8] = g2[0]*g2[3]*op; f32v[fo+ 9] = g2[1]*g2[3]*op;
        f32v[fo+10] = g2[2]*g2[3]*op; f32v[fo+11] = g2[3]*op;
      } else {
        f32v[fo+ 8] = f[0]*f[3]*op; f32v[fo+ 9] = f[1]*f[3]*op;
        f32v[fo+10] = f[2]*f[3]*op; f32v[fo+11] = f[3]*op;
      }
      // strokeW, cornerR (floats 12-13), shapeType as u32 (float 14), opacity=1 (float 15)
      f32v[fo+12] = c.strokeW;
      f32v[fo+13] = c.cornerR;
      u32v[fo+14] = c.type;     // u32 at float index 14 = byte 56
      f32v[fo+15] = 1.0;
      // gradType (u32, float 16), pad (float 17), gradDir (18-19), gradStart (20-21)
      if (g) {
        u32v[fo+16] = g.type;
        f32v[fo+17] = 0;
        if (g.type === 1) {
          f32v[fo+18] = g.x2-g.x1; f32v[fo+19] = g.y2-g.y1;
          f32v[fo+20] = g.x1-c.px; f32v[fo+21] = g.y1-c.py;
        } else if (g.type === 2) {
          f32v[fo+18] = g.x2; f32v[fo+19] = Math.max(g.y2-g.x2, 0.001);
          f32v[fo+20] = g.x1-c.px; f32v[fo+21] = g.y1-c.py;
        } else {
          f32v[fo+18] = g.x2; f32v[fo+19] = 0;
          f32v[fo+20] = g.x1-c.px; f32v[fo+21] = g.y1-c.py;
        }
      } else {
        u32v[fo+16] = 0; // no gradient
      }
      // blendGroup (u32, float 22), grad_lut_row (u32, float 23)
      u32v[fo+22] = c.blendGroup;
      u32v[fo+23] = c.gradient ? (this._gradMap.get(c.gradient) ?? 0xFFFFFFFF) : 0xFFFFFFFF;
    }
    // Skip writeBuffer if style data is identical to last frame (saves ~5MB upload at N=50k)
    if (this._statDataHash !== this._lastStatDataHash) {
      this.device.queue.writeBuffer(this.statBuf, 0, this._statStaging!, 0, n.length * STAT_STRIDE);
      this._lastStatDataHash = this._statDataHash;
    }

    // Rasterize only NEW/CHANGED gradient rows (persistent cache skips re-rasterization)
    if (this._gradDirtyRows.size > 0 && this._gradLUT2d && this._gradLUTCanvas && this._gradLUT) {
      this._rasterizeGradLUT();
    }
  }

  private _rasterizeGradLUT() {
    const ctx = this._gradLUT2d!;
    const W = 256;

    // Only rasterize dirty rows (new gradients not in persistent cache)
    for (const [g, row] of this._gradMap) {
      if (!this._gradDirtyRows.has(row)) continue; // already cached
      if (!g.color1 || !g.color2) continue;

      const stops = g._stops;
      // Premultiplied RGBA row buffer
      const buf = this._gradRowBuf; // reuse to avoid per-gradient allocation

      if (stops && stops.length >= 2) {
        // Multi-stop: rasterize via Canvas2D (handles all stop counts correctly)
        ctx.clearRect(0, 0, W, 1);
        const linearGrad = ctx.createLinearGradient(0, 0, W-1, 0);
        for (const s of stops) linearGrad.addColorStop(Math.max(0,Math.min(1,s.offset)), s.color);
        ctx.fillStyle = linearGrad;
        ctx.fillRect(0, 0, W, 1);
        // getImageData returns STRAIGHT (un-premultiplied) RGBA [0-255]
        const px = ctx.getImageData(0, 0, W, 1).data;
        for (let x = 0; x < W; x++) {
          const r = px[x*4]/255, gv = px[x*4+1]/255, bv = px[x*4+2]/255, a = px[x*4+3]/255;
          // Premultiply: GPU blend state expects premultiplied output
          buf[x*4+0] = Math.round(r*a*255);
          buf[x*4+1] = Math.round(gv*a*255);
          buf[x*4+2] = Math.round(bv*a*255);
          buf[x*4+3] = Math.round(a*255);
        }
      } else {
        // 2-stop: interpolate in premultiplied space
        const [r1,g1,b1,a1] = g.color1;
        const [r2,g2,b2,a2] = g.color2;
        for (let x = 0; x < W; x++) {
          const t = x / (W-1);
          // Interpolate in premultiplied space (better than straight interpolation + premultiply)
          const pr1=r1*a1, pg1=g1*a1, pb1=b1*a1;
          const pr2=r2*a2, pg2=g2*a2, pb2=b2*a2;
          const ai = a1+(a2-a1)*t;
          buf[x*4+0] = Math.round((pr1+(pr2-pr1)*t)*255);
          buf[x*4+1] = Math.round((pg1+(pg2-pg1)*t)*255);
          buf[x*4+2] = Math.round((pb1+(pb2-pb1)*t)*255);
          buf[x*4+3] = Math.round(ai*255);
        }
      }

      // Upload this row directly to GPU texture (no canvas copy ambiguity)
      this.device.queue.writeTexture(
        {texture: this._gradLUT!, origin: {x:0, y:row, z:0}},
        buf,
        {offset:0, bytesPerRow: W*4, rowsPerImage: 1},
        {width: W, height: 1, depthOrArrayLayers: 1},
      );
    }
  }

  private _uploadTri() {
    if (!this._triVerts.length) return;
    const needed = this._triVerts.length * 4;
    if (this._triVerts.length > this.triCapacity * 6) {
      this.triCapacity = this._triVerts.length;
      this.triVBuf.destroy();
      this.triVBuf = this.device.createBuffer({size: this.triCapacity * 4, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST});
    }
    const vlen = this._triVerts.length;
    if (vlen > this._triStagingCap) {
      this._triStagingCap = vlen * 2;
      this._triStaging = new Float32Array(new ArrayBuffer(this._triStagingCap * 4));
    }
    this._triStaging.set(this._triVerts, 0);
    this.device.queue.writeBuffer(this.triVBuf, 0, this._triStaging, 0, vlen);
    void needed;
  }

  private _uniformScratch = new Float32Array(new ArrayBuffer(32)); // 8 floats, reused for uniform writes

  private _updateUniforms(s: KlintGPUSurface) {
    const sc = this._uniformScratch;
    sc[0]=s.width; sc[1]=s.height; sc[2]=s.dpr; sc[3]=0;
    this.device.queue.writeBuffer(this.uniformBuf, 0, sc, 0, 4);
  }

  private _updateUniforms2(w: number, h: number, dpr: number) {
    const sc = this._uniformScratch;
    sc[0]=w; sc[1]=h; sc[2]=dpr; sc[3]=0;
    this.device.queue.writeBuffer(this.uniformBuf, 0, sc, 0, 4);
  }

  // ─── Internal: render passes ──────────────────────────────────────────────

  private _clear(s: KlintGPUSurface) {
    const tex = s.gpuCtx.getCurrentTexture().createView();
    const enc = this.device.createCommandEncoder();
    enc.beginRenderPass({colorAttachments:[{view:tex,clearValue:this._bgColor,loadOp:'clear',storeOp:'store'}]}).end();
    this.device.queue.submit([enc.finish()]);
  }

  private _renderPass(s: KlintGPUSurface) {
    const tex = s.gpuCtx.getCurrentTexture().createView();
    this._renderPassToView(tex, s.width, s.height);
  }

  private _renderPassToView(tex: GPUTextureView, surfW: number, surfH: number) {
    const enc = this.device.createCommandEncoder({label:'klint-gpu'});
    // Semi-transparent background → preserve previous frame (trails/motion-blur)
    const loadOp: GPULoadOp = this._bgSemiTransparent ? 'load' : 'clear';
    const pass = enc.beginRenderPass({colorAttachments:[{
      view:tex, clearValue:this._bgColor, loadOp, storeOp:'store',
    }]});

    // Semi-transparent bg rect first (persistent buffer, drawn before all shapes)
    if (this._bgSemiTransparent && this._bgTriBuf) {
      pass.setPipeline(this.triPipeline);
      pass.setBindGroup(0, this.triBG);
      pass.setVertexBuffer(0, this._bgTriBuf);
      pass.draw(6, 1, 0, 0);
    }

    const n = this.commands.length;
    if (n > 0) {
      if (this.aaMethod === AaMethod.Fast && this.fastPipelines.length >= 6) {
        // 4-way split: sorted order groups by (blendGroup, hasStroke, type)
        // Dispatch each group with its specialized pipeline
        const order = this._sortedOrderLen === n ? this._sortedOrder : (() => { const a=new Int32Array(n); for(let i=0;i<n;i++)a[i]=i; return a; })();
        const srcPLs = this.fastPipelines;
        const addPLs = this.fastPipelinesAdd;
        const opaPLs = this.fastPipelinesOpa;

        // Group runs by sort key
        let runStart = 0;
        while (runStart < n) {
          const key = this.sortKeys[order[runStart]];
          let runEnd = runStart + 1;
          while (runEnd < n && this.sortKeys[order[runEnd]] === key) runEnd++;

          const blend = (key >> 3) & 1;
          const hasStroke = (key >> 2) & 1;
          const type = key & 3;

          // Pick pipeline: type 0=circle, 1=rect; stroke=0/1
          let pIdx = -1;
          if (type <= 1) pIdx = type * 2 + hasStroke; // 0=cns,1=cs,2=rns,3=rs
          else if (type === 2) pIdx = 4; // 4=ls (line stroke)
          else if (type === 3) pIdx = 5; // 5=pt (point)
          const pls = blend === 1 ? addPLs : (this.alphaMode === AlphaMode.Opaque ? opaPLs : srcPLs);
          const pl = (pIdx >= 0 && pIdx < pls.length) ? pls[pIdx] : (blend?this.qualPipelineAdd:this.qualPipeline);

          pass.setPipeline(pl);
          pass.setBindGroup(0, this.sdfBG);
          pass.draw(6, runEnd - runStart, 0, runStart);
          runStart = runEnd;
        }
      } else {
        // Quality mode: single unified pipeline.
        // For mixed-blend scenes (some additive, some source-over), use the majority blend.
        // Fully correct mixed-blend in quality mode requires sorting — deferred to future work.
        const pl = this.alphaMode === AlphaMode.Opaque ? this.qualPipelineOpa :
                   (this._hasAdditiveBlend ? this.qualPipelineAdd : this.qualPipeline);
        pass.setPipeline(pl);
        pass.setBindGroup(0, this.sdfBG);
        pass.draw(6, n, 0, 0);
      }
    }

    // Triangle VBO (polygon fills)
    const triCount = Math.floor(this._triVerts.length / 6); // 6 floats per vertex (x,y,r,g,b,a)
    if (triCount > 0) {
      const pl = this._shapeBlend === 1 ? this.triPipelineAdd :
                 (this.alphaMode === AlphaMode.Opaque ? this.triPipelineOpa : this.triPipeline);
      pass.setPipeline(pl);
      pass.setBindGroup(0, this.triBG);
      pass.setVertexBuffer(0, this.triVBuf);
      pass.draw(triCount, 1, 0, 0);
    }

    // Image draws — reuse cached uniform buffers to avoid createBuffer per frame
    for (const img of this._imgDraws) {
      const entry = this.imgTextures.get(img.key);
      if (!entry) continue;
      // Lazy-create or reuse cached uniform buffer for this image key
      let cached = this._imgUniCache.get(img.key);
      if (!cached) {
        const buf = this.device.createBuffer({size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST});
        const bg  = this.device.createBindGroup({
          layout: this.imgUniLayout,
          entries: [{binding:0, resource:{buffer:buf}}],
        });
        cached = {buf, bg};
        this._imgUniCache.set(img.key, cached);
      }
      // Update buffer with current frame's position/size/opacity
      const sc = this._uniformScratch;
      sc[0]=surfW; sc[1]=surfH; sc[2]=img.x; sc[3]=img.y; sc[4]=img.w; sc[5]=img.h; sc[6]=img.opacity; sc[7]=0;
      this.device.queue.writeBuffer(cached.buf, 0, sc, 0, 8);
      const pl = img.blendGroup === 1 ? this.imgPipelineAdd :
                 (this.alphaMode === AlphaMode.Opaque ? this.imgPipelineOpa : this.imgPipeline);
      pass.setPipeline(pl);
      pass.setBindGroup(0, entry.bg);
      pass.setBindGroup(1, cached.bg);
      pass.draw(6, 1, 0, 0);
    }

    pass.end();
    this.device.queue.submit([enc.finish()]);
  }

  // ─── Internal: filter chain ───────────────────────────────────────────────

  private _ensureFilterTex(w: number, h: number) {
    const needNew = !this._filterTex || this._filterTex.width !== w || this._filterTex.height !== h;
    if (needNew) {
      this._filterTex?.destroy(); this._filterTex2?.destroy();
      const desc: GPUTextureDescriptor = {size:{width:w,height:h},format:this.format,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING};
      this._filterTex  = this.device.createTexture(desc);
      this._filterTex2 = this.device.createTexture(desc);
      // Pre-create views and bind groups (reused across all filter passes)
      this._filterView  = this._filterTex.createView();
      this._filterView2 = this._filterTex2.createView();
      this._filterSrcBG  = this.device.createBindGroup({layout:this.filterBgl, entries:[{binding:0,resource:this.filterSampler},{binding:1,resource:this._filterView}]});
      this._filterSrcBG2 = this.device.createBindGroup({layout:this.filterBgl, entries:[{binding:0,resource:this.filterSampler},{binding:1,resource:this._filterView2}]});
    }
  }

  private _applyFilters(s: KlintGPUSurface) {
    let src = this._filterTex!;
    let tmp = this._filterTex2!;
    const tex = s.gpuCtx.getCurrentTexture();

    // Lazy-create persistent filter uniform buffer
    if (!this._filterUniBuf) {
      this._filterUniBuf = this.device.createBuffer({size:16, usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
      this._filterUniBG  = this.device.createBindGroup({
        layout: this.filterUniLayout,
        entries: [{binding:0, resource:{buffer:this._filterUniBuf}}],
      });
    }

    // Collect all filter passes into one command encoder to reduce submit overhead
    // Each pass reads from a different texture than it writes → safe to batch
    const cmds: Array<{srcTex:GPUTexture; dstView:GPUTextureView; mode:number; strength:number}> = [];

    for (const f of this._filters) {
      if (f.mode === 5) {
        cmds.push({srcTex:src, dstView:tmp.createView(), mode:5, strength:f.strength});
        const t = src; src = tmp; tmp = t;
        cmds.push({srcTex:src, dstView:tmp.createView(), mode:6, strength:f.strength});
        const t2 = src; src = tmp; tmp = t2;
      } else {
        cmds.push({srcTex:src, dstView:tmp.createView(), mode:f.mode, strength:f.strength});
        const t = src; src = tmp; tmp = t;
      }
    }
    // Final pass: src → canvas
    cmds.push({srcTex:src, dstView:tex.createView(), mode:0, strength:1});

    // Write ALL uniform data and create bind groups first, then record all passes in one encoder
    const bgArr: GPUBindGroup[] = [];
    const sc = this._uniformScratch;
    for (let pi = 0; pi < cmds.length; pi++) {
      const cmd = cmds[pi];
      // Grow per-pass uniform buffer pool as needed (persistent, not mappedAtCreation)
      if (pi >= this._filterPassUniPool.length) {
        const buf = this.device.createBuffer({size:16, usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
        const bg  = this.device.createBindGroup({layout:this.filterUniLayout, entries:[{binding:0,resource:{buffer:buf}}]});
        this._filterPassUniPool.push(buf);
        this._filterPassUniBGPool.push(bg);
      }
      const uniBuf = this._filterPassUniPool[pi];
      sc[0]=cmd.mode; sc[1]=cmd.strength; sc[2]=1/cmd.srcTex.width; sc[3]=1/cmd.srcTex.height;
      this.device.queue.writeBuffer(uniBuf, 0, sc, 0, 4);
      const uniBG = this._filterPassUniBGPool[pi];
      // Use pre-cached bind group for filterTex/filterTex2; create new only for canvas src
      let srcBG: GPUBindGroup;
      if (cmd.srcTex === this._filterTex && this._filterSrcBG) srcBG = this._filterSrcBG;
      else if (cmd.srcTex === this._filterTex2 && this._filterSrcBG2) srcBG = this._filterSrcBG2;
      else srcBG = this.device.createBindGroup({layout:this.filterBgl, entries:[{binding:0,resource:this.filterSampler},{binding:1,resource:cmd.srcTex.createView()}]});
      bgArr.push(srcBG); bgArr.push(uniBG);
    }

    const enc = this.device.createCommandEncoder({label:'klint-filter'});
    for (let i = 0; i < cmds.length; i++) {
      const cmd = cmds[i];
      const clearV = (i === cmds.length-1) ? this._bgColor : {r:0,g:0,b:0,a:0};
      const pass = enc.beginRenderPass({colorAttachments:[{view:cmd.dstView, clearValue:clearV, loadOp:'clear', storeOp:'store'}]});
      pass.setPipeline(this.filterPipeline);
      pass.setBindGroup(0, bgArr[i*2]);
      pass.setBindGroup(1, bgArr[i*2+1]);
      pass.draw(6, 1, 0, 0);
      pass.end();
    }
    this.device.queue.submit([enc.finish()]);
  }

  // ─── Internal: particle render ────────────────────────────────────────────

  private _runParticleRenders(targets: KlintGPUSurface[]) {
    if (!this._pendingParticles.length) return;

    for (const {ps, blend} of this._pendingParticles) {
      // Update sim
      const surface = targets[0];
      const sc = this._uniformScratch;
      sc[0]=surface.width; sc[1]=surface.height; sc[2]=ps.tStep++; sc[3]=0;
      this.device.queue.writeBuffer(ps.simBuf, 0, sc, 0, 4);

      // Compute pass
      const enc = this.device.createCommandEncoder();
      const cp = enc.beginComputePass();
      cp.setPipeline(ps.computePipeline);
      cp.setBindGroup(0, ps.computeBG);
      cp.dispatchWorkgroups(Math.ceil(ps.N / 64));
      cp.end();
      this.device.queue.submit([enc.finish()]);

      // Render pass — reuse fast CNS pipeline (particles are circles, no stroke)
      for (const s of targets) {
        this._updateUniforms(s);
        const tex = s.gpuCtx.getCurrentTexture().createView();
        const enc2 = this.device.createCommandEncoder();
        const pass = enc2.beginRenderPass({colorAttachments:[{
          view:tex, clearValue:this._bgColor, loadOp:'load', storeOp:'store',
        }]});
        const pl = blend === 1 ? (this.fastPipelinesAdd[0] ?? this.qualPipelineAdd)
                                : (this.fastPipelines[0]    ?? this.qualPipeline);
        pass.setPipeline(pl);
        pass.setBindGroup(0, blend===1 ? ps.renderBGAdd : ps.renderBG);
        pass.draw(6, ps.N, 0, 0);
        pass.end();
        this.device.queue.submit([enc2.finish()]);
      }
    }
  }

  // ─── Internal: rebuild bind groups ───────────────────────────────────────

  private _bgRectData = new Float32Array(new ArrayBuffer(6 * 6 * 4)); // 6 verts × 6 floats × 4 bytes
  private _uploadBgRect(targets: KlintGPUSurface[]) {
    if (!this._bgSemiTransparent || !targets.length) return;
    const {r,g,b,a} = this._bgColor;
    const [pr,pg,pb,pa] = [r*a, g*a, b*a, a];
    const s = targets[0];
    const w = s.width, h = s.height;
    const d = this._bgRectData;
    d[0]=0;d[1]=0;d[2]=pr;d[3]=pg;d[4]=pb;d[5]=pa;
    d[6]=w;d[7]=0;d[8]=pr;d[9]=pg;d[10]=pb;d[11]=pa;
    d[12]=w;d[13]=h;d[14]=pr;d[15]=pg;d[16]=pb;d[17]=pa;
    d[18]=0;d[19]=0;d[20]=pr;d[21]=pg;d[22]=pb;d[23]=pa;
    d[24]=w;d[25]=h;d[26]=pr;d[27]=pg;d[28]=pb;d[29]=pa;
    d[30]=0;d[31]=h;d[32]=pr;d[33]=pg;d[34]=pb;d[35]=pa;
    const needed = d.byteLength;
    if (!this._bgTriBuf || this._bgTriSize < needed) {
      this._bgTriBuf?.destroy();
      this._bgTriBuf = this.device.createBuffer({size:needed, usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST, label:'bg-tri'});
      this._bgTriSize = needed;
    }
    this.device.queue.writeBuffer(this._bgTriBuf, 0, d);
  }

  private _renderClips(s: KlintGPUSurface, allCmds: DrawCommand[]) {
    if (!this._stencilPair) return;
    this._ensureStencilTex(s.width, s.height);

    // Group commands by clipId
    const ids = new Set(allCmds.filter(c => c.clipId >= 0).map(c => c.clipId));
    const canvasTex = s.gpuCtx.getCurrentTexture().createView();
    const stencilView = this._stencilTex!.createView();

    for (const id of ids) {
      const maskCmds    = allCmds.filter(c => c.clipId === id && c.isClipMask);
      const contentCmds = allCmds.filter(c => c.clipId === id && !c.isClipMask);
      if (!maskCmds.length || !contentCmds.length) continue;

      // Upload mask commands to GPU buffers temporarily
      const mkBufs = (cmds: DrawCommand[]) => {
        const dyn  = new Float32Array(cmds.length * 4);
        const stat = new ArrayBuffer(cmds.length * STAT_STRIDE);
        const dv   = new DataView(stat);
        for (let i = 0; i < cmds.length; i++) {
          const c = cmds[i]; const o = i * 4;
          dyn[o]=c.px; dyn[o+1]=c.py; dyn[o+2]=c.sx; dyn[o+3]=c.sy;
          const f=c.fill, off=i*STAT_STRIDE;
          dv.setFloat32(off+0,f[0]*f[3]*c.opacity,true); dv.setFloat32(off+4,f[1]*f[3]*c.opacity,true);
          dv.setFloat32(off+8,f[2]*f[3]*c.opacity,true); dv.setFloat32(off+12,f[3]*c.opacity,true);
          dv.setUint32(off+56, c.type, true); dv.setFloat32(off+60,1,true);
          dv.setUint32(off+64,0,true); // no gradient
          dv.setUint32(off+92, 0xFFFFFFFF, true); // no LUT
        }
        const dynB  = this.device.createBuffer({size:Math.max(DYN_STRIDE,cmds.length*DYN_STRIDE),   usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});
        const statB = this.device.createBuffer({size:Math.max(STAT_STRIDE,cmds.length*STAT_STRIDE), usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});
        this.device.queue.writeBuffer(dynB,  0, dyn);
        this.device.queue.writeBuffer(statB, 0, stat);
        const bg = this.createSdfBindGroup(dynB, statB);
        return {dynB, statB, bg, n: cmds.length};
      };

      const maskBufs    = mkBufs(maskCmds);
      const contentBufs = mkBufs(contentCmds);
      this._updateUniforms(s);

      // Pass 1: stencil write (mask shapes → set stencil=1, no color output)
      const enc1 = this.device.createCommandEncoder();
      const p1 = enc1.beginRenderPass({
        colorAttachments:[{view:canvasTex, loadOp:'load', storeOp:'store'}],
        depthStencilAttachment:{view:stencilView, stencilClearValue:0, stencilLoadOp:'clear', stencilStoreOp:'store'},
      });
      p1.setPipeline(this._stencilPair.write);
      p1.setBindGroup(0, maskBufs.bg);
      p1.setStencilReference(1);
      p1.draw(6, maskBufs.n, 0, 0);
      p1.end();
      this.device.queue.submit([enc1.finish()]);

      // Pass 2: stencil test (content shapes → only draw where stencil==1)
      const enc2 = this.device.createCommandEncoder();
      const p2 = enc2.beginRenderPass({
        colorAttachments:[{view:canvasTex, loadOp:'load', storeOp:'store'}],
        depthStencilAttachment:{view:stencilView, stencilClearValue:0, stencilLoadOp:'load', stencilStoreOp:'discard'},
      });
      p2.setPipeline(this._stencilPair.test);
      p2.setBindGroup(0, contentBufs.bg);
      p2.setStencilReference(1);
      p2.draw(6, contentBufs.n, 0, 0);
      p2.end();
      this.device.queue.submit([enc2.finish()]);

      // Cleanup temp buffers
      maskBufs.dynB.destroy(); maskBufs.statB.destroy();
      contentBufs.dynB.destroy(); contentBufs.statB.destroy();
    }
  }

  private _createStencilPipelines(sdfLayout: GPUPipelineLayout): StencilPair {
    const qualMod = this.device.createShaderModule({code: WGSL_QUALITY});
    const stencilFmt: GPUTextureFormat = 'stencil8';
    const write = this.device.createRenderPipeline({
      layout: sdfLayout,
      vertex:   {module: qualMod, entryPoint: 'vs'},
      fragment: {module: qualMod, entryPoint: 'fs', targets: [{format: this.format, writeMask: 0}]},
      primitive: {topology: 'triangle-list'},
      depthStencil: {
        format: stencilFmt,
        stencilFront: {compare:'always', passOp:'replace', failOp:'keep', depthFailOp:'keep'},
        stencilBack:  {compare:'always', passOp:'replace', failOp:'keep', depthFailOp:'keep'},
        stencilReadMask: 0xff, stencilWriteMask: 0xff,
      },
    });
    const test = this.device.createRenderPipeline({
      layout: sdfLayout,
      vertex:   {module: qualMod, entryPoint: 'vs'},
      fragment: {module: qualMod, entryPoint: 'fs', targets: [{format: this.format, blend: {
        color:{operation:'add',srcFactor:'one',dstFactor:'one-minus-src-alpha'},
        alpha:{operation:'add',srcFactor:'one',dstFactor:'one-minus-src-alpha'},
      }}]},
      primitive: {topology: 'triangle-list'},
      depthStencil: {
        format: stencilFmt,
        stencilFront: {compare:'equal', passOp:'keep', failOp:'keep', depthFailOp:'keep'},
        stencilBack:  {compare:'equal', passOp:'keep', failOp:'keep', depthFailOp:'keep'},
        stencilReadMask: 0xff, stencilWriteMask: 0x00,
      },
    });
    return {write, test};
  }

  private _ensureStencilTex(w: number, h: number) {
    if (!this._stencilTex || this._stencilTex.width !== w || this._stencilTex.height !== h) {
      this._stencilTex?.destroy();
      this._stencilTex = this.device.createTexture({
        size:{width:w,height:h}, format:'stencil8',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        label: 'klint-stencil',
      });
    }
  }

  private _rebuildSdfBG() {
    if (!this._gradLUT || !this._gradLUTSampler) return;
    this.sdfBG = this.device.createBindGroup({
      layout: this.sdfBgl,
      entries: [
        {binding:0, resource:{buffer:this.uniformBuf}},
        {binding:1, resource:{buffer:this.dynBuf}},
        {binding:2, resource:{buffer:this.statBuf}},
        {binding:3, resource:this._gradLUT.createView()},
        {binding:4, resource:this._gradLUTSampler},
      ],
    });
  }

  /** Create a SDF bind group with custom dyn+stat buffers (for particle systems) */
  createSdfBindGroup(dynBuf: GPUBuffer, statBuf: GPUBuffer): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.sdfBgl,
      entries: [
        {binding:0, resource:{buffer:this.uniformBuf}},
        {binding:1, resource:{buffer:dynBuf}},
        {binding:2, resource:{buffer:statBuf}},
        {binding:3, resource:this._gradLUT!.createView()},
        {binding:4, resource:this._gradLUTSampler!},
      ],
    });
  }

  // ─── Pipeline construction ────────────────────────────────────────────────

  private async _buildPipelines() {
    this.format = navigator.gpu.getPreferredCanvasFormat();

    // Shared uniform + storage buffers
    this.uniformBuf = this.device.createBuffer({size:16, usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    this.dynBuf  = this.device.createBuffer({size:this.dynCapacity  * DYN_STRIDE,  usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});
    this.statBuf = this.device.createBuffer({size:this.statCapacity * STAT_STRIDE, usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST});

    // Gradient LUT texture (256 × MAX_GRAD_LUTS rows, one row per unique gradient)
    const LUT_W = 256, LUT_H = WebGPURenderer.MAX_GRAD_LUTS;
    this._gradLUTSampler = this.device.createSampler({magFilter:'linear',minFilter:'linear'});
    this._gradLUT = this.device.createTexture({
      size:{width:LUT_W,height:LUT_H}, format:'rgba8unorm',
      usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST,
      label:'gradient-lut',
    });
    this._gradLUTCanvas = document.createElement('canvas');
    this._gradLUTCanvas.width = LUT_W; this._gradLUTCanvas.height = LUT_H;
    this._gradLUT2d = this._gradLUTCanvas.getContext('2d')!;

    // SDF bind group layout (includes gradient LUT texture)
    this.sdfBgl = this.device.createBindGroupLayout({entries:[
      {binding:0, visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT, buffer:{type:'uniform'}},
      {binding:1, visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT, buffer:{type:'read-only-storage'}},
      {binding:2, visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT, buffer:{type:'read-only-storage'}},
      {binding:3, visibility:GPUShaderStage.FRAGMENT, texture:{sampleType:'float'}},
      {binding:4, visibility:GPUShaderStage.FRAGMENT, sampler:{type:'filtering'}},
    ]});
    this._rebuildSdfBG();

    const sdfLayout = this.device.createPipelineLayout({bindGroupLayouts:[this.sdfBgl]});

    const blendSrcOver: GPUBlendState = {
      color:{operation:'add',srcFactor:'one',dstFactor:'one-minus-src-alpha'},
      alpha:{operation:'add',srcFactor:'one',dstFactor:'one-minus-src-alpha'},
    };
    const blendAdd: GPUBlendState = {
      color:{operation:'add',srcFactor:'one',dstFactor:'one'},
      alpha:{operation:'add',srcFactor:'one',dstFactor:'one'},
    };
    const noBlend = undefined;

    const mkSdfPL = (wgsl: string, blend: GPUBlendState | undefined) =>
      this.device.createRenderPipeline({
        layout: sdfLayout,
        vertex:   {module: this.device.createShaderModule({code:wgsl}), entryPoint:'vs'},
        fragment: {module: this.device.createShaderModule({code:wgsl}), entryPoint:'fs',
                   targets:[{format:this.format, blend}]},
        primitive:{topology:'triangle-list'},
      });

    if (this.aaMethod === AaMethod.Fast) {
      // 5 specialized fast pipelines (cns, cs, rns, rs, ls) × 3 blend modes = 15
      const shaders = [WGSL_CNS, WGSL_CS, WGSL_RNS, WGSL_RS, WGSL_LS, WGSL_PT];
      this.fastPipelines    = shaders.map(s => mkSdfPL(s, blendSrcOver));
      this.fastPipelinesAdd = shaders.map(s => mkSdfPL(s, blendAdd));
      this.fastPipelinesOpa = shaders.map(s => mkSdfPL(s, noBlend));
    }

    this.qualPipeline    = mkSdfPL(WGSL_QUALITY, blendSrcOver);
    this.qualPipelineAdd = mkSdfPL(WGSL_QUALITY, blendAdd);
    this.qualPipelineOpa = mkSdfPL(WGSL_QUALITY, noBlend);

    // Stencil pipeline pair (lazy-created on first clipTo use; stored for later)
    // Pre-create them here to avoid stutter on first clip
    this._stencilPair = this._createStencilPipelines(sdfLayout);

    // ── Triangle VBO pipeline ─────────────────────────────────────────────
    this.triVBuf = this.device.createBuffer({
      size: this.triCapacity * TRI_STRIDE,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.triBgl = this.device.createBindGroupLayout({entries:[
      {binding:0, visibility:GPUShaderStage.VERTEX, buffer:{type:'uniform'}},
    ]});
    this.triBG = this.device.createBindGroup({
      layout: this.triBgl,
      entries: [{binding:0, resource:{buffer:this.uniformBuf}}],
    });
    const triLayout = this.device.createPipelineLayout({bindGroupLayouts:[this.triBgl]});
    const mkTriPL = (blend: GPUBlendState | undefined) =>
      this.device.createRenderPipeline({
        layout: triLayout,
        vertex: {
          module: this.device.createShaderModule({code: WGSL_TRIANGLE}),
          entryPoint: 'vs',
          buffers: [{
            arrayStride: TRI_STRIDE,
            attributes: [
              {shaderLocation:0, offset:0,  format:'float32x2'},  // pos
              {shaderLocation:1, offset:8,  format:'float32x4'},  // color
            ],
          }],
        },
        fragment: {
          module: this.device.createShaderModule({code: WGSL_TRIANGLE}),
          entryPoint: 'fs',
          targets: [{format:this.format, blend}],
        },
        primitive: {topology:'triangle-list'},
      });
    this.triPipeline    = mkTriPL(blendSrcOver);
    this.triPipelineAdd = mkTriPL(blendAdd);
    this.triPipelineOpa = mkTriPL(noBlend);

    // ── Image pipeline ────────────────────────────────────────────────────
    this.imgSampler = this.device.createSampler({magFilter:'linear', minFilter:'linear', mipmapFilter:'linear'});
    this.imgBgl = this.device.createBindGroupLayout({entries:[
      {binding:0, visibility:GPUShaderStage.FRAGMENT, sampler:{type:'filtering'}},
      {binding:1, visibility:GPUShaderStage.FRAGMENT, texture:{sampleType:'float'}},
    ]});
    this.imgUniLayout = this.device.createBindGroupLayout({entries:[
      {binding:0, visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT, buffer:{type:'uniform'}},
    ]});
    const imgLayout = this.device.createPipelineLayout({bindGroupLayouts:[this.imgBgl, this.imgUniLayout]});
    const mkImgPL = (blend: GPUBlendState | undefined) =>
      this.device.createRenderPipeline({
        layout: imgLayout,
        vertex:   {module:this.device.createShaderModule({code:WGSL_IMAGE}), entryPoint:'vs'},
        fragment: {module:this.device.createShaderModule({code:WGSL_IMAGE}), entryPoint:'fs',
                   targets:[{format:this.format, blend}]},
        primitive: {topology:'triangle-list'},
      });
    this.imgPipeline    = mkImgPL(blendSrcOver);
    this.imgPipelineAdd = mkImgPL(blendAdd);
    this.imgPipelineOpa = mkImgPL(noBlend);

    // ── Filter pipeline ───────────────────────────────────────────────────
    this.filterSampler = this.device.createSampler({magFilter:'linear', minFilter:'linear'});
    this.filterBgl = this.device.createBindGroupLayout({entries:[
      {binding:0, visibility:GPUShaderStage.FRAGMENT, sampler:{type:'filtering'}},
      {binding:1, visibility:GPUShaderStage.FRAGMENT, texture:{sampleType:'float'}},
    ]});
    this.filterUniLayout = this.device.createBindGroupLayout({entries:[
      {binding:0, visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT, buffer:{type:'uniform'}},
    ]});
    this.filterPipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({bindGroupLayouts:[this.filterBgl, this.filterUniLayout]}),
      vertex:   {module:this.device.createShaderModule({code:WGSL_FILTER}), entryPoint:'vs'},
      fragment: {module:this.device.createShaderModule({code:WGSL_FILTER}), entryPoint:'fs',
                 targets:[{format:this.format, blend:blendSrcOver}]},
      primitive:{topology:'triangle-list'},
    });

    // ── Particle compute pipeline ─────────────────────────────────────────
    this.particleComputeBgl = this.device.createBindGroupLayout({entries:[
      {binding:0, visibility:GPUShaderStage.COMPUTE, buffer:{type:'storage'}},
      {binding:1, visibility:GPUShaderStage.COMPUTE, buffer:{type:'storage'}},
      {binding:2, visibility:GPUShaderStage.COMPUTE, buffer:{type:'uniform'}},
    ]});
    this.particleComputePipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({bindGroupLayouts:[this.particleComputeBgl]}),
      compute: {module:this.device.createShaderModule({code:WGSL_PARTICLE_COMPUTE}), entryPoint:'update'},
    });
  }

  destroy() {
    this.uniformBuf.destroy(); this.dynBuf.destroy(); this.statBuf.destroy();
    this.triVBuf.destroy();
    this._filterTex?.destroy(); this._filterTex2?.destroy();
    this._gradLUT?.destroy();
    this._textTex?.destroy();
    this._bgTriBuf?.destroy();
    this._stencilTex?.destroy();
    this._filterUniBuf?.destroy();
    for (const buf of this._filterPassUniPool) buf.destroy();
    for (const {tex} of this.imgTextures.values()) tex.destroy();
    for (const {buf} of this._imgUniCache.values()) buf.destroy();
    for (const surface of this.surfaces) surface.gpuCtx.unconfigure?.();
    for (const os of this.offscreenMap.values()) os.texture.destroy();
  }
}

// ─── WGSL Shaders ─────────────────────────────────────────────────────────────
// Shared struct definitions

const WGSL_STRUCTS = /* wgsl */`
struct Screen { size:vec2f, dpr:f32, _pad:f32 }
struct DynShape { pos:vec2f, size:vec2f }
struct StatShape {
  fill         : vec4f,
  stroke       : vec4f,
  fill2        : vec4f,
  stroke_w     : f32,
  corner_r     : f32,
  shape_type   : u32,
  opacity      : f32,
  grad_type    : u32,
  _pad0        : f32,
  grad_dir     : vec2f,
  grad_start   : vec2f,
  blend_group  : u32,
  grad_lut_row : u32,  // 0xFFFFFFFF=no LUT, 0..63=LUT row for multi-stop gradient
}
@group(0) @binding(0) var<uniform>       screen    : Screen;
@group(0) @binding(1) var<storage, read> dyn       : array<DynShape>;
@group(0) @binding(2) var<storage, read> stat      : array<StatShape>;
@group(0) @binding(3) var               gradLUT    : texture_2d<f32>;
@group(0) @binding(4) var               gradSampler: sampler;
const Q=array<vec2f,6>(vec2f(-1,-1),vec2f(1,-1),vec2f(1,1),vec2f(-1,-1),vec2f(1,1),vec2f(-1,1));
struct V { @builtin(position) cp:vec4f, @location(0) lp:vec2f, @location(1) @interpolate(flat) idx:u32 }
fn ndc(wp:vec2f,sz:vec2f)->vec4f { return vec4f(wp.x/sz.x*2.0-1.0,-(wp.y/sz.y*2.0-1.0),0,1); }

fn get_fill(s:StatShape,p:vec2f)->vec4f {
  if s.grad_type==0u { return s.fill; }
  var t:f32;
  if s.grad_type==1u {
    let glen2=dot(s.grad_dir,s.grad_dir);
    t=select(0.0,dot(p-s.grad_start,s.grad_dir)/glen2,glen2>0.0001);
  } else if s.grad_type==2u {
    let dist=length(p-s.grad_start);
    t=(dist-s.grad_dir.x)/max(s.grad_dir.y,0.001);
  } else {
    let angle=atan2(p.y-s.grad_start.y,p.x-s.grad_start.x)-s.grad_dir.x;
    t=fract(angle/6.2831853);
  }
  t=clamp(t,0.0,1.0);
  // Multi-stop: sample the gradient LUT texture
  if s.grad_lut_row!=0xFFFFFFFFu {
    let lut_v=(f32(s.grad_lut_row)+0.5)/64.0;
    return textureSampleLevel(gradLUT,gradSampler,vec2f(t,lut_v),0);
  }
  return mix(s.fill,s.fill2,t);
}
fn blend_stroke(c:vec4f,s:StatShape,dist:f32)->vec4f {
  let cov=clamp(0.5-(abs(dist)-s.stroke_w*0.5)*0.5,0.0,1.0);
  return c*(1.0-cov*s.stroke.a)+s.stroke*cov;
}`;

// Shared helper: circle or ellipse SDF based on size
// Uses ellipse approximation when radii differ (sdf_ellipse is fast but slightly approximate)
const WGSL_CIRC_SDF = /* wgsl */`
fn sdf_ce(p:vec2f,ab:vec2f)->f32 {
  if abs(ab.x-ab.y)<0.5 { return length(p)-ab.x; }
  let k1=length(p/ab); let k2=length(p/(ab*ab));
  return k1*(k1-1.0)/k2;
}`;

// ── Fast pipeline: Circle No-Stroke ──────────────────────────────────────────
const WGSL_CNS = WGSL_STRUCTS + WGSL_CIRC_SDF + /* wgsl */`
@vertex fn vs(@builtin(vertex_index) vi:u32, @builtin(instance_index) ii:u32)->V {
  let d=dyn[ii]; let qv=Q[vi];
  let hs=d.size+vec2f(1.5);
  var o:V; o.cp=ndc(d.pos+qv*hs,screen.size); o.lp=qv*hs; o.idx=ii; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let d=dyn[in.idx]; let s=stat[in.idx];
  let dist=sdf_ce(in.lp,d.size);
  let fa=clamp(0.5-dist*0.5,0.0,1.0);
  return get_fill(s,in.lp)*fa;
}`;

// ── Fast pipeline: Circle Stroke ─────────────────────────────────────────────
const WGSL_CS = WGSL_STRUCTS + WGSL_CIRC_SDF + /* wgsl */`
@vertex fn vs(@builtin(vertex_index) vi:u32, @builtin(instance_index) ii:u32)->V {
  let d=dyn[ii]; let s=stat[ii]; let qv=Q[vi];
  let hs=d.size+vec2f(s.stroke_w*0.5+1.5);
  var o:V; o.cp=ndc(d.pos+qv*hs,screen.size); o.lp=qv*hs; o.idx=ii; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let d=dyn[in.idx]; let s=stat[in.idx];
  let dist=sdf_ce(in.lp,d.size);
  let fa=clamp(0.5-dist*0.5,0.0,1.0);
  return blend_stroke(get_fill(s,in.lp)*fa,s,dist);
}`;

// ── Fast pipeline: Rect No-Stroke ─────────────────────────────────────────────
const WGSL_RNS = WGSL_STRUCTS + /* wgsl */`
fn rrect(p:vec2f,hw:vec2f,r:f32)->f32{let q=abs(p)-hw+vec2f(r);return length(max(q,vec2f(0)))+min(max(q.x,q.y),0.0)-r;}
@vertex fn vs(@builtin(vertex_index) vi:u32, @builtin(instance_index) ii:u32)->V {
  let d=dyn[ii]; let qv=Q[vi];
  let hs=d.size+vec2f(1.5);
  var o:V; o.cp=ndc(d.pos+qv*hs,screen.size); o.lp=qv*hs; o.idx=ii; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let d=dyn[in.idx]; let s=stat[in.idx];
  let dist=rrect(in.lp,d.size,s.corner_r);
  let fa=clamp(0.5-dist*0.5,0.0,1.0);
  return get_fill(s,in.lp)*fa;
}`;

// ── Fast pipeline: Rect Stroke ────────────────────────────────────────────────
const WGSL_RS = WGSL_STRUCTS + /* wgsl */`
fn rrect(p:vec2f,hw:vec2f,r:f32)->f32{let q=abs(p)-hw+vec2f(r);return length(max(q,vec2f(0)))+min(max(q.x,q.y),0.0)-r;}
@vertex fn vs(@builtin(vertex_index) vi:u32, @builtin(instance_index) ii:u32)->V {
  let d=dyn[ii]; let s=stat[ii]; let qv=Q[vi];
  let hs=d.size+vec2f(s.stroke_w*0.5+1.5);
  var o:V; o.cp=ndc(d.pos+qv*hs,screen.size); o.lp=qv*hs; o.idx=ii; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let d=dyn[in.idx]; let s=stat[in.idx];
  let dist=rrect(in.lp,d.size,s.corner_r);
  let fa=clamp(0.5-dist*0.5,0.0,1.0);
  return blend_stroke(get_fill(s,in.lp)*fa,s,dist);
}`;

// ── Quality pipeline: unified SDF (all shape types, adaptive AA) ──────────────
// ── Fast pipeline: Point ──────────────────────────────────────────────────────
const WGSL_PT = WGSL_STRUCTS + /* wgsl */`
@vertex fn vs(@builtin(vertex_index) vi:u32, @builtin(instance_index) ii:u32)->V {
  let d=dyn[ii]; let s=stat[ii]; let qv=Q[vi];
  let r=s.stroke_w*0.5+1.5;
  var o:V; o.cp=ndc(d.pos+qv*vec2f(r,r),screen.size); o.lp=qv*vec2f(r,r); o.idx=ii; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let s=stat[in.idx];
  let fa=clamp(0.5-(length(in.lp)-s.stroke_w*0.5)*0.5,0.0,1.0);
  if fa<0.001 { discard; }
  // Points use stroke color (matching Klint Canvas2D behaviour)
  let c=select(get_fill(s,in.lp),s.stroke,s.stroke.a>0.0);
  return c*fa;
}`;

// ── Fast pipeline: Line (always has stroke) ───────────────────────────────────
const WGSL_LS = WGSL_STRUCTS + /* wgsl */`
fn sdf_seg(p:vec2f,a:vec2f,b:vec2f)->f32{let pa=p-a;let ba=b-a;let h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h);}
@vertex fn vs(@builtin(vertex_index) vi:u32, @builtin(instance_index) ii:u32)->V {
  let d=dyn[ii]; let s=stat[ii]; let qv=Q[vi];
  // Tight bounding box: along line axis + stroke radius, perpendicular + stroke radius
  let pad=s.stroke_w*0.5+2.0;
  let hs=abs(d.size)+vec2f(pad,pad);
  var o:V; o.cp=ndc(d.pos+qv*hs,screen.size); o.lp=qv*hs; o.idx=ii; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let d=dyn[in.idx]; let s=stat[in.idx];
  let dist=sdf_seg(in.lp,-d.size,d.size)-s.stroke_w*0.5;
  let fa=clamp(0.5-dist*0.5,0.0,1.0);
  if fa<0.001 { discard; }
  return get_fill(s,in.lp)*fa;
}`;

const WGSL_QUALITY = WGSL_STRUCTS + /* wgsl */`
fn rrect(p:vec2f,hw:vec2f,r:f32)->f32{let q=abs(p)-hw+vec2f(r);return length(max(q,vec2f(0)))+min(max(q.x,q.y),0.0)-r;}
fn sdf_seg(p:vec2f,a:vec2f,b:vec2f)->f32{let pa=p-a;let ba=b-a;let h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h);}
@vertex fn vs(@builtin(vertex_index) vi:u32, @builtin(instance_index) ii:u32)->V {
  let d=dyn[ii]; let s=stat[ii]; let qv=Q[vi];
  var hs:vec2f;
  if s.shape_type==2u {
    let hl=length(d.size)+s.stroke_w*0.5+2.0;
    hs=vec2f(hl+abs(d.size.x)*0.5,hl+abs(d.size.y)*0.5);
  } else { hs=d.size+vec2f(s.stroke_w*0.5+2.0); }
  var o:V; o.cp=ndc(d.pos+qv*hs,screen.size); o.lp=qv*hs; o.idx=ii; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let d=dyn[in.idx]; let s=stat[in.idx]; let p=in.lp;
  var dist:f32;
  switch s.shape_type {
    case 0u: {
      if abs(d.size.x-d.size.y)<0.5 { dist=length(p)-d.size.x; }
      else { let k1=length(p/d.size);let k2=length(p/(d.size*d.size));dist=k1*(k1-1.0)/k2; }
    }
    case 1u: { let q=abs(p)-d.size+vec2f(s.corner_r);dist=length(max(q,vec2f(0)))+min(max(q.x,q.y),0.0)-s.corner_r; }
    case 2u: { dist=sdf_seg(p,-d.size,d.size)-s.stroke_w*0.5; }
    default: { dist=length(p)-s.stroke_w*0.5; }
  }
  let aa=max(fwidth(dist),0.0001);
  let fa=1.0-smoothstep(-aa,aa,dist);
  var c:vec4f;
  if s.shape_type==3u {
    // POINT: use stroke color as fill (matching Klint Canvas2D behaviour)
    c=select(get_fill(s,p),s.stroke,s.stroke.a>0.0)*fa;
  } else {
    c=get_fill(s,p)*fa;
    if s.stroke_w>0.0&&s.shape_type!=2u {
      let sd=abs(dist)-s.stroke_w*0.5;
      let sa=(1.0-smoothstep(-aa,aa,sd))*s.stroke.a;
      c=c*(1.0-sa)+s.stroke*sa;
    }
  }
  if c.a<0.001 { discard; }
  return c;
}`;

// ── Triangle VBO shader ───────────────────────────────────────────────────────
const WGSL_TRIANGLE = /* wgsl */`
struct Screen { size:vec2f, dpr:f32, _pad:f32 }
@group(0) @binding(0) var<uniform> screen:Screen;
struct Vin  { @location(0) pos:vec2f, @location(1) color:vec4f }
struct Vout { @builtin(position) cp:vec4f, @location(0) color:vec4f }
@vertex fn vs(v:Vin)->Vout {
  var o:Vout;
  o.cp=vec4f(v.pos.x/screen.size.x*2.0-1.0,-(v.pos.y/screen.size.y*2.0-1.0),0,1);
  o.color=v.color; return o;
}
@fragment fn fs(in:Vout)->@location(0) vec4f {
  if in.color.a<0.001 { discard; }
  return in.color;
}`;

// ── Image pipeline shader ──────────────────────────────────────────────────────
const WGSL_IMAGE = /* wgsl */`
@group(0) @binding(0) var imgSampler:sampler;
@group(0) @binding(1) var imgTex:texture_2d<f32>;
// [screen_w, screen_h, pos_x, pos_y, img_w, img_h, opacity, pad]
struct ImgParams { screen:vec2f, pos:vec2f, size:vec2f, opacity:f32, _pad:f32 }
@group(1) @binding(0) var<uniform> p:ImgParams;
struct V { @builtin(position) cp:vec4f, @location(0) uv:vec2f }
const Q=array<vec2f,6>(vec2f(0,0),vec2f(1,0),vec2f(1,1),vec2f(0,0),vec2f(1,1),vec2f(0,1));
@vertex fn vs(@builtin(vertex_index) vi:u32)->V {
  let uv=Q[vi];
  let px=p.pos+uv*p.size;
  var o:V;
  o.cp=vec4f(px.x/p.screen.x*2.0-1.0,-(px.y/p.screen.y*2.0-1.0),0,1);
  o.uv=uv; return o;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  var c=textureSample(imgTex,imgSampler,vec2f(in.uv.x,1.0-in.uv.y));
  let a=c.a*p.opacity;
  if a<0.001 { discard; }
  // Premultiply for blend state (src-one, dst-one-minus-src-alpha)
  return vec4f(c.rgb*a, a);
}`;

// ── Filter pipeline shader ────────────────────────────────────────────────────
const WGSL_FILTER = /* wgsl */`
@group(0) @binding(0) var fSampler:sampler;
@group(0) @binding(1) var fTex:texture_2d<f32>;
struct FP { mode:u32, strength:f32, inv_size:vec2f }
@group(1) @binding(0) var<uniform> fp:FP;
const Q=array<vec2f,6>(vec2f(-1,-1),vec2f(1,-1),vec2f(1,1),vec2f(-1,-1),vec2f(1,1),vec2f(-1,1));
struct V { @builtin(position) cp:vec4f, @location(0) uv:vec2f }
@vertex fn vs(@builtin(vertex_index) vi:u32)->V {
  let p=Q[vi]; var o:V;
  o.cp=vec4f(p,0,1); o.uv=p*0.5+0.5; return o;
}
fn rgb2hsl(c:vec3f)->vec3f {
  let mx=max(max(c.r,c.g),c.b); let mn=min(min(c.r,c.g),c.b);
  let l=(mx+mn)*0.5; let d=mx-mn;
  if d<0.001 { return vec3f(0,0,l); }
  let s=select(d/(2.0-mx-mn),d/(mx+mn),l<0.5);
  var h:f32;
  if mx==c.r      { h=(c.g-c.b)/d+select(6.0,0.0,c.g>=c.b); }
  else if mx==c.g { h=(c.b-c.r)/d+2.0; }
  else            { h=(c.r-c.g)/d+4.0; }
  return vec3f(h/6.0,s,l);
}
fn hue2rgb(p:f32,q:f32,t:f32)->f32 {
  var tt=t; if tt<0.0{tt+=1.0;} if tt>1.0{tt-=1.0;}
  if tt<0.1667{return p+(q-p)*6.0*tt;}
  if tt<0.5   {return q;}
  if tt<0.6667{return p+(q-p)*(0.6667-tt)*6.0;}
  return p;
}
fn hsl2rgb(h:vec3f)->vec3f {
  if h.y<0.001 { return vec3f(h.z); }
  let q=select(h.z+h.y-h.z*h.y,(h.z+h.y)*(1.0+h.y),h.z<0.5);
  let p=2.0*h.z-q;
  return vec3f(hue2rgb(p,q,h.x+0.3333),hue2rgb(p,q,h.x),hue2rgb(p,q,h.x-0.3333));
}
fn gaussian5(uv:vec2f,axis:vec2f,sigma:f32)->vec4f {
  let s=max(sigma,0.5);
  var acc=vec4f(0); var wt=0.0;
  for(var i=-8;i<=8;i++) {
    let d=f32(i)*s*0.5; let t=exp(-d*d/(2.0*s*s));
    acc+=textureSample(fTex,fSampler,uv+axis*d*fp.inv_size)*t;
    wt+=t;
  }
  return acc/wt;
}
@fragment fn fs(in:V)->@location(0) vec4f {
  let uv=vec2f(in.uv.x,in.uv.y);
  switch fp.mode {
    case 0u: { return textureSample(fTex,fSampler,uv); }
    case 1u: { // grayscale — unpremultiply for luma, then re-premultiply
      let c=textureSample(fTex,fSampler,uv);
      let rgb=select(c.rgb/max(c.a,0.0001),vec3f(0),c.a<0.001);
      let l=dot(rgb,vec3f(0.2126,0.7152,0.0722));
      return vec4f(mix(rgb,vec3f(l),fp.strength)*c.a,c.a);
    }
    case 2u: { // invert
      let c=textureSample(fTex,fSampler,uv);
      return vec4f(mix(c.rgb,(vec3f(c.a)-c.rgb),fp.strength),c.a);
    }
    case 3u: { // hue rotate — unpremultiply for HSL, then re-premultiply
      let c=textureSample(fTex,fSampler,uv);
      let rgb=select(c.rgb/max(c.a,0.0001),vec3f(0),c.a<0.001);
      let hsl=rgb2hsl(rgb);
      let h2=vec3f(fract(hsl.x+fp.strength/(2.0*3.14159265)),hsl.y,hsl.z);
      return vec4f(hsl2rgb(h2)*c.a,c.a);
    }
    case 4u: { // filter opacity
      let c=textureSample(fTex,fSampler,uv);
      return c*fp.strength;
    }
    case 5u: { return gaussian5(uv,vec2f(1,0),fp.strength); } // blur H
    case 6u: { return gaussian5(uv,vec2f(0,1),fp.strength); } // blur V
    default: { return textureSample(fTex,fSampler,uv); }
  }
}`;

// ── Particle compute shader ───────────────────────────────────────────────────
const WGSL_PARTICLE_COMPUTE = /* wgsl */`
struct DynShape { pos:vec2f, size:vec2f }
struct Particle { pos:vec2f, vel:vec2f, r:f32, phase:f32 }
struct Sim      { W:f32, H:f32, tStep:u32, _pad:f32 }
@group(0) @binding(0) var<storage,read_write> parts:array<Particle>;
@group(0) @binding(1) var<storage,read_write> dyn  :array<DynShape>;
@group(0) @binding(2) var<uniform>            sim  :Sim;
@compute @workgroup_size(64)
fn update(@builtin(global_invocation_id) gid:vec3u) {
  let i=gid.x; if i>=arrayLength(&parts){return;}
  var p=parts[i];
  p.pos+=p.vel;
  if p.pos.x<0.0||p.pos.x>sim.W{p.vel.x*=-1.0;p.pos.x=clamp(p.pos.x,0.0,sim.W);}
  if p.pos.y<0.0||p.pos.y>sim.H{p.vel.y*=-1.0;p.pos.y=clamp(p.pos.y,0.0,sim.H);}
  parts[i]=p;
  let t=f32(sim.tStep)*0.002;
  let r=p.r*(0.85+0.15*sin(t+p.phase));
  dyn[i]=DynShape(p.pos,vec2f(r,r));
}`;
