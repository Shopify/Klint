/**
 * KlintGPU — WebGPU 2D batch renderer
 *
 * Architecture:
 *   • One GPUDevice shared across ALL canvases (multi-canvas first-class)
 *   • Per-frame: collect draw commands → upload to storage buffer → one render pass per canvas
 *   • SDF-based shapes: circle, rect, line, point — all batched in a single draw call
 *   • CPU-side 2×3 affine transform stack baked into positions before upload
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** 80 bytes per shape, matches WGSL struct Shape (std430) */
const SHAPE_STRIDE = 80;
const INITIAL_CAPACITY = 1024;

export const SHAPE_TYPE = {
  CIRCLE: 0,
  RECT: 1,
  LINE: 2,
  POINT: 3,
} as const;

export type ShapeType = (typeof SHAPE_TYPE)[keyof typeof SHAPE_TYPE];

interface DrawCommand {
  type: ShapeType;
  px: number;   // center x (CSS px)
  py: number;   // center y (CSS px)
  sx: number;   // half-size x (radius for circle)
  sy: number;   // half-size y
  fill: [number, number, number, number];   // RGBA [0,1]
  stroke: [number, number, number, number]; // RGBA [0,1]
  strokeW: number;
  cornerR: number;
  opacity: number;
}

export interface KlintGPUSurface {
  canvas: HTMLCanvasElement;
  gpuCtx: GPUCanvasContext;
  width: number;
  height: number;
  dpr: number;
}

// ─── Color parser ─────────────────────────────────────────────────────────────

// Reuse a single hidden canvas for CSS color parsing
let _colorCanvas: HTMLCanvasElement | null = null;
let _colorCtx: CanvasRenderingContext2D | null = null;

export function parseCSSColor(css: string): [number, number, number, number] {
  if (!_colorCanvas) {
    _colorCanvas = document.createElement('canvas');
    _colorCanvas.width = _colorCanvas.height = 1;
    _colorCtx = _colorCanvas.getContext('2d')!;
  }
  if (!_colorCtx) return [0, 0, 0, 1];

  // Handle transparent
  if (css === 'transparent' || css === 'none') return [0, 0, 0, 0];

  _colorCtx.clearRect(0, 0, 1, 1);
  _colorCtx.fillStyle = '#000';
  _colorCtx.fillStyle = css;
  const hex = _colorCtx.fillStyle;

  // fillStyle normalizes to '#rrggbb' or 'rgba(r,g,b,a)'
  if (hex.startsWith('#')) {
    const n = parseInt(hex.slice(1), 16);
    const len = hex.length - 1;
    if (len === 6) {
      return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
    }
    if (len === 8) {
      return [(n >> 24 & 255) / 255, (n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    }
  }
  if (hex.startsWith('rgba')) {
    const m = hex.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255, +m[4]];
  }
  if (hex.startsWith('rgb')) {
    const m = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) return [+m[1] / 255, +m[2] / 255, +m[3] / 255, 1];
  }
  return [0, 0, 0, 1];
}

// ─── Transform stack (CPU-side 2×3 affine) ────────────────────────────────────

class TransformStack {
  private stack: Float32Array[] = [];
  // [a, b, c, d, tx, ty] — row-major
  private current: Float32Array = new Float32Array([1, 0, 0, 1, 0, 0]);

