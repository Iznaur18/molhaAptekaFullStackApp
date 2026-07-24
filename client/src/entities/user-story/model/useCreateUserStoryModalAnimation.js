import { useEffect, useState } from "react";

import { CREATE_USER_STORY_MODAL_ANIMATION } from "./createUserStoryModalAnimation.js";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * @param {boolean} isOpen
 * @returns {{ mounted: boolean; isVisible: boolean }}
 */
export function useCreateUserStoryModalAnimation(isOpen) {
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
    }, CREATE_USER_STORY_MODAL_ANIMATION.exitMs);

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
