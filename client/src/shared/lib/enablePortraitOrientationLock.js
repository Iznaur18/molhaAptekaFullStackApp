import { APP_PORTRAIT_LOCK_UI } from "../config/appUiCopy.js";

/**
 * Portrait-only на смартфонах (web).
 * `screen.orientation.lock` — где браузер даёт (Chrome Android / installed PWA).
 * iOS Safari lock не даёт → CSS-оверлей на landscape.
 */

const PORTRAIT_LOCK_TYPES = /** @type {const} */ (["portrait", "portrait-primary"]);

function isPhoneLikeViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  if (!coarse) {
    return false;
  }

  // Landscape phone: короткая сторона ≈ ширина портрета (≤560).
  // iPad landscape height обычно ≥600–768 — не трогаем.
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  return shortSide <= 560;
}

/**
 * @returns {Promise<boolean>}
 */
async function tryLockPortrait() {
  if (typeof screen === "undefined" || !screen.orientation?.lock) {
    return false;
  }

  for (const type of PORTRAIT_LOCK_TYPES) {
    try {
      await screen.orientation.lock(type);
      return true;
    } catch {
      // NotAllowedError / SecurityError / unsupported type — пробуем следующий.
    }
  }

  return false;
}

function syncPortraitLockClass() {
  if (typeof document === "undefined") {
    return;
  }

  const shouldBlock =
    isPhoneLikeViewport() &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(orientation: landscape)").matches;

  document.documentElement.classList.toggle("app-portrait-lock-active", shouldBlock);
  document.documentElement.setAttribute(
    "data-portrait-lock-hint",
    APP_PORTRAIT_LOCK_UI.HINT,
  );
}

/**
 * @returns {() => void}
 */
export function enablePortraitOrientationLock() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const run = () => {
    syncPortraitLockClass();
    if (isPhoneLikeViewport()) {
      void tryLockPortrait();
    }
  };

  run();

  window.addEventListener("orientationchange", run);
  window.addEventListener("resize", run);
  document.addEventListener("visibilitychange", run);

  return () => {
    window.removeEventListener("orientationchange", run);
    window.removeEventListener("resize", run);
    document.removeEventListener("visibilitychange", run);
    document.documentElement.classList.remove("app-portrait-lock-active");
    document.documentElement.removeAttribute("data-portrait-lock-hint");
    try {
      screen.orientation?.unlock?.();
    } catch {
      // ignore
    }
  };
}
