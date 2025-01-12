import { useRef } from "react";

type VideoSource = string | HTMLVideoElement;

export function useVideo(source: VideoSource) {
  const videoRef = useRef<HTMLVideoElement>();
  const loadingPromise = useRef<Promise<HTMLVideoElement>>();

  const load = (): Promise<HTMLVideoElement> => {
    if (loadingPromise.current) return loadingPromise.current;

    loadingPromise.current = new Promise((resolve, reject) => {
      if (source instanceof HTMLVideoElement) {
        videoRef.current = source;
        resolve(source);
        return;
      }

      const video = document.createElement("video");
      video.src = source;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;

      // Set video reference early
      videoRef.current = video;

      // Simple timeout to prevent infinite waiting
      const timeout = setTimeout(() => {
        if (!video.readyState) {
          reject(new Error("Video load timeout"));
        }
      }, 10000);

      video.addEventListener(
        "loadedmetadata",
        async () => {
          try {
            await video.play();
            clearTimeout(timeout);
            resolve(video);
          } catch (e) {
            console.warn("Play failed, resolving anyway:", e);
            // Resolve anyway - we'll retry play in the draw loop
            resolve(video);
          }
        },
        { once: true }
      );

      video.addEventListener(
        "error",
        (e) => {
          clearTimeout(timeout);
          console.error("Video load error:", e);
          reject(new Error(`Failed to load video: ${source}`));
        },
        { once: true }
      );

      // Force load
      video.load();
    });

    return loadingPromise.current;
  };

  return {
    video: () => videoRef.current!,
    load,
  };
}