  push() {
    this.stack.push(this.current.slice());
  }
  pop() {
    const prev = this.stack.pop();
    if (prev) this.current = prev;
  }
  reset() {
    this.current = new Float32Array([1, 0, 0, 1, 0, 0]);
    this.stack = [];
  }
  translate(tx: number, ty: number) {
    const [a, b, c, d, x, y] = this.current;
    this.current[4] = a * tx + c * ty + x;
    this.current[5] = b * tx + d * ty + y;
  }
  rotate(angle: number) {
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const [a, b, c, d, tx, ty] = this.current;
    this.current[0] = a * cos + c * sin;
    this.current[1] = b * cos + d * sin;
    this.current[2] = a * -sin + c * cos;
    this.current[3] = b * -sin + d * cos;
    this.current[4] = tx;
    this.current[5] = ty;
  }
  scale(sx: number, sy = sx) {
    this.current[0] *= sx; this.current[1] *= sx;
    this.current[2] *= sy; this.current[3] *= sy;
  }
  /** Transform a point (CSS px) through the current matrix */
  apply(px: number, py: number): [number, number] {
    const [a, b, c, d, tx, ty] = this.current;
    return [a * px + c * py + tx, b * px + d * py + ty];
  }
  /** Scale factor for stroke/radius (uniform scale only — approx for non-uniform) */
  scaleX(): number {
    return Math.sqrt(this.current[0] ** 2 + this.current[1] ** 2);
  }
  scaleY(): number {
    return Math.sqrt(this.current[2] ** 2 + this.current[3] ** 2);
  }
}

// ─── WebGPURenderer ──────────────────────────────────────────────────────────

export class WebGPURenderer {
  readonly device: GPUDevice;
  private pipeline!: GPURenderPipeline;
  private uniformBuf!: GPUBuffer;
  private storageBuf!: GPUBuffer;
  private bindGroupLayout!: GPUBindGroupLayout;
  private bindGroup!: GPUBindGroup;
  private storageCapacity = INITIAL_CAPACITY;
  private format: GPUTextureFormat = 'bgra8unorm';

  // Per-frame draw list
  private commands: DrawCommand[] = [];

  // Render state (mirrors KlintContext API)
  private _fill: [number, number, number, number] = [1, 1, 1, 1];
  private _stroke: [number, number, number, number] = [0, 0, 0, 0];
  private _strokeW = 0;
  private _cornerR = 0;
  private _opacity = 1;
  private _noFill = false;
  private _noStroke = true;
  readonly transform = new TransformStack();

  // Background color for this frame
  private _bgColor: GPUColor = { r: 0, g: 0, b: 0, a: 1 };

  private surfaces: KlintGPUSurface[] = [];

  private constructor(device: GPUDevice) {
    this.device = device;
  }

  // ─── Static factory ───────────────────────────────────────────────────────

