import { useEffect } from "react";

const flushAfterMs = 15_000;
const idleAfterMs = 60_000;

function getLocalDayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function useActiveTimeTracking(enabled, onFlush) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    let accumulatedMs = 0;
    let lastTick = performance.now();
    let lastInteraction = performance.now();
    let sending = false;

    const flush = () => {
      if (sending) return;
      const seconds = Math.min(30, Math.floor(accumulatedMs / 1000));
      if (!seconds) return;
      accumulatedMs -= seconds * 1000;
      sending = true;
      Promise.resolve(onFlush(seconds, getLocalDayKey()))
        .catch(() => {})
        .finally(() => {
          sending = false;
          if (accumulatedMs >= flushAfterMs) flush();
        });
    };

    const tick = () => {
      const now = performance.now();
      const elapsed = Math.min(now - lastTick, 1500);
      lastTick = now;
      if (document.visibilityState === "visible" && now - lastInteraction <= idleAfterMs) {
        accumulatedMs += elapsed;
      }
      if (accumulatedMs >= flushAfterMs) flush();
    };

    const markActive = () => { lastInteraction = performance.now(); };
    const onVisibilityChange = () => {
      tick();
      if (document.visibilityState === "hidden") flush();
      else markActive();
    };
    const onPageHide = () => { tick(); flush(); };
    const timer = window.setInterval(tick, 1000);
    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, markActive, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      tick();
      flush();
      window.clearInterval(timer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, markActive));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [enabled, onFlush]);
}
