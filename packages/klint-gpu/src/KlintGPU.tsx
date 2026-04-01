import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WebGPURenderer } from './renderer/WebGPURenderer';
import {
  KlintGPUContext,
  KlintGPUOptions,
  DEFAULT_GPU_OPTIONS,
  buildKlintGPUContext,
} from './context/KlintGPUContext';
import { KlintGPUContextWrapper } from './useKlintGPU';

const DEFAULT_ALT = 'A beautiful artwork made with KlintGPU';

export interface KlintGPUProps {
  context: KlintGPUContextWrapper;
  draw: (ctx: KlintGPUContext) => void;
  setup?: (ctx: KlintGPUContext) => void;
  preload?: (ctx: KlintGPUContext) => Promise<void>;
  options?: KlintGPUOptions;
  onResize?: (ctx: KlintGPUContext) => void;
  /** Called when the canvas enters/exits the viewport */
  onVisible?: (ctx: KlintGPUContext) => void;
}

function useAnimate(
  contextRef: React.RefObject<KlintGPUContext | null>,
  draw: (ctx: KlintGPUContext) => void,
  isVisible: boolean,
) {
  const rafRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp = 0) => {
      const ctx = contextRef.current;
      if (!ctx || !isVisible || !ctx.__isReadyToDraw || !ctx.__isPlaying) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const target = 1000 / ctx.fps;
      const ctxEx = ctx as KlintGPUContext & {__lastTargetTime?:number;__lastRealTime?:number};
      if (!ctxEx.__lastTargetTime) {
        ctxEx.__lastTargetTime = timestamp;
        ctxEx.__lastRealTime   = timestamp;
      }

      const sinceLast = timestamp - ctxEx.__lastTargetTime!;
      if (sinceLast >= target - 5) {
        ctx.deltaTime = timestamp - ctxEx.__lastRealTime!;

        // ── GPU frame ───────────────────────────────────────────
        ctx.__renderer.beginFrame();

        // Match Klint Canvas2D: coordinate system in CSS pixels (not device pixels).
        // Apply DPR scale so user coords are CSS px, just like in Klint's ctx.scale(dpr,dpr).
        const dpr = ctx.__dpr;
        ctx.__renderer.transform.scale(dpr, dpr);
        ctx.__renderer.cacheScale(); // cache scaleX = dpr for _push() performance

        // Apply center origin (in CSS px)
        if (ctx.__canvasOrigin === 'center') {
          ctx.__renderer.transform.translate(ctx.width / 2, ctx.height / 2);
        }

        draw(ctx);
        ctx.__renderer.render(ctx.__surface);
        // ────────────────────────────────────────────────────────

        ctx.time += ctx.deltaTime / 1000;
        ctx.frame++;
        if (ctx.time > 1e7) ctx.time = 0;
        if (ctx.frame > 1e7) ctx.frame = 0;
        ctxEx.__lastTargetTime = timestamp;
        ctxEx.__lastRealTime   = timestamp;
      }

      rafRef.current = requestAnimationFrame(animate);
    },
    [contextRef, draw, isVisible],
  );

  return { animate, rafRef };
}

export default function KlintGPU({
  context: contextWrapper,
  draw,
  setup,
  preload,
  options = {},
  onResize,
  onVisible,
}: KlintGPUProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<KlintGPUContext | null>(null);
  const rendererRef = useRef<WebGPURenderer | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [gpuError, setGpuError] = useState<string | null>(null);

  const opts = { ...DEFAULT_GPU_OPTIONS, ...options };
  const { animate, rafRef } = useAnimate(contextRef, draw, isVisible);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    let cancelled = false;

    const init = async () => {
      try {
        // Check WebGPU support
        if (!navigator.gpu) throw new Error('WebGPU not supported');

        const dpr = opts.dpr === 'default' ? (window.devicePixelRatio || 1) : opts.dpr;
        const { width, height } = container.getBoundingClientRect();

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Init shared renderer (with user-specified AA and alpha modes)
        if (!rendererRef.current) {
          rendererRef.current = await WebGPURenderer.init({
            aaMethod: opts.aaMethod,
            alphaMode: opts.alphaMode,
          });
        }

        if (cancelled) return;

        const renderer = rendererRef.current;
        const surface = renderer.addCanvas(canvas, dpr);
        contextRef.current = buildKlintGPUContext(canvas, renderer, surface, opts);
        const ctx = contextRef.current;

        // Preload
        if (preload) await preload(ctx);
        if (cancelled) return;

        // Setup
        if (setup) setup(ctx);

        // First draw — same transform setup as animate loop
        renderer.beginFrame();
        renderer.transform.scale(dpr, dpr); // CSS px coordinate system
        renderer.cacheScale();
        if (ctx.__canvasOrigin === 'center') {
          renderer.transform.translate(ctx.width / 2, ctx.height / 2);
        }
        draw(ctx);
        renderer.render(surface);
        ctx.__isReadyToDraw = true;

        if (!opts.noloop) animate();
      } catch (err: any) {
        if (!cancelled) setGpuError(err?.message ?? String(err));
      }
    };

    init();

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!contextRef.current || !rendererRef.current) return;
      const ctx = contextRef.current;
      const { width, height } = container.getBoundingClientRect();
      canvas.width  = Math.floor(width  * ctx.__dpr);
      canvas.height = Math.floor(height * ctx.__dpr);
      ctx.width  = width;   // CSS pixels
      ctx.height = height;  // CSS pixels
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.__surface.width = canvas.width;
      ctx.__surface.height = canvas.height;
      onResize?.(ctx);
    });
    ro.observe(container);

    // Visibility observer
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (contextRef.current) onVisible?.(contextRef.current);
      },
      { threshold: 0.1, rootMargin: '50px' },
    );
    io.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      rendererRef.current?.removeCanvas(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gpuError) {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#1a1a1a', color: '#ff6b6b', fontFamily: 'monospace',
          padding: '1rem', fontSize: '0.85rem',
        }}
      >
        ⚠️ WebGPU error: {gpuError}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
        aria-label={DEFAULT_ALT}
        role="img"
      />
    </div>
  );
}
