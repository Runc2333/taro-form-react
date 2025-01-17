import { useCallback, useRef } from "react";

import { useUpdate } from "ahooks";

export default function useImmediateState<T> (initialValue: T): readonly [T, (newValue: T) => void] {
  const value = useRef<T>(initialValue);

  const update = useUpdate();

  const setValue = useCallback((newValue: T) => {
    value.current = newValue;
    update();
  }, [update]);

  return [value.current, setValue] as const;
}