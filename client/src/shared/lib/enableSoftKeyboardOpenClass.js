import { isPageScrollLockTextField } from "./enableInputFocusPageScrollLock.js";

/** Класс на <html>, пока софт-клавиатура перекрывает нижнюю кромку экрана. */
export const SOFT_KEYBOARD_OPEN_CLASS = "app-soft-keyboard-open";

/** Тот же порог, что и в enableAndroidFocusFieldScroll: меньше — это не клавиатура. */
const KEYBOARD_INSET_MIN_PX = 40;

/** Клавиатура успевает подняться за это время; дальше верим замеру visualViewport. */
const KEYBOARD_SETTLE_MS = 600;

/**
 * Насколько visualViewport ниже layout-viewport — высота софт-клавиатуры.
 *
 * @param {{ height: number; offsetTop: number } | null | undefined} viewport
 * @param {number} innerHeight
 * @returns {number}
 */
export function resolveSoftKeyboardInset(viewport, innerHeight) {
  if (!viewport) {
    return 0;
  }
  return Math.max(0, innerHeight - viewport.height - viewport.offsetTop);
}

/**
 * iOS Safari переносит `position: fixed` к нижней кромке visualViewport, пока открыта
 * клавиатура: плавающий bottom nav уезжает вверх и остаётся там. Поэтому на тач-устройствах
 * прячем его сразу по фокусу, а через KEYBOARD_SETTLE_MS сверяемся с реальным inset —
 * иначе «спрятать клавиатуру» на Android (фокус остаётся) навсегда убирал бы навбар.
 *
 * @param {{
 *   isTextFieldFocused: boolean;
 *   isCoarsePointer: boolean;
 *   hasVisualViewport: boolean;
 *   inset: number;
 *   isSettled: boolean;
 * }} state
 * @returns {boolean}
 */
export function isSoftKeyboardOpen({
  isTextFieldFocused,
  isCoarsePointer,
  hasVisualViewport,
  inset,
  isSettled,
}) {
  if (!isTextFieldFocused) {
    return false;
  }

  if (hasVisualViewport && inset >= KEYBOARD_INSET_MIN_PX) {
    return true;
  }

  if (!isCoarsePointer) {
    return false;
  }

  return !hasVisualViewport || !isSettled;
}

/**
 * Глобально помечает <html> классом, пока открыта софт-клавиатура.
 *
 * @returns {() => void}
 */
export function enableSoftKeyboardOpenClass() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return () => {};
  }

  const viewport = window.visualViewport ?? null;
  const isCoarsePointer =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(hover: none) and (pointer: coarse)").matches
      : false;

  /** @type {ReturnType<typeof setTimeout> | null} */
  let settleTimer = null;
  let isSettled = true;

  const sync = () => {
    const open = isSoftKeyboardOpen({
      isTextFieldFocused: isPageScrollLockTextField(document.activeElement),
      isCoarsePointer,
      hasVisualViewport: Boolean(viewport),
      inset: resolveSoftKeyboardInset(viewport, window.innerHeight),
      isSettled,
    });
    document.documentElement.classList.toggle(SOFT_KEYBOARD_OPEN_CLASS, open);
  };

  /** @param {FocusEvent} event */
  const onFocusIn = (event) => {
    if (!isPageScrollLockTextField(event.target)) {
      return;
    }
    if (settleTimer != null) {
      clearTimeout(settleTimer);
    }
    isSettled = false;
    settleTimer = setTimeout(() => {
      settleTimer = null;
      isSettled = true;
      sync();
    }, KEYBOARD_SETTLE_MS);
    sync();
  };

  const onFocusOut = () => {
    queueMicrotask(sync);
  };

  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);
  viewport?.addEventListener("resize", sync);

  return () => {
    if (settleTimer != null) {
      clearTimeout(settleTimer);
      settleTimer = null;
    }
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("focusout", onFocusOut);
    viewport?.removeEventListener("resize", sync);
    document.documentElement.classList.remove(SOFT_KEYBOARD_OPEN_CLASS);
  };
}
