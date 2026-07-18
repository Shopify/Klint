import type { KlintContext } from "../KlintTypes";

/**
 * Noise — Perlin (1-4D), Simplex (1-4D), Hash (1-4D), Gaussian random
 *
 * @example
 * ```tsx
 * const draw = (K) => {
 *   K.Noise.seed(42);
 *   const n = K.Noise.perlin(x * 0.01, y * 0.01);
 * };
 * ```
 */
class Noise {
  private p: Uint8Array;
  private _seed: number;

  private static readonly F2 = (Math.sqrt(3) - 1) / 2;
  private static readonly G2 = (3 - Math.sqrt(3)) / 6;
  private static readonly F3 = 1 / 3;
  private static readonly G3 = 1 / 6;
  private static readonly F4 = (Math.sqrt(5) - 1) / 4;
  private static readonly G4 = (5 - Math.sqrt(5)) / 20;

  constructor(_ctx: KlintContext) {
    this._seed = Math.random();
    this.p = new Uint8Array(512);
    this.buildPerm();
  }

  private rng(): number {
    const x = Math.sin(this._seed++) * 10000;
    return x - Math.floor(x);
  }

  private buildPerm(): void {
    const t = new Uint8Array(256);
    for (let i = 0; i < 256; i++) t[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = (this.rng() * (i + 1)) | 0;
      const tmp = t[i];
      t[i] = t[j];
      t[j] = tmp;
    }
    for (let i = 0; i < 512; i++) this.p[i] = t[i & 255];
  }

  /** Set seed for reproducible noise */
  seed(s?: number): void {
    this._seed = s ?? Math.random() * 10000;
    this.buildPerm();
  }

  // ---- Utilities ----

  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private static lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  /** Improved Perlin gradient — maps 4-bit hash to one of 12 gradient directions */
  private static grad3(h: number, x: number, y: number, z: number): number {
    h &= 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  // ---- PERLIN NOISE ----

  perlin(x: number): number;
  perlin(x: number, y: number): number;
  perlin(x: number, y: number, z: number): number;
  perlin(x: number, y: number, z: number, w: number): number;
  perlin(x: number, y?: number, z?: number, w?: number): number {
    if (y === undefined) return this.perlin1(x);
    if (z === undefined) return this.perlin2(x, y);
    if (w === undefined) return this.perlin3(x, y, z);
    return this.perlin4(x, y, z, w);
  }

  private perlin1(x: number): number {
    const p = this.p;
    const fx = Math.floor(x);
    const X = fx & 255;
    const xf = x - fx;
    const u = Noise.fade(xf);
    const g = (h: number, d: number) => ((h & 1) === 0 ? d : -d);
    return Noise.lerp(u, g(p[X], xf), g(p[X + 1], xf - 1));
  }

  private perlin2(x: number, y: number): number {
    const { fade, lerp } = Noise;
    const p = this.p;
    const fx = Math.floor(x),
      fy = Math.floor(y);
    const X = fx & 255,
      Y = fy & 255;
    const xf = x - fx,
      yf = y - fy;
    const u = fade(xf),
      v = fade(yf);
    const g = (h: number, x: number, y: number) => {
      const b = h & 3;
      return ((b & 1) === 0 ? x : -x) + ((b & 2) === 0 ? y : -y);
    };
    const aa = p[p[X] + Y],
      ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y],
      bb = p[p[X + 1] + Y + 1];
    return lerp(
      v,
      lerp(u, g(aa, xf, yf), g(ba, xf - 1, yf)),
      lerp(u, g(ab, xf, yf - 1), g(bb, xf - 1, yf - 1)),
    );
  }

