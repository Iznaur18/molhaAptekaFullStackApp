import { useEffect, useState } from "react";

import {
  prefersReducedMotion,
  scheduleOpenAfterPaint,
} from "./scheduleOpenAfterPaint.js";

/**
 * Mount → paint closed → open; на close ждёт exitMs перед unmount.
 * Reduced-motion: короткий exit, но enter всё равно через paint (иначе на ПК
 * sheet появляется без анимации из‑за Windows «Эффекты анимации: выкл»).
 *
 * @param {boolean} isOpen
 * @param {{ exitMs: number }} options
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useEnterExitMountAnimation(isOpen, { exitMs }) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return undefined;
    }

    setIsVisible(false);

    if (!mounted) {
      return undefined;
    }

    const waitMs = prefersReducedMotion() ? Math.min(exitMs, 100) : exitMs;
    const timeoutId = window.setTimeout(() => {
      setMounted(false);
    }, waitMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, mounted, exitMs]);

  useEffect(() => {
    if (!isOpen || !mounted) {
      return undefined;
    }

    return scheduleOpenAfterPaint(setIsVisible);
  }, [isOpen, mounted]);

  return { mounted, isVisible };
}
