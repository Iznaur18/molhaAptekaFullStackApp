import { useEffect, useState } from "react";

const ENTER_MS = 280;
const EXIT_MS = 220;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Mount + slide-up visibility для bottom sheet (enter 280ms / exit 220ms).
 *
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useWholesalePriceSheetAnimation(isOpen) {
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

    if (prefersReducedMotion()) {
      setMounted(false);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMounted(false);
    }, EXIT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen || !mounted) {
      return undefined;
    }

    if (prefersReducedMotion()) {
      setIsVisible(true);
      return undefined;
    }

    let innerFrameId = 0;
    const outerFrameId = window.requestAnimationFrame(() => {
      innerFrameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(outerFrameId);
      window.cancelAnimationFrame(innerFrameId);
    };
  }, [isOpen, mounted]);

  return { mounted, isVisible };
}

export const WHOLESALE_PRICE_SHEET_ANIMATION = {
  enterMs: ENTER_MS,
  exitMs: EXIT_MS,
};
