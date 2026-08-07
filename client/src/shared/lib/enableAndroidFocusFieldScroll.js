import { isPageScrollLockTextField } from "./enableInputFocusPageScrollLock.js";

/** Gap under focused field above soft keyboard. */
const COMFORT_GAP_PX = 20;
/** Wait for IME, then one smooth scroll — no double-pass jitter. */
const KEYBOARD_SETTLE_MS = 200;
const ASSUMED_KEYBOARD_RATIO = 0.48;

/**
 * @param {string} [userAgent]
 * @returns {boolean}
 */
export function isAndroidUserAgent(userAgent = "") {
  return /Android/i.test(userAgent);
}

/**
 * @returns {boolean}
 */
function isAndroidRuntime() {
  return typeof navigator !== "undefined" && isAndroidUserAgent(navigator.userAgent || "");
}

/**
 * @param {string} overflowY
 * @returns {boolean}
 */
const isScrollableOverflowY = (overflowY) =>
  overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";

/**
 * @param {HTMLElement} start
 * @returns {HTMLElement | null}
 */
function findScrollableAncestor(start) {
  let node = start.parentElement;
  /** @type {HTMLElement | null} */
  let overflowHost = null;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (isScrollableOverflowY(style.overflowY)) {
      if (node.scrollHeight > node.clientHeight + 1) {
        return node;
      }
      if (!overflowHost) {
        overflowHost = node;
      }
    }
    node = node.parentElement;
  }
  return overflowHost;
}

/**
 * Visible bottom Y in CSS px (accounts for soft keyboard when possible).
 * @param {boolean} assumeKeyboard
 * @returns {number}
 */
export function resolveAndroidVisibleBottom(assumeKeyboard) {
  const visualViewport = window.visualViewport;
  if (visualViewport) {
    const inset = Math.max(
      0,
      window.innerHeight - visualViewport.height - visualViewport.offsetTop,
    );
    if (inset >= 40) {
      return visualViewport.offsetTop + visualViewport.height - COMFORT_GAP_PX;
    }
  }

  if (assumeKeyboard) {
    return window.innerHeight * (1 - ASSUMED_KEYBOARD_RATIO) - COMFORT_GAP_PX;
  }

  if (visualViewport) {
    return visualViewport.offsetTop + visualViewport.height - COMFORT_GAP_PX;
  }

  return window.innerHeight - COMFORT_GAP_PX;
}

/**
 * @param {HTMLElement} el
 * @param {number} delta
 * @param {ScrollBehavior} behavior
 */
function ensurePadAndScroll(el, delta, behavior) {
  if (delta > 0) {
    const room = el.scrollHeight - el.clientHeight - el.scrollTop;
    if (room < delta) {
      if (!el.dataset.androidFocusPad) {
        el.dataset.androidFocusPad = "1";
        el.dataset.androidFocusPadPrev = el.style.paddingBottom;
      }
      const base = Number.parseFloat(el.dataset.androidFocusPadPrev || "") || 0;
      el.style.paddingBottom = `${base + Math.ceil(delta) + 24}px`;
    }
  }
  el.scrollBy({ top: delta, behavior });
}

/**
 * One smooth scroll so the field sits in the visible band above the keyboard.
 * @param {HTMLElement} target
 * @param {{ assumeKeyboard?: boolean; behavior?: ScrollBehavior }} [options]
 */
export function scrollAndroidFieldIntoView(target, options = {}) {
  if (!target.isConnected) {
    return;
  }

  const behavior = options.behavior ?? "smooth";
  const assumeKeyboard = Boolean(options.assumeKeyboard);
  const visualViewport = window.visualViewport;
  const visibleBottom = resolveAndroidVisibleBottom(assumeKeyboard);
  const visibleTop =
    visualViewport && !assumeKeyboard
      ? visualViewport.offsetTop + COMFORT_GAP_PX
      : COMFORT_GAP_PX;
  const bandCenter = (visibleTop + visibleBottom) / 2;

  const rect = target.getBoundingClientRect();
  const fieldCenter = (rect.top + rect.bottom) / 2;
  // Center in band, but never leave bottom under the keyboard.
  const delta = Math.max(fieldCenter - bandCenter, rect.bottom - visibleBottom);
  if (Math.abs(delta) < 4) {
    return;
  }

  const scrollRoot = findScrollableAncestor(target);
  if (scrollRoot) {
    ensurePadAndScroll(scrollRoot, delta, behavior);
    return;
  }

  const scrollingElement = document.scrollingElement || document.documentElement;
  if (scrollingElement instanceof HTMLElement) {
    ensurePadAndScroll(scrollingElement, delta, behavior);
  }
}

function clearAndroidFocusPadding() {
  const padded = document.querySelectorAll("[data-android-focus-pad]");
  for (const el of padded) {
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    el.style.paddingBottom = el.dataset.androidFocusPadPrev ?? "";
    delete el.dataset.androidFocusPad;
    delete el.dataset.androidFocusPadPrev;
  }
}

/**
 * Android-only: one smooth scroll after keyboard settles (no instant double-pass).
 *
 * @returns {() => void}
 */
export function enableAndroidFocusFieldScroll() {
  if (typeof document === "undefined" || !isAndroidRuntime()) {
    return () => {};
  }

  /** @type {HTMLElement | null} */
  let activeTarget = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let settleTimer = null;

  const cancelPending = () => {
    if (settleTimer != null) {
      clearTimeout(settleTimer);
      settleTimer = null;
    }
  };

  const releaseActive = () => {
    cancelPending();
    clearAndroidFocusPadding();
    activeTarget = null;
  };

  /** @param {FocusEvent} event */
  const onFocusIn = (event) => {
    if (!isPageScrollLockTextField(event.target)) {
      return;
    }
    activeTarget = /** @type {HTMLElement} */ (event.target);
    cancelPending();
    settleTimer = setTimeout(() => {
      if (!activeTarget?.isConnected) {
        return;
      }
      scrollAndroidFieldIntoView(activeTarget, {
        assumeKeyboard: true,
        behavior: "smooth",
      });
    }, KEYBOARD_SETTLE_MS);
  };

  const onFocusOut = () => {
    queueMicrotask(() => {
      if (isPageScrollLockTextField(document.activeElement)) {
        return;
      }
      releaseActive();
    });
  };

  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);

  return () => {
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("focusout", onFocusOut);
    releaseActive();
  };
}
