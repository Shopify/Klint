/**
 * A 3D point in world space.
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * A projected 2D point with depth info.
 * - `x`, `y`: screen coordinates (centered at 0,0)
 * - `z`: transformed depth (use for sorting, back-to-front)
 * - `scale`: perspective foreshortening factor (use for sizing elements by depth)
 */
export interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  scale: number;
}

/**
 * 3D transform operations available inside the transform callback.
 * All angles are in radians. Transforms are applied in the order you call them.
 */
export interface Transform3D {
  rotateX(radians: number): void;
  rotateY(radians: number): void;
  rotateZ(radians: number): void;
  translate(x: number, y: number, z: number): void;
  scale(x: number, y?: number, z?: number): void;
}

const RAD_TO_DEG = 180 / Math.PI;

/**
 * Projector — 3D to 2D projection for canvas2D creative coding.
 *
 * Projects 3D points onto a 2D plane using DOMMatrix for transforms
 * and custom perspective division for depth foreshortening.
 *
 * @example
 * ```tsx
 * const projector = new Projector({ perspective: 2, radius: 200 });
 *
 * // In draw loop:
 * const projected = projector.project(
 *   { x: 1, y: 0, z: -1 },
 *   (t) => {
 *     t.rotateX(K.time * 0.5);
 *     t.rotateY(K.time * 0.3);
 *   }
 * );
 * K.circle(projected.x, projected.y, 10 * projected.scale);
 * ```
 */
export default class Projector {
  /** Perspective strength. 0 = orthographic, higher = stronger foreshortening. */
  perspective: number;
  /** Output scale — controls how far from center projected points spread. */
  radius: number;

  constructor(options?: { perspective?: number; radius?: number }) {
    this.perspective = options?.perspective ?? 2;
    this.radius = options?.radius ?? 1;
  }

  /**
   * Build a DOMMatrix from a transform callback.
   * The callback receives a Transform3D object — call rotateX, rotateY, etc.
   * in the order you want them applied.
   */
  private buildMatrix(transforms?: (t: Transform3D) => void): DOMMatrix {
    const m = new DOMMatrix();
    if (!transforms) return m;

    transforms({
      rotateX: (r) => m.rotateAxisAngleSelf(1, 0, 0, r * RAD_TO_DEG),
      rotateY: (r) => m.rotateAxisAngleSelf(0, 1, 0, r * RAD_TO_DEG),
      rotateZ: (r) => m.rotateAxisAngleSelf(0, 0, 1, r * RAD_TO_DEG),
      translate: (x, y, z) => m.translateSelf(x, y, z),
      scale: (x, y?, z?) => m.scaleSelf(x, y ?? x, z ?? x),
    });

    return m;
  }

  /**
   * Apply perspective projection to a transformed 3D point.
   * Returns 2D coordinates + depth + scale factor.
   */
  private projectPoint(m: DOMMatrix, point: Point3D): ProjectedPoint {
    const p = m.transformPoint(new DOMPoint(point.x, point.y, point.z, 1));
    const d = this.perspective;
    const f = d === 0 ? 1 : 1 / (d - p.z);
    const r = this.radius;
    return {
      x: p.x * f * r,
      y: p.y * f * r,
      z: p.z,
      scale: Math.abs(f),
    };
  }

  /**
   * Project a single 3D point.
   *
   * @param point - The 3D point to project.
   * @param transforms - Optional callback to apply 3D transforms before projection.
   * @returns Projected 2D point with depth and scale info.
   *
   * @example
   * ```tsx
   * const p = projector.project({ x: 0, y: 1, z: 0 }, (t) => {
   *   t.rotateY(angle);
   * });
   * K.circle(p.x, p.y, 8 * p.scale);
   * ```
   */
  project(
    point: Point3D,
    transforms?: (t: Transform3D) => void,
  ): ProjectedPoint {
    return this.projectPoint(this.buildMatrix(transforms), point);
  }

  /**
   * Project an array of 3D points with the same transform.
   * The transform matrix is built once and reused for all points.
   *
   * @param points - Array of 3D points.
   * @param transforms - Optional transform callback (applied identically to all points).
   * @returns Array of projected points (same order as input).
   *
   * @example
   * ```tsx
   * const projected = projector.projectAll(cubeVertices, (t) => {
   *   t.rotateX(K.time);
   *   t.rotateY(K.time * 0.7);
   * });
   * for (const p of projected) {
   *   K.circle(p.x, p.y, 6 * p.scale);
   * }
   * ```
   */
  projectAll(
    points: Point3D[],
    transforms?: (t: Transform3D) => void,
  ): ProjectedPoint[] {
    const m = this.buildMatrix(transforms);
    return points.map((pt) => this.projectPoint(m, pt));
  }

  /**
   * Project and depth-sort an array of 3D points (back-to-front).
   * Each result includes `index` — the original index in the input array,
   * so you can map back to colors, labels, etc.
   *
   * @param points - Array of 3D points.
   * @param transforms - Optional transform callback.
   * @returns Depth-sorted array of projected points with original indices.
   *
   * @example
   * ```tsx
   * const sorted = projector.projectSorted(points, (t) => {
   *   t.rotateX(K.time);
   * });
   * for (const p of sorted) {
   *   K.fillColor(colors[p.index]);
   *   K.circle(p.x, p.y, 10 * p.scale);
   * }
   * ```
   */
  projectSorted(
    points: Point3D[],
    transforms?: (t: Transform3D) => void,
  ): (ProjectedPoint & { index: number })[] {
    const m = this.buildMatrix(transforms);
    return points
      .map((pt, i) => ({ ...this.projectPoint(m, pt), index: i }))
      .sort((a, b) => a.z - b.z);
  }
}
