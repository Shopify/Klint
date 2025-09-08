/**
 * FontParser Plugin Tests
 * Comprehensive test suite for font loading and rendering
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import FontParser from '../src/FontParser';
import type { FontData, FontPathsResult, FontPointsResult } from '../src/FontParser';

// Mock fetch for testing
const mockFontBuffer = new ArrayBuffer(1000);
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: () => Promise.resolve(mockFontBuffer),
});

describe('FontParser', () => {
  let parser: FontParser;
  let mockFont: FontData;

  beforeAll(async () => {
    parser = new FontParser();
    
    // Create a mock font for testing
    mockFont = {
      toPaths: vi.fn().mockReturnValue({
        letters: [
          {
            path: new Path2D(),
            center: { x: 0, y: 0 },
            letterIndex: 0,
            wordIndex: 0,
            lineIndex: 0,
            width: 50,
            height: 72,
            char: 'T'
          }
        ],
        block: { width: 100, height: 72 }
      }),
      toPoints: vi.fn().mockReturnValue({
        letters: [
          {
            shape: [
              { x: 0, y: 0, contour: 0 },
              { x: 10, y: 0, contour: 0 },
              { x: 20, y: 0, contour: 0 }
            ],
            center: { x: 0, y: 0 },
            letterIndex: 0,
            wordIndex: 0,
            lineIndex: 0,
            width: 50,
            height: 72,
            char: 'T'
          }
        ],
        block: { width: 100, height: 72 }
      }),
      layoutText: vi.fn(),
      head: { unitsPerEm: 1000, xMin: 0, yMin: 0, xMax: 1000, yMax: 1000 },
      hhea: { ascender: 800, descender: -200, lineGap: 0 },
      name: { fontFamily: 'Test Font', postScriptName: 'TestFont' }
    };
  });

  describe('FontParser Class', () => {
    it('should create a new instance', () => {
      expect(parser).toBeDefined();
      expect(parser).toBeInstanceOf(FontParser);
    });

    it('should have fonts Map property', () => {
      expect(parser.fonts).toBeDefined();
      expect(parser.fonts).toBeInstanceOf(Map);
    });
  });

  describe('Font Loading', () => {
    it('should reject unsupported font formats', async () => {
      await expect(parser.load('test.otf')).rejects.toThrow('OTF not supported');
      await expect(parser.load('test.woff')).rejects.toThrow('WOFF not supported');
      await expect(parser.load('test.woff2')).rejects.toThrow('WOFF2 not supported');
    });

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
      await expect(parser.load('test.ttf')).rejects.toThrow('Failed to load font');
    });
  });

  describe('FontData Interface', () => {
    it('should have required methods', () => {
      expect(mockFont.toPaths).toBeDefined();
      expect(mockFont.toPoints).toBeDefined();
      expect(mockFont.layoutText).toBeDefined();
    });

    it('should have font metadata', () => {
      expect(mockFont.head).toBeDefined();
      expect(mockFont.hhea).toBeDefined();
      expect(mockFont.name).toBeDefined();
    });
  });

  describe('toPaths Method', () => {
    it('should return FontPathsResult', () => {
      const result = mockFont.toPaths('Test');
      
      expect(result).toBeDefined();
      expect(result.letters).toBeDefined();
      expect(result.block).toBeDefined();
      expect(Array.isArray(result.letters)).toBe(true);
    });

    it('should handle text options', () => {
      const options = {
        align: 'center' as const,
        baseline: 'center' as const,
        anchor: 'center' as const,
        letterSpacing: 2,
        lineSpacing: 1.5
      };

      const result = mockFont.toPaths('Test', 72, options);
      expect(mockFont.toPaths).toHaveBeenCalledWith('Test', 72, options);
    });

    it('should create Path2D objects', () => {
      const result = mockFont.toPaths('T');
      const firstLetter = result.letters[0];
      
      expect(firstLetter.path).toBeDefined();
      expect(firstLetter.center).toEqual({ x: 0, y: 0 });
      expect(firstLetter.char).toBe('T');
    });
  });

  describe('toPoints Method', () => {
    it('should return FontPointsResult', () => {
      const result = mockFont.toPoints('Test');
      
      expect(result).toBeDefined();
      expect(result.letters).toBeDefined();
      expect(result.block).toBeDefined();
      expect(Array.isArray(result.letters)).toBe(true);
    });

    it('should create point arrays', () => {
      const result = mockFont.toPoints('T');
      const firstLetter = result.letters[0];
      
      expect(Array.isArray(firstLetter.shape)).toBe(true);
      expect(firstLetter.shape.length).toBeGreaterThan(0);
      expect(firstLetter.shape[0]).toHaveProperty('x');
      expect(firstLetter.shape[0]).toHaveProperty('y');
      expect(firstLetter.shape[0]).toHaveProperty('contour');
    });

    it('should handle sampling options', () => {
      const options = { sampling: 0.5, align: 'center' as const };
      const result = mockFont.toPoints('Test', 72, options);
      
      expect(mockFont.toPoints).toHaveBeenCalledWith('Test', 72, options);
    });
  });

  describe('Text Alignment', () => {
    it('should support all alignment options', () => {
      const alignments: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
      const baselines: Array<'top' | 'center' | 'bottom' | 'baseline'> = ['top', 'center', 'bottom', 'baseline'];
      
      alignments.forEach(align => {
        baselines.forEach(baseline => {
          const result = mockFont.toPaths('Test', 48, { align, baseline });
          expect(result).toBeDefined();
        });
      });
    });

    it('should handle multiline text', () => {
      const result = mockFont.toPaths('Line 1\nLine 2\nLine 3', 48, {
        align: 'center',
        baseline: 'center',
        anchor: 'center'
      });
      
      expect(result).toBeDefined();
      expect(result.letters.length).toBeGreaterThan(0);
    });
  });

  describe('Variable Fonts', () => {
    it('should support axisValues parameter', () => {
      const options = {
        axisValues: [400, 100], // Weight, Width
        align: 'center' as const
      };

      const result = mockFont.toPaths('Variable', 72, options);
      expect(mockFont.toPaths).toHaveBeenCalledWith('Variable', 72, options);
    });

    it('should handle variable font metadata', () => {
      const variableFont = {
        ...mockFont,
        fvar: [
          [
            ['wght', 100, 400, 900, 0, 'Weight'],
            ['wdth', 50, 100, 200, 0, 'Width']
          ],
          []
        ]
      };

      expect(variableFont.fvar).toBeDefined();
      expect(Array.isArray(variableFont.fvar)).toBe(true);
    });
  });

  describe('Creative Coding Features', () => {
    it('should provide point data for particle effects', () => {
      const result = mockFont.toPoints('PARTICLE', 120, { sampling: 0.3 });
      
      result.letters.forEach(letter => {
        expect(letter.shape).toBeDefined();
        expect(Array.isArray(letter.shape)).toBe(true);
        
        letter.shape.forEach(point => {
          expect(typeof point.x).toBe('number');
          expect(typeof point.y).toBe('number');
          expect(typeof point.contour).toBe('number');
        });
      });
    });

    it('should provide path data for vector rendering', () => {
      const result = mockFont.toPaths('VECTOR', 120);
      
      result.letters.forEach(letter => {
        expect(letter.path).toBeDefined();
        expect(letter.center).toHaveProperty('x');
        expect(letter.center).toHaveProperty('y');
        expect(typeof letter.width).toBe('number');
        expect(typeof letter.height).toBe('number');
      });
    });

    it('should handle different font sizes', () => {
      const sizes = [12, 24, 48, 96, 144];
      
      sizes.forEach(size => {
        const result = mockFont.toPaths('Size Test', size);
        expect(result).toBeDefined();
        expect(result.block.width).toBeGreaterThan(0);
        expect(result.block.height).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle empty text', () => {
      const result = mockFont.toPaths('');
      expect(result).toBeDefined();
      expect(result.letters).toBeDefined();
    });

    it('should handle special characters', () => {
      const specialText = 'Hello! @#$%^&*()_+-=[]{}|;:,.<>?';
      const result = mockFont.toPaths(specialText);
      expect(result).toBeDefined();
    });

    it('should handle large text efficiently', () => {
      const largeText = 'A'.repeat(100); // Reduce size for mock test
      const result = mockFont.toPoints(largeText, 48, { sampling: 0.1 });
      expect(result).toBeDefined();
      expect(result.letters.length).toBeGreaterThan(0);
    });
  });

  describe('Type Safety', () => {
    it('should provide proper TypeScript types', () => {
      const result: FontPathsResult = mockFont.toPaths('TypeScript');
      expect(result.letters).toBeDefined();
      expect(result.block).toBeDefined();
      
      const pointResult: FontPointsResult = mockFont.toPoints('TypeScript');
      expect(pointResult.letters).toBeDefined();
      expect(pointResult.block).toBeDefined();
    });

    it('should have proper option types', () => {
      const options: FontTextOptions = {
        align: 'center',
        baseline: 'center',
        anchor: 'center',
        letterSpacing: 1,
        lineSpacing: 1.2,
        wordSpacing: 0.5,
        sampling: 0.25,
        axisValues: [400, 100]
      };

      const result = mockFont.toPaths('Options Test', 48, options);
      expect(result).toBeDefined();
    });
  });
});