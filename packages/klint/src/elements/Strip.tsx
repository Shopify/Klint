import type { KlintContext } from "../KlintTypes";

/**
 * Triangle structure for Strip
 */
export interface StripTriangle {
  id: number;
  center: { x: number; y: number };
  points: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number }
  ];
}

/**
 * Quad structure for Strip
 */
export interface StripQuad {
  id: number;
  center: { x: number; y: number };
  points: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number }
  ];
}

/**
 * Hull structure for Strip
 */
export interface StripHull {
  id: number;
  center: { x: number; y: number };
}

/**
 * Strip Element for Klint
 * 
 * Creates strips of triangles, quads, or hulls from a set of points
 * 
 * @example
 * ```tsx
 * const draw = (K) => {
 *   const points = [];
 *   for (let i = 0; i < 20; i++) {
 *     points.push({
 *       x: 100 + i * 30,
 *       y: 300 + Math.sin(i * 0.5) * 50
 *     });
 *   }
 *   
 *   // Draw triangles
 *   K.Strip.triangles(points, (triangle) => {
 *     const { id, center } = triangle;
 *     K.circle(center.x, center.y, 3);
 *     return `hsl(${id * 30}, 70%, 50%)`;
 *   });
 * };
 * ```
 */
class Strip {
  private context: KlintContext;

  /**
   * Creates a new Strip instance
   * @param ctx - The Klint context
   */
  constructor(ctx: KlintContext) {
    this.context = ctx;
  }

  /**
   * Create a strip of triangles from points
   * Points are connected in a zigzag pattern:
   * 0 - 2 - 4 ...
   * | / | / |
   * 1 - 3 - 5 ...
   * 
   * @param points - Array of points (must be even number for complete triangles)
   * @param draw - Optional callback to customize each triangle's appearance
   */
  triangles(
    points: Array<{ x: number; y: number }>,
    draw?: (triangle: StripTriangle) => string | void
  ): void {
    // Need at least 3 points for a triangle
    if (points.length < 3) return;

    // Calculate how many complete triangles we can make
    const numTriangles = Math.floor((points.length - 2) * 2);

    for (let i = 0; i < numTriangles; i++) {
      const baseIndex = Math.floor(i / 2) * 2;
      const isEven = i % 2 === 0;

      let p1: { x: number; y: number };
      let p2: { x: number; y: number };
      let p3: { x: number; y: number };

      if (isEven) {
        // Upper triangle: 0-1-2, 2-3-4, etc.
        p1 = points[baseIndex];
        p2 = points[baseIndex + 1];
        p3 = points[baseIndex + 2];
      } else {
        // Lower triangle: 1-3-2, 3-5-4, etc.
        p1 = points[baseIndex + 1];
        p2 = points[baseIndex + 3];
        p3 = points[baseIndex + 2];
      }

      // Skip if we don't have all points
      if (!p1 || !p2 || !p3) continue;

      // Calculate center (centroid)
      const center = {
        x: (p1.x + p2.x + p3.x) / 3,
        y: (p1.y + p2.y + p3.y) / 3
      };

      const triangle: StripTriangle = {
        id: i,
        center,
        points: [p1, p2, p3]
      };

      // Get fill color from callback
      let fillColor: string | undefined;
      if (draw) {
        const result = draw(triangle);
        if (typeof result === 'string') {
          fillColor = result;
        }
      }

      // Draw the triangle
      this.context.beginPath();
      this.context.moveTo(p1.x, p1.y);
      this.context.lineTo(p2.x, p2.y);
      this.context.lineTo(p3.x, p3.y);
      this.context.closePath();

      if (fillColor) {
        const prevFill = this.context.fillStyle;
        this.context.fillStyle = fillColor;
        this.context.fill();
        this.context.fillStyle = prevFill;
      } else if (this.context.checkTransparency("fill")) {
        this.context.fill();
      }

      if (this.context.checkTransparency("stroke")) {
        this.context.stroke();
      }
    }
  }

  /**
   * Create a strip of quads from points
   * Points are connected in a grid pattern:
   * 0 - 2 - 4 ...
   * |   |   |
   * 1 - 3 - 5 ...
   * 
   * @param points - Array of points (must be even number for complete quads)
   * @param draw - Optional callback to customize each quad's appearance
   */
  quads(
    points: Array<{ x: number; y: number }>,
    draw?: (quad: StripQuad) => string | void
  ): void {
    // Need at least 4 points for a quad
    if (points.length < 4) return;

    // Calculate how many complete quads we can make
    const numQuads = Math.floor((points.length - 2) / 2);

    for (let i = 0; i < numQuads; i++) {
      const baseIndex = i * 2;

      const p1 = points[baseIndex];
      const p2 = points[baseIndex + 1];
      const p3 = points[baseIndex + 3];
      const p4 = points[baseIndex + 2];

      // Skip if we don't have all points
      if (!p1 || !p2 || !p3 || !p4) continue;

      // Calculate center (average of all points)
      const center = {
        x: (p1.x + p2.x + p3.x + p4.x) / 4,
        y: (p1.y + p2.y + p3.y + p4.y) / 4
      };

      const quad: StripQuad = {
        id: i,
        center,
        points: [p1, p2, p3, p4]
      };

      // Get fill color from callback
      let fillColor: string | undefined;
      if (draw) {
        const result = draw(quad);
        if (typeof result === 'string') {
          fillColor = result;
        }
      }

      // Draw the quad
      this.context.beginPath();
      this.context.moveTo(p1.x, p1.y);
      this.context.lineTo(p2.x, p2.y);
      this.context.lineTo(p3.x, p3.y);
      this.context.lineTo(p4.x, p4.y);
      this.context.closePath();

      if (fillColor) {
        const prevFill = this.context.fillStyle;
        this.context.fillStyle = fillColor;
        this.context.fill();
        this.context.fillStyle = prevFill;
      } else if (this.context.checkTransparency("fill")) {
        this.context.fill();
      }

      if (this.context.checkTransparency("stroke")) {
        this.context.stroke();
      }
    }
  }

