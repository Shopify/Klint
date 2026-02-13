/**
 * Standalone Perlin noise implementation for Art Studio algorithms.
 *
 * The published @shopify/klint (0.0.98) doesn't include K.Noise.
 * This module provides the same perlin(x, y?, z?) API so algorithms
 * don't depend on a specific Klint version.
 */

const p = new Uint8Array(512);
let seeded = false;

function buildPerm(seed: number) {
  const t = new Uint8Array(256);
  for (let i = 0; i < 256; i++) t[i] = i;
  // Fisher-Yates shuffle seeded by sin hash
  let s = seed;
  const rng = () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
  for (let i = 255; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const tmp = t[i];
    t[i] = t[j];
    t[j] = tmp;
  }
  for (let i = 0; i < 512; i++) p[i] = t[i & 255];
}

function ensureInit() {
  if (!seeded) {
    buildPerm(42);
    seeded = true;
  }
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number) {
  return a + t * (b - a);
}

function grad2(h: number, x: number, y: number) {
  const b = h & 3;
  return ((b & 1) === 0 ? x : -x) + ((b & 2) === 0 ? y : -y);
}

function grad3(h: number, x: number, y: number, z: number) {
  h &= 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/** 2D Perlin noise. Returns roughly [-1, 1]. */
function perlin2(x: number, y: number): number {
  ensureInit();
  const fx = Math.floor(x),
    fy = Math.floor(y);
  const X = fx & 255,
    Y = fy & 255;
  const xf = x - fx,
    yf = y - fy;
  const u = fade(xf),
    v = fade(yf);
  const aa = p[p[X] + Y],
    ab = p[p[X] + Y + 1];
  const ba = p[p[X + 1] + Y],
    bb = p[p[X + 1] + Y + 1];
  return lerp(
    v,
    lerp(u, grad2(aa, xf, yf), grad2(ba, xf - 1, yf)),
    lerp(u, grad2(ab, xf, yf - 1), grad2(bb, xf - 1, yf - 1)),
  );
}

/** 3D Perlin noise. Returns roughly [-1, 1]. */
function perlin3(x: number, y: number, z: number): number {
  ensureInit();
  const fx = Math.floor(x),
    fy = Math.floor(y),
    fz = Math.floor(z);
  const X = fx & 255,
    Y = fy & 255,
    Z = fz & 255;
  const xf = x - fx,
    yf = y - fy,
    zf = z - fz;
  const u = fade(xf),
    v = fade(yf),
    w = fade(zf);
  const A = p[X] + Y,
    B = p[X + 1] + Y;
  const AA = p[A] + Z,
    AB = p[A + 1] + Z,
    BA = p[B] + Z,
    BB = p[B + 1] + Z;
  return lerp(
    w,
    lerp(
      v,
      lerp(u, grad3(p[AA], xf, yf, zf), grad3(p[BA], xf - 1, yf, zf)),
      lerp(u, grad3(p[AB], xf, yf - 1, zf), grad3(p[BB], xf - 1, yf - 1, zf)),
    ),
    lerp(
      v,
      lerp(u, grad3(p[AA + 1], xf, yf, zf - 1), grad3(p[BA + 1], xf - 1, yf, zf - 1)),
      lerp(u, grad3(p[AB + 1], xf, yf - 1, zf - 1), grad3(p[BB + 1], xf - 1, yf - 1, zf - 1)),
    ),
  );
}

/** Perlin noise — 2D or 3D. */
export function perlin(x: number, y: number, z?: number): number {
  if (z !== undefined) return perlin3(x, y, z);
  return perlin2(x, y);
}
