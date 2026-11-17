"use client";

import { useCallback, useEffect, useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadValue = () => {
      if (cancelled) return;

      try {
        const storedValue = window.localStorage.getItem(key);
        setValue(storedValue === null ? initialValue : JSON.parse(storedValue));
      } catch {
        setValue(initialValue);
      } finally {
        setIsReady(true);
      }
    };

    window.setTimeout(loadValue, 0);
    return () => { cancelled = true; };
  }, [initialValue, key]);

  const updateValue = useCallback((nextValue) => {
    setValue((currentValue) => {
      const resolvedValue = typeof nextValue === "function" ? nextValue(currentValue) : nextValue;

      try {
        window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      } catch {
        // Keep the in-memory value when storage is unavailable.
      }

      return resolvedValue;
    });
  }, [key]);

  return [value, updateValue, isReady];
}
