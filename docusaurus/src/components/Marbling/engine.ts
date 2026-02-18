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

import type { Drop } from "./config";

/**
 * Sample a polar radius function at evenly spaced angles to produce a polygon.
 */
function createPolarDrop(
  cx: number,
  cy: number,
  color: string,
  radiusFn: (angle: number) => number,
  numVertices = 120,
): Drop {
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const r = radiusFn(angle);
    vertices.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return { color, vertices };
}

export function createDrop(cx: number, cy: number, radius: number, color: string, numVertices = 120): Drop {
  return createPolarDrop(cx, cy, color, () => radius, numVertices);
}

/** r(θ) = radius × (1 + amplitude × cos(petals × θ)) */
export function createFlower(cx: number, cy: number, radius: number, color: string, petals: number, amplitude: number, numVertices = 120): Drop {
  return createPolarDrop(cx, cy, color, (a) => radius * (1 + amplitude * Math.cos(petals * a)), numVertices);
}

/** Layered sine harmonics — each harmonic adds a wobble at a different frequency. */
export function createBlob(cx: number, cy: number, radius: number, color: string, harmonics: { amp: number; freq: number; phase: number }[], numVertices = 120): Drop {
  return createPolarDrop(cx, cy, color, (a) => {
    let r = radius;
    for (const h of harmonics) r += radius * h.amp * Math.sin(h.freq * a + h.phase);
    return r;
  }, numVertices);
}

/** Smooth star: r oscillates between radius × innerRatio and radius. */
export function createStar(cx: number, cy: number, radius: number, color: string, points: number, innerRatio: number, sharpness = 0.6, numVertices = 120): Drop {
  return createPolarDrop(cx, cy, color, (a) => {
    const t = Math.pow((1 + Math.cos(points * a)) / 2, sharpness);
    return radius * (innerRatio + (1 - innerRatio) * t);
  }, numVertices);
}

/**
 * Limaçon: offset=0 is a circle, 0.5 is a cardioid, 0.8 is a deep crescent.
 * rotation rotates the bulge direction.
 */
export function createCrescent(cx: number, cy: number, radius: number, color: string, offset: number, rotation: number, numVertices = 120): Drop {
  return createPolarDrop(cx, cy, color, (a) => radius * (1 + offset * Math.cos(a - rotation)), numVertices);
}

/** Gielis superformula: r(θ) = (|cos(mθ/4)|^n2 + |sin(mθ/4)|^n3)^(-1/n1) */
export function createSupershape(cx: number, cy: number, radius: number, color: string, m: number, n1: number, n2: number, n3: number, numVertices = 120): Drop {
  return createPolarDrop(cx, cy, color, (a) => {
    const t1 = Math.abs(Math.cos((m * a) / 4));
    const t2 = Math.abs(Math.sin((m * a) / 4));
    return radius * Math.pow(Math.pow(t1, n2) + Math.pow(t2, n3), -1 / n1);
  }, numVertices);
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
 * - d: radial distance from point to the tine origin
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

  const mx = dirX / len;
  const my = dirY / len;

  for (const drop of drops) {
    for (const v of drop.vertices) {
      const relX = v.x - lineX;
      const relY = v.y - lineY;
      const d = Math.sqrt(relX * relX + relY * relY);
      const displacement = z * Math.pow(u, d / scale);
      v.x += mx * displacement;
      v.y += my * displacement;
    }
  }

  subdivideStretched(drops, 8);
  constrainNeighborDistance(drops, 12);
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

/**
 * Constrain each vertex so it stays within maxDist of both its neighbors.
 * If an edge is too long, pull the vertex toward the midpoint of the edge.
 * Multiple passes handle chains of stretched edges.
 */
function constrainNeighborDistance(drops: Drop[], maxDist: number) {
  const maxDist2 = maxDist * maxDist;

  for (const drop of drops) {
    const verts = drop.vertices;
    const len = verts.length;
    if (len < 3) continue;

    for (let pass = 0; pass < 3; pass++) {
      let anyFixed = false;
      for (let i = 0; i < len; i++) {
        const curr = verts[i];
        const next = verts[(i + 1) % len];
        const dx = next.x - curr.x;
        const dy = next.y - curr.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 > maxDist2) {
          const dist = Math.sqrt(dist2);
          const excess = (dist - maxDist) / dist;
          const cx = dx * excess * 0.5;
          const cy = dy * excess * 0.5;
          curr.x += cx;
          curr.y += cy;
          next.x -= cx;
          next.y -= cy;
          anyFixed = true;
        }
      }
      if (!anyFixed) break;
    }
  }
}

