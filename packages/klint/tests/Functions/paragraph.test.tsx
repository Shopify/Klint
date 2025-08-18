import { describe, it, expect, beforeEach, vi } from "vitest";

// Partial representation of Klint with paragraph functionality
type KlintContext = {
  paragraph: (
    text: string | number | undefined,
    x: number,
    y: number,
    width: number,
    options?: {
      justification?: 'left' | 'center' | 'right' | 'justified';
      overflow?: number;
      break?: 'words' | 'letters';
    }
  ) => void;
  computeFont: () => void;
  checkTransparency: (type: string) => boolean;
  fillText: (text: string, x: number, y: number) => void;
  strokeText: (text: string, x: number, y: number) => void;
  measureText: (text: string) => TextMetrics;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  __textLeading?: number;
  __textSize: number;
  _ctx: CanvasRenderingContext2D;
};

describe("paragraph", () => {
  let K: KlintContext;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let fillTextSpy: ReturnType<typeof vi.fn>;
  let strokeTextSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext("2d")!;

    fillTextSpy = vi.fn();
    strokeTextSpy = vi.fn();

    // Create mock context
    K = {
      paragraph(text, x, y, width, options) {
        if (text === undefined) return;
        this.computeFont();

        const textString = String(text);
        const justification = options?.justification || 'left';
        const overflow = options?.overflow || 0;
        const breakMode = options?.break || 'words';
        
        // Save current text alignment
        const originalAlign = this.textAlign;
        const originalBaseline = this.textBaseline;
        
        // Set alignment for paragraph
        if (justification === 'center') {
          this.textAlign = 'center';
        } else if (justification === 'right') {
          this.textAlign = 'right';
        } else {
          this.textAlign = 'left';
        }
        this.textBaseline = 'top';

        // Split text into words or characters based on break mode
        const tokens = breakMode === 'letters' 
          ? textString.split('') 
          : textString.split(/\s+/);
        
        const lines: string[] = [];
        let currentLine = '';
        
        // Build lines based on width constraint
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const testLine = currentLine 
            ? (breakMode === 'letters' ? currentLine + token : currentLine + ' ' + token)
            : token;
          
          const metrics = this.measureText(testLine);
          
          if (metrics.width > width && currentLine !== '') {
            lines.push(currentLine);
            currentLine = token;
          } else {
            currentLine = testLine;
          }
        }
        
        // Add remaining text as last line
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Calculate line height
        const lineHeight = this.__textLeading ?? this.__textSize * 1.2;
        
        // Handle overflow - limit lines if overflow is set
        let linesToDraw = lines;
        if (overflow > 0 && lines.length * lineHeight > overflow) {
          const maxLines = Math.floor(overflow / lineHeight);
          linesToDraw = lines.slice(0, maxLines);
        }
        
        // Draw each line
        linesToDraw.forEach((line, index) => {
          const lineY = y + index * lineHeight;
          let lineX = x;
          
          // Adjust x position based on justification
          if (justification === 'center') {
            lineX = x + width / 2;
          } else if (justification === 'right') {
            lineX = x + width;
          } else if (justification === 'justified' && index < linesToDraw.length - 1) {
            // Justify all lines except the last one
            const words = line.split(/\s+/);
            if (words.length > 1) {
              const textWidth = this.measureText(words.join('')).width;
              const totalSpaceWidth = width - textWidth;
              const spaceWidth = totalSpaceWidth / (words.length - 1);
              
              // Draw each word individually with calculated spacing
              let currentX = x;
              words.forEach((word) => {
                if (this.checkTransparency("fill")) {
                  this.fillText(word, currentX, lineY);
                }
                if (this.checkTransparency("stroke")) {
                  this.strokeText(word, currentX, lineY);
                }
                currentX += this.measureText(word).width + spaceWidth;
              });
              return;
            }
          }
          
          // Draw line normally (non-justified)
          if (this.checkTransparency("fill")) {
            this.fillText(line, lineX, lineY);
          }
          if (this.checkTransparency("stroke")) {
            this.strokeText(line, lineX, lineY);
          }
        });
        
        // Restore original alignment
        this.textAlign = originalAlign;
        this.textBaseline = originalBaseline;
      },
      computeFont: vi.fn(),
      checkTransparency: vi.fn(() => true),
      fillText: fillTextSpy,
      strokeText: strokeTextSpy,
      measureText: (text: string) => {
        // Mock text measurement - each character is 10px wide
        return {
          width: text.length * 10
        } as TextMetrics;
      },
      textAlign: 'left',
      textBaseline: 'alphabetic',
      __textSize: 16,
      _ctx: ctx,
    };
  });

  describe("basic functionality", () => {
    it("should render text within specified width", () => {
      const text = "This is a long paragraph that should wrap to multiple lines";
      K.paragraph(text, 100, 100, 200);
      
      // Should have called fillText multiple times for wrapped lines
      expect(fillTextSpy).toHaveBeenCalled();
    });

    it("should handle undefined text gracefully", () => {
      K.paragraph(undefined, 100, 100, 200);
      expect(fillTextSpy).not.toHaveBeenCalled();
    });

    it("should convert numbers to strings", () => {
      K.paragraph(12345, 100, 100, 200);
      expect(fillTextSpy).toHaveBeenCalledWith("12345", expect.any(Number), expect.any(Number));
    });
  });

  describe("justification options", () => {
    it("should align text to the left by default", () => {
      K.paragraph("Test text", 100, 100, 200);
      expect(K.textAlign).toBe('left');
    });

    it("should support center justification", () => {
      K.paragraph("Test text", 100, 100, 200, { justification: 'center' });
      expect(fillTextSpy).toHaveBeenCalledWith("Test text", 200, expect.any(Number));
    });

    it("should support right justification", () => {
      K.paragraph("Test text", 100, 100, 200, { justification: 'right' });
      expect(fillTextSpy).toHaveBeenCalledWith("Test text", 300, expect.any(Number));
    });

    it("should support justified text for multi-word lines", () => {
      const text = "Word1 Word2 Word3";
      K.paragraph(text, 100, 100, 200, { justification: 'justified' });
      
      // In justified mode, each word should be drawn separately
      expect(fillTextSpy).toHaveBeenCalledWith("Word1", expect.any(Number), expect.any(Number));
      expect(fillTextSpy).toHaveBeenCalledWith("Word2", expect.any(Number), expect.any(Number));
      expect(fillTextSpy).toHaveBeenCalledWith("Word3", expect.any(Number), expect.any(Number));
    });
  });

  describe("break modes", () => {
    it("should break on words by default", () => {
      const text = "This is a test";
      K.paragraph(text, 100, 100, 50); // Very narrow width
      
      // Should break into multiple lines
      expect(fillTextSpy.mock.calls.length).toBeGreaterThan(1);
    });

    it("should support breaking on letters", () => {
      const text = "Verylongwordthatcannotfitonasingleline";
      K.paragraph(text, 100, 100, 100, { break: 'letters' });
      
      // Should break the long word across lines
      expect(fillTextSpy).toHaveBeenCalled();
    });
  });

  describe("overflow handling", () => {
    it("should respect overflow limit", () => {
      const text = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
      const lineHeight = K.__textSize * 1.2;
      
      // Set overflow to only show 2 lines
      K.paragraph(text, 100, 100, 200, { overflow: lineHeight * 2 });
      
      // Should only draw 2 lines
      expect(fillTextSpy.mock.calls.length).toBe(2);
    });

    it("should show all lines when overflow is 0", () => {
      const text = "Line 1 Line 2 Line 3 Line 4 Line 5";
      K.paragraph(text, 100, 100, 50, { overflow: 0 });
      
      // Should draw all lines regardless of height
      expect(fillTextSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("text styling", () => {
    it("should respect fill and stroke transparency", () => {
      K.checkTransparency = vi.fn((type) => type === 'fill');
      
      K.paragraph("Test", 100, 100, 200);
      
      expect(fillTextSpy).toHaveBeenCalled();
      expect(strokeTextSpy).not.toHaveBeenCalled();
    });

    it("should use custom line height when __textLeading is set", () => {
      K.__textLeading = 30;
      K.paragraph("Line 1\nLine 2", 100, 100, 200);
      
      // Second line should be at y + 30
      expect(fillTextSpy).toHaveBeenCalledWith("Line 1", expect.any(Number), 100);
      expect(fillTextSpy).toHaveBeenCalledWith("Line 2", expect.any(Number), 130);
    });
  });

  describe("state restoration", () => {
    it("should restore original text alignment after drawing", () => {
      const originalAlign = K.textAlign;
      const originalBaseline = K.textBaseline;
      
      K.paragraph("Test", 100, 100, 200, { justification: 'center' });
      
      expect(K.textAlign).toBe(originalAlign);
      expect(K.textBaseline).toBe(originalBaseline);
    });
  });
});