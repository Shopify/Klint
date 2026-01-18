import { KlintContext } from "../Klint";

type FbmOptions = {
  octaves?: number;
  lacunarity?: number;
  gain?: number;
  amplitude?: number;
  frequency?: number;
};

type TurbulenceOptions = {
  octaves?: number;
};

type RidgeOptions = {
  octaves?: number;
  amplitude?: number;
  frequency?: number;
  lacunarity?: number;
  gain?: number;
};

type CellularOptions = {
  distance?: "euclidean" | "manhattan";
};

/**
 * Noise Element for Klint
 * 
 * Provides Perlin noise, Simplex noise, and hash functions for procedural generation
 * Based on implementations by Stefan Gustavson and others
 * 
 * @example
 * ```tsx
 * const draw = (K) => {
 *   K.Noise.seed(42); // Optional: set seed for reproducibility
 *   
 *   // Generate terrain
 *   for (let x = 0; x < K.width; x += 5) {
 *     for (let y = 0; y < K.height; y += 5) {
 *       const n = K.Noise.perlin(x * 0.01, y * 0.01);
 *       const brightness = (n + 1) * 127;
 *       K.fillColor(`rgb(${brightness}, ${brightness}, ${brightness})`);
 *       K.rectangle(x, y, 5, 5);
 *     }
 *   }
 * };
 * ```
 */
