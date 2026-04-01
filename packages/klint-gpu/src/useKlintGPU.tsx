/**
 * useKlintGPU — full parity with useKlint (Canvas2D) for WebGPU.
 * Provides the same hook API: KlintMouse, KlintScroll, KlintGesture,
 * KlintKeyboard, KlintWindow, KlintImage, useDev, togglePlay.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { WebGPURenderer } from './renderer/WebGPURenderer';
import {
  KlintGPUContext,
  KlintGPUOptions,
  DEFAULT_GPU_OPTIONS,
  buildKlintGPUContext,
} from './context/KlintGPUContext';

export interface KlintGPUContextWrapper {
  context: KlintGPUContext | null;
  initGPUContext: (
    canvas: HTMLCanvasElement,
    options: KlintGPUOptions,
  ) => Promise<KlintGPUContext>;
}

export interface KlintGPUMouse {
  x: number; y: number;
  px: number; py: number;
  vx: number; vy: number;
  angle: number;
  isPressed: boolean;
  isHover: boolean;
}

export interface KlintGPUScroll {
  distance: number;
  velocity: number;
  lastTime: number;
}

export interface KlintGPUGesture {
  active: boolean; touches: TouchList | null;
  startDistance: number; currentDistance: number;
  scale: number; rotation: number;
  startTime: number; lastTime: number;
  deltaX: number; deltaY: number;
  velocityX: number; velocityY: number;
  lastX: number; lastY: number;
}

export interface KlintGPUKeyboard {
  pressedKeys: Set<string>;
  modifiers: { alt: boolean; shift: boolean; ctrl: boolean; meta: boolean };
  lastKey: string | null;
  lastKeyTime: number;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function useKlintGPU() {
  const contextRef = useRef<KlintGPUContext | null>(null);
  const rendererRef = useRef<WebGPURenderer | null>(null);
  const mouseRef    = useRef<KlintGPUMouse>({ x:0,y:0,px:0,py:0,vx:0,vy:0,angle:0,isPressed:false,isHover:false });
  const scrollRef   = useRef<KlintGPUScroll>({ distance:0,velocity:0,lastTime:0 });
  const gestureRef  = useRef<KlintGPUGesture>({ active:false,touches:null,startDistance:0,currentDistance:0,scale:1,rotation:0,startTime:0,lastTime:0,deltaX:0,deltaY:0,velocityX:0,velocityY:0,lastX:0,lastY:0 });
  const keyboardRef = useRef<KlintGPUKeyboard>({ pressedKeys:new Set(),modifiers:{alt:false,shift:false,ctrl:false,meta:false},lastKey:null,lastKeyTime:0 });

  useEffect(() => { return () => { rendererRef.current?.destroy(); }; }, []);

  // ── Core init ─────────────────────────────────────────────────────────────

  const initGPUContext = useCallback(
    async (canvas: HTMLCanvasElement, options: KlintGPUOptions): Promise<KlintGPUContext> => {
      if (contextRef.current) return contextRef.current;
      const opts = { ...DEFAULT_GPU_OPTIONS, ...options };
      const dpr = opts.dpr === 'default' ? (window.devicePixelRatio || 1) : opts.dpr;
      if (!rendererRef.current) {
        rendererRef.current = await WebGPURenderer.init({ aaMethod: opts.aaMethod, alphaMode: opts.alphaMode });
      }
      const renderer = rendererRef.current;
      const container = canvas.parentElement;
      const { width, height } = container ? container.getBoundingClientRect() : { width: canvas.offsetWidth || 300, height: canvas.offsetHeight || 300 };
      canvas.width  = Math.floor(width * dpr);  canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;         canvas.style.height = `${height}px`;
      const surface = renderer.addCanvas(canvas, dpr);
      contextRef.current = buildKlintGPUContext(canvas, renderer, surface, opts);
      return contextRef.current;
    }, [],
  );

  const togglePlay = useCallback((playing?: boolean) => {
    if (!contextRef.current) return;
    contextRef.current.__isPlaying = playing !== undefined ? playing : !contextRef.current.__isPlaying;
  }, []);

  // ── useDev — HMR helper ──────────────────────────────────────────────────
  const useDev = () => {
    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((typeof (globalThis as any).process !== 'undefined' ? (globalThis as any).process.env?.NODE_ENV : 'production') === 'development' && contextRef.current) {
        contextRef.current.__isReadyToDraw = true;
      }
    });
  };

  // ── KlintMouse ────────────────────────────────────────────────────────────
  const KlintMouse = () => {
    const clickCb    = useRef<((ctx: KlintGPUContext, e: MouseEvent) => void) | null>(null);
    const mouseInCb  = useRef<((ctx: KlintGPUContext, e: MouseEvent) => void) | null>(null);
    const mouseOutCb = useRef<((ctx: KlintGPUContext, e: MouseEvent) => void) | null>(null);
    const mouseDownCb= useRef<((ctx: KlintGPUContext, e: MouseEvent) => void) | null>(null);
    const mouseUpCb  = useRef<((ctx: KlintGPUContext, e: MouseEvent) => void) | null>(null);

    useEffect(() => {
      const ctx = contextRef.current;
      if (!ctx?.canvas) return;
      const canvas = ctx.canvas;
      const controller = new AbortController();
      const { signal } = controller;
      const origin = ctx.__canvasOrigin;

      const updatePos = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        // CSS pixel coordinates (matching Klint Canvas2D API — no dpr multiplication)
        const cssX = e.clientX - rect.left;
        const cssY = e.clientY - rect.top;
        const x = origin === 'center' ? cssX - rect.width  / 2 : cssX;
        const y = origin === 'center' ? cssY - rect.height / 2 : cssY;
        const m = mouseRef.current;
        m.px = m.x; m.py = m.y; m.x = x; m.y = y;
        m.vx = x - m.px; m.vy = y - m.py;
        m.angle = Math.atan2(m.vy, m.vx);
      };

      canvas.addEventListener('mousemove',  (e) => { updatePos(e); }, { signal });
      canvas.addEventListener('mousedown',  (e) => { mouseRef.current.isPressed = true;  mouseDownCb.current?.(ctx, e); }, { signal });
      canvas.addEventListener('mouseup',    (e) => { mouseRef.current.isPressed = false; mouseUpCb.current?.(ctx, e);   }, { signal });
      canvas.addEventListener('mouseenter', (e) => { mouseRef.current.isHover = true;    mouseInCb.current?.(ctx, e);   }, { signal });
      canvas.addEventListener('mouseleave', (e) => { mouseRef.current.isHover = false; mouseRef.current.isPressed = false; mouseOutCb.current?.(ctx, e); }, { signal });
      canvas.addEventListener('click',      (e) => { clickCb.current?.(ctx, e); }, { signal });

      return () => controller.abort();
    }, []);

    return {
      mouse:       mouseRef.current,
      onClick:     (cb: (ctx: KlintGPUContext, e: MouseEvent) => void) => { clickCb.current = cb; },
      onMouseIn:   (cb: (ctx: KlintGPUContext, e: MouseEvent) => void) => { mouseInCb.current = cb; },
      onMouseOut:  (cb: (ctx: KlintGPUContext, e: MouseEvent) => void) => { mouseOutCb.current = cb; },
      onMouseDown: (cb: (ctx: KlintGPUContext, e: MouseEvent) => void) => { mouseDownCb.current = cb; },
      onMouseUp:   (cb: (ctx: KlintGPUContext, e: MouseEvent) => void) => { mouseUpCb.current = cb; },
    };
  };

  // ── KlintScroll ───────────────────────────────────────────────────────────
  const KlintScroll = () => {
    const scrollCb = useRef<((ctx: KlintGPUContext, scroll: KlintGPUScroll, e: WheelEvent) => void) | null>(null);

    useEffect(() => {
      const ctx = contextRef.current;
      if (!ctx?.canvas) return;
      const controller = new AbortController();
      const { signal } = controller;

      ctx.canvas.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
        const now = performance.now();
        const dt  = now - scrollRef.current.lastTime;
        scrollRef.current.distance += e.deltaY;
        scrollRef.current.velocity  = dt > 0 ? e.deltaY / dt : 0;
        scrollRef.current.lastTime  = now;
        scrollCb.current?.(ctx, scrollRef.current, e);
      }, { passive: false, signal });

      return () => controller.abort();
    }, []);

    return {
      scroll:   scrollRef.current,
      onScroll: (cb: (ctx: KlintGPUContext, scroll: KlintGPUScroll, e: WheelEvent) => void) => { scrollCb.current = cb; },
    };
  };

  // ── KlintGesture ──────────────────────────────────────────────────────────
  const KlintGesture = () => {
    const tapCb    = useRef<((ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) | null>(null);
    const swipeCb  = useRef<((ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture, dir: 'left'|'right'|'up'|'down') => void) | null>(null);
    const pinchCb  = useRef<((ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) | null>(null);
    const rotateCb = useRef<((ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) | null>(null);
    const tStartCb = useRef<((ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) | null>(null);
    const tMoveCb  = useRef<((ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) | null>(null);
    const tEndCb   = useRef<((ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) | null>(null);

    useEffect(() => {
      const ctx = contextRef.current;
      if (!ctx?.canvas) return;
      const canvas = ctx.canvas;
      const controller = new AbortController();
      const { signal } = controller;
      const g = gestureRef.current;

      const dist = (t1: Touch, t2: Touch) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const angle= (t1: Touch, t2: Touch) => Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
      const center = (ts: TouchList) => {
        let sx = 0, sy = 0;
        for (let i = 0; i < ts.length; i++) { sx += ts[i].clientX; sy += ts[i].clientY; }
        return { x: sx / ts.length, y: sy / ts.length };
      };

      canvas.addEventListener('touchstart', (e: TouchEvent) => {
        const c = center(e.touches);
        Object.assign(g, { active:true, touches:e.touches, startTime:performance.now(), lastTime:performance.now(), lastX:c.x, lastY:c.y, deltaX:0, deltaY:0, velocityX:0, velocityY:0 });
        if (e.touches.length >= 2) { g.startDistance = dist(e.touches[0], e.touches[1]); g.scale = 1; g.rotation = angle(e.touches[0], e.touches[1]); }
        tStartCb.current?.(ctx, e, g);
      }, { passive: false, signal });

      canvas.addEventListener('touchmove', (e: TouchEvent) => {
        if (!g.active) return;
        const now = performance.now();
        const c = center(e.touches);
        const dt = now - g.lastTime;
        g.touches = e.touches;
        g.deltaX  = c.x - g.lastX; g.deltaY = c.y - g.lastY;
        if (dt > 0) { g.velocityX = g.deltaX / dt; g.velocityY = g.deltaY / dt; }
        g.lastTime = now; g.lastX = c.x; g.lastY = c.y;
        if (e.touches.length >= 2) {
          const d = dist(e.touches[0], e.touches[1]);
          g.currentDistance = d;
          if (g.startDistance > 0) g.scale = d / g.startDistance;
          g.rotation = angle(e.touches[0], e.touches[1]);
          pinchCb.current?.(ctx, e, g);
          if (rotateCb.current && Math.abs(g.rotation) > 5) rotateCb.current(ctx, e, g);
        }
        tMoveCb.current?.(ctx, e, g);
      }, { passive: false, signal });

      canvas.addEventListener('touchend', (e: TouchEvent) => {
        const duration = performance.now() - g.startTime;
        if (duration < 300 && Math.abs(g.deltaX) < 10 && Math.abs(g.deltaY) < 10) tapCb.current?.(ctx, e, g);
        if (swipeCb.current && duration < 300) {
          const horizontal = Math.abs(g.deltaX) > Math.abs(g.deltaY);
          if (horizontal && Math.abs(g.deltaX) > 50) swipeCb.current(ctx, e, g, g.deltaX > 0 ? 'right' : 'left');
          else if (!horizontal && Math.abs(g.deltaY) > 50) swipeCb.current(ctx, e, g, g.deltaY > 0 ? 'down' : 'up');
        }
        tEndCb.current?.(ctx, e, g);
        if (e.touches.length === 0) g.active = false;
      }, { signal });

      canvas.addEventListener('touchcancel', (e: TouchEvent) => { g.active = false; tEndCb.current?.(ctx, e, g); }, { signal });

      return () => controller.abort();
    }, []);

    return {
      gesture: gestureRef.current,
      onTap:        (cb: (ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) => { tapCb.current = cb; },
      onSwipe:      (cb: (ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture, dir: 'left'|'right'|'up'|'down') => void) => { swipeCb.current = cb; },
      onPinch:      (cb: (ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) => { pinchCb.current = cb; },
      onRotate:     (cb: (ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) => { rotateCb.current = cb; },
      onTouchStart: (cb: (ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) => { tStartCb.current = cb; },
      onTouchMove:  (cb: (ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) => { tMoveCb.current = cb; },
      onTouchEnd:   (cb: (ctx: KlintGPUContext, e: TouchEvent, g: KlintGPUGesture) => void) => { tEndCb.current = cb; },
    };
  };

  // ── KlintKeyboard ─────────────────────────────────────────────────────────
  const KlintKeyboard = () => {
    const keyPressedCb  = useRef<Map<string,(ctx:KlintGPUContext,e:KeyboardEvent)=>void>>(new Map());
    const keyReleasedCb = useRef<Map<string,(ctx:KlintGPUContext,e:KeyboardEvent)=>void>>(new Map());
    const keyComboCb    = useRef<Map<string,(ctx:KlintGPUContext,e:KeyboardEvent)=>void>>(new Map());
    const kb = keyboardRef.current;

    const normKey = (k: string) => ({ ' ': 'Space', Control: 'Ctrl', Escape: 'Esc' }[k] || k);
    const comboKey = (keys: string[]) => keys.map(normKey).sort().join('+');

    useEffect(() => {
      if (!contextRef.current) return;
      const ctx = contextRef.current;
      const controller = new AbortController();
      const { signal } = controller;

      window.addEventListener('keydown', (e) => {
        const key = normKey(e.key);
        kb.pressedKeys.add(key); kb.lastKey = key; kb.lastKeyTime = performance.now();
        kb.modifiers.alt = e.altKey; kb.modifiers.shift = e.shiftKey; kb.modifiers.ctrl = e.ctrlKey; kb.modifiers.meta = e.metaKey;
        keyPressedCb.current.get(key)?.(ctx, e);
        const combo = [...kb.pressedKeys].sort().join('+');
        keyComboCb.current.get(combo)?.(ctx, e);
      }, { signal });

      window.addEventListener('keyup', (e) => {
        const key = normKey(e.key);
        kb.pressedKeys.delete(key);
        kb.modifiers.alt = e.altKey; kb.modifiers.shift = e.shiftKey; kb.modifiers.ctrl = e.ctrlKey; kb.modifiers.meta = e.metaKey;
        keyReleasedCb.current.get(key)?.(ctx, e);
      }, { signal });

      return () => controller.abort();
    }, []);

    return {
      keyboard: kb,
      keyPressed:  (key: string, cb: (ctx: KlintGPUContext, e: KeyboardEvent) => void) => { keyPressedCb.current.set(normKey(key), cb); },
      keyReleased: (key: string, cb: (ctx: KlintGPUContext, e: KeyboardEvent) => void) => { keyReleasedCb.current.set(normKey(key), cb); },
      keyCombo:    (keys: string[], cb: (ctx: KlintGPUContext, e: KeyboardEvent) => void) => { keyComboCb.current.set(comboKey(keys), cb); },
      isPressed:   (key: string) => kb.pressedKeys.has(normKey(key)),
      arePressed:  (keys: string[]) => keys.every(k => kb.pressedKeys.has(normKey(k))),
      clearCallbacks: () => { keyPressedCb.current.clear(); keyReleasedCb.current.clear(); keyComboCb.current.clear(); },
    };
  };

  // ── KlintWindow ───────────────────────────────────────────────────────────
  const KlintWindow = () => {
    const resizeCb     = useRef<((ctx: KlintGPUContext) => void) | null>(null);
    const blurCb       = useRef<((ctx: KlintGPUContext) => void) | null>(null);
    const focusCb      = useRef<((ctx: KlintGPUContext) => void) | null>(null);
    const visibilityCb = useRef<((ctx: KlintGPUContext, isVisible: boolean) => void) | null>(null);

    useEffect(() => {
      if (!contextRef.current) return;
      const ctx = contextRef.current;
      const controller = new AbortController();
      const { signal } = controller;

      window.addEventListener('resize',           () => { resizeCb.current?.(ctx); }, { signal });
      window.addEventListener('blur',             () => { blurCb.current?.(ctx);   }, { signal });
      window.addEventListener('focus',            () => { focusCb.current?.(ctx);  }, { signal });
      document.addEventListener('visibilitychange', () => {
        visibilityCb.current?.(ctx, document.visibilityState === 'visible');
      }, { signal });

      return () => controller.abort();
    }, []);

    return {
      onResize:          (cb: (ctx: KlintGPUContext) => void) => { resizeCb.current = cb; },
      onBlur:            (cb: (ctx: KlintGPUContext) => void) => { blurCb.current = cb; },
      onFocus:           (cb: (ctx: KlintGPUContext) => void) => { focusCb.current = cb; },
      onVisibilityChange:(cb: (ctx: KlintGPUContext, isVisible: boolean) => void) => { visibilityCb.current = cb; },
    };
  };

  // ── KlintImage — image loading with state tracking ────────────────────────
  const KlintImage = () => {
    const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

    const loadImage = useCallback(async (key: string, url: string, opts?: { crossOrigin?: string }): Promise<HTMLImageElement> => {
      // Load for React state (HTMLImageElement) AND for GPU (GPUTexture)
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imagesRef.current.set(key, img);
          // Also register in GPU renderer if available
          rendererRef.current?.loadImage(key, url).catch(() => {});
          resolve(img);
        };
        img.onerror = reject;
        img.crossOrigin = opts?.crossOrigin || 'anonymous';
        img.src = url;
      });
    }, []);

    const loadImages = useCallback(async (map: Record<string, string>, opts?: { crossOrigin?: string }): Promise<Map<string, HTMLImageElement>> => {
      const results = await Promise.all(Object.entries(map).map(([k, url]) => loadImage(k, url, opts).then(img => [k, img] as [string, HTMLImageElement])));
      return new Map(results);
    }, [loadImage]);

    const imagesProxy = new Proxy({} as Record<string, HTMLImageElement>, {
      get: (_, prop) => prop === 'get' ? (k: string) => imagesRef.current.get(k) : (typeof prop === 'string' ? imagesRef.current.get(prop) : undefined),
      has: (_, prop) => typeof prop === 'string' && imagesRef.current.has(prop),
    });

    return {
      images:     imagesProxy,
      loadImage,
      loadImages,
      getImage:   (key: string) => imagesRef.current.get(key),
      hasImage:   (key: string) => imagesRef.current.has(key),
      clearImages:() => imagesRef.current.clear(),
    };
  };

  // ─────────────────────────────────────────────────────────────────────────

  return {
    context: {
      context: contextRef.current,
      initGPUContext,
    } as KlintGPUContextWrapper,
    togglePlay,
    rendererRef,
    useDev,
    KlintMouse,
    KlintScroll,
    KlintGesture,
    KlintKeyboard,
    KlintWindow,
    KlintImage,
  };
}

// ─── useProps / useStorage — identical to Klint, re-exported for convenience ──

export const useProps = <T extends object = Record<string, unknown>>(props: T) => {
  const propsRef = useRef<T>(props);
  const [, forceUpdate] = useState(0);

  useEffect(() => { propsRef.current = props; }, [props]);

  const get    = useCallback(<K extends keyof T>(key: K): T[K] => propsRef.current[key], []);
  const has    = useCallback(<K extends keyof T>(key: K): boolean => key in propsRef.current, []);
  const set    = useCallback(<K extends keyof T>(key: K, val: T[K]) => { propsRef.current[key] = val; forceUpdate(n => n+1); }, [forceUpdate]);

  return { get, set, has, props: propsRef.current };
};

export const useStorage = <T extends object = Record<string, unknown>>(initial: T = {} as T) => {
  const storeRef = useRef<T>(initial);

  const get    = useCallback(<K extends keyof T>(key: K): T[K] => storeRef.current[key], []);
  const set    = useCallback(<K extends keyof T>(key: K, val: T[K]) => { storeRef.current[key] = val; }, []);
  const has    = useCallback(<K extends keyof T>(key: K): boolean => key in storeRef.current, []);
  const remove = useCallback(<K extends keyof T>(key: K) => { delete storeRef.current[key]; }, []);

  return { get, set, has, remove, store: storeRef.current };
};
