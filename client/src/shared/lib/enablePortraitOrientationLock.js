import { APP_PORTRAIT_LOCK_UI } from "../config/appUiCopy.js";

/**
 * Portrait-only на всех touch-устройствах (web): телефоны и планшеты.
 * `screen.orientation.lock` — где браузер даёт (Chrome Android / installed PWA).
 * iOS Safari lock не даёт → CSS-оверлей на landscape.
 * Десктоп (мышь / трекпад) не блокируем — мониторы landscape по умолчанию.
 */

const PORTRAIT_LOCK_TYPES = /** @type {const} */ (["portrait", "portrait-primary"]);

function isTouchDeviceViewport() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
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
    isTouchDeviceViewport() &&
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
    if (isTouchDeviceViewport()) {
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
