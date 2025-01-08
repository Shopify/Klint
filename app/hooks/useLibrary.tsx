import { useEffect, useState } from "react";

type LibraryConfig = {
  url: string;
  globalName: string; // The name that gets attached to window, e.g., 'opentype', 'paper'
};

const DEFAULT_CONFIGS: Record<string, LibraryConfig> = {
  opentype: {
    url: "https://cdn.jsdelivr.net/npm/opentype.js@latest/dist/opentype.min.js",
    globalName: "opentype",
  },
  paper: {
    url: "https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js",
    globalName: "paper",
  },
};

// Global loading queue
const LOADING_QUEUE = new Map<string, Promise<unknown>>();

export function useLibrary(libraryName: string, customUrl?: string) {
  const [library, setLibrary] = useState<unknown>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const config = DEFAULT_CONFIGS[libraryName];
    const url = customUrl || config?.url;

    if (!url) {
      setError(new Error("Invalid library name or URL"));
      setIsLoading(false);
      return;
    }

    const loadLibrary = async () => {
      // Check if already in loading queue
      if (!LOADING_QUEUE.has(url)) {
        LOADING_QUEUE.set(
          url,
          new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url;
            script.async = true;

            script.onload = () => {
              // Poll for library
              let attempts = 0;
              const maxAttempts = 50;
              const checkInterval = 100;

              const checkLibrary = () => {
                // @ts-ignore
                const lib = window[config.globalName];
                if (lib) {
                  resolve(lib);
                } else if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(checkLibrary, checkInterval);
                } else {
                  reject(new Error(`Timeout loading ${libraryName}`));
                }
              };
              checkLibrary();
            };

            script.onerror = () =>
              reject(new Error(`Failed to load ${libraryName}`));
            document.body.appendChild(script);
          })
        );
      }

      try {
        const loadedLib = await LOADING_QUEUE.get(url);
        setLibrary(loadedLib);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load library")
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      loadLibrary();
    }

    return () => {
      // Cleanup if needed
    };
  }, [libraryName, customUrl]);

  return { library, error, isLoading };
}
