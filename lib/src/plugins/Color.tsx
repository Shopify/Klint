interface KlintColor {
  colors: readonly string[];

  coral: string;
  brown: string;
  mustard: string;
  crimson: string;
  navy: string;
  sky: string;
  olive: string;
  charcoal: string;
  peach: string;
  rose: string;
  plum: string;
  sage: string;
  drab: string;
  taupe: string;
  midnight: string;
  golden: string;
  orange: string;
  slate: string;

  hex(color: string): string;
  rgb(r: number, g: number, b: number): string;
  rgba(r: number, g: number, b: number, alpha: number): string;
  gray(value: number, alpha?: number): string;
  hsl(h: number, s: number, l: number): string;
  hsla(h: number, s: number, l: number, alpha: number): string;
  lch(l: number, c: number, h: number): string;
  lcha(l: number, c: number, h: number, alpha: number): string;
  lab(l: number, a: number, b: number): string;
  laba(l: number, a: number, b: number, alpha: number): string;
  oklch(l: number, c: number, h: number): string;
  oklcha(l: number, c: number, h: number, alpha: number): string;
  oklab(l: number, a: number, b: number): string;
  oklaba(l: number, a: number, b: number, alpha: number): string;
  blendColors(
    colorA: string,
    colorB: string,
    factor: number,
    colorMode?: string
  ): string;
  createPalette(baseColor: string, steps?: number): string[];
  complementary(color: string): string;
  analogous(color: string, angle?: number): [string, string];
  triadic(color: string): [string, string];
  saturate(color: string, amount: number): string;
  lighten(color: string, amount: number): string;
  darken(color: string, amount: number): string;
}

class Color implements KlintColor {
  // context: KlintContexts;

  /**
   * Array of predefined colors in the Klint color palette
   */
  public colors = [
    "#E84D37", // coral
    "#7F4C2F", // brown
    "#EDBC2F", // mustard
    "#BF3034", // crimson
    "#18599D", // navy
    "#45A7C6", // sky
    "#8CB151", // olive
    "#252120", // charcoal
    "#ECA088", // peach
    "#C9B1B8", // rose
    "#8F3064", // plum
    "#7B8870", // sage
    "#C0C180", // drab
    "#4B423D", // taupe
    "#1A2A65", // midnight
    "#EAA550", // golden
    "#F17B04", // orange
    "#404757", // slate
  ] as const;

  // /**
  //  * Creates a new Color instance
  //  * @param ctx - The Klint context
  //  */
  // constructor(ctx: KlintContexts) {
  //   this.context = ctx;
  // }

  get coral() {
    return this.colors[0];
  }
  get brown() {
    return this.colors[1];
  }
  get mustard() {
    return this.colors[2];
  }
  get crimson() {
    return this.colors[3];
  }
  get navy() {
    return this.colors[4];
  }
  get sky() {
    return this.colors[5];
  }
  get olive() {
    return this.colors[6];
  }
  get charcoal() {
    return this.colors[7];
  }
  get peach() {
    return this.colors[8];
  }
  get rose() {
    return this.colors[9];
  }
  get plum() {
    return this.colors[10];
  }
  get sage() {
    return this.colors[11];
  }
  get drab() {
    return this.colors[12];
  }
  get taupe() {
    return this.colors[13];
  }
  get midnight() {
    return this.colors[14];
  }
  get golden() {
    return this.colors[15];
  }
  get orange() {
    return this.colors[16];
  }
  get slate() {
    return this.colors[17];
  }

  /**
   * Ensures a color string has a # prefix
   * @param color - Color string in hex format (with or without #)
   * @returns Hex color string with # prefix
   */
  hex(color: string) {
    return color.startsWith("#") ? color : `#${color}`;
  }

