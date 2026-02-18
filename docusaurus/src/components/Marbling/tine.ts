/**
 * Vector-based marbling engine.
 *
 * Based on "Mathematical Marbling" (Lu, Jaffer, Jin, Zhao, Mao, 2012)
 * and Aubrey Jaffer's "The Mathematics of Marbling."
 *
 * Each ink drop is a polygon of vertices. Operations displace vertices
 * analytically — no pixel manipulation. Drawing is just filling polygons,
 * so the GPU handles rasterization with perfectly crisp edges.
 */

export interface Drop {
  color: string;
  vertices: { x: number; y: number }[];
}

/**
 * Create a circular ink drop with evenly spaced vertices.
 */
export function createDrop(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  numVertices = 120,
): Drop {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    vertices.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return { color, vertices };
}

/**
 * Create a flower-shaped drop using a rose curve.
 * r(θ) = radius × (1 + amplitude × cos(petals × θ))
 */
export function createFlower(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  petals: number,
  amplitude: number,
  numVertices = 120,
): Drop {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const r = radius * (1 + amplitude * Math.cos(petals * angle));
    vertices.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return { color, vertices };
}

/**
 * Create an organic blob using layered sine harmonics.
 * Each harmonic adds a wobble at a different frequency.
 */
export function createBlob(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  harmonics: { amp: number; freq: number; phase: number }[],
  numVertices = 120,
): Drop {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    let r = radius;
    for (const h of harmonics) {
      r += radius * h.amp * Math.sin(h.freq * angle + h.phase);
    }
    vertices.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return { color, vertices };
}

/**
 * Create a star with sharp points.
 * Alternates between outer radius and inner radius with smooth transitions.
 */
export function createStar(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  points: number,
  innerRatio: number,
  sharpness = 0.6,
  numVertices = 120,
): Drop {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const t = Math.pow((1 + Math.cos(points * angle)) / 2, sharpness);
    const r = radius * (innerRatio + (1 - innerRatio) * t);
    vertices.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return { color, vertices };
}

/**
 * Create a crescent / limaçon shape.
 * offset=0 is a circle, 0.5 is a cardioid, 0.8 is a deep crescent.
 * rotation rotates the bulge direction.
 */
export function createCrescent(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  offset: number,
  rotation: number,
  numVertices = 120,
): Drop {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const r = radius * (1 + offset * Math.cos(angle - rotation));
    vertices.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return { color, vertices };
}

/**
 * Create a supershape using the Gielis formula.
 * One formula that can produce stars, flowers, organic lobes, and everything in between.
 * r(θ) = (|cos(mθ/4)/a|^n2 + |sin(mθ/4)/b|^n3)^(-1/n1)
 */
export function createSupershape(
  cx: number,
  cy: number,
  radius: number,
  color: string,
  m: number,
  n1: number,
  n2: number,
  n3: number,
  numVertices = 120,
): Drop {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const t1 = Math.abs(Math.cos((m * angle) / 4));
    const t2 = Math.abs(Math.sin((m * angle) / 4));
    const r = radius * Math.pow(Math.pow(t1, n2) + Math.pow(t2, n3), -1 / n1);
    vertices.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    });
  }
  return { color, vertices };
}

/**
 * Displace all existing drops when a new ink drop lands.
 *
 * Formula: P' = C + (P - C) * sqrt(1 + r² / ||P - C||²)
 *
 * This is area-preserving (incompressible) — paint pushes outward
 * without overlapping or leaving gaps.
 */
export function displaceForDrop(
  drops: Drop[],
  cx: number,
  cy: number,
  radius: number,
) {
  const r2 = radius * radius;
  for (const drop of drops) {
    for (const v of drop.vertices) {
      const dx = v.x - cx;
      const dy = v.y - cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 0.01) continue; // skip coincident points
      const factor = Math.sqrt(1 + r2 / dist2);
      v.x = cx + dx * factor;
      v.y = cy + dy * factor;
    }
  }
}

/**
 * Apply a tine (stylus/toothpick) drag through the paint.
 *
 * Formula: P' = P + z · u^(d/scale) · M
 *
 * - M: unit vector of drag direction
 * - d: perpendicular distance from point to the tine line
 * - z: max displacement (drag magnitude)
 * - u: base falloff rate (0 < u < 1, smaller = sharper cusps)
 * - scale: normalizes distance so falloff is independent of canvas size
 */
export function applyTineLine(
  drops: Drop[],
  lineX: number,
  lineY: number,
  dirX: number,
  dirY: number,
  z: number,
  u: number,
  scale: number,
) {
  const len = Math.sqrt(dirX * dirX + dirY * dirY);
  if (len < 0.5) return;

  // M = direction unit vector
  const mx = dirX / len;
  const my = dirY / len;

  for (const drop of drops) {
    for (const v of drop.vertices) {
      const relX = v.x - lineX;
      const relY = v.y - lineY;
      const d = Math.sqrt(relX * relX + relY * relY); // distance to point
      const displacement = z * Math.pow(u, d / scale);
      v.x += mx * displacement;
      v.y += my * displacement;
    }
  }

  // Subdivide edges that stretched too far — prevents self-intersection
  subdivideStretched(drops, 8);
}

/**
 * Subdivide any polygon edge longer than maxLen by inserting midpoints.
 * This keeps the polygon smooth through sharp displacement gradients
 * instead of letting edges jump across and fold over themselves.
 * Caps vertex count per drop to prevent unbounded growth.
 */
const MAX_VERTICES_PER_DROP = 3000;

function subdivideStretched(drops: Drop[], maxLen: number) {
  const maxLen2 = maxLen * maxLen;

  for (const drop of drops) {
    if (drop.vertices.length >= MAX_VERTICES_PER_DROP) continue;

    const verts = drop.vertices;
    const len = verts.length;
    let needsSubdiv = false;

    // Quick scan: does any edge exceed the threshold?
    for (let i = 0; i < len; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % len];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      if (dx * dx + dy * dy > maxLen2) {
        needsSubdiv = true;
        break;
      }
    }

    if (!needsSubdiv) continue;

    const newVerts: { x: number; y: number }[] = [];
    for (let i = 0; i < len; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % len];
      newVerts.push(a);

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const edgeLen2 = dx * dx + dy * dy;

      if (edgeLen2 > maxLen2) {
        const edgeLen = Math.sqrt(edgeLen2);
        const subdivs = Math.ceil(edgeLen / maxLen);
        for (let j = 1; j < subdivs; j++) {
          const t = j / subdivs;
          newVerts.push({
            x: a.x + dx * t,
            y: a.y + dy * t,
          });
        }
      }
    }

    drop.vertices = newVerts;
  }
}
