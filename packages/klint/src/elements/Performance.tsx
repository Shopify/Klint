/**
 * Performance monitoring and optimization utilities for Klint
 */

import { KlintContext, KlintPerformanceMetrics } from "../Klint";

interface KlintPerformance {
  // Performance utilities
  batchDraw: (drawFn: () => void) => void;
  useOffscreenCache: (
    id: string,
    width: number,
    height: number,
    renderFn: (offscreenCtx: KlintContext) => void
  ) => void;
  throttleFrame: <T>(interval: number, fn: () => T) => T;
  useLeakDetection: () => {
    track: (type: string) => void;
    check: () => void;
  };
  getCachedTextMetrics: (text: string, font: string) => TextMetrics;
  clearCaches: () => void;

  // Widget rendering
  render: (options?: PerformanceWidgetOptions) => void;
  show: (options?: PerformanceWidgetOptions) => void;

  // Metrics access
  getMetrics: () => KlintPerformanceMetrics | null;
}

export interface PerformanceWidgetOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showGraph?: boolean;
  graphHeight?: number;
  fontSize?: number;
  showMemory?: boolean;
}

class Performance implements KlintPerformance {
  private context: KlintContext;
  private textMetricsCache = new Map<string, TextMetrics>();
  private frameTimeHistory: number[] = [];
  private readonly MAX_HISTORY = 60;

  constructor(ctx: KlintContext) {
    this.context = ctx;
  }

  /**
   * Batch multiple canvas operations together for better performance
   */
  batchDraw(drawFn: () => void): void {
    this.context.save();
    this.context.beginPath();

    try {
      drawFn();
    } finally {
      this.context.restore();
    }
  }

  /**
   * Optimize drawing by using offscreen canvas for static elements
   */
  useOffscreenCache(
    id: string,
    width: number,
    height: number,
    renderFn: (offscreenCtx: KlintContext) => void
  ): void {
    let offscreen = this.context.__offscreens.get(id);

    if (!offscreen || offscreen instanceof HTMLImageElement) {
      offscreen = this.context.createOffscreen(id, width, height);
      if (offscreen && !(offscreen instanceof HTMLImageElement)) {
        renderFn(offscreen as KlintContext);
      }
    }

    if (offscreen) {
      if (offscreen instanceof HTMLImageElement) {
        this.context.image(offscreen, 0, 0);
      } else {
        this.context.image(offscreen.canvas, 0, 0);
      }
    }
  }

  /**
   * Throttle expensive operations to run less frequently
   */
  throttleFrame<T>(interval: number, fn: () => T): T {
    const cacheKey = `__throttle_${fn.toString().slice(0, 50)}`;
    const cached = (this.context as any)[cacheKey];

    if (!cached || this.context.frame % interval === 0) {
      const result = fn();
      (this.context as any)[cacheKey] = { value: result, frame: this.context.frame };
      return result;
    }

    return cached.value;
  }

  /**
   * Detect potential memory leaks by tracking object creation
   */
  useLeakDetection() {
    const objectCounts = new Map<string, number>();
    let lastCheckFrame = 0;

    return {
      track: (type: string) => {
        const count = objectCounts.get(type) || 0;
        objectCounts.set(type, count + 1);
      },

      check: () => {
        // Check every 60 frames (1 second at 60fps)
        if (this.context.frame - lastCheckFrame < 60) return;
        lastCheckFrame = this.context.frame;

        const warnings: string[] = [];

        objectCounts.forEach((count, type) => {
          if (count > 10000) {
            warnings.push(
              `Potential memory leak: ${type} has ${count} instances`
            );
          }
        });

        if (warnings.length > 0) {
          console.warn("[Klint] Memory leak warnings:", warnings);
        }

        // Reset counts
        objectCounts.clear();
      },
    };
  }

  /**
   * Optimize text rendering by caching text measurements
   */
  getCachedTextMetrics(text: string, font: string): TextMetrics {
    const cacheKey = `${font}:${text}`;

    if (!this.textMetricsCache.has(cacheKey)) {
      this.context.save();
      this.context.font = font;
      const metrics = this.context.measureText(text);
      this.context.restore();
      this.textMetricsCache.set(cacheKey, metrics);

      // Limit cache size
      if (this.textMetricsCache.size > 1000) {
        const firstKey = this.textMetricsCache.keys().next().value;
        if (firstKey) this.textMetricsCache.delete(firstKey);
      }
    }

    return this.textMetricsCache.get(cacheKey)!;
  }

  /**
   * Clear all performance caches
   */
  clearCaches(): void {
    this.textMetricsCache.clear();
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): KlintPerformanceMetrics | null {
    return this.context.__performance || null;
  }