  private perlin3(x: number, y: number, z: number): number {
    const { fade, lerp, grad3 } = Noise;
    const p = this.p;
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
        lerp(
          u,
          grad3(p[AA + 1], xf, yf, zf - 1),
          grad3(p[BA + 1], xf - 1, yf, zf - 1),
        ),
        lerp(
          u,
          grad3(p[AB + 1], xf, yf - 1, zf - 1),
          grad3(p[BB + 1], xf - 1, yf - 1, zf - 1),
        ),
      ),
    );
  }

  private perlin4(x: number, y: number, z: number, w: number): number {
    const { fade, lerp } = Noise;
    const p = this.p;
    const fx = Math.floor(x),
      fy = Math.floor(y),
      fz = Math.floor(z),
      fw = Math.floor(w);
    const X = fx & 255,
      Y = fy & 255,
      Z = fz & 255,
      W = fw & 255;
    const xf = x - fx,
      yf = y - fy,
      zf = z - fz,
      wf = w - fw;
    const fu = fade(xf),
      fv = fade(yf),
      fW = fade(zf),
      ft = fade(wf);
    const g = (h: number, x: number, y: number, z: number, w: number) => {
      const b = h & 31;
      const u = b < 24 ? x : y;
      const v = b < 16 ? y : z;
      const t = b < 8 ? z : w;
      return (
        ((b & 1) === 0 ? u : -u) +
        ((b & 2) === 0 ? v : -v) +
        ((b & 4) === 0 ? t : -t)
      );
    };
    const h = (dx: number, dy: number, dz: number, dw: number) =>
      p[p[p[p[X + dx] + Y + dy] + Z + dz] + W + dw];
    return lerp(
      ft,
      lerp(
        fW,
        lerp(
          fv,
          lerp(
            fu,
            g(h(0, 0, 0, 0), xf, yf, zf, wf),
            g(h(1, 0, 0, 0), xf - 1, yf, zf, wf),
          ),
          lerp(
            fu,
            g(h(0, 1, 0, 0), xf, yf - 1, zf, wf),
            g(h(1, 1, 0, 0), xf - 1, yf - 1, zf, wf),
          ),
        ),
        lerp(
          fv,
          lerp(
            fu,
            g(h(0, 0, 1, 0), xf, yf, zf - 1, wf),
            g(h(1, 0, 1, 0), xf - 1, yf, zf - 1, wf),
          ),
          lerp(
            fu,
            g(h(0, 1, 1, 0), xf, yf - 1, zf - 1, wf),
            g(h(1, 1, 1, 0), xf - 1, yf - 1, zf - 1, wf),
          ),
        ),
      ),
      lerp(
        fW,
        lerp(
          fv,
          lerp(
            fu,
            g(h(0, 0, 0, 1), xf, yf, zf, wf - 1),
            g(h(1, 0, 0, 1), xf - 1, yf, zf, wf - 1),
          ),
          lerp(
            fu,
            g(h(0, 1, 0, 1), xf, yf - 1, zf, wf - 1),
            g(h(1, 1, 0, 1), xf - 1, yf - 1, zf, wf - 1),
          ),
        ),
        lerp(
          fv,
          lerp(
            fu,
            g(h(0, 0, 1, 1), xf, yf, zf - 1, wf - 1),
            g(h(1, 0, 1, 1), xf - 1, yf, zf - 1, wf - 1),
          ),
          lerp(
            fu,
            g(h(0, 1, 1, 1), xf, yf - 1, zf - 1, wf - 1),
            g(h(1, 1, 1, 1), xf - 1, yf - 1, zf - 1, wf - 1),
          ),
        ),
      ),
    );
  }

  // ---- SIMPLEX NOISE ----

  simplex(x: number): number;
  simplex(x: number, y: number): number;
  simplex(x: number, y: number, z: number): number;
  simplex(x: number, y: number, z: number, w: number): number;
  simplex(x: number, y?: number, z?: number, w?: number): number {
    if (y === undefined) return this.perlin1(x); // 1D simplex ≈ 1D perlin
    if (z === undefined) return this.simplex2(x, y);
    if (w === undefined) return this.simplex3(x, y, z);
    return this.simplex4(x, y, z, w);
  }

  private simplex2(x: number, y: number): number {
    const { F2, G2, grad3 } = Noise;
    const p = this.p;
    const s = (x + y) * F2;
    const i = Math.floor(x + s),
      j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - (i - t),
      y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0,
      j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2,
      y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2,
      y2 = y0 - 1 + 2 * G2;
    const ii = i & 255,
      jj = j & 255;
    const gi0 = p[ii + p[jj]] % 12;
    const gi1 = p[ii + i1 + p[jj + j1]] % 12;
    const gi2 = p[ii + 1 + p[jj + 1]] % 12;
    let n0 = 0,
      n1 = 0,
      n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * grad3(gi0, x0, y0, 0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * grad3(gi1, x1, y1, 0);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * grad3(gi2, x2, y2, 0);
    }
    return 70 * (n0 + n1 + n2);
  }

  private simplex3(x: number, y: number, z: number): number {
    const { F3, G3, grad3 } = Noise;
    const p = this.p;
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s),
      j = Math.floor(y + s),
      k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const x0 = x - (i - t),
      y0 = y - (j - t),
      z0 = z - (k - t);

    let i1: number, j1: number, k1: number;
    let i2: number, j2: number, k2: number;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3,
      y1 = y0 - j1 + G3,
      z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3,
      y2 = y0 - j2 + 2 * G3,
      z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3,
      y3 = y0 - 1 + 3 * G3,
      z3 = z0 - 1 + 3 * G3;
    const ii = i & 255,
      jj = j & 255,
      kk = k & 255;
    const gi0 = p[ii + p[jj + p[kk]]] % 12;
    const gi1 = p[ii + i1 + p[jj + j1 + p[kk + k1]]] % 12;
    const gi2 = p[ii + i2 + p[jj + j2 + p[kk + k2]]] % 12;
    const gi3 = p[ii + 1 + p[jj + 1 + p[kk + 1]]] % 12;

    let n = 0;
    let tc = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * grad3(gi0, x0, y0, z0);
    }
    tc = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * grad3(gi1, x1, y1, z1);
    }
    tc = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * grad3(gi2, x2, y2, z2);
    }
    tc = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * grad3(gi3, x3, y3, z3);
    }
    return 32 * n;
  }

  private simplex4(x: number, y: number, z: number, w: number): number {
    const { F4, G4 } = Noise;
    const p = this.p;
    const s = (x + y + z + w) * F4;
    const i = Math.floor(x + s),
      j = Math.floor(y + s),
      k = Math.floor(z + s),
      l = Math.floor(w + s);
    const t = (i + j + k + l) * G4;
    const x0 = x - (i - t),
      y0 = y - (j - t),
      z0 = z - (k - t),
      w0 = w - (l - t);

    // Rank coordinates to determine simplex traversal
    let rx = 0,
      ry = 0,
      rz = 0,
      rw = 0;
    if (x0 > y0) rx++;
    else ry++;
    if (x0 > z0) rx++;
    else rz++;
    if (x0 > w0) rx++;
    else rw++;
    if (y0 > z0) ry++;
    else rz++;
    if (y0 > w0) ry++;
    else rw++;
    if (z0 > w0) rz++;
    else rw++;

    const i1 = +(rx >= 3),
      j1 = +(ry >= 3),
      k1 = +(rz >= 3),
      l1 = +(rw >= 3);
    const i2 = +(rx >= 2),
      j2 = +(ry >= 2),
      k2 = +(rz >= 2),
      l2 = +(rw >= 2);
    const i3 = +(rx >= 1),
      j3 = +(ry >= 1),
      k3 = +(rz >= 1),
      l3 = +(rw >= 1);

    const x1 = x0 - i1 + G4,
      y1 = y0 - j1 + G4,
      z1 = z0 - k1 + G4,
      w1 = w0 - l1 + G4;
    const x2 = x0 - i2 + 2 * G4,
      y2 = y0 - j2 + 2 * G4,
      z2 = z0 - k2 + 2 * G4,
      w2 = w0 - l2 + 2 * G4;
    const x3 = x0 - i3 + 3 * G4,
      y3 = y0 - j3 + 3 * G4,
      z3 = z0 - k3 + 3 * G4,
      w3 = w0 - l3 + 3 * G4;
    const x4 = x0 - 1 + 4 * G4,
      y4 = y0 - 1 + 4 * G4,
      z4 = z0 - 1 + 4 * G4,
      w4 = w0 - 1 + 4 * G4;

    const ii = i & 255,
      jj = j & 255,
      kk = k & 255,
      ll = l & 255;

    // 4D gradient: 32 directions — one coord is 0, others ±1
    const g4 = (gi: number, x: number, y: number, z: number, w: number) => {
      const g = gi >> 3;
      const b = gi & 7;
      let a: number, c: number, d: number;
      if (g === 0) {
        a = y;
        c = z;
        d = w;
      } else if (g === 1) {
        a = x;
        c = z;
        d = w;
      } else if (g === 2) {
        a = x;
        c = y;
        d = w;
      } else {
        a = x;
        c = y;
        d = z;
      }
      return (b & 4 ? -a : a) + (b & 2 ? -c : c) + (b & 1 ? -d : d);
    };

    const gi0 = p[ii + p[jj + p[kk + p[ll]]]] & 31;
    const gi1 = p[ii + i1 + p[jj + j1 + p[kk + k1 + p[ll + l1]]]] & 31;
    const gi2 = p[ii + i2 + p[jj + j2 + p[kk + k2 + p[ll + l2]]]] & 31;
    const gi3 = p[ii + i3 + p[jj + j3 + p[kk + k3 + p[ll + l3]]]] & 31;
    const gi4 = p[ii + 1 + p[jj + 1 + p[kk + 1 + p[ll + 1]]]] & 31;

    let n = 0;
    let tc = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * g4(gi0, x0, y0, z0, w0);
    }
    tc = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * g4(gi1, x1, y1, z1, w1);
    }
    tc = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * g4(gi2, x2, y2, z2, w2);
    }
    tc = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * g4(gi3, x3, y3, z3, w3);
    }
    tc = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    if (tc >= 0) {
      tc *= tc;
      n += tc * tc * g4(gi4, x4, y4, z4, w4);
    }
    return 27 * n;
  }

  // ---- HASH ----

  hash(x: number): number;
  hash(x: number, y: number): number;
  hash(x: number, y: number, z: number): number;
  hash(x: number, y: number, z: number, w: number): number;
  hash(x: number, y?: number, z?: number, w?: number): number {
    let n: number;
    if (y === undefined) {
      n = Math.sin(x * 12.9898 + this._seed) * 43758.5453;
    } else if (z === undefined) {
      n = Math.sin(x * 12.9898 + y * 78.233 + this._seed) * 43758.5453;
    } else if (w === undefined) {
      n =
        Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + this._seed) *
        43758.5453;
    } else {
      n =
        Math.sin(
          x * 12.9898 + y * 78.233 + z * 37.719 + w * 53.137 + this._seed,
        ) * 43758.5453;
    }
    return n - Math.floor(n);
  }

  // ---- GAUSSIAN RANDOM ----

  /** Box-Muller transform — returns normally distributed random number (seeded) */
  gaussianRandom(mean = 0, stddev = 1): number {
    const u1 = 1 - this.rng(); // (0, 1] to avoid log(0)
    const u2 = this.rng();
    return (
      mean + stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    );
  }
}

export default Noise;
