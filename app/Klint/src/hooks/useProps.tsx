import { useRef, useCallback } from "react";

type PropsValue = unknown;
type PropsStore = Record<string, PropsValue>;

const useProps = (initialProps: PropsStore = {}) => {
  const storeRef = useRef<PropsStore>(initialProps);

  // Proxy handler for direct property access
  const handler = {
    get: (target: PropsStore, prop: string) => {
      if (typeof prop === "string") {
        return target[prop];
      }
      return undefined;
    },
    set: (target: PropsStore, prop: string, value: PropsValue) => {
      if (typeof prop === "string") {
        target[prop] = value;
        return true;
      }
      return false;
    },
  };

  // Create a proxy for direct property access
  const proxy = new Proxy(storeRef.current, handler);

  // Methods for explicit get/set if preferred
  const get = useCallback((key: string): PropsValue => {
    return storeRef.current[key];
  }, []);

  const set = useCallback((key: string, value: PropsValue): void => {
    storeRef.current[key] = value;
  }, []);

  const has = useCallback((key: string): boolean => {
    return key in storeRef.current;
  }, []);

  const remove = useCallback((key: string): void => {
    delete storeRef.current[key];
  }, []);

  return {
    ...proxy,
    get,
    set,
    has,
    remove,
    store: storeRef.current,
  };
};

export default useProps;
