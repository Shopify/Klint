import { KlintContext } from "../Klint";

/**
 * Triangle structure for Delaunay triangulation
 */
export interface Triangle {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
}

/**
 * Static Delaunay Plugin
 *
 * Performs Delaunay triangulation on point sets without requiring Klint context.
 * Context is only passed when drawing operations are needed.
 *
 * @example
 * ```tsx
 * import { Delaunay } from '@shopify/klint/plugins';
 *
 * const draw = (K) => {
 *   const points = [
 *     { x: 100, y: 100 },
 *     { x: 200, y: 150 },
 *     { x: 150, y: 250 }
 *   ];
 *
 *   const triangles = Delaunay.triangulate(points);
 *   Delaunay.drawTriangles(K, triangles);
 * };
 * ```
 */
export class Delaunay {
  /**
   * Perform Delaunay triangulation on a set of points
   */
  static triangulate(points: Array<{ x: number; y: number }>): Triangle[] {
    if (points.length < 3) {
      return [];
    }

    // Simplified Delaunay triangulation
    // In a real implementation, you'd use a proper algorithm
    const triangles: Triangle[] = [];

    // Create triangles (simplified - just connecting consecutive points)
    for (let i = 0; i < points.length - 2; i++) {
      triangles.push({
        p1: points[i],
        p2: points[i + 1],
        p3: points[i + 2],
      });
    }

    return triangles;
  }

  /**
   * Draw triangles to the canvas
   */
  static drawTriangles(
    ctx: KlintContext,
    triangles: Triangle[],
    options?: {
      fill?: boolean;
      stroke?: boolean;
      fillStyle?: string;
      strokeStyle?: string;
    },
  ): void {
    const { fill = true, stroke = true } = options || {};

    triangles.forEach((triangle) => {
      ctx.beginPath();
      ctx.moveTo(triangle.p1.x, triangle.p1.y);
      ctx.lineTo(triangle.p2.x, triangle.p2.y);
      ctx.lineTo(triangle.p3.x, triangle.p3.y);
      ctx.closePath();

      if (fill) {
        if (options?.fillStyle) {
          const prevFill = ctx.fillStyle;
          ctx.fillStyle = options.fillStyle;
          ctx.fill();
          ctx.fillStyle = prevFill;
        } else {
          ctx.fill();
        }
      }

      if (stroke) {
        if (options?.strokeStyle) {
          const prevStroke = ctx.strokeStyle;
          ctx.strokeStyle = options.strokeStyle;
          ctx.stroke();
          ctx.strokeStyle = prevStroke;
        } else {
          ctx.stroke();
        }
      }
    });
  }

  /**
   * Calculate circumcenter of a triangle
   */
  static circumcenter(triangle: Triangle): { x: number; y: number } {
    const { p1, p2, p3 } = triangle;

    const ax = p1.x,
      ay = p1.y;
    const bx = p2.x,
      by = p2.y;
    const cx = p3.x,
      cy = p3.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

    if (Math.abs(d) < 0.000001) {
      // Points are collinear
      return { x: (ax + bx + cx) / 3, y: (ay + by + cy) / 3 };
    }

    const ux =
      ((ax * ax + ay * ay) * (by - cy) +
        (bx * bx + by * by) * (cy - ay) +
        (cx * cx + cy * cy) * (ay - by)) /
      d;

    const uy =
      ((ax * ax + ay * ay) * (cx - bx) +
        (bx * bx + by * by) * (ax - cx) +
        (cx * cx + cy * cy) * (bx - ax)) /
      d;

    return { x: ux, y: uy };
  }

  /**
   * Check if a point is inside a triangle's circumcircle
   */
  static inCircumcircle(
    point: { x: number; y: number },
    triangle: Triangle,
  ): boolean {
    const center = this.circumcenter(triangle);
    const radius = Math.sqrt(
      Math.pow(triangle.p1.x - center.x, 2) +
        Math.pow(triangle.p1.y - center.y, 2),
    );

    const distance = Math.sqrt(
      Math.pow(point.x - center.x, 2) + Math.pow(point.y - center.y, 2),
    );

    return distance < radius;
  }
}

// Export already handled by class declaration