  static async init(): Promise<WebGPURenderer> {
    if (!navigator.gpu) throw new Error('WebGPU not supported in this browser');
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance',
    });
    if (!adapter) throw new Error('No WebGPU adapter found');
    const device = await adapter.requestDevice();
    const renderer = new WebGPURenderer(device);
    await renderer._buildPipeline();
    return renderer;
  }

  // ─── Surface management (multi-canvas) ───────────────────────────────────

  addCanvas(canvas: HTMLCanvasElement, dpr = window.devicePixelRatio || 1): KlintGPUSurface {
    const gpuCtx = canvas.getContext('webgpu') as GPUCanvasContext;
    if (!gpuCtx) throw new Error('Failed to get WebGPU context from canvas');

    this.format = navigator.gpu.getPreferredCanvasFormat();
    gpuCtx.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'premultiplied',
    });

    const surface: KlintGPUSurface = {
      canvas,
      gpuCtx,
      width: canvas.width,
      height: canvas.height,
      dpr,
    };
    this.surfaces.push(surface);
    return surface;
  }

  removeCanvas(canvas: HTMLCanvasElement) {
    this.surfaces = this.surfaces.filter(s => s.canvas !== canvas);
  }

  resizeSurface(surface: KlintGPUSurface, width: number, height: number, dpr: number) {
    surface.canvas.width = Math.floor(width * dpr);
    surface.canvas.height = Math.floor(height * dpr);
    surface.canvas.style.width = `${width}px`;
    surface.canvas.style.height = `${height}px`;
    surface.width = surface.canvas.width;
    surface.height = surface.canvas.height;
    surface.dpr = dpr;
  }

  // ─── Render state API (mirrors KlintFunctions) ────────────────────────────

  setFill(css: string) {
    this._fill = parseCSSColor(css);
    this._noFill = false;
  }
  setNoFill() {
    this._noFill = true;
  }
  setStroke(css: string) {
    this._stroke = parseCSSColor(css);
    this._noStroke = false;
  }
  setNoStroke() {
    this._noStroke = true;
  }
  setStrokeWidth(w: number) {
    this._strokeW = Math.max(0, w);
    this._noStroke = w <= 0;
  }
  setCornerRadius(r: number) {
    this._cornerR = r;
  }
  setOpacity(a: number) {
    this._opacity = Math.max(0, Math.min(1, a));
  }
  setBackground(css: string) {
    const [r, g, b, a] = parseCSSColor(css);
    this._bgColor = { r, g, b, a };
  }

  // ─── Draw commands ────────────────────────────────────────────────────────

  private push(cmd: Omit<DrawCommand, 'fill' | 'stroke' | 'strokeW' | 'cornerR' | 'opacity'>) {
    this.commands.push({
      ...cmd,
      fill: this._noFill ? [0, 0, 0, 0] : [...this._fill],
      stroke: this._noStroke ? [0, 0, 0, 0] : [...this._stroke],
      strokeW: this._noStroke ? 0 : this._strokeW,
      cornerR: this._cornerR,
      opacity: this._opacity,
    });
  }

  circle(x: number, y: number, r: number, r2?: number) {
    const [px, py] = this.transform.apply(x, y);
    const sx = r * this.transform.scaleX();
    const sy = (r2 ?? r) * this.transform.scaleY();
    this.push({ type: SHAPE_TYPE.CIRCLE, px, py, sx, sy });
  }

  rect(x: number, y: number, w: number, h: number, cornerR?: number) {
    const [px, py] = this.transform.apply(x + w / 2, y + h / 2);
    const sx = (w / 2) * this.transform.scaleX();
    const sy = (h / 2) * this.transform.scaleY();
    if (cornerR !== undefined) this.setCornerRadius(cornerR);
    this.push({ type: SHAPE_TYPE.RECT, px, py, sx, sy });
    if (cornerR !== undefined) this.setCornerRadius(0);
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    const [px, py] = this.transform.apply(cx, cy);
    const [ax, ay] = this.transform.apply(x1, y1);
    const sx = ax - px, sy = ay - py;
    this.push({ type: SHAPE_TYPE.LINE, px, py, sx, sy });
  }

  point(x: number, y: number) {
    const [px, py] = this.transform.apply(x, y);
    this.push({ type: SHAPE_TYPE.POINT, px, py, sx: 0, sy: 0 });
  }

  // ─── Frame lifecycle ──────────────────────────────────────────────────────

  beginFrame() {
    this.commands = [];
    this.transform.reset();
  }

  /** Render the accumulated frame to one or all registered surfaces */
  render(surface?: KlintGPUSurface) {
    const targets = surface ? [surface] : this.surfaces;
    if (targets.length === 0 || this.commands.length === 0) {
      // Still clear even with no shapes
      for (const s of targets) this._clearSurface(s);
      return;
    }

    this._uploadShapes();

    for (const s of targets) {
      this._updateUniforms(s);
      this._renderPass(s);
    }
  }

  private _clearSurface(s: KlintGPUSurface) {
    const tex = s.gpuCtx.getCurrentTexture().createView();
    const cmd = this.device.createCommandEncoder();
    cmd.beginRenderPass({
      colorAttachments: [{
        view: tex,
        clearValue: this._bgColor,
        loadOp: 'clear',
        storeOp: 'store',
      }],
    }).end();
    this.device.queue.submit([cmd.finish()]);
  }

  // ─── Internal GPU work ────────────────────────────────────────────────────

  private _uploadShapes() {
    const count = this.commands.length;
    const needed = count * SHAPE_STRIDE;

    // Grow storage buffer if needed
    if (count > this.storageCapacity) {
      this.storageCapacity = Math.max(count * 2, this.storageCapacity * 2);
      this.storageBuf.destroy();
      this.storageBuf = this.device.createBuffer({
        size: this.storageCapacity * SHAPE_STRIDE,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      this._rebuildBindGroup();
    }

    const data = new ArrayBuffer(needed);
    const view = new DataView(data);
    let off = 0;
    for (const c of this.commands) {
      view.setFloat32(off + 0, c.px, true);
      view.setFloat32(off + 4, c.py, true);
      view.setFloat32(off + 8, c.sx, true);
      view.setFloat32(off + 12, c.sy, true);
      // fill rgba
      view.setFloat32(off + 16, c.fill[0], true);
      view.setFloat32(off + 20, c.fill[1], true);
      view.setFloat32(off + 24, c.fill[2], true);
      view.setFloat32(off + 28, c.fill[3], true);
      // stroke rgba
      view.setFloat32(off + 32, c.stroke[0], true);
      view.setFloat32(off + 36, c.stroke[1], true);
      view.setFloat32(off + 40, c.stroke[2], true);
      view.setFloat32(off + 44, c.stroke[3], true);
      view.setFloat32(off + 48, c.strokeW, true);
      view.setFloat32(off + 52, c.cornerR, true);
      view.setUint32(off + 56, c.type, true);
      view.setFloat32(off + 60, c.opacity, true);
      // pad to 80 bytes
      off += SHAPE_STRIDE;
    }
    this.device.queue.writeBuffer(this.storageBuf, 0, data);
  }

  private _updateUniforms(s: KlintGPUSurface) {
    const buf = new Float32Array(4);
    buf[0] = s.width;
    buf[1] = s.height;
    buf[2] = s.dpr;
    buf[3] = 0;
    this.device.queue.writeBuffer(this.uniformBuf, 0, buf);
  }

  private _renderPass(s: KlintGPUSurface) {
    const tex = s.gpuCtx.getCurrentTexture().createView();
    const encoder = this.device.createCommandEncoder({ label: 'klint-gpu-frame' });

    const pass = encoder.beginRenderPass({
      label: 'klint-gpu-shapes',
      colorAttachments: [{
        view: tex,
        clearValue: this._bgColor,
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.draw(6, this.commands.length, 0, 0); // 6 verts, N instances
    pass.end();

    this.device.queue.submit([encoder.finish()]);
  }

  // ─── Pipeline setup ───────────────────────────────────────────────────────

  private async _buildPipeline() {
    this.format = navigator.gpu.getPreferredCanvasFormat();

    // Buffers
    this.uniformBuf = this.device.createBuffer({
      size: 16, // vec4f (size.xy, dpr, pad)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.storageBuf = this.device.createBuffer({
      size: this.storageCapacity * SHAPE_STRIDE,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
      ],
    });

    this._rebuildBindGroup();

    // Load shader
    const wgsl = await this._loadShader();
    const shaderModule = this.device.createShaderModule({ code: wgsl, label: 'sdf-shapes' });

    this.pipeline = this.device.createRenderPipeline({
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.bindGroupLayout] }),
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{
          format: this.format,
          blend: {
            color: { operation: 'add', srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
            alpha: { operation: 'add', srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
          },
        }],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  private _rebuildBindGroup() {
    this.bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuf } },
        { binding: 1, resource: { buffer: this.storageBuf } },
      ],
    });
  }

  private async _loadShader(): Promise<string> {
    // Inline the WGSL so the bundle is self-contained
    return WGSL_SDF_SHAPES;
  }

  destroy() {
    this.uniformBuf.destroy();
    this.storageBuf.destroy();
  }
}

