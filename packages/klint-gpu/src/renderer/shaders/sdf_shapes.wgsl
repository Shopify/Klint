// KlintGPU — SDF shape batch renderer
// All shapes share one pipeline; shape_type enum dispatches the SDF.
//
// Shape types:
//   0 = circle / ellipse
//   1 = rectangle (rounded if corner_r > 0)
//   2 = line segment
//   3 = point

struct Screen {
  size    : vec2f,
  dpr     : f32,
  _pad    : f32,
}

// Per-shape data — 80 bytes, std430 layout
struct Shape {
  pos         : vec2f,   // center in CSS pixels
  size        : vec2f,   // radius for circle, half-wh for rect, endpoint delta for line
  fill        : vec4f,   // RGBA premultiplied
  stroke      : vec4f,   // RGBA premultiplied
  stroke_w    : f32,     // stroke width px
  corner_r    : f32,     // rounded rect corner radius (type 1 only)
  shape_type  : u32,     // 0=circle 1=rect 2=line 3=point
  opacity     : f32,     // global opacity multiplier
}

@group(0) @binding(0) var<uniform>         screen : Screen;
@group(0) @binding(1) var<storage, read>   shapes : array<Shape>;

// ─── Vertex stage ────────────────────────────────────────────────────────────

struct VertOut {
  @builtin(position)                   clip_pos : vec4f,
  @location(0)                         px_local : vec2f,  // px from shape center
  @location(1) @interpolate(flat)      idx      : u32,
}

// Procedural quad — 6 vertices (2 tris), no VBO needed
const QUAD = array<vec2f, 6>(
  vec2f(-1.0, -1.0), vec2f( 1.0, -1.0), vec2f( 1.0,  1.0),
  vec2f(-1.0, -1.0), vec2f( 1.0,  1.0), vec2f(-1.0,  1.0),
);

@vertex
fn vs_main(
  @builtin(vertex_index)    vi : u32,
  @builtin(instance_index)  ii : u32,
) -> VertOut {
  let s   = shapes[ii];
  let qv  = QUAD[vi];

  // Expand quad to cover SDF + stroke + 2px AA fringe
  var half_size : vec2f;
  if s.shape_type == 2u {
    // Line: bounding box of segment + stroke + fringe
    let half_len = length(s.size) * 0.5 + s.stroke_w * 0.5 + 2.0;
    half_size = vec2f(half_len + abs(s.size.x) * 0.5,
                      half_len + abs(s.size.y) * 0.5);
  } else {
    half_size = s.size + vec2f(s.stroke_w * 0.5 + 2.0);
  }

  let world_pos = s.pos + qv * half_size;

  // Y-flip: screen Y is down, NDC Y is up
  let ndc = vec2f(
     world_pos.x / screen.size.x * 2.0 - 1.0,
    -world_pos.y / screen.size.y * 2.0 + 1.0,
  );

  var o : VertOut;
  o.clip_pos = vec4f(ndc, 0.0, 1.0);
  o.px_local = qv * half_size;
  o.idx      = ii;
  return o;
}

// ─── SDF library ─────────────────────────────────────────────────────────────

fn sdf_circle(p: vec2f, r: f32) -> f32 {
  return length(p) - r;
}

fn sdf_ellipse(p: vec2f, ab: vec2f) -> f32 {
  // Approximation (exact is iterative; this is fast & good enough for AA)
  let k1 = length(p / ab);
  let k2 = length(p / (ab * ab));
  return k1 * (k1 - 1.0) / k2;
}

fn sdf_rounded_rect(p: vec2f, half_wh: vec2f, r: f32) -> f32 {
  let q = abs(p) - half_wh + vec2f(r);
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - r;
}

fn sdf_segment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h  = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// ─── Fragment stage ───────────────────────────────────────────────────────────

@fragment
fn fs_main(in: VertOut) -> @location(0) vec4f {
  let s  = shapes[in.idx];
  let p  = in.px_local;

  // Compute signed distance
  var d : f32;
  switch s.shape_type {
    case 0u: { // circle / ellipse
      if s.size.x == s.size.y {
        d = sdf_circle(p, s.size.x);
      } else {
        d = sdf_ellipse(p, s.size);
      }
    }
    case 1u: { // rectangle (optionally rounded)
      d = sdf_rounded_rect(p, s.size, s.corner_r);
    }
    case 2u: { // line segment — size = half-delta from center
      let a = -s.size;
      let b =  s.size;
      d = sdf_segment(p, a, b) - s.stroke_w * 0.5;
    }
    case 3u: { // point
      d = sdf_circle(p, s.stroke_w * 0.5);
    }
    default: { d = 1.0; }
  }

  // Anti-aliased coverage
  let aa = max(fwidth(d), 0.0001);

  // Fill coverage (inside shape)
  let fill_a = 1.0 - smoothstep(-aa, aa, d);

  // Stroke ring coverage
  var color = vec4f(s.fill.rgb * s.fill.a, s.fill.a) * fill_a;

  if s.stroke_w > 0.0 {
    let sd        = abs(d) - s.stroke_w * 0.5;
    let stroke_a  = (1.0 - smoothstep(-aa, aa, sd)) * s.stroke.a;
    // Composite stroke over fill (premultiplied)
    color = color * (1.0 - stroke_a) + vec4f(s.stroke.rgb * stroke_a, stroke_a);
  }

  // Global opacity
  color = color * s.opacity;

  if color.a < 0.001 { discard; }
  return color;
}