  /**
   * Create a single hull shape from points
   * Points are connected following the winding order:
   * 0 - 2 - 4 - ... n-1
   * |                 |
   * 1 - 3 - 5 - ... n
   * 
   * Final order: 0 - 2 - 4 ... n-1, n, ... 5 - 3 - 1
   * 
   * @param points - Array of points
   * @param draw - Optional callback to add elements along the hull
   */
  hull(
    points: Array<{ x: number; y: number }>,
    draw?: (hull: StripHull) => void
  ): void {
    if (points.length < 2) return;

    // Build the hull path following the winding order
    const hullPath: Array<{ x: number; y: number }> = [];
    
    // Add even indices in forward order (top edge)
    for (let i = 0; i < points.length; i += 2) {
      hullPath.push(points[i]);
    }
    
    // Add odd indices in reverse order (bottom edge)
    for (let i = points.length - 1 - (points.length % 2); i >= 1; i -= 2) {
      hullPath.push(points[i]);
    }

    // Draw the hull shape
    this.context.beginPath();
    this.context.moveTo(hullPath[0].x, hullPath[0].y);
    
    for (let i = 1; i < hullPath.length; i++) {
      this.context.lineTo(hullPath[i].x, hullPath[i].y);
    }
    
    this.context.closePath();

    if (this.context.checkTransparency("fill")) {
      this.context.fill();
    }
    if (this.context.checkTransparency("stroke")) {
      this.context.stroke();
    }

    // Call draw callback for each vertical pair
    if (draw) {
      const numPairs = Math.floor(points.length / 2);
      
      for (let i = 0; i < numPairs; i++) {
        const topPoint = points[i * 2];
        const bottomPoint = points[i * 2 + 1];
        
        if (topPoint && bottomPoint) {
          // Calculate center between the pair
          const center = {
            x: (topPoint.x + bottomPoint.x) / 2,
            y: (topPoint.y + bottomPoint.y) / 2
          };
          
          const hull: StripHull = {
            id: i,
            center
          };
          
          draw(hull);
        }
      }
    }
  }

  /**
   * Create a ribbon/tape effect from points
   * Similar to hull but with configurable width
   * 
   * @param points - Array of center points
   * @param width - Width of the ribbon
   * @param draw - Optional callback
   */
  ribbon(
    points: Array<{ x: number; y: number }>,
    width: number,
    draw?: (segment: { id: number; center: { x: number; y: number } }) => string | void
  ): void {
    if (points.length < 2) return;

    // Calculate perpendicular offsets for each point
    const offsetPoints: Array<{ top: { x: number; y: number }; bottom: { x: number; y: number } }> = [];
    
    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1] || curr;
      const next = points[i + 1] || curr;
      
      // Calculate direction
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Calculate perpendicular
      const perpX = -dy / len * (width / 2);
      const perpY = dx / len * (width / 2);
      
      offsetPoints.push({
        top: { x: curr.x + perpX, y: curr.y + perpY },
        bottom: { x: curr.x - perpX, y: curr.y - perpY }
      });
    }

    // Draw the ribbon
    this.context.beginPath();
    
    // Top edge
    this.context.moveTo(offsetPoints[0].top.x, offsetPoints[0].top.y);
    for (let i = 1; i < offsetPoints.length; i++) {
      this.context.lineTo(offsetPoints[i].top.x, offsetPoints[i].top.y);
    }
    
    // Bottom edge (reverse)
    for (let i = offsetPoints.length - 1; i >= 0; i--) {
      this.context.lineTo(offsetPoints[i].bottom.x, offsetPoints[i].bottom.y);
    }
    
    this.context.closePath();

    if (this.context.checkTransparency("fill")) {
      this.context.fill();
    }
    if (this.context.checkTransparency("stroke")) {
      this.context.stroke();
    }

    // Call draw callback for each segment
    if (draw) {
      for (let i = 0; i < points.length - 1; i++) {
        const center = {
          x: (points[i].x + points[i + 1].x) / 2,
          y: (points[i].y + points[i + 1].y) / 2
        };
        
        const result = draw({ id: i, center });
        
        if (typeof result === 'string') {
          // Draw segment with custom color
          this.context.beginPath();
          this.context.moveTo(offsetPoints[i].top.x, offsetPoints[i].top.y);
          this.context.lineTo(offsetPoints[i + 1].top.x, offsetPoints[i + 1].top.y);
          this.context.lineTo(offsetPoints[i + 1].bottom.x, offsetPoints[i + 1].bottom.y);
          this.context.lineTo(offsetPoints[i].bottom.x, offsetPoints[i].bottom.y);
          this.context.closePath();
          
          const prevFill = this.context.fillStyle;
          this.context.fillStyle = result;
          this.context.fill();
          this.context.fillStyle = prevFill;
        }
      }
    }
  }
}

export default Strip;