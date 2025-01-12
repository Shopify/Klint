import { useEffect, useState, useRef } from "react";

interface VideoOptions {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playbackRate?: number;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isReady: boolean;
  isBuffering: boolean;
  error: string | null;
  volume: number;
}

export const useAdvancedVideo = (options: VideoOptions) => {
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isReady: false,
    isBuffering: false,
    error: null,
    volume: 1,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    videoRef.current = video;

    // Initial setup
    video.src = options.src;
    video.autoplay = options.autoplay ?? true;
    video.loop = options.loop ?? true;
    video.muted = options.muted ?? true;
    video.playsInline = true;
    video.playbackRate = options.playbackRate ?? 1;

    const handlers = {
      loadedmetadata: () =>
        setState((s) => ({ ...s, duration: video.duration })),
      canplay: () =>
        setState((s) => ({ ...s, isReady: true, isBuffering: false })),
      waiting: () => setState((s) => ({ ...s, isBuffering: true })),
      playing: () =>
        setState((s) => ({ ...s, isPlaying: true, isBuffering: false })),
      pause: () => setState((s) => ({ ...s, isPlaying: false })),
      timeupdate: () =>
        setState((s) => ({ ...s, currentTime: video.currentTime })),
      volumechange: () => setState((s) => ({ ...s, volume: video.volume })),
      error: () =>
        setState((s) => ({
          ...s,
          error: video.error?.message || "An error occurred",
          isReady: false,
          isPlaying: false,
        })),
    };

    // Add all event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    // Initial load
    video.load();
    if (options.autoplay) {
      video.play().catch((e) => {
        console.warn("Video autoplay prevented:", e);
        setState((s) => ({ ...s, isPlaying: false }));
      });
    }

    // Cleanup
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
      video.pause();
      video.src = "";
      video.load();
      videoRef.current = null;
    };
  }, [options]);

  // Update video properties when options change
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.loop = options.loop ?? true;
    videoRef.current.muted = options.muted ?? true;
    videoRef.current.playbackRate = options.playbackRate ?? 1;
  }, [options.loop, options.muted, options.playbackRate]);

  return {
    // Video element reference
    video: videoRef.current,

    // Current state
    ...state,

    // Controls
    controls: {
      play: async () => {
        try {
          await videoRef.current?.play();
        } catch (e) {
          setState((s) => ({ ...s, error: "Failed to play video" }));
        }
      },
      pause: () => videoRef.current?.pause(),
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(
            0,
            Math.min(time, state.duration)
          );
        }
      },
      setPlaybackRate: (rate: number) => {
        if (videoRef.current) {
          videoRef.current.playbackRate = Math.max(0.25, Math.min(rate, 4));
        }
      },
      setVolume: (volume: number) => {
        if (videoRef.current) {
          videoRef.current.volume = Math.max(0, Math.min(volume, 1));
        }
      },
      toggleMute: () => {
        if (videoRef.current) {
          videoRef.current.muted = !videoRef.current.muted;
        }
      },
      restart: () => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
        }
      },
    },
  };
};