  /**
   * Creates an RGB color string
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns RGB color string
   */
  rgb(r: number, g: number, b: number) {
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  /**
   * Creates an RGBA color string
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns RGBA color string
   */
  rgba(r: number, g: number, b: number, alpha: number) {
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
      b
    )}, ${alpha})`;
  }

  /**
   * Creates a grayscale color
   * @param value - Gray value (0-255)
   * @param alpha - Optional alpha/opacity value (0-1)
   * @returns RGB or RGBA grayscale color string
   */
  gray(value: number, alpha?: number) {
    return alpha !== undefined
      ? `rgba(${Math.round(value)}, ${Math.round(value)}, ${Math.round(
          value
        )}, ${alpha})`
      : `rgb(${Math.round(value)}, ${Math.round(value)}, ${Math.round(value)})`;
  }

  /**
   * Creates an HSL color string
   * @param h - Hue (0-360)
   * @param s - Saturation percentage (0-100)
   * @param l - Lightness percentage (0-100)
   * @returns HSL color string
   */
  hsl(h: number, s: number, l: number) {
    return `hsl(${h % 360}, ${Math.max(0, s)}%, ${Math.max(0, l)}%)`;
  }

  /**
   * Creates an HSLA color string
   * @param h - Hue (0-360)
   * @param s - Saturation percentage (0-100)
   * @param l - Lightness percentage (0-100)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns HSLA color string
   */
  hsla(h: number, s: number, l: number, alpha: number) {
    return `hsla(${h % 360}, ${Math.max(0, s)}%, ${Math.max(0, l)}%, ${alpha})`;
  }

  /**
   * Creates an LCH color string
   * @param l - Lightness percentage (0-100)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @returns LCH color string
   */
  lch(l: number, c: number, h: number) {
    return `lch(${l}% ${c} ${h})`;
  }

  /**
   * Creates an LCH color string with alpha
   * @param l - Lightness percentage (0-100)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns LCH color string with alpha
   */
  lcha(l: number, c: number, h: number, alpha: number) {
    return `lch(${l}% ${c} ${h} / ${alpha})`;
  }

  /**
   * Creates a LAB color string
   * @param l - Lightness percentage (0-100)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @returns LAB color string
   */
  lab(l: number, a: number, b: number) {
    return `lab(${l}% ${a} ${b})`;
  }

  /**
   * Creates a LAB color string with alpha
   * @param l - Lightness percentage (0-100)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns LAB color string with alpha
   */
  laba(l: number, a: number, b: number, alpha: number) {
    return `lab(${l}% ${a} ${b} / ${alpha})`;
  }

  /**
   * Creates an OKLCH color string
   * @param l - Lightness value (0-1)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @returns OKLCH color string
   */
  oklch(l: number, c: number, h: number) {
    return `oklch(${l} ${c} ${h})`;
  }

  /**
   * Creates an OKLCH color string with alpha
   * @param l - Lightness value (0-1)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns OKLCH color string with alpha
   */
  oklcha(l: number, c: number, h: number, alpha: number) {
    return `oklch(${l} ${c} ${h} / ${alpha})`;
  }

  /**
   * Creates an OKLAB color string
   * @param l - Lightness value (0-1)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @returns OKLAB color string
   */
  oklab(l: number, a: number, b: number) {
    return `oklab(${l} ${a} ${b})`;
  }

  /**
   * Creates an OKLAB color string with alpha
   * @param l - Lightness value (0-1)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns OKLAB color string with alpha
   */
  oklaba(l: number, a: number, b: number, alpha: number) {
    return `oklab(${l} ${a} ${b} / ${alpha})`;
  }

  /**
   * Blends two colors using CSS color-mix
   * @param colorA - First color
   * @param colorB - Second color
   * @param factor - Blend factor (0-1) where 0 is colorA and 1 is colorB
   * @param colorMode - Color space to blend in (e.g., "oklch", "hsl")
   * @returns Blended color string
   */
  blendColors(
    colorA: string,
    colorB: string,
    factor: number,
    colorMode = "oklch"
  ): string {
    const t = Math.max(0, Math.min(1, factor)) * 100;
    return `color-mix(in ${colorMode}, ${colorA}, ${colorB} ${t}%)`;
  }

  /**
   * Creates a palette of colors based on a single base color
   * @param baseColor - The base color to create palette from
   * @param steps - Number of steps in each direction (lighter/darker)
   * @returns Array of color strings forming a palette
   */
  createPalette(baseColor: string, steps: number = 9): string[] {
    const palette: string[] = [];
    // Generate lighter shades
    for (let i = 1; i < steps; i++) {
      const factor = i / steps;
      palette.unshift(this.blendColors(baseColor, "#ffffff", factor, "oklch"));
    }
    // Add base color
    palette.push(baseColor);
    // Generate darker shades
    for (let i = 1; i < steps; i++) {
      const factor = i / steps;
      palette.push(this.blendColors(baseColor, "#000000", factor, "oklch"));
    }
    return palette;
  }

  /**
   * Creates a complementary color (opposite on the color wheel)
   * @param color - Base color
   * @returns Complementary color string
   */
  complementary(color: string): string {
    return this.blendColors(color, "hsl(180deg 100% 50%)", 1, "hsl");
  }

  /**
   * Creates analogous colors (adjacent on the color wheel)
   * @param color - Base color
   * @param angle - Angle of separation in degrees
   * @returns Tuple of two analogous color strings
   */
  analogous(color: string, angle: number = 30): [string, string] {
    return [
      this.blendColors(color, `hsl(${-angle}deg 100% 50%)`, 1, "hsl"),
      this.blendColors(color, `hsl(${angle}deg 100% 50%)`, 1, "hsl"),
    ];
  }

  /**
   * Creates a triadic color scheme (three colors evenly spaced on the color wheel)
   * @param color - Base color
   * @returns Tuple of two additional colors to form a triadic scheme
   */
  triadic(color: string): [string, string] {
    return [
      this.blendColors(color, "hsl(120deg 100% 50%)", 1, "hsl"),
      this.blendColors(color, "hsl(240deg 100% 50%)", 1, "hsl"),
    ];
  }

  /**
   * Increases the saturation of a color
   * @param color - Base color
   * @param amount - Amount to saturate (percentage)
   * @returns Saturated color string
   */
  saturate(color: string, amount: number): string {
    return this.blendColors(
      color,
      "hsl(0deg 100% 50% / 0%)",
      amount / 100,
      "hsl"
    );
  }

  /**
   * Lightens a color by mixing with white
   * @param color - Base color
   * @param amount - Amount to lighten (percentage)
   * @returns Lightened color string
   */
  lighten(color: string, amount: number): string {
    return this.blendColors(color, "white", amount / 100, "hsl");
  }

  /**
   * Darkens a color by mixing with black
   * @param color - Base color
   * @param amount - Amount to darken (percentage)
   * @returns Darkened color string
   */
  darken(color: string, amount: number): string {
    return this.blendColors(color, "black", amount / 100, "hsl");
  }
}

// const colors = {
//   coral: "#E84D37",
//   brown: "#7F4C2F",
//   mustard: "#EDBC2F",
//   crimson: "#BF3034",
//   navy: "#18599D",
//   sky: "#45A7C6",
//   olive: "#8CB151",
//   charcoal: "#252120",
//   peach: "#ECA088",
//   rose: "#C9B1B8",
//   plum: "#8F3064",
//   sage: "#7B8870",
//   drab: "#C0C180",
//   taupe: "#4B423D",
//   midnight: "#1A2A65",
//   golden: "#EAA550",
//   orange: "#F17B04",
//   slate: "#404757",
// };

export default Color;