class Noise {
  private context: KlintContext;
  private perm: number[] = [];
  private permMod12: number[] = [];
  private grad3: number[][] = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];
  private grad4: number[][] = [
    [0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1],
    [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1],
    [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1],
    [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1],
    [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1],
    [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1],
    [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0],
    [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]
  ];
  private currentSeed: number = Math.random();
  private F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  private G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
  private F3 = 1.0 / 3.0;
  private G3 = 1.0 / 6.0;
  private F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
  private G4 = (5.0 - Math.sqrt(5.0)) / 20.0;

  /**
   * Creates a new Noise instance
   * @param ctx - The Klint context
   */
  constructor(ctx: KlintContext) {
    this.context = ctx;
    this.buildPermutationTable();
  }

  /**
   * Build permutation table for noise generation
   */
  private buildPermutationTable(): void {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle using current seed
    let n = 256;
    while (n > 0) {
      const index = Math.floor(this.random() * n--);
      const temp = p[n];
      p[n] = p[index];
      p[index] = temp;
    }

    // Duplicate and create mod 12 table
    this.perm = [];
    this.permMod12 = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  /**
   * Seeded random number generator
   */
  private random(): number {
    const x = Math.sin(this.currentSeed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Set seed for noise generation
   * @param seed - Seed value for reproducible noise
   */
  seed(seed?: number): void {
    this.currentSeed = seed !== undefined ? seed : Math.random() * 10000;
    this.buildPermutationTable();
  }

  /**
   * Fade function for Perlin noise
   */
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * Linear interpolation
   */
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  /**
   * 1D Perlin noise
   * @param x - X coordinate
   * @returns Noise value between -1 and 1
   */
  perlin(x: number): number;
  /**
   * 2D Perlin noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Noise value between -1 and 1
   */
  perlin(x: number, y: number): number;
  /**
   * 3D Perlin noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @returns Noise value between -1 and 1
   */
  perlin(x: number, y: number, z: number): number;
  /**
   * 4D Perlin noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param w - W coordinate
   * @returns Noise value between -1 and 1
   */
  perlin(x: number, y: number, z: number, w: number): number;
  perlin(x: number, y?: number, z?: number, w?: number): number {
    if (y === undefined) {
      // 1D Perlin noise
      const xi = Math.floor(x) & 255;
      const xf = x - Math.floor(x);
      const u = this.fade(xf);
      
      const a = this.perm[xi];
      const b = this.perm[xi + 1];
      
      const grad1 = (hash: number, x: number) => (hash & 1) === 0 ? x : -x;
      
      return this.lerp(u, grad1(a, xf), grad1(b, xf - 1));
    } else if (z === undefined) {
      // 2D Perlin noise
      const xi = Math.floor(x) & 255;
      const yi = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = this.fade(xf);
      const v = this.fade(yf);
      
      const aa = this.perm[this.perm[xi] + yi];
      const ab = this.perm[this.perm[xi] + yi + 1];
      const ba = this.perm[this.perm[xi + 1] + yi];
      const bb = this.perm[this.perm[xi + 1] + yi + 1];
      
      const grad2 = (hash: number, x: number, y: number) => {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };
      
      const x1 = this.lerp(u, grad2(aa, xf, yf), grad2(ba, xf - 1, yf));
      const x2 = this.lerp(u, grad2(ab, xf, yf - 1), grad2(bb, xf - 1, yf - 1));
      
      return this.lerp(v, x1, x2);
    } else if (w === undefined) {
      // 3D Perlin noise
      const xi = Math.floor(x) & 255;
      const yi = Math.floor(y) & 255;
      const zi = Math.floor(z) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const zf = z - Math.floor(z);
      const u = this.fade(xf);
      const v = this.fade(yf);
      const w = this.fade(zf);
      
      const aaa = this.perm[this.perm[this.perm[xi] + yi] + zi];
      const aba = this.perm[this.perm[this.perm[xi] + yi + 1] + zi];
      const aab = this.perm[this.perm[this.perm[xi] + yi] + zi + 1];
      const abb = this.perm[this.perm[this.perm[xi] + yi + 1] + zi + 1];
      const baa = this.perm[this.perm[this.perm[xi + 1] + yi] + zi];
      const bba = this.perm[this.perm[this.perm[xi + 1] + yi + 1] + zi];
      const bab = this.perm[this.perm[this.perm[xi + 1] + yi] + zi + 1];
      const bbb = this.perm[this.perm[this.perm[xi + 1] + yi + 1] + zi + 1];
      
      const grad3 = (hash: number, x: number, y: number, z: number) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };
      
      const x1 = this.lerp(w,
        this.lerp(v, this.lerp(u, grad3(aaa, xf, yf, zf), grad3(baa, xf - 1, yf, zf)),
                     this.lerp(u, grad3(aba, xf, yf - 1, zf), grad3(bba, xf - 1, yf - 1, zf))),
        this.lerp(v, this.lerp(u, grad3(aab, xf, yf, zf - 1), grad3(bab, xf - 1, yf, zf - 1)),
                     this.lerp(u, grad3(abb, xf, yf - 1, zf - 1), grad3(bbb, xf - 1, yf - 1, zf - 1)))
      );
      
      return x1;
    } else {
      // 4D Perlin noise - simplified implementation
      // For brevity, using a simplified 4D noise
      return this.perlin(x, y, z) * 0.5 + this.perlin(x + w, y + w, z + w) * 0.5;
    }
  }

  /**
   * 1D Simplex noise
   * @param x - X coordinate
   * @returns Noise value between -1 and 1
   */
  simplex(x: number): number;
  /**
   * 2D Simplex noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Noise value between -1 and 1
   */
  simplex(x: number, y: number): number;
  /**
   * 3D Simplex noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @returns Noise value between -1 and 1
   */
  simplex(x: number, y: number, z: number): number;
  /**
   * 4D Simplex noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param w - W coordinate
   * @returns Noise value between -1 and 1
   */
  simplex(x: number, y: number, z: number, w: number): number;
  simplex(x: number, y?: number, z?: number, w?: number): number {
    if (y === undefined) {
      // 1D Simplex noise - use 1D Perlin as fallback
      return this.perlin(x);
    } else if (z === undefined) {
      // 2D Simplex noise
      let n0 = 0, n1 = 0, n2 = 0;
      
      const s = (x + y) * this.F2;
      const i = Math.floor(x + s);
      const j = Math.floor(y + s);
      const t = (i + j) * this.G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = x - X0;
      const y0 = y - Y0;
      
      let i1: number, j1: number;
      if (x0 > y0) {
        i1 = 1; j1 = 0;
      } else {
        i1 = 0; j1 = 1;
      }
      
      const x1 = x0 - i1 + this.G2;
      const y1 = y0 - j1 + this.G2;
      const x2 = x0 - 1.0 + 2.0 * this.G2;
      const y2 = y0 - 1.0 + 2.0 * this.G2;
      
      const ii = i & 255;
      const jj = j & 255;
      const gi0 = this.permMod12[ii + this.perm[jj]];
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
      
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 < 0) {
        n0 = 0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot2(this.grad3[gi0], x0, y0);
      }
      
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 < 0) {
        n1 = 0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot2(this.grad3[gi1], x1, y1);
      }
      
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 < 0) {
        n2 = 0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot2(this.grad3[gi2], x2, y2);
      }
      
      return 70 * (n0 + n1 + n2);
    } else if (w === undefined) {
      // 3D Simplex noise
      let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
      
      const s = (x + y + z) * this.F3;
      const i = Math.floor(x + s);
      const j = Math.floor(y + s);
      const k = Math.floor(z + s);
      const t = (i + j + k) * this.G3;
      const X0 = i - t;
      const Y0 = j - t;
      const Z0 = k - t;
      const x0 = x - X0;
      const y0 = y - Y0;
      const z0 = z - Z0;
      
      let i1: number, j1: number, k1: number;
      let i2: number, j2: number, k2: number;
      
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
        } else if (x0 >= z0) {
          i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
        } else {
          i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
        }
      } else {
        if (y0 < z0) {
          i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
        } else if (x0 < z0) {
          i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
        } else {
          i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
        }
      }
      
      const x1 = x0 - i1 + this.G3;
      const y1 = y0 - j1 + this.G3;
      const z1 = z0 - k1 + this.G3;
      const x2 = x0 - i2 + 2.0 * this.G3;
      const y2 = y0 - j2 + 2.0 * this.G3;
      const z2 = z0 - k2 + 2.0 * this.G3;
      const x3 = x0 - 1.0 + 3.0 * this.G3;
      const y3 = y0 - 1.0 + 3.0 * this.G3;
      const z3 = z0 - 1.0 + 3.0 * this.G3;
      
      const ii = i & 255;
      const jj = j & 255;
      const kk = k & 255;
      const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
      const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
      const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
      
      let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) {
        n0 = 0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot3(this.grad3[gi0], x0, y0, z0);
      }
      
      let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) {
        n1 = 0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot3(this.grad3[gi1], x1, y1, z1);
      }
      
      let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) {
        n2 = 0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot3(this.grad3[gi2], x2, y2, z2);
      }
      
      let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) {
        n3 = 0;
      } else {
        t3 *= t3;
        n3 = t3 * t3 * this.dot3(this.grad3[gi3], x3, y3, z3);
      }
      
      return 32 * (n0 + n1 + n2 + n3);
    } else {
      // 4D Simplex noise - simplified
      return this.simplex(x, y, z) * 0.5 + this.simplex(x + w, y + w, z + w) * 0.5;
    }
  }

  /**
   * Dot product for 2D
   */
  private dot2(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  /**
   * Dot product for 3D
   */
  private dot3(g: number[], x: number, y: number, z: number): number {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  /**
   * 1D hash function
   * @param x - X coordinate
   * @returns Hash value between 0 and 1
   */
  hash(x: number): number;
  /**
   * 2D hash function
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Hash value between 0 and 1
   */
  hash(x: number, y: number): number;
  /**
   * 3D hash function
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @returns Hash value between 0 and 1
   */
  hash(x: number, y: number, z: number): number;
  /**
   * 4D hash function
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param w - W coordinate
   * @returns Hash value between 0 and 1
   */
  hash(x: number, y: number, z: number, w: number): number;
  hash(x: number, y?: number, z?: number, w?: number): number {
    // Simple hash function based on sine
    let n = 0;
    
    if (y === undefined) {
      n = Math.sin(x * 12.9898 + this.currentSeed) * 43758.5453;
    } else if (z === undefined) {
      n = Math.sin(x * 12.9898 + y * 78.233 + this.currentSeed) * 43758.5453;
    } else if (w === undefined) {
      n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + this.currentSeed) * 43758.5453;
    } else {
      n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + w * 59.1337 + this.currentSeed) * 43758.5453;
    }
    
    return n - Math.floor(n);
  }

  /**
   * Fractal Brownian Motion (fBm) noise
   * Supports options object for amplitude/frequency/lacunarity/gain/octaves.
   */
  fbm(
    x: number,
    y?: number | FbmOptions,
    z?: number | FbmOptions,
    options?: FbmOptions
  ): number {
    let yVal: number | undefined = undefined;
    let zVal: number | undefined = undefined;
    let opts: FbmOptions =
      typeof y === "object"
        ? y
        : typeof z === "object"
          ? (z as FbmOptions)
          : {};

    if (typeof y === "number") yVal = y;
    if (typeof z === "number") zVal = z;
    if (options) opts = { ...opts, ...options };

    const octaves = opts.octaves ?? 4;
    if (octaves <= 0) return 0;

    let amplitude = opts.amplitude ?? 1;
    let frequency = opts.frequency ?? 1;
    const lacunarity = opts.lacunarity ?? 2;
    const gain = opts.gain ?? 0.5;

    let value = 0;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      if (yVal === undefined) {
        value += amplitude * this.perlin(x * frequency);
      } else if (zVal === undefined) {
        value += amplitude * this.perlin(x * frequency, yVal * frequency);
      } else {
        value += amplitude * this.perlin(x * frequency, yVal * frequency, zVal * frequency);
      }

      maxValue += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }

    return maxValue === 0 ? 0 : value / maxValue;
  }

  /**
   * Turbulence noise (absolute value of noise)
   * Supports options object for octaves.
   */
  turbulence(
    x: number,
    y?: number | TurbulenceOptions,
    z?: number | TurbulenceOptions,
    options?: TurbulenceOptions
  ): number {
    let yVal: number | undefined = undefined;
    let zVal: number | undefined = undefined;
    let opts: TurbulenceOptions =
      typeof y === "object"
        ? y
        : typeof z === "object"
          ? (z as TurbulenceOptions)
          : {};

    if (typeof y === "number") yVal = y;
    if (typeof z === "number") zVal = z;
    if (options) opts = { ...opts, ...options };

    const octaves = opts.octaves ?? 4;
    if (octaves <= 0) return 0;

    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      let noise = 0;
      if (yVal === undefined) {
        noise = this.perlin(x * frequency);
      } else if (zVal === undefined) {
        noise = this.perlin(x * frequency, yVal * frequency);
      } else {
        noise = this.perlin(x * frequency, yVal * frequency, zVal * frequency);
      }

      value += amplitude * Math.abs(noise);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return maxValue === 0 ? 0 : value / maxValue;
  }

  /**
   * Ridged multifractal noise (simple implementation)
   */
  ridge(
    x: number,
    y?: number | RidgeOptions,
    options?: RidgeOptions
  ): number {
    let yVal: number | undefined = undefined;
    let opts: RidgeOptions = typeof y === "object" ? y : {};
    if (typeof y === "number") yVal = y;
    if (options) opts = { ...opts, ...options };

    const octaves = opts.octaves ?? 4;
    if (octaves <= 0) return 0;

    let amplitude = opts.amplitude ?? 1;
    let frequency = opts.frequency ?? 1;
    const lacunarity = opts.lacunarity ?? 2;
    const gain = opts.gain ?? 0.5;

    let value = 0;
    let weight = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      const n =
        yVal === undefined
          ? this.perlin(x * frequency)
          : this.perlin(x * frequency, yVal * frequency);
      let signal = 1 - Math.abs(n);
      signal *= signal;
      signal *= weight;
      weight = signal * 2;
      weight = Math.min(Math.max(weight, 0), 1);

      value += signal * amplitude;
      maxValue += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }

    return maxValue === 0 ? 0 : value / maxValue;
  }

  /**
   * Cellular / Worley noise (2D simple implementation)
   */
  cellular(
    x: number,
    y?: number | CellularOptions,
    options?: CellularOptions
  ): number {
    let yVal: number | undefined = undefined;
    let opts: CellularOptions = typeof y === "object" ? y : {};
    if (typeof y === "number") yVal = y;
    if (options) opts = { ...opts, ...options };
    if (yVal === undefined) yVal = 0;

    const xi = Math.floor(x);
    const yi = Math.floor(yVal);
    const distance = opts.distance ?? "euclidean";

    let minDist = Infinity;

    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        const fx = i + this.hash(xi + i, yi + j);
        const fy = j + this.hash(yi + j, xi + i);
        const dx = fx + xi - x;
        const dy = fy + yi - yVal;
        const dist =
          distance === "manhattan"
            ? Math.abs(dx) + Math.abs(dy)
            : Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) minDist = dist;
      }
    }

    // Normalize to [0,1] using maximal possible distance ~ sqrt(2)
    const maxDist = Math.SQRT2;
    const normalized = 1 - Math.min(minDist / maxDist, 1);
    return normalized;
  }
}

export default Noise;