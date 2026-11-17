"use client";

import { useEffect } from "react";

export default function useOutsideClick(ref, onOutsideClick, enabled = true, ignoredRefs = []) {
  useEffect(() => {
    if (!enabled) return undefined;

    function handlePointerDown(event) {
      const isIgnored = ignoredRefs.some((ignoredRef) => ignoredRef?.current?.contains(event.target));
      if (ref.current && !ref.current.contains(event.target) && !isIgnored) onOutsideClick(event);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") onOutsideClick(event);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, ignoredRefs, onOutsideClick, ref]);
}
