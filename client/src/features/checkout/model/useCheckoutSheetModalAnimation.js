import { useEffect, useState } from "react";

import { CHECKOUT_SHEET_MODAL_ANIMATION } from "../lib/checkoutSheetModalAnimation.js";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Паритет mobile `useAdminEditModalAnimation` для checkout sheet:
 * enter 280ms / exit 220ms — сначала mount в closed, затем --open после paint.
 *
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useCheckoutSheetModalAnimation(isOpen) {
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
    }, CHECKOUT_SHEET_MODAL_ANIMATION.exitMs);

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
