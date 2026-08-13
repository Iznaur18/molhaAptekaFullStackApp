/**
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Два rAF + reflow: сначала paint в closed, потом --open.
 * Один rAF на быстром ПК часто схлопывает enter (mount уже с open-классом).
 *
 * @param {(open: boolean) => void} setOpen
 * @returns {() => void}
 */
export function scheduleOpenAfterPaint(setOpen) {
  let innerFrameId = 0;
  const outerFrameId = window.requestAnimationFrame(() => {
    void document.body.offsetHeight;
    innerFrameId = window.requestAnimationFrame(() => {
      setOpen(true);
    });
  });

  return () => {
    window.cancelAnimationFrame(outerFrameId);
    window.cancelAnimationFrame(innerFrameId);
  };
}
