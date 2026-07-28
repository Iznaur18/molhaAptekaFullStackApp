import { useEffect, useState } from "react";

import { HOME_FEATURED_RAFFLE_MODAL_ANIMATION } from "../lib/homeFeaturedRaffleModalAnimation.js";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Mount → paint closed → --open; exit ждёт slide-down перед unmount.
 *
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useHomeFeaturedRaffleModalAnimation(isOpen) {
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
    }, HOME_FEATURED_RAFFLE_MODAL_ANIMATION.exitMs);

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
