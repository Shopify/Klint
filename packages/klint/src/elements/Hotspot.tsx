import type { KlintContext } from "../core/KlintTypes";

/**
 * Point interface for hotspot detection
 */
export interface HotspotPoint {
  x: number;
  y: number;
}

/**
 * Hotspot Element for Klint
 * 
 * Provides simple hit detection for various shapes
 * 
 * @example
 * ```tsx
 * const draw = (K) => {
 *   // Check if mouse is inside a circle
 *   const isHovering = K.Hotspot.circle(K.mouse, 200, 200, 50);
 *   
 *   // Draw circle with hover effect
 *   K.fillColor(isHovering ? '#ff0066' : '#333');
 *   K.circle(200, 200, 50);
 *   
 *   // Rectangle hotspot
 *   if (K.Hotspot.rect(K.mouse, 100, 100, 80, 60)) {
 *     K.canvas.style.cursor = 'pointer';
 *   } else {
 *     K.canvas.style.cursor = 'default';
 *   }
 * };
 * ```
 */
class Hotspot {
  private context: KlintContext;

  /**
   * Creates a new Hotspot instance
   * @param ctx - The Klint context
   */
  constructor(ctx: KlintContext) {
    this.context = ctx;
  }

  /**
   * Check if point is inside a circle
   * @param point - Point to check (usually mouse position)
   * @param x - Circle center X
   * @param y - Circle center Y
   * @param radius - Circle radius
   * @returns True if point is inside the circle
   */
  circle(
    point: HotspotPoint,
    x: number,
    y: number,
    radius: number
  ): boolean {
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius;
  }

  /**
   * Check if point is inside a rectangle
   * @param point - Point to check (usually mouse position)
   * @param x - Rectangle X position
   * @param y - Rectangle Y position
   * @param width - Rectangle width
   * @param height - Rectangle height
   * @returns True if point is inside the rectangle
   */
  rect(
    point: HotspotPoint,
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    // Check for rectangle origin setting
    const origin = this.context.__rectangleOrigin || 'corner';
    
    let left: number, top: number;
    
    if (origin === 'center') {
      left = x - width / 2;
      top = y - height / 2;
    } else {
      left = x;
      top = y;
    }
    
    const right = left + width;
    const bottom = top + height;
    
    return point.x >= left && point.x <= right &&
           point.y >= top && point.y <= bottom;
  }

  /**
   * Check if point is inside an ellipse
   * @param point - Point to check
   * @param x - Ellipse center X
   * @param y - Ellipse center Y
   * @param radiusX - Horizontal radius
   * @param radiusY - Vertical radius
   * @param rotation - Rotation angle in radians
   * @returns True if point is inside the ellipse
   */
  ellipse(
    point: HotspotPoint,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number = 0
  ): boolean {
    // Transform point to ellipse's local coordinate system
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    const dx = point.x - x;
    const dy = point.y - y;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    
    // Check if point is inside ellipse equation
    return (localX * localX) / (radiusX * radiusX) + 
           (localY * localY) / (radiusY * radiusY) <= 1;
  }

  /**
   * Check if point is inside a polygon
   * @param point - Point to check
   * @param vertices - Array of polygon vertices
   * @returns True if point is inside the polygon
   */
  polygon(
    point: HotspotPoint,
    vertices: HotspotPoint[]
  ): boolean {
    // Use ray casting algorithm
    let inside = false;
    const n = vertices.length;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;
      
      const intersect = ((yi > point.y) !== (yj > point.y))
          && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  }

  /**
   * Check if point is inside a Path2D
   * @param point - Point to check
   * @param path - Path2D object
   * @returns True if point is inside the path
   */
  path(
    point: HotspotPoint,
    path: Path2D
  ): boolean {
    return this.context.isPointInPath(path, point.x, point.y);
  }
}

export default Hotspot;