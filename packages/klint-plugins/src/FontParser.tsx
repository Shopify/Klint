import { KlintContext } from '@shopify/klint';

/**
 * Font data structure
 */
interface FontData {
  glyphs: Map<string, any>;
  metrics: {
    unitsPerEm: number;
    ascender: number;
    descender: number;
  };
}

/**
 * Static FontParser Plugin
 * 
 * Loads and renders font files without requiring Klint context initialization.
 * Context is only passed when drawing operations are needed.
 * 
 * @example
 * ```tsx
 * import { FontParser } from '@shopify/klint-plugins';
 * 
 * const preload = async () => {
 *   const font = await FontParser.load('myFont', '/assets/font.ttf');
 * };
 * 
 * const draw = (K) => {
 *   const points = FontParser.toPoints('Hello', 'myFont', 72);
 *   FontParser.draw(K, 'Hello World', 'myFont', 100, 100);
 * };
 * ```
 */
export class FontParser {
  private static fonts: Map<string, FontData> = new Map();
  
  /**
   * Load a font from URL
   */
  static async load(name: string, url: string): Promise<FontData> {
    // Font loading logic here
    // This is a simplified example
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    
    // Parse font data (simplified)
    const fontData: FontData = {
      glyphs: new Map(),
      metrics: {
        unitsPerEm: 1000,
        ascender: 800,
        descender: -200
      }
    };
    
    this.fonts.set(name, fontData);
    return fontData;
  }
  
  /**
   * Convert text to point coordinates
   */
  static toPoints(text: string, fontName: string, size: number = 72): Array<{x: number, y: number}> {
    const font = this.fonts.get(fontName);
    if (!font) {
      throw new Error(`Font ${fontName} not loaded`);
    }
    
    // Convert text to points (simplified)
    const points: Array<{x: number, y: number}> = [];
    let x = 0;
    
    for (const char of text) {
      // Add character points
      points.push({ x, y: 0 });
      x += size * 0.6; // Simplified advance
    }
    
    return points;
  }
  
  /**
   * Draw text using the loaded font
   */
  static draw(
    ctx: KlintContext, 
    text: string, 
    fontName: string, 
    x: number, 
    y: number, 
    size: number = 72
  ): void {
    const font = this.fonts.get(fontName);
    if (!font) {
      throw new Error(`Font ${fontName} not loaded`);
    }
    
    // Draw the text using canvas context
    ctx.save();
    ctx.font = `${size}px ${fontName}`;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  
  /**
   * Get font metrics
   */
  static getMetrics(fontName: string): FontData['metrics'] | undefined {
    return this.fonts.get(fontName)?.metrics;
  }
  
  /**
   * Check if font is loaded
   */
  static hasFont(fontName: string): boolean {
    return this.fonts.has(fontName);
  }
  
  /**
   * Clear all loaded fonts
   */
  static clear(): void {
    this.fonts.clear();
  }
}

// Export the class directly for static import
export { FontParser };