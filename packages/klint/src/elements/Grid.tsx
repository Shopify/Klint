import type { KlintContext } from "../KlintTypes";

/**
 * Grid point interface
 */
export interface GridPoint {
  x: number;
  y: number;
  i: number;  // column index
  j: number;  // row index
  id: number; // unique id (row * cols + col)
}

/**
 * Grid Element for Klint
 * 
 * Provides utilities for creating rectangular and radial grids
 * 
 * @example
 * ```tsx
 * const draw = (K) => {
 *   // Rectangular grid
 *   const rectGrid = K.Grid.rect(100, 100, 400, 300, 5, 4);
 *   rectGrid.forEach(point => {
 *     K.circle(point.x, point.y, 5);
 *   });
 *   
 *   // Radial grid
 *   const radialGrid = K.Grid.radial(400, 300, 100, 12, 3, 50);
 *   radialGrid.forEach(point => {
 *     K.circle(point.x, point.y, 3);
 *   });
 * };
 * ```
 */
class Grid {
  private context: KlintContext;

  /**
   * Creates a new Grid instance
   * @param ctx - The Klint context
   */
  constructor(ctx: KlintContext) {
    this.context = ctx;
  }

  /**
   * Create a rectangular grid of points
   * @param x - X position of the grid
   * @param y - Y position of the grid
   * @param width - Width of the grid
   * @param height - Height of the grid
   * @param countX - Number of points horizontally
   * @param countY - Number of points vertically
   * @param options - Grid options
   * @returns Array of grid points
   */
  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    countX: number,
    countY: number,
    options?: {
      origin?: 'corner' | 'center';
    }
  ): GridPoint[] {
    const origin = options?.origin || 'corner';
    const points: GridPoint[] = [];
    
    // Calculate starting position based on origin
    let startX = x;
    let startY = y;
    
    if (origin === 'center') {
      startX = x - width / 2;
      startY = y - height / 2;
    }
    
    // Calculate spacing
    const spacingX = countX > 1 ? width / (countX - 1) : 0;
    const spacingY = countY > 1 ? height / (countY - 1) : 0;
    
    // Generate grid points
    for (let j = 0; j < countY; j++) {
      for (let i = 0; i < countX; i++) {
        const pointX = startX + i * spacingX;
        const pointY = startY + j * spacingY;
        const id = j * countX + i;
        
        points.push({
          x: pointX,
          y: pointY,
          i,
          j,
          id
        });
      }
    }
    
    return points;
  }

  /**
   * Create a radial grid of points
   * @param x - Center X position
   * @param y - Center Y position
   * @param radius - Maximum radius
   * @param count - Number of points per ring
   * @param ringCount - Number of rings
   * @param ringSpace - Space between rings
   * @param options - Grid options
   * @returns Array of grid points
   */
  radial(
    x: number,
    y: number,
    radius: number,
    count: number,
    ringCount: number,
    ringSpace: number,
    options?: {
      perStepCount?: number;
    }
  ): GridPoint[] {
    const perStepCount = options?.perStepCount || 0;
    const points: GridPoint[] = [];
    let id = 0;
    
    // Generate points for each ring
    for (let ring = 0; ring < ringCount; ring++) {
      const ringRadius = ring * ringSpace;
      
      // Don't exceed the maximum radius
      if (ringRadius > radius) break;
      
      // Calculate number of points for this ring
      // Add more points for outer rings if perStepCount is set
      const ringPointCount = count + (perStepCount * ring);
      
      // Generate points around the ring
      for (let i = 0; i < ringPointCount; i++) {
        const angle = (Math.PI * 2 * i) / ringPointCount;
        const pointX = x + Math.cos(angle) * ringRadius;
        const pointY = y + Math.sin(angle) * ringRadius;
        
        points.push({
          x: pointX,
          y: pointY,
          i,
          j: ring,
          id: id++
        });
      }
    }
    
    // Add center point for ring 0 if it has radius 0
    if (ringCount > 0 && points.length === 0) {
      points.push({
        x,
        y,
        i: 0,
        j: 0,
        id: 0
      });
    }
    
    return points;
  }

  /**
   * Create a hexagonal grid of points
   * @param x - X position of the grid
   * @param y - Y position of the grid
   * @param width - Width of the grid area
   * @param height - Height of the grid area
   * @param size - Size of each hexagon
   * @param options - Grid options
   * @returns Array of grid points
   */
  hex(
    x: number,
    y: number,
    width: number,
    height: number,
    size: number,
    options?: {
      origin?: 'corner' | 'center';
      pointy?: boolean; // true for pointy-topped, false for flat-topped
    }
  ): GridPoint[] {
    const origin = options?.origin || 'corner';
    const pointy = options?.pointy !== false; // default to pointy-topped
    const points: GridPoint[] = [];
    
    // Calculate starting position based on origin
    let startX = x;
    let startY = y;
    
    if (origin === 'center') {
      startX = x - width / 2;
      startY = y - height / 2;
    }
    
    // Calculate hex dimensions
    const hexWidth = pointy ? Math.sqrt(3) * size : 2 * size;
    const hexHeight = pointy ? 2 * size : Math.sqrt(3) * size;
    
    // Calculate grid dimensions
    const cols = Math.ceil(width / hexWidth) + 1;
    const rows = Math.ceil(height / (hexHeight * 0.75)) + 1;
    
    let id = 0;
    
    // Generate hex grid points
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let pointX: number;
        let pointY: number;
        
        if (pointy) {
          // Pointy-topped hexagons
          pointX = startX + i * hexWidth;
          pointY = startY + j * hexHeight * 0.75;
          
          // Offset every other row
          if (j % 2 === 1) {
            pointX += hexWidth / 2;
          }
        } else {
          // Flat-topped hexagons
          pointX = startX + i * hexWidth * 0.75;
          pointY = startY + j * hexHeight;
          
          // Offset every other column
          if (i % 2 === 1) {
            pointY += hexHeight / 2;
          }
        }
        
        // Only add points within the specified area
        if (pointX <= startX + width && pointY <= startY + height) {
          points.push({
            x: pointX,
            y: pointY,
            i,
            j,
            id: id++
          });
        }
      }
    }
    
    return points;
  }

  /**
   * Create a triangular grid of points
   * @param x - X position of the grid
   * @param y - Y position of the grid
   * @param width - Width of the grid
   * @param height - Height of the grid
   * @param size - Size of each triangle
   * @param options - Grid options
   * @returns Array of grid points
   */
  triangle(
    x: number,
    y: number,
    width: number,
    height: number,
    size: number,
    options?: {
      origin?: 'corner' | 'center';
    }
  ): GridPoint[] {
    const origin = options?.origin || 'corner';
    const points: GridPoint[] = [];
    
    // Calculate starting position based on origin
    let startX = x;
    let startY = y;
    
    if (origin === 'center') {
      startX = x - width / 2;
      startY = y - height / 2;
    }
    
    // Calculate triangle dimensions
    const triHeight = (Math.sqrt(3) / 2) * size;
    
    // Calculate grid dimensions
    const cols = Math.ceil(width / (size / 2)) + 1;
    const rows = Math.ceil(height / triHeight) + 1;
    
    let id = 0;
    
    // Generate triangular grid points
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const pointX = startX + i * (size / 2);
        const pointY = startY + j * triHeight;
        
        // Only add points within the specified area
        if (pointX <= startX + width && pointY <= startY + height) {
          points.push({
            x: pointX,
            y: pointY,
            i,
            j,
            id: id++
          });
        }
      }
    }
    
    return points;
  }
}

export default Grid;