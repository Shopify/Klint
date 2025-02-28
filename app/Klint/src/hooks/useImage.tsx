import { useState, useEffect } from "react";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      img.width = img.naturalWidth;
      img.height = img.naturalHeight;
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function useImages(urls: string | string[], throwErrors = false) {
  const [images, setImages] = useState<HTMLImageElement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const urlsArray = Array.isArray(urls) ? urls : [urls];

    setLoading(true);
    setError(null);
    setImages(null);

    Promise.all(urlsArray.map((url) => loadImage(url)))
      .then((loadedImages) => {
        // Only update state if component is still mounted
        if (mounted) {
          setImages(loadedImages);
          setLoading(false);
        }
      })
      .catch((err) => {
        // Only update state if component is still mounted
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false;
    };
  }, [urls]);

  // This will propagate the error to error boundaries if enabled
  if (throwErrors && error && !loading) {
    throw error;
  }

  // Only return images when they're fully loaded
  return { images, loading, error };
}

// For single image convenience
export function useImage(url: string, throwErrors = false) {
  const { images, loading, error } = useImages(url, throwErrors);
  console.log(images);
  return { image: images?.[0] || null, loading, error };
}
