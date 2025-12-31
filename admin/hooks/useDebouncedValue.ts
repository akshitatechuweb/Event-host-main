"use client";

import { useEffect, useState } from "react";

/**
 * Generic debounced value hook.
 * - Keeps UI snappy while avoiding excessive work (API calls, filtering).
 * - Suitable for both client-side filtering and server-side search.
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debounced;
}
