import type { KlintContexts } from "../KlintTypes";

type TextMetrics = {
  width: number;
  height: number;
  baseline: number;
};

type LineData = {
  text: string;
  width: number;
  letters: Array<{
    char: string;
    x: number;
    y: number;
    metrics: TextMetrics;
    letterIndex?: number;
    wordIndex?: number;
    lineIndex?: number;
  }>;
};

interface KlintText {
  context: KlintContexts;
  findTextSize: (
    text: string,
    dist: number,
    estimate?: number,
    direction?: "x" | "y"
  ) => number;
  getTextMetrics: (text: string) => TextMetrics;
  splitTo: (
    text: string,
    kind: "letters" | "words" | "lines" | "all",
    options?: {
      maxWidth?: number;
      lineSpacing?: number;
      letterSpacing?: number;
      wordSpacing?: number;
    }
  ) => Array<{
    char: string;
    x: number;
    y: number;
    metrics: TextMetrics;
    letterIndex?: number;
    wordIndex?: number;
    lineIndex?: number;
  }>;
  circularText: (
    text: string,
    radius?: number,
    fill?: "fill" | "kerned" | "words",
    offset?: number,
    arc?: number
  ) => void;
  textBounds: (text: string) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  log: () => void;
}

class Text implements KlintText {
  context: KlintContexts;
  constructor(ctx: KlintContexts) {
    this.context = ctx;
  }

