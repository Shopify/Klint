/**
 * Point with at least x, y — can carry any extra data.
 */
export interface QuadtreePoint {
  x: number;
  y: number;
  [key: string]: any;
}

/**
 * Center-based rectangular bounds (x, y = center, w, h = half-extents).
 */
export class Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(point: QuadtreePoint): boolean {
    return (
      point.x >= this.x - this.w &&
      point.x < this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y < this.y + this.h
    );
  }

  intersects(range: Rectangle): boolean {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }

  intersectsCircle(cx: number, cy: number, r: number): boolean {
    const dx = Math.abs(cx - this.x);
    const dy = Math.abs(cy - this.y);
    if (dx > this.w + r || dy > this.h + r) return false;
    if (dx <= this.w || dy <= this.h) return true;
    return (dx - this.w) ** 2 + (dy - this.h) ** 2 <= r * r;
  }
}

/**
 * Quadtree — spatial partitioning for efficient neighbor queries.
 *
 * Uses center-based bounds. Create with `Quadtree.create()`.
 *
 * @example
 * ```tsx
 * const qt = K.Quadtree.create(0, 0, K.width, K.height);
 * particles.forEach(p => qt.insert(p));
 * const nearby = qt.queryRadius(mouseX, mouseY, 100);
 * ```
 */
class Quadtree<T extends QuadtreePoint = QuadtreePoint> {
  private boundary: Rectangle;
  private capacity: number;
  private maxDepth: number;
  private depth: number;
  private points: T[];
  private divided: boolean;
  private ne: Quadtree<T> | null = null;
  private nw: Quadtree<T> | null = null;
  private se: Quadtree<T> | null = null;
  private sw: Quadtree<T> | null = null;

  constructor(
    boundary: Rectangle,
    capacity: number = 4,
    maxDepth: number = 8,
    depth: number = 0,
  ) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.maxDepth = maxDepth;
    this.depth = depth;
    this.points = [];
    this.divided = false;
  }

  /**
   * Create a Quadtree from corner-based bounds (top-left + size).
   * Internally converts to center-based representation.
   */
  static create<T extends QuadtreePoint = QuadtreePoint>(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: { capacity?: number; maxDepth?: number },
  ): Quadtree<T> {
    const hw = width / 2;
    const hh = height / 2;
    return new Quadtree<T>(
      new Rectangle(x + hw, y + hh, hw, hh),
      options?.capacity ?? 4,
      options?.maxDepth ?? 8,
    );
  }

  insert(point: T): boolean {
    if (!this.boundary.contains(point)) return false;

    if (!this.divided) {
      if (this.points.length < this.capacity || this.depth >= this.maxDepth) {
        this.points.push(point);
        return true;
      }
      this.subdivide();
    }

    return (
      this.ne!.insert(point) ||
      this.nw!.insert(point) ||
      this.se!.insert(point) ||
      this.sw!.insert(point)
    );
  }

  private subdivide(): void {
    const { x, y, w, h } = this.boundary;
    const hw = w / 2;
    const hh = h / 2;
    const d = this.depth + 1;
    this.ne = new Quadtree<T>(
      new Rectangle(x + hw, y - hh, hw, hh),
      this.capacity,
      this.maxDepth,
      d,
    );
    this.nw = new Quadtree<T>(
      new Rectangle(x - hw, y - hh, hw, hh),
      this.capacity,
      this.maxDepth,
      d,
    );
    this.se = new Quadtree<T>(
      new Rectangle(x + hw, y + hh, hw, hh),
      this.capacity,
      this.maxDepth,
      d,
    );
    this.sw = new Quadtree<T>(
      new Rectangle(x - hw, y + hh, hw, hh),
      this.capacity,
      this.maxDepth,
      d,
    );
    this.divided = true;

    for (const p of this.points) {
      this.ne.insert(p) ||
        this.nw.insert(p) ||
        this.se.insert(p) ||
        this.sw.insert(p);
    }
    this.points = [];
  }

  query(range: Rectangle, found: T[] = []): T[] {
    if (!this.boundary.intersects(range)) return found;

    for (const p of this.points) {
      if (range.contains(p)) found.push(p);
    }
    if (this.divided) {
      this.ne!.query(range, found);
      this.nw!.query(range, found);
      this.se!.query(range, found);
      this.sw!.query(range, found);
    }
    return found;
  }

  queryRadius(cx: number, cy: number, radius: number, found: T[] = []): T[] {
    if (!this.boundary.intersectsCircle(cx, cy, radius)) return found;

    const rSq = radius * radius;
    for (const p of this.points) {
      if ((p.x - cx) ** 2 + (p.y - cy) ** 2 <= rSq) found.push(p);
    }
    if (this.divided) {
      this.ne!.queryRadius(cx, cy, radius, found);
      this.nw!.queryRadius(cx, cy, radius, found);
      this.se!.queryRadius(cx, cy, radius, found);
      this.sw!.queryRadius(cx, cy, radius, found);
    }
    return found;
  }

  clear(): void {
    this.points = [];
    this.divided = false;
    this.ne = this.nw = this.se = this.sw = null;
  }

  get size(): number {
    let n = this.points.length;
    if (this.divided) {
      n += this.ne!.size + this.nw!.size + this.se!.size + this.sw!.size;
    }
    return n;
  }
}

export default Quadtree;
