const SCROLL_TO_TOP_MIN_MS = 320;
const SCROLL_TO_TOP_MAX_MS = 640;
const SCROLL_TO_TOP_PX_PER_MS = 2.2;

/** @type {number | null} */
let activeFrameId = null;

function readScrollY() {
  if (typeof window === "undefined") return 0;
  return (
    window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
  );
}

/**
 * @param {number} y
 */
function writeScrollY(y) {
  if (typeof window === "undefined") return;
  const next = Math.max(0, y);
  window.scrollTo(0, next);
  document.documentElement.scrollTop = next;
  document.body.scrollTop = next;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Анимация скролла окна наверх (rAF). Надёжнее native `behavior: "smooth"`
 * на мобильном Chrome/Safari.
 */
export function scrollWindowToTopAnimated() {
  if (typeof window === "undefined") return;

  if (activeFrameId != null) {
    cancelAnimationFrame(activeFrameId);
    activeFrameId = null;
  }

  const startY = readScrollY();
  if (startY <= 1) {
    writeScrollY(0);
    return;
  }

  if (prefersReducedMotion()) {
    writeScrollY(0);
    return;
  }

  const durationMs = Math.min(
    SCROLL_TO_TOP_MAX_MS,
    Math.max(SCROLL_TO_TOP_MIN_MS, startY / SCROLL_TO_TOP_PX_PER_MS),
  );
  const startedAt = performance.now();

  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = 1 - (1 - progress) ** 3;
    writeScrollY(startY * (1 - eased));

    if (progress < 1) {
      activeFrameId = requestAnimationFrame(tick);
      return;
    }

    activeFrameId = null;
    writeScrollY(0);
  };

  activeFrameId = requestAnimationFrame(tick);
}