  findTextSize = (
    text: string,
    dist: number,
    estimate?: number,
    direction: "x" | "y" = "x",
  ) => {
    if (!Number.isFinite(dist) || dist <= 0) return 0;

    const context = this.context;
    const originalSize = context.__textSize;
    const measureAt = (size: number) => {
      context.__textSize = size;
      context.computeFont();
      const bounds = this.textBounds(text);
      return direction === "x" ? bounds.width : bounds.height;
    };

    let low = 1;
    let high = Math.max(1, Math.ceil(estimate ?? originalSize));
    while (measureAt(high) < dist && high < 1_000_000) high *= 2;
    let result = 0;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      if (measureAt(middle) <= dist) {
        result = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    context.__textSize = originalSize;
    context.computeFont();
    return result;
  };

  getTextMetrics = (text: string): TextMetrics => {
    const ctx = this.context;
    ctx.computeFont();
    const metrics = ctx.measureText(text);

    return {
      width: metrics.width,
      height:
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      baseline: metrics.actualBoundingBoxAscent,
    };
  };

  splitTo = (
    text: string,
    kind: "letters" | "words" | "lines" | "all",
    options: {
      maxWidth?: number;
      lineSpacing?: number;
      letterSpacing?: number;
      wordSpacing?: number;
    } = {}
  ) => {
    const ctx = this.context;
    const {
      maxWidth = 0,
      lineSpacing = 0,
      letterSpacing = 0,
      wordSpacing = 0,
    } = options;
    ctx.computeFont();
    if (maxWidth < this.textBounds(" ").width * 2 && maxWidth !== 0) {
      return [];
    }
    const lines = text.split("\n");
    const lineHeights = lines.map((line) => this.getTextMetrics(line).height);
    const totalHeight =
      lineHeights.reduce((sum, height) => sum + height, 0) +
      (lines.length - 1) * (lineSpacing || 0);

    // Initial y position based on alignment
    let y = ctx.textBaseline === "middle" ? -totalHeight / 2 : 0;

    return lines.flatMap((lineText, lineIndex) => {
      const words = lineText.split(" ");
      const currentLine: LineData = {
        text: "",
        width: 0,
        letters: [],
      };

      // Calculate total width for this line
      const totalWidth = this.getTextMetrics(lineText).width;
      let startX = 0;

      // Adjust starting X position based on alignment
      switch (ctx.textAlign) {
        case "center":
          startX = -totalWidth / 2;
          break;
        case "right":
          startX = -totalWidth;
          break;
        // left alignment starts at 0
      }

      let x = startX;
      let letterIndex = 0;
      let wordIndex = 0;

      // Process each word in the line
      const lineLetters = words.flatMap((word) => {
        const letters = [];

        // Process each character in the word
        for (const char of word) {
          const charMetrics = this.getTextMetrics(char);
          x += charMetrics.width / 2;

          const letterData = {
            char,
            x,
            y:
              y +
              (ctx.textBaseline === "middle" ? lineHeights[lineIndex] / 2 : 0),
            metrics: charMetrics,
            ...(kind === "all" && {
              letterIndex,
              wordIndex,
              lineIndex,
            }),
          };

          letters.push(letterData);
          currentLine.text += char;
          x += charMetrics.width / 2 + letterSpacing;
          letterIndex++;
        }

        // Add space after word (except for last word)
        if (wordIndex < words.length - 1) {
          const spaceMetrics = this.getTextMetrics(" ");
          x += spaceMetrics.width + wordSpacing;
          letters.push({
            char: " ",
            x,
            y,
            metrics: spaceMetrics,
            ...(kind === "all" && {
              letterIndex,
              wordIndex,
              lineIndex,
            }),
          });
          currentLine.text += " ";
          letterIndex++;
        }

        wordIndex++;
        return letters;
      });

      // Update y position for next line
      const lineHeight = lineHeights[lineIndex];
      y += lineHeight + lineSpacing;

      return lineLetters;
    });
  };

  circularText = (
    text: string,
    radius = 100,
    fill: "fill" | "kerned" | "words" = "fill",
    offset = 0,
    arc = Math.PI * 2
  ) => {
    const totalAngle = Math.min(Math.max(arc, 0), Math.PI * 2);

    if (fill === "fill") {
      // Evenly distribute characters
      const chars = text.split("");
      const anglePerChar = totalAngle / (chars.length + 1);

      chars.forEach((char, i) => {
        const angle = anglePerChar * i + offset;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        this.context.push();
        this.context.textAlign = "center";
        this.context.translate(x, y);
        this.context.rotate(angle + Math.PI / 2); // Rotate text perpendicular to radius
        this.context.text(char, 0, 0);
        this.context.pop();
      });
    } else if (fill === "kerned") {
      // Space based on character widths
      let currentAngle = offset;
      text.split("").forEach((char) => {
        const charWidth = this.textBounds(char).width;
        currentAngle += (charWidth / radius) * 0.5;
        const angle = currentAngle;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        this.context.push();
        this.context.textAlign = "center";
        this.context.translate(x, y);
        this.context.rotate(angle + Math.PI / 2);
        this.context.text(char, 0, 0);
        this.context.pop();

        currentAngle += (charWidth / radius) * 0.5;
      });
    } else if (fill === "words") {
      // Split into words and calculate total width of each word
      const words = text.split(" ");
      const wordMetrics = words.map((word) => ({
        word,
        width: this.textBounds(word).width,
      }));

      // Calculate angle per space (between words)
      const spaceCount = words.length;
      const totalWordWidth = wordMetrics.reduce((sum, m) => sum + m.width, 0);
      const spaceAngle = (totalAngle - totalWordWidth / radius) / spaceCount;

      let currentAngle = offset;
      wordMetrics.forEach(({ word }, i) => {
        // Render each character in the word with kerning
        word.split("").forEach((char) => {
          const charWidth = this.textBounds(char).width;
          currentAngle += (charWidth / radius) * 0.5;

          const x = Math.cos(currentAngle) * radius;
          const y = Math.sin(currentAngle) * radius;

          this.context.push();
          this.context.textAlign = "center";
          this.context.translate(x, y);
          this.context.rotate(currentAngle + Math.PI / 2);
          this.context.text(char, 0, 0);
          this.context.pop();

          currentAngle += (charWidth / radius) * 0.5;
        });

        // Add space angle after each word (except last)
        if (i < words.length - 1) {
          currentAngle += spaceAngle;
        }
      });
    }
  };

  textBounds = (text: string) => {
    this.context.computeFont();
    const metrics = this.context.measureText(text);
    return {
      x: metrics.actualBoundingBoxLeft * -1,
      y: metrics.actualBoundingBoxAscent * -1,
      width: metrics.width,
      height:
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    };
  };

  log = () => {
    console.log(this.context);
  };
}

export default Text;
