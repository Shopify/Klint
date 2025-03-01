import { useState, useEffect, useCallback } from "react";

type ImageUrl = string;

interface UseImageReturn {
  image: HTMLImageElement | null;
  loading: boolean;
  error: Error | null;
  loadImage: (url: string) => Promise<HTMLImageElement>;
}

export function useImage(src: ImageUrl): UseImageReturn {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadImage = useCallback(
    async (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          img.width = img.naturalWidth;
          img.height = img.naturalHeight;
          resolve(img);
        };
        img.onerror = (e) => {
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      });
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    loadImage(src)
      .then((img) => {
        setImage(img);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
        console.error("Failed to load image:", err);
      });
  }, [src, loadImage]);

  return {
    image,
    loading,
    error,
    loadImage,
  };
}
