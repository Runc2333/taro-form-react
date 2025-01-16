import { useCallback, useRef } from "react";

import { useUpdate } from "ahooks";

export default function useMap<
  K extends string | number | symbol,
  V,
> () {
  const map = useRef(new Map<K, V>());

  const update = useUpdate();

  const set = useCallback((key: K, value: V) => {
    map.current.set(key, value);
    update();
  }, [update]);

  const setAll = useCallback((newMap: Iterable<readonly [K, V]>) => {
    map.current = new Map(newMap);
    update();
  }, [update]);

  const remove = useCallback((key: K) => {
    map.current.delete(key);
    update();
  }, [update]);

  const reset = useCallback(() => {
    map.current.clear();
    update();
  }, [update]);

  const get = useCallback((key: K) => map.current.get(key), []);

  return [map.current, { set, setAll, remove, reset, get }] as const;
}