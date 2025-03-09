/**
 * Interface defining a 2D vector with various vector operations
 */
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

/**
 * A 2D vector class with various vector operations
 */
class Vector implements KlintVector {
  /** X-coordinate of the vector */
  x: number;
  /** Y-coordinate of the vector */
  y: number;

  /**
   * Creates a new Vector
   * @param x - X-coordinate (default: 0)
   * @param y - Y-coordinate (default: 0)
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Adds another vector to this vector
   * @param v - Vector to add
   * @returns This vector after addition
   */
  add(v: KlintVector): Vector {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtracts another vector from this vector
   * @param v - Vector to subtract
   * @returns This vector after subtraction
   */
  sub(v: KlintVector): Vector {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Multiplies this vector by a scalar
   * @param n - Scalar to multiply by
   * @returns This vector after multiplication
   */
  mult(n: number): Vector {
    this.x *= n;
    this.y *= n;
    return this;
  }

  /**
   * Divides this vector by a scalar
   * @param n - Scalar to divide by
   * @returns This vector after division
   */
  div(n: number): Vector {
    this.x /= n;
    this.y /= n;
    return this;
  }
  // to do : project, perp, slerp

  /**
   * Rotates this vector by an angle
   * @param angle - Angle in radians
   * @returns This vector after rotation
   */
  rotate(angle: number): Vector {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Calculates the magnitude (length) of this vector
   * @returns The magnitude of the vector
   */
  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Alias for mag() - calculates the length of this vector
   * @returns The length of the vector
   */
  length(): number {
    return this.mag();
  }

  /**
   * Calculates the dot product of this vector with another vector
   * @param v - The other vector
   * @returns The dot product
   */
  dot(v: KlintVector): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Calculates the distance between this vector and another vector
   * @param v - The other vector
   * @returns The distance between the vectors
   */
  dist(v: KlintVector): number {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  /**
   * Calculates the angle of this vector
   * @returns The angle in radians
   */
  angle(): number {
    return Math.atan2(-this.x, -this.y) + Math.PI;
  }

  /**
   * Creates a copy of this vector
   * @returns A new Vector with the same coordinates
   */
  copy(): Vector {
    return new Vector(this.x, this.y);
  }

  /**
   * Normalizes this vector (sets its magnitude to 1)
   * @returns This vector after normalization
   */
  normalize(): Vector {
    const m = this.mag();
    return m !== 0 ? this.div(m) : this;
  }

  /**
   * Sets the coordinates of this vector
   * @param x - New X-coordinate
   * @param y - New Y-coordinate
   * @returns This vector after setting coordinates
   */
  set(x: number, y: number): Vector {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Creates a new vector at a specified angle and distance from a center point
   * @param center - The center point vector
   * @param a - The angle in radians
   * @param r - The radius (distance from center)
   * @returns A new Vector at the calculated position
   */
  static fromAngle(center: Vector, a: number, r: number): Vector {
    const x = Math.cos(a) * r + center.x;
    const y = Math.sin(a) * r + center.y;
    return new Vector(x, y);
  }
}

export default Vector;
