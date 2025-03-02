declare module "../Klint" {
  interface KlintPlugins {
    Vector: Vector;
  }
}

interface KlintVector {
  x: number;
  y: number;
  add: (v: KlintVector) => KlintVector;
  sub: (v: KlintVector) => KlintVector;
  mult: (n: number) => KlintVector;
  div: (n: number) => KlintVector;
  rotate: (angle: number) => KlintVector;
  mag: () => number;
  length: () => number;
  dot: (v: KlintVector) => number;
  dist: (v: KlintVector) => number;
  angle: () => number;
  copy: () => KlintVector;
  normalize: () => KlintVector;
  set: (x: number, y: number, z?: number, w?: number) => KlintVector;
}

class Vector implements KlintVector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: KlintVector): Vector {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: KlintVector): Vector {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mult(n: number): Vector {
    this.x *= n;
    this.y *= n;
    return this;
  }

  div(n: number): Vector {
    this.x /= n;
    this.y /= n;
    return this;
  }
  // to do : project, perp, slerp
  rotate(angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  length(): number {
    return this.mag();
  }

  dot(v: KlintVector): number {
    return this.x * v.x + this.y * v.y;
  }

  dist(v: KlintVector): number {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  angle(): number {
    return Math.atan2(-this.x, -this.y) + Math.PI;
  }

  copy(): Vector {
    return new Vector(this.x, this.y);
  }

  normalize(): Vector {
    const m = this.mag();
    return m !== 0 ? this.div(m) : this;
  }

  set(x: number, y: number): Vector {
    this.x = x;
    this.y = y;
    return this;
  }

  static fromAngle(center: Vector, a: number, r: number): Vector {
    const x = Math.cos(a) * r + center.x;
    const y = Math.sin(a) * r + center.y;
    return new Vector(x, y);
  }
}

export default Vector;
