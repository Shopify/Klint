import { KlintContext } from '@shopify/klint';

/**
 * Static CatmullRom Plugin
 * 
 * Provides Catmull-Rom spline interpolation without requiring Klint context.
 * Context is only passed when drawing operations are needed.
 * 
 * @example
 * ```tsx
 * import { CatmullRom } from '@shopify/klint-plugins';
 * 
 * const draw = (K) => {
 *   const points = [
 *     { x: 100, y: 100 },
 *     { x: 200, y: 150 },
 *     { x: 300, y: 100 },
 *     { x: 400, y: 200 }
 *   ];
 *   
 *   const smooth = CatmullRom.interpolate(points);
 *   CatmullRom.draw(K, points);
 * };
 * ```
 */
export class CatmullRom {
  /**
   * Interpolate points using Catmull-Rom spline
   */
  static interpolate(
    points: Array<{x: number, y: number}>, 
    tension: number = 0.5,
    segments: number = 20
  ): Array<{x: number, y: number}> {
    if (points.length < 2) return points;
    
    const result: Array<{x: number, y: number}> = [];
    
    // Add control points at the beginning and end
    const extendedPoints = [
      points[0],
      ...points,
      points[points.length - 1]
    ];
    
    for (let i = 1; i < extendedPoints.length - 2; i++) {
      const p0 = extendedPoints[i - 1];
      const p1 = extendedPoints[i];
      const p2 = extendedPoints[i + 1];
      const p3 = extendedPoints[i + 2];
      
      for (let t = 0; t < 1; t += 1 / segments) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        const v0 = tension * (p2.x - p0.x);
        const v1 = tension * (p3.x - p1.x);
        
        const x = p1.x + 
          v0 * t + 
          (3 * (p2.x - p1.x) - 2 * v0 - v1) * t2 +
          (2 * (p1.x - p2.x) + v0 + v1) * t3;
        
        const v0y = tension * (p2.y - p0.y);
        const v1y = tension * (p3.y - p1.y);
        
        const y = p1.y + 
          v0y * t + 
          (3 * (p2.y - p1.y) - 2 * v0y - v1y) * t2 +
          (2 * (p1.y - p2.y) + v0y + v1y) * t3;
        
        result.push({ x, y });
      }
    }
    
    // Add the last point
    result.push(points[points.length - 1]);
    
    return result;
  }
  
  /**
   * Draw interpolated curve to canvas
   */
  static draw(
    ctx: KlintContext,
    points: Array<{x: number, y: number}>, 
    options?: {
      tension?: number;
      segments?: number;
      closed?: boolean;
      strokeStyle?: string;
      lineWidth?: number;
    }
  ): void {
    const { tension = 0.5, segments = 20, closed = false } = options || {};
    
    const interpolated = this.interpolate(
      closed ? [...points, points[0]] : points,
      tension,
      segments
    );
    
    ctx.save();
    
    if (options?.strokeStyle) {
      ctx.strokeStyle = options.strokeStyle;
    }
    if (options?.lineWidth) {
      ctx.lineWidth = options.lineWidth;
    }
    
    ctx.beginPath();
    ctx.moveTo(interpolated[0].x, interpolated[0].y);
    
    for (let i = 1; i < interpolated.length; i++) {
      ctx.lineTo(interpolated[i].x, interpolated[i].y);
    }
    
    if (closed) {
      ctx.closePath();
    }
    
    ctx.stroke();
    ctx.restore();
  }
  
  /**
   * Get path as a Path2D object
   */
  static toPath2D(
    points: Array<{x: number, y: number}>,
    options?: {
      tension?: number;
      segments?: number;
      closed?: boolean;
    }
  ): Path2D {
    const { tension = 0.5, segments = 20, closed = false } = options || {};
    
    const interpolated = this.interpolate(
      closed ? [...points, points[0]] : points,
      tension,
      segments
    );
    
    const path = new Path2D();
    path.moveTo(interpolated[0].x, interpolated[0].y);
    
    for (let i = 1; i < interpolated.length; i++) {
      path.lineTo(interpolated[i].x, interpolated[i].y);
    }
    
    if (closed) {
      path.closePath();
    }
    
    return path;
  }
}

// Export the class directly for static import
export { CatmullRom };