// ─── Inlined WGSL (set by build step) ────────────────────────────────────────
// This string is replaced with the actual WGSL at build time via a Vite/esbuild plugin,
// or at runtime by a fetch. For now we inline it directly.

const WGSL_SDF_SHAPES = /* wgsl */`
struct Screen {
  size    : vec2f,
  dpr     : f32,
  _pad    : f32,
}
struct Shape {
  pos         : vec2f,
  size        : vec2f,
  fill        : vec4f,
  stroke      : vec4f,
  stroke_w    : f32,
  corner_r    : f32,
  shape_type  : u32,
  opacity     : f32,
}
@group(0) @binding(0) var<uniform>        screen : Screen;
@group(0) @binding(1) var<storage, read>  shapes : array<Shape>;

struct VertOut {
  @builtin(position)                   clip_pos : vec4f,
  @location(0)                         px_local : vec2f,
  @location(1) @interpolate(flat)      idx      : u32,
}
const QUAD = array<vec2f, 6>(
  vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(1.0,1.0),
  vec2f(-1.0,-1.0), vec2f(1.0,1.0),  vec2f(-1.0,1.0),
);
@vertex fn vs_main(
  @builtin(vertex_index)   vi : u32,
  @builtin(instance_index) ii : u32,
) -> VertOut {
  let s  = shapes[ii];
  let qv = QUAD[vi];
  var half_size : vec2f;
  if s.shape_type == 2u {
    let hl = length(s.size) * 0.5 + s.stroke_w * 0.5 + 2.0;
    half_size = vec2f(hl + abs(s.size.x)*0.5, hl + abs(s.size.y)*0.5);
  } else {
    half_size = s.size + vec2f(s.stroke_w*0.5 + 2.0);
  }
  let wp  = s.pos + qv * half_size;
  let ndc = vec2f(wp.x/screen.size.x*2.0-1.0, -(wp.y/screen.size.y*2.0-1.0));
  var o   : VertOut;
  o.clip_pos = vec4f(ndc,0.0,1.0);
  o.px_local = qv * half_size;
  o.idx      = ii;
  return o;
}
fn sdf_circle(p:vec2f,r:f32)->f32{ return length(p)-r; }
fn sdf_ellipse(p:vec2f,ab:vec2f)->f32{
  let k1=length(p/ab); let k2=length(p/(ab*ab));
  return k1*(k1-1.0)/k2;
}
fn sdf_rrect(p:vec2f,hw:vec2f,r:f32)->f32{
  let q=abs(p)-hw+vec2f(r);
  return length(max(q,vec2f(0.0)))+min(max(q.x,q.y),0.0)-r;
}
fn sdf_seg(p:vec2f,a:vec2f,b:vec2f)->f32{
  let pa=p-a; let ba=b-a;
  let h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
  return length(pa-ba*h);
}
@fragment fn fs_main(in:VertOut)->@location(0) vec4f {
  let s=shapes[in.idx];
  let p=in.px_local;
  var d:f32;
  switch s.shape_type {
    case 0u: {
      if s.size.x==s.size.y { d=sdf_circle(p,s.size.x); }
      else { d=sdf_ellipse(p,s.size); }
    }
    case 1u: { d=sdf_rrect(p,s.size,s.corner_r); }
    case 2u: { d=sdf_seg(p,-s.size,s.size)-s.stroke_w*0.5; }
    case 3u: { d=sdf_circle(p,s.stroke_w*0.5); }
    default: { d=1.0; }
  }
  let aa=max(fwidth(d),0.0001);
  let fa=1.0-smoothstep(-aa,aa,d);
  var color=vec4f(s.fill.rgb*s.fill.a,s.fill.a)*fa;
  if s.stroke_w>0.0 {
    let sd=abs(d)-s.stroke_w*0.5;
    let sa=(1.0-smoothstep(-aa,aa,sd))*s.stroke.a;
    color=color*(1.0-sa)+vec4f(s.stroke.rgb*sa,sa);
  }
  color=color*s.opacity;
  if color.a<0.001 { discard; }
  return color;
}
`;
