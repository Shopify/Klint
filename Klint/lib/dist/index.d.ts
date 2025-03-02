import React from 'react';

type KlintCoreFunctionNames = keyof typeof KlintCoreFunctions;
type KlintCoreFunctions = {
    [K in KlintCoreFunctionNames]: ReturnType<(typeof KlintCoreFunctions)[K]>;
};
declare const KlintCoreFunctions: {
    saveCanvas: (ctx: KlintContext) => () => void;
    fullscreen: (ctx: KlintContext) => () => void;
    play: (ctx: KlintContext) => () => void;
    pause: (ctx: KlintContext) => () => void;
    redraw: () => () => void;
    extend: (ctx: KlintContext) => (name: string, data: unknown, enforceReplace?: boolean) => void;
    passImage: () => (element: HTMLImageElement) => HTMLImageElement | null;
    passImages: () => (elements: HTMLImageElement[]) => (HTMLImageElement | null)[];
    saveConfig: (ctx: KlintContexts) => (from?: KlintContexts) => KlintConfig;
    restoreConfig: (ctx: KlintContext) => (config: KlintConfig) => void;
    describe: (ctx: KlintContext) => (description: string) => void;
    createOffscreen: (ctx: KlintContext) => (id: string, width: number, height: number, options?: KlintCanvasOptions, callback?: (ctx: KlintOffscreenContext) => void) => KlintOffscreenContext | HTMLImageElement;
    getOffscreen: (ctx: KlintContext) => (id: string) => KlintOffscreenContext | HTMLImageElement;
};
type KlintFunctionNames = keyof typeof KlintFunctions;
type KlintFunctions = {
    [K in KlintFunctionNames]: ReturnType<(typeof KlintFunctions)[K]>;
};
declare const KlintFunctions: {
    readonly extend: (ctx: KlintContexts) => (name: string, data: unknown, enforceReplace?: boolean) => void;
    readonly background: (ctx: KlintContexts) => (color?: string) => void;
    readonly reset: (ctx: KlintContexts) => () => void;
    readonly clear: (ctx: KlintContexts) => () => void;
    readonly fillColor: (ctx: KlintContexts) => (color: string | CanvasGradient) => void;
    readonly strokeColor: (ctx: KlintContexts) => (color: string | CanvasGradient) => void;
    readonly noFill: (ctx: KlintContexts) => () => void;
    readonly noStroke: (ctx: KlintContexts) => () => void;
    readonly strokeWidth: (ctx: KlintContexts) => (width: number) => void;
    readonly strokeJoin: (ctx: KlintContexts) => (join: CanvasLineJoin) => void;
    readonly strokeCap: (ctx: KlintContexts) => (cap: CanvasLineCap) => void;
    readonly push: (ctx: KlintContexts) => () => void;
    readonly pop: (ctx: KlintContexts) => () => void;
    readonly point: (ctx: KlintContexts) => (x: number, y: number) => void;
    readonly checkTransparency: (ctx: KlintContexts) => (toCheck: string) => boolean;
    readonly drawIfVisible: (ctx: KlintContexts) => () => void;
    readonly line: (ctx: KlintContexts) => (x1: number, y1: number, x2: number, y2: number) => void;
    readonly circle: (ctx: KlintContexts) => (x: number, y: number, radius: number, radius2?: number) => void;
    readonly disk: (ctx: KlintContexts) => (x: number, y: number, radius: number, startAngle?: number, endAngle?: number, closed?: boolean) => void;
    readonly rectangle: (ctx: KlintContexts) => (x: number, y: number, width: number, height?: number) => void;
    readonly roundedRectangle: (ctx: KlintContexts) => (x: number, y: number, width: number, radius: number | number[], height?: number) => void;
    readonly polygon: (ctx: KlintContexts) => (x: number, y: number, radius: number, sides: number, radius2?: number, rotation?: number) => void;
    readonly beginShape: (ctx: KlintContexts) => () => void;
    readonly beginContour: (ctx: KlintContexts) => () => void;
    readonly vertex: (ctx: KlintContexts) => (x: number, y: number) => void;
    readonly endContour: (ctx: KlintContexts) => (forceRevert?: boolean) => void;
    readonly endShape: (ctx: KlintContexts) => (close?: boolean) => void;
    readonly gradient: (ctx: KlintContexts) => (x1?: number, y1?: number, x2?: number, y2?: number) => CanvasGradient;
    readonly radialGradient: (ctx: KlintContexts) => (x1?: number, y1?: number, r1?: number, x2?: number, y2?: number, r2?: number) => CanvasGradient;
    readonly conicGradient: (ctx: KlintContexts) => (angle?: number, x1?: number, y1?: number) => CanvasGradient;
    readonly addColorStop: () => (gradient: CanvasGradient, offset?: number, color?: string) => void;
    readonly constrain: () => (val: number, floor: number, ceil: number) => number;
    readonly lerp: (ctx: KlintContexts) => (A: number, B: number, mix: number, bounded?: boolean) => number;
    readonly fract: () => (n: number, mod: number, mode?: "precise" | "fast" | "faster") => number;
    readonly distance: (ctx: KlintContexts) => (x1: number, y1: number, x2: number, y2: number, mode?: "precise" | "fast" | "faster") => number;
    readonly squareDistance: () => (x1: number, y1: number, x2: number, y2: number) => number;
    readonly dot: () => (x1: number, y1: number, x2: number, y2: number) => number;
    readonly remap: (ctx: KlintContexts) => (n: number, A: number, B: number, C: number, D: number, bounded?: boolean) => number;
    readonly textFont: (ctx: KlintContexts) => (font: string) => void;
    readonly textSize: (ctx: KlintContexts) => (size: number) => void;
    readonly textStyle: (ctx: KlintContexts) => (style: string) => void;
    readonly textWeight: (ctx: KlintContexts) => (weight: string) => void;
    readonly textQuality: (ctx: KlintContexts) => (quality?: "speed" | "auto" | "legibility" | "precision") => void;
    readonly textSpacing: (ctx: KlintContexts) => (kind: "letter" | "word", value: number) => void;
    readonly computeTextStyle: (ctx: KlintContexts) => () => void;
    readonly alignText: (ctx: KlintContexts) => (horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => void;
    readonly textLeading: (ctx: KlintContexts) => (spacing: number) => void;
    readonly computeFont: (ctx: KlintContexts) => () => void;
    readonly textWidth: (ctx: KlintContexts) => (text: string) => number;
    readonly text: (ctx: KlintContexts) => (text: string | number | undefined, x: number, y: number, maxWidth?: number | undefined) => void;
    readonly image: (ctx: KlintContexts) => (image: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | KlintContexts, x: number, y: number, arg3?: number, arg4?: number, arg5?: number, arg6?: number, arg7?: number, arg8?: number) => void;
    readonly loadPixels: (ctx: KlintContexts) => () => ImageData;
    readonly updatePixels: (ctx: KlintContexts) => (pixels: Uint8ClampedArray | number[]) => void;
    readonly readPixels: (ctx: KlintContexts) => (x: number, y: number, w?: number, h?: number) => number[];
    readonly scaleTo: () => (originWidth: number, originHeight: number, destinationWidth: number, destinationHeight: number, cover?: boolean) => number;
    readonly opacity: (ctx: KlintContexts) => (value: number) => void;
    readonly blend: (ctx: KlintContexts) => (blend: GlobalCompositeOperation) => void;
    readonly setCanvasOrigin: (ctx: KlintContexts) => (type: "center" | "corner") => void;
    readonly setImageOrigin: (ctx: KlintContexts) => (type: "center" | "corner") => void;
    readonly setRectOrigin: (ctx: KlintContexts) => (type: "center" | "corner") => void;
    readonly withConfig: (ctx: KlintContexts) => (config: KlintConfig) => void;
    readonly toBase64: (ctx: KlintContexts) => (type?: string, quality?: number) => string;
    readonly saveConfig: (ctx: KlintContexts) => (from?: KlintContexts) => KlintConfig;
    readonly restoreConfig: (ctx: KlintContexts) => (config: KlintConfig) => void;
    readonly resizeCanvas: (ctx: KlintContexts) => (width: number, height: number) => void;
};

declare const EPSILON = 0.0001;
interface KlintPlugins {
}
type KlintContexts = KlintContext | KlintOffscreenContext;
interface KlintOffscreenContext extends CanvasRenderingContext2D, KlintFunctions, KlintPlugins {
    width: number;
    height: number;
    __dpr: number;
    __startedShape: boolean;
    __currentShape: number[][] | null;
    __startedContour: boolean;
    __currentContours: number[][][] | null;
    __currentContour: number[][] | null;
    __isReadyToDraw: boolean;
    __isMainContext: boolean;
    __imageOrigin: "corner" | "center";
    __rectangleOrigin: "corner" | "center";
    __canvasOrigin: "corner" | "center";
    __computedTextFont: string;
    __textFont: string;
    __textSize: number;
    __textStyle: string;
    __textWeight: string;
    __textAlignment: {
        horizontal: CanvasTextAlign;
        vertical: CanvasTextBaseline;
    };
    [key: string]: any;
}
interface KlintContext extends KlintOffscreenContext, KlintCoreFunctions {
    frame: number;
    time: number;
    deltaTime: number;
    fps: number;
    __lastTargetTime: number;
    __lastRealTime: number;
    __isPlaying: boolean;
    __offscreens: Map<string, KlintOffscreenContext | HTMLImageElement>;
}
interface KlintCanvasOptions {
    alpha?: string;
    willreadfrequently?: string;
    autoplay?: string;
    ignoreResize?: string;
    noloop?: string;
    ignoreFunctions?: string;
    static?: string;
    nocanvas?: string;
    fps?: number;
    unsafemode?: string;
    origin?: "corner" | "center";
}
type KlintConfig = Partial<Pick<KlintContext, (typeof CONFIG_PROPS)[number]>>;
interface KlintContextWrapper {
    context: KlintContext | null;
    initCoreContext: (canvas: HTMLCanvasElement, options: KlintCanvasOptions) => KlintContext;
}
declare const CONFIG_PROPS: readonly ["lineWidth", "strokeStyle", "lineJoin", "lineCap", "fillStyle", "font", "textAlign", "textBaseline", "textRendering", "wordSpacing", "letterSpacing", "globalAlpha", "globalCompositeOperation", "origin", "transform", "__imageOrigin", "__rectangleOrigin", "__textFont", "__textWeight", "__textStyle", "__textSize", "__textAlignment", "__isPlaying"];
interface KlintProps {
    context: KlintContextWrapper;
    draw: (ctx: KlintContext) => void;
    setup?: (ctx: KlintContext) => void;
    preload?: (ctx: KlintContext) => Promise<void>;
    options?: KlintCanvasOptions;
    onResize?: (ctx: KlintContext) => void;
    onVisible?: (ctx: KlintContext) => void;
}
declare function Klint({ context, setup, draw, options, preload, onVisible, }: KlintProps): React.JSX.Element;

interface KlintMouse {
    x: number;
    y: number;
    px: number;
    py: number;
    vx: number;
    vy: number;
    angle: number;
    isPressed: boolean;
    isHover: boolean;
}
interface KlintScroll {
    distance: number;
    velocity: number;
    lastTime: number;
}
declare function useKlint(): {
    context: {
        context: KlintContext | null;
        initCoreContext: (canvas: HTMLCanvasElement, options: KlintCanvasOptions) => KlintContext;
    };
    useMouse: () => {
        mouse: KlintMouse;
        onClick: (callback: (ctx: KlintContext, e: MouseEvent) => void) => (ctx: KlintContext, e: MouseEvent) => void;
        onMouseIn: (callback: (ctx: KlintContext, e: MouseEvent) => void) => (ctx: KlintContext, e: MouseEvent) => void;
        onMouseOut: (callback: (ctx: KlintContext, e: MouseEvent) => void) => (ctx: KlintContext, e: MouseEvent) => void;
        onMouseDown: (callback: (ctx: KlintContext, e: MouseEvent) => void) => (ctx: KlintContext, e: MouseEvent) => void;
        onMouseUp: (callback: (ctx: KlintContext, e: MouseEvent) => void) => (ctx: KlintContext, e: MouseEvent) => void;
    };
    useScroll: () => {
        scroll: KlintScroll;
        onScroll: (callback: (ctx: KlintContext, scroll: KlintScroll, e: WheelEvent) => void) => (ctx: KlintContext, scroll: KlintScroll, e: WheelEvent) => void;
    };
    useWindow: () => {
        onResize: (callback: (ctx: KlintContext) => void) => (ctx: KlintContext) => void;
        onBlur: (callback: (ctx: KlintContext) => void) => (ctx: KlintContext) => void;
        onFocus: (callback: (ctx: KlintContext) => void) => (ctx: KlintContext) => void;
        onVisibilityChange: (callback: (ctx: KlintContext, isVisible: boolean) => void) => (ctx: KlintContext, isVisible: boolean) => void;
    };
    useImage: () => {
        images: Record<string, HTMLImageElement>;
        loadImage: (key: string, url: string) => Promise<HTMLImageElement>;
        loadImages: (imageMap: Record<string, string>) => Promise<Map<string, HTMLImageElement>>;
        getImage: (key: string) => HTMLImageElement | undefined;
        hasImage: (key: string) => boolean;
        clearImages: () => void;
    };
    togglePlay: (playing?: boolean) => void;
};
declare const useProps: <T extends object = Record<string, unknown>>(props: T) => {
    get: <K extends keyof T>(key: K) => T[K];
    has: <K extends keyof T>(key: K) => boolean;
    props: T;
};
declare const useStorage: <T extends object = Record<string, unknown>>(initialProps?: T) => {
    get: <K extends keyof T>(key: K) => T[K];
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    has: <K extends keyof T>(key: K) => boolean;
    remove: <K extends keyof T>(key: K) => void;
    store: T;
};

declare module "../Klint" {
    interface KlintPlugins {
        BitmapText: BitmapText;
    }
}
interface KlintBitmapText {
    context: KlintContext;
    chars: Map<string, {
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
    texture: HTMLImageElement;
    currentSize: "small" | "medium" | "large";
    spaceWidth: number;
}
declare class BitmapText implements KlintBitmapText {
    context: KlintContext;
    chars: Map<any, any>;
    texture: HTMLImageElement;
    currentSize: "small" | "medium" | "large";
    spaceWidth: number;
    private readonly sizes;
    private __currentFont;
    private __currentFill;
    private __currentStroke;
    constructor(ctx: KlintContext);
    private initialize;
    private createFontTexture;
    textBounds: (text: string) => {
        x: number;
        y: number;
        width: number;
        height: number;
        offset: number;
        baseline: number;
    };
    text: (text: string, x: number, y: number) => void;
}

declare module "../Klint" {
    interface KlintPlugins {
        Color: Color;
    }
}
interface KlintColor {
    context: KlintContexts;
}
declare class Color implements KlintColor {
    context: KlintContexts;
    /**
     * Array of predefined colors in the Klint color palette
     */
    colors: readonly ["#E84D37", "#7F4C2F", "#EDBC2F", "#BF3034", "#18599D", "#45A7C6", "#8CB151", "#252120", "#ECA088", "#C9B1B8", "#8F3064", "#7B8870", "#C0C180", "#4B423D", "#1A2A65", "#EAA550", "#F17B04", "#404757"];
    /**
     * Creates a new Color instance
     * @param ctx - The Klint context
     */
    constructor(ctx: KlintContexts);
    get coral(): "#E84D37";
    get brown(): "#7F4C2F";
    get mustard(): "#EDBC2F";
    get crimson(): "#BF3034";
    get navy(): "#18599D";
    get sky(): "#45A7C6";
    get olive(): "#8CB151";
    get charcoal(): "#252120";
    get peach(): "#ECA088";
    get rose(): "#C9B1B8";
    get plum(): "#8F3064";
    get sage(): "#7B8870";
    get drab(): "#C0C180";
    get taupe(): "#4B423D";
    get midnight(): "#1A2A65";
    get golden(): "#EAA550";
    get orange(): "#F17B04";
    get slate(): "#404757";
    /**
     * Ensures a color string has a # prefix
     * @param color - Color string in hex format (with or without #)
     * @returns Hex color string with # prefix
     */
    hex(color: string): string;
    /**
     * Creates an RGB color string
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @returns RGB color string
     */
    rgb(r: number, g: number, b: number): string;
    /**
     * Creates an RGBA color string
     * @param r - Red component (0-255)
     * @param g - Green component (0-255)
     * @param b - Blue component (0-255)
     * @param alpha - Alpha/opacity value (0-1)
     * @returns RGBA color string
     */
    rgba(r: number, g: number, b: number, alpha: number): string;
    /**
     * Creates a grayscale color
     * @param value - Gray value (0-255)
     * @param alpha - Optional alpha/opacity value (0-1)
     * @returns RGB or RGBA grayscale color string
     */
    gray(value: number, alpha?: number): string;
    /**
     * Creates an HSL color string
     * @param h - Hue (0-360)
     * @param s - Saturation percentage (0-100)
     * @param l - Lightness percentage (0-100)
     * @returns HSL color string
     */
    hsl(h: number, s: number, l: number): string;
    /**
     * Creates an HSLA color string
     * @param h - Hue (0-360)
     * @param s - Saturation percentage (0-100)
     * @param l - Lightness percentage (0-100)
     * @param alpha - Alpha/opacity value (0-1)
     * @returns HSLA color string
     */
    hsla(h: number, s: number, l: number, alpha: number): string;
    /**
     * Creates an LCH color string
     * @param l - Lightness percentage (0-100)
     * @param c - Chroma value
     * @param h - Hue (0-360)
     * @returns LCH color string
     */
    lch(l: number, c: number, h: number): string;
    /**
     * Creates an LCH color string with alpha
     * @param l - Lightness percentage (0-100)
     * @param c - Chroma value
     * @param h - Hue (0-360)
     * @param alpha - Alpha/opacity value (0-1)
     * @returns LCH color string with alpha
     */
    lcha(l: number, c: number, h: number, alpha: number): string;
    /**
     * Creates a LAB color string
     * @param l - Lightness percentage (0-100)
     * @param a - A-axis value (green to red)
     * @param b - B-axis value (blue to yellow)
     * @returns LAB color string
     */
    lab(l: number, a: number, b: number): string;
    /**
     * Creates a LAB color string with alpha
     * @param l - Lightness percentage (0-100)
     * @param a - A-axis value (green to red)
     * @param b - B-axis value (blue to yellow)
     * @param alpha - Alpha/opacity value (0-1)
     * @returns LAB color string with alpha
     */
    laba(l: number, a: number, b: number, alpha: number): string;
    /**
     * Creates an OKLCH color string
     * @param l - Lightness value (0-1)
     * @param c - Chroma value
     * @param h - Hue (0-360)
     * @returns OKLCH color string
     */
    oklch(l: number, c: number, h: number): string;
    /**
     * Creates an OKLCH color string with alpha
     * @param l - Lightness value (0-1)
     * @param c - Chroma value
     * @param h - Hue (0-360)
     * @param alpha - Alpha/opacity value (0-1)
     * @returns OKLCH color string with alpha
     */
    oklcha(l: number, c: number, h: number, alpha: number): string;
    /**
     * Creates an OKLAB color string
     * @param l - Lightness value (0-1)
     * @param a - A-axis value (green to red)
     * @param b - B-axis value (blue to yellow)
     * @returns OKLAB color string
     */
    oklab(l: number, a: number, b: number): string;
    /**
     * Creates an OKLAB color string with alpha
     * @param l - Lightness value (0-1)
     * @param a - A-axis value (green to red)
     * @param b - B-axis value (blue to yellow)
     * @param alpha - Alpha/opacity value (0-1)
     * @returns OKLAB color string with alpha
     */
    oklaba(l: number, a: number, b: number, alpha: number): string;
    /**
     * Blends two colors using CSS color-mix
     * @param colorA - First color
     * @param colorB - Second color
     * @param factor - Blend factor (0-1) where 0 is colorA and 1 is colorB
     * @param colorMode - Color space to blend in (e.g., "oklch", "hsl")
     * @returns Blended color string
     */
    blendColors(colorA: string, colorB: string, factor: number, colorMode?: string): string;
    /**
     * Creates a palette of colors based on a single base color
     * @param baseColor - The base color to create palette from
     * @param steps - Number of steps in each direction (lighter/darker)
     * @returns Array of color strings forming a palette
     */
    createPalette(baseColor: string, steps?: number): string[];
    /**
     * Creates a complementary color (opposite on the color wheel)
     * @param color - Base color
     * @returns Complementary color string
     */
    complementary(color: string): string;
    /**
     * Creates analogous colors (adjacent on the color wheel)
     * @param color - Base color
     * @param angle - Angle of separation in degrees
     * @returns Tuple of two analogous color strings
     */
    analogous(color: string, angle?: number): [string, string];
    /**
     * Creates a triadic color scheme (three colors evenly spaced on the color wheel)
     * @param color - Base color
     * @returns Tuple of two additional colors to form a triadic scheme
     */
    triadic(color: string): [string, string];
    /**
     * Increases the saturation of a color
     * @param color - Base color
     * @param amount - Amount to saturate (percentage)
     * @returns Saturated color string
     */
    saturate(color: string, amount: number): string;
    /**
     * Lightens a color by mixing with white
     * @param color - Base color
     * @param amount - Amount to lighten (percentage)
     * @returns Lightened color string
     */
    lighten(color: string, amount: number): string;
    /**
     * Darkens a color by mixing with black
     * @param color - Base color
     * @param amount - Amount to darken (percentage)
     * @returns Darkened color string
     */
    darken(color: string, amount: number): string;
}

declare module "../Klint" {
    interface KlintPlugins {
        Easing: Easing;
    }
}
interface KlintEasing {
    context: KlintContexts;
    normalize: (val: number) => number;
    expand: (val: number) => number;
    inout: (val: number, power?: number) => number;
    in: (val: number, power?: number) => number;
    out: (val: number, power?: number) => number;
    overshootIn: (val: number) => number;
    overshootOut: (val: number) => number;
    overshootInOut: (val: number) => number;
}
declare class Easing implements KlintEasing {
    context: KlintContexts;
    constructor(ctx: KlintContexts);
    normalize: (val: number) => number;
    expand: (val: number) => number;
    inout: (val: number, power?: number) => number;
    in: (val: number, power?: number) => number;
    out: (val: number, power?: number) => number;
    overshootIn: (val: number) => number;
    overshootOut: (val: number) => number;
    overshootInOut: (val: number) => number;
    bounceOut: (val: number) => number;
    bounceIn: (val: number) => number;
    bounceInOut: (val: number) => number;
    elasticIn: (val: number) => number;
    elasticOut: (val: number) => number;
    elasticInOut: (val: number) => number;
    smoothstep: (val: number, x0?: number, x1?: number) => number;
    log: () => void;
}

declare module "../Klint" {
    interface KlintPlugins {
        SVGfont: SVGfont;
    }
}
type SVGFontPaths = Array<Array<Array<{
    x: number;
    y: number;
}>>>;
interface FontMetrics {
    fontFamily: string;
    fontWeight: string;
    unitsPerEm: number;
    ascent: number;
    descent: number;
    xHeight: number;
    capHeight: number;
}
interface GlyphMetrics {
    name: string;
    unicode: string;
    horizAdvX: number;
    d?: string;
}
interface KlintSVGfont {
    context: KlintContexts;
    metrics: FontMetrics;
    glyphs: Map<string, GlyphMetrics>;
    parse(font: string): void;
}
interface PointOptions {
    factor: number;
    align?: "center" | "left" | "right";
    center?: "alphabetic" | "middle" | "top";
    letterSpacing?: number;
    treshold?: number;
}
interface DisplacementParams {
    point: {
        x: number;
        y: number;
    };
    position: {
        x: number;
        y: number;
    };
    groupIndex: number;
    letterSpacing: number;
}
interface DisplacementCallback {
    (params: DisplacementParams): {
        x: number;
        y: number;
    };
}
declare class SVGfont implements KlintSVGfont {
    readonly context: KlintContexts;
    readonly metrics: FontMetrics;
    readonly glyphs: Map<string, GlyphMetrics>;
    private font;
    private SCALE;
    private targetXHeight;
    constructor(context: KlintContexts);
    parse(font: string, desiredXHeight?: number): void;
    toJSON(): {
        metrics: FontMetrics;
        glyphs: Record<string, GlyphMetrics>;
    };
    getPoints(text: string, options: PointOptions): Array<Array<Array<{
        x: number;
        y: number;
    }>>>;
    flatten(points: SVGFontPaths, displacement?: DisplacementCallback): Array<{
        x: number;
        y: number;
    }>;
    draw(points: SVGFontPaths, displacement?: DisplacementCallback): void;
}

declare module "../Klint" {
    interface KlintPlugins {
        State: State;
    }
}
type KlintStateValue = unknown;
type KlintStateCallback = (key: string, value: KlintStateValue) => void;
interface KlintState {
    set(key: string, value: KlintStateValue, callback?: KlintStateCallback): void;
    get(key: string, callback?: KlintStateCallback): KlintStateValue;
    has(key: string): boolean;
    delete(key: string, callback?: (key: string) => void): void;
    log(): Map<string, KlintStateValue>;
}
declare class State implements KlintState {
    private store;
    set(key: string, value: KlintStateValue, callback?: KlintStateCallback): void;
    get(key: string, callback?: KlintStateCallback): unknown;
    has(key: string): boolean;
    delete(key: string, callback?: (key: string) => void): void;
    log(): Map<string, unknown>;
}

declare module "../Klint" {
    interface KlintPlugins {
        Text: Text;
    }
}
type TextMetrics = {
    width: number;
    height: number;
    baseline: number;
};
interface KlintText {
    context: KlintContexts;
    findTextSize: (text: string, dist: number, estimate?: number, direction?: "x" | "y") => number;
    getTextMetrics: (text: string) => TextMetrics;
    splitTo: (text: string, kind: "letters" | "words" | "lines" | "all", options?: {
        maxWidth?: number;
        lineSpacing?: number;
        letterSpacing?: number;
        wordSpacing?: number;
    }) => Array<{
        char: string;
        x: number;
        y: number;
        metrics: TextMetrics;
        letterIndex?: number;
        wordIndex?: number;
        lineIndex?: number;
    }>;
    circularText: (text: string, radius?: number, fill?: "fill" | "kerned" | "words", offset?: number, arc?: number) => void;
    textBounds: (text: string) => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    log: () => void;
}
declare class Text implements KlintText {
    context: KlintContexts;
    constructor(ctx: KlintContexts);
    findTextSize: (text: string, dist: number, estimate?: number, direction?: "x" | "y") => number;
    getTextMetrics: (text: string) => TextMetrics;
    splitTo: (text: string, kind: "letters" | "words" | "lines" | "all", options?: {
        maxWidth?: number;
        lineSpacing?: number;
        letterSpacing?: number;
        wordSpacing?: number;
    }) => {
        letterIndex?: number | undefined;
        wordIndex?: number | undefined;
        lineIndex?: number | undefined;
        char: string;
        x: number;
        y: number;
        metrics: TextMetrics;
    }[];
    circularText: (text: string, radius?: number, fill?: "fill" | "kerned" | "words", offset?: number, arc?: number) => void;
    textBounds: (text: string) => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    log: () => void;
}

declare module "../Klint" {
    interface KlintPlugins {
        Thing: Thing;
    }
}
interface KlintThing {
    context: KlintContexts;
    log(): void;
}
declare class Thing implements KlintThing {
    readonly context: KlintContexts;
    constructor(context: KlintContexts);
    log(): void;
}

declare module "../Klint" {
    interface KlintPlugins {
        Time: Time;
    }
}
interface KlintTime {
    context: KlintContexts;
    timeline(key: string): KlintTime;
    use(progress: number): KlintTime;
    for(duration: number): KlintTime;
}
declare class Time implements KlintTime {
    context: KlintContexts;
    private timelines;
    private currentTimeline;
    private readonly DEFAULT_DURATION;
    private staggers;
    constructor(ctx: KlintContexts);
    timeline(key: string): this;
    use(progress: number): this;
    for(duration: number): this;
    stagger(num: number, offset?: number, callback?: (progress: number, id: number, num: number) => void): this | {
        id: number;
        progress: number;
    }[];
    between(from: number | undefined, to: number | undefined, callback: (progress: number) => void): this;
    progress(): number;
}

declare module "../Klint" {
    interface KlintPlugins {
        Vector: Vector;
    }
}
interface KlintVector {
    x: number;
    y: number;
    add: (v: KlintVector) => KlintVector;
    sub: (v: KlintVector) => KlintVector;
    mult: (n: number) => KlintVector;
    div: (n: number) => KlintVector;
    rotate: (angle: number) => KlintVector;
    mag: () => number;
    length: () => number;
    dot: (v: KlintVector) => number;
    dist: (v: KlintVector) => number;
    angle: () => number;
    copy: () => KlintVector;
    normalize: () => KlintVector;
    set: (x: number, y: number, z?: number, w?: number) => KlintVector;
}
declare class Vector implements KlintVector {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    add(v: KlintVector): Vector;
    sub(v: KlintVector): Vector;
    mult(n: number): Vector;
    div(n: number): Vector;
    rotate(angle: number): Vector;
    mag(): number;
    length(): number;
    dot(v: KlintVector): number;
    dist(v: KlintVector): number;
    angle(): number;
    copy(): Vector;
    normalize(): Vector;
    set(x: number, y: number): Vector;
    static fromAngle(center: Vector, a: number, r: number): Vector;
}

export { BitmapText, CONFIG_PROPS, Color, EPSILON, Easing, Klint, KlintCanvasOptions, KlintConfig, KlintContext, KlintContextWrapper, KlintContexts, KlintCoreFunctions, KlintFunctions, KlintMouse, KlintOffscreenContext, KlintPlugins, KlintProps, KlintScroll, SVGfont, State, Text, Thing, Time, Vector, useKlint, useProps, useStorage };
