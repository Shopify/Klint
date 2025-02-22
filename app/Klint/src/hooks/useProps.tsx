import { useRef, useCallback } from "react";

type PropsValue = unknown;
type PropsStore = Record<string, PropsValue>;

const useProps = (initialProps: PropsStore = {}) => {
  const storeRef = useRef<PropsStore>(initialProps);

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
    get,
    set,
    has,
    remove,
    store: storeRef.current,
  };
};

export default useProps;
