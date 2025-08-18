/**
 * Interface defining a 3D vector with various vector operations
 */
interface KlintVector {
  x: number;
  y: number;
  z: number;
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
  cross: (v: KlintVector) => KlintVector;
  relativeTo: (v: KlintVector) => KlintVector;
  lookAt: (target: KlintVector) => KlintVector;
  toScreen: (width: number, height: number) => KlintVector;
  slerp: (v: KlintVector, amt: number) => KlintVector;
}

/**
 * A 3D vector class with various vector operations (z=0 by default for 2D use)
 */
class Vector implements KlintVector {
  /** X-coordinate of the vector */
  x: number;
  /** Y-coordinate of the vector */
  y: number;
  /** Z-coordinate of the vector */
  z: number;

  /**
   * Creates a new Vector
   * @param x - X-coordinate (default: 0)
   * @param y - Y-coordinate (default: 0)
   * @param z - Z-coordinate (default: 0)
   */
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Adds another vector to this vector
   * @param v - Vector to add
   * @returns This vector after addition
   */
  add(v: KlintVector): Vector {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
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
    this.z -= v.z;
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
    this.z *= n;
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
    this.z /= n;
    return this;
  }

  /**
   * Rotates this vector by an angle (around z-axis for 2D rotation)
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
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
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
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Calculates the distance between this vector and another vector
   * @param v - The other vector
   * @returns The distance between the vectors
   */
  dist(v: KlintVector): number {
    return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  /**
   * Calculates the angle of this vector (in 2D, ignoring z)
   * @returns The angle in radians
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Creates a copy of this vector
   * @returns A new Vector with the same coordinates
   */
  copy(): Vector {
    return new Vector(this.x, this.y, this.z);
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
   * @param z - New Z-coordinate (default: 0)
   * @returns This vector after setting coordinates
   */
  set(x: number, y: number, z = 0): Vector {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Calculates the cross product of this vector with another vector
   * @param v - The other vector
   * @returns A new Vector representing the cross product
   */
  cross(v: KlintVector): Vector {
    return new Vector(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  /**
   * Calculates this vector's position relative to another vector
   * @param v - The reference vector
   * @returns This vector after making it relative to v
   */
  relativeTo(v: KlintVector): Vector {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * Makes this vector point towards a target vector
   * @param target - The target vector to look at
   * @returns This vector after pointing towards target
   */
  lookAt(target: KlintVector): Vector {
    const direction = new Vector(
      target.x - this.x,
      target.y - this.y,
      target.z - this.z
    );
    direction.normalize();
    this.x = direction.x;
    this.y = direction.y;
    this.z = direction.z;
    return this;
  }

  /**
   * Converts this vector from world space to screen space
   * @param width - Screen width
   * @param height - Screen height
   * @returns This vector after screen space conversion
   */
  toScreen(width: number, height: number): Vector {
    this.x = ((this.x + 1) * width) / 2;
    this.y = ((1 - this.y) * height) / 2;
    return this;
  }

  /**
   * Spherical linear interpolation between this vector and another vector
   * @param v - The target vector
   * @param amt - Interpolation amount (0-1)
   * @returns This vector after interpolation
   */
  slerp(v: KlintVector, amt: number): Vector {
    // edge cases.
    if (amt === 0) {
      return this;
    }
    if (amt === 1) {
      return this.set(v.x, v.y, v.z);
    }

    // calculate magnitudes
    const selfMag = this.mag();
    const vMag = v.mag();
    const magmag = selfMag * vMag;
    // if either is a zero vector, linearly interpolate by these vectors
    if (magmag === 0) {
      this.mult(1 - amt).add(new Vector(v.x * amt, v.y * amt, v.z * amt));
      return this;
    }
    // the cross product of 'this' and 'v' is the axis of rotation
    const axis = this.cross(v);
    const axisMag = axis.mag();
    // Calculates the angle between 'this' and 'v'
    const theta = Math.atan2(axisMag, this.dot(v));

    // However, if the norm of axis is 0, normalization cannot be performed,
    // so we will divide the cases
    if (axisMag > 0) {
      axis.x /= axisMag;
      axis.y /= axisMag;
      axis.z /= axisMag;
    } else if (theta < Math.PI * 0.5) {
      // if the norm is 0 and the angle is less than PI/2,
      // the angle is very close to 0, so do linear interpolation.
      this.mult(1 - amt).add(new Vector(v.x * amt, v.y * amt, v.z * amt));
      return this;
    } else {
      // If the norm is 0 and the angle is more than PI/2, the angle is
      // very close to PI.
      // In this case v can be regarded as '-this', so take any vector
      // that is orthogonal to 'this' and use that as the axis.
      if (this.z === 0 && v.z === 0) {
        // if both this and v are 2D vectors, use (0,0,1)
        // this makes the result also a 2D vector.
        axis.set(0, 0, 1);
      } else if (this.x !== 0) {
        // if the x components is not 0, use (y, -x, 0)
        axis.set(this.y, -this.x, 0).normalize();
      } else {
        // if the x components is 0, use (1,0,0)
        axis.set(1, 0, 0);
      }
    }

    // Since 'axis' is a unit vector, ey is a vector of the same length as 'this'.
    const ey = axis.cross(this);
    // interpolate the length with 'this' and 'v'.
    const lerpedMagFactor = 1 - amt + (amt * vMag) / selfMag;
    // imagine a situation where 'axis', 'this', and 'ey' are pointing
    // along the z, x, and y axes, respectively.
    // rotates 'this' around 'axis' by amt * theta towards 'ey'.
    const cosMultiplier = lerpedMagFactor * Math.cos(amt * theta);
    const sinMultiplier = lerpedMagFactor * Math.sin(amt * theta);
    // then, calculate 'result'.
    this.x = this.x * cosMultiplier + ey.x * sinMultiplier;
    this.y = this.y * cosMultiplier + ey.y * sinMultiplier;
    this.z = this.z * cosMultiplier + ey.z * sinMultiplier;

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
    return new Vector(x, y, center.z);
  }
}

export default Vector;