  /**
   * Render performance widget on canvas
   */
  render(options: PerformanceWidgetOptions = {}): void {
    const metrics = this.getMetrics();
    if (!metrics) return;

    const {
      x = 10,
      y = 10,
      width = 200,
      height = 120,
      backgroundColor = "rgba(0, 0, 0, 0.8)",
      textColor = "#ffffff",
      accentColor = "#4ecdc4",
      showGraph = true,
      graphHeight = 40,
      fontSize = 12,
      showMemory = true,
    } = options;

    // Update frame time history for graph
    if (showGraph) {
      this.frameTimeHistory.push(metrics.frameTime);
      if (this.frameTimeHistory.length > this.MAX_HISTORY) {
        this.frameTimeHistory.shift();
      }
    }

    // Save context state
    this.context.save();

    // Draw background
    this.context.fillStyle = backgroundColor;
    this.context.fillRect(x, y, width, height);

    // Draw border
    this.context.strokeStyle = accentColor;
    this.context.lineWidth = 1;
    this.context.strokeRect(x, y, width, height);

    // Set text properties
    this.context.fillStyle = textColor;
    this.context.font = `${fontSize}px monospace`;
    this.context.textAlign = "left";
    this.context.textBaseline = "top";

    let currentY = y + 8;

    // FPS
    const fpsColor = metrics.fps >= 55 ? "#4ecdc4" : metrics.fps >= 30 ? "#ffd93d" : "#ff6b6b";
    this.context.fillStyle = fpsColor;
    this.context.fillText(`FPS: ${metrics.fps}`, x + 8, currentY);
    currentY += fontSize + 4;

    // Frame time
    this.context.fillStyle = textColor;
    this.context.fillText(`Frame: ${metrics.frameTime.toFixed(2)}ms`, x + 8, currentY);
    currentY += fontSize + 4;

    // Average frame time
    this.context.fillText(`Avg: ${metrics.averageFrameTime.toFixed(2)}ms`, x + 8, currentY);
    currentY += fontSize + 4;

    // Min/Max
    this.context.fillText(
      `Min: ${metrics.minFrameTime.toFixed(2)}ms / Max: ${metrics.maxFrameTime.toFixed(2)}ms`,
      x + 8,
      currentY
    );
    currentY += fontSize + 4;

    // Dropped frames
    if (metrics.droppedFrames > 0) {
      this.context.fillStyle = "#ff6b6b";
      this.context.fillText(`Dropped: ${metrics.droppedFrames}`, x + 8, currentY);
      currentY += fontSize + 4;
    }

    // Memory usage
    if (showMemory && metrics.memoryUsage !== undefined) {
      this.context.fillStyle = textColor;
      this.context.fillText(`Memory: ${metrics.memoryUsage.toFixed(2)}MB`, x + 8, currentY);
      currentY += fontSize + 4;
    }

    // Frame time graph
    if (showGraph && this.frameTimeHistory.length > 1) {
      const graphX = x + 8;
      const graphY = currentY + 4;
      const graphWidth = width - 16;
      const targetFrameTime = 1000 / this.context.fps;

      // Draw graph background
      this.context.fillStyle = "rgba(255, 255, 255, 0.1)";
      this.context.fillRect(graphX, graphY, graphWidth, graphHeight);

      // Draw target line
      const targetY = graphY + graphHeight - (targetFrameTime / (targetFrameTime * 2)) * graphHeight;
      this.context.strokeStyle = "rgba(255, 255, 255, 0.3)";
      this.context.lineWidth = 1;
      this.context.beginPath();
      this.context.moveTo(graphX, targetY);
      this.context.lineTo(graphX + graphWidth, targetY);
      this.context.stroke();

      // Draw frame time line
      this.context.strokeStyle = accentColor;
      this.context.lineWidth = 2;
      this.context.beginPath();

      const maxFrameTime = Math.max(...this.frameTimeHistory, targetFrameTime * 2);
      const stepX = graphWidth / (this.frameTimeHistory.length - 1);

      this.frameTimeHistory.forEach((frameTime, index) => {
        const normalizedTime = Math.min(frameTime / maxFrameTime, 1);
        const pointY = graphY + graphHeight - normalizedTime * graphHeight;
        const pointX = graphX + index * stepX;

        if (index === 0) {
          this.context.moveTo(pointX, pointY);
        } else {
          this.context.lineTo(pointX, pointY);
        }
      });

      this.context.stroke();
    }

    // Restore context state
    this.context.restore();
  }

  /**
   * Alias for render() - shows performance widget
   */
  show(options?: PerformanceWidgetOptions): void {
    this.render(options);
  }
}

export default Performance;

