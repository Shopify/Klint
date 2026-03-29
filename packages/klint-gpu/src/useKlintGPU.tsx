import { useRef, useCallback, useEffect } from 'react';
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

export default function useKlintGPU() {
  const contextRef = useRef<KlintGPUContext | null>(null);
  const rendererRef = useRef<WebGPURenderer | null>(null);

  // Cleanup renderer on unmount
  useEffect(() => {
    return () => {
      rendererRef.current?.destroy();
    };
  }, []);

  const initGPUContext = useCallback(
    async (canvas: HTMLCanvasElement, options: KlintGPUOptions): Promise<KlintGPUContext> => {
      if (contextRef.current) return contextRef.current;

      const opts = { ...DEFAULT_GPU_OPTIONS, ...options };
      const dpr = opts.dpr === 'default' ? (window.devicePixelRatio || 1) : opts.dpr;

      // Init WebGPU renderer (shared device)
      if (!rendererRef.current) {
        rendererRef.current = await WebGPURenderer.init();
      }
      const renderer = rendererRef.current;

      // Size canvas
      const container = canvas.parentElement;
      const { width, height } = container
        ? container.getBoundingClientRect()
        : { width: canvas.offsetWidth || 300, height: canvas.offsetHeight || 300 };

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const surface = renderer.addCanvas(canvas, dpr);
      contextRef.current = buildKlintGPUContext(canvas, renderer, surface, opts);

      return contextRef.current;
    },
    [],
  );

  const togglePlay = useCallback((playing?: boolean) => {
    if (!contextRef.current) return;
    contextRef.current.__isPlaying =
      playing !== undefined ? playing : !contextRef.current.__isPlaying;
  }, []);

  return {
    context: {
      context: contextRef.current,
      initGPUContext,
    } as KlintGPUContextWrapper,
    togglePlay,
    rendererRef,
  };
}
