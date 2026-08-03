import { lockBodyScrollOverflowOnly } from "./scrollLock.js";

const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const NON_PASSIVE_CAPTURE = { capture: true, passive: false };

/**
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
function isPageScrollLockTextFieldType(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }

  if (tag === "INPUT") {
    const type = (target.getAttribute("type") || "text").toLowerCase();
    return !NON_TEXT_INPUT_TYPES.has(type);
  }

  return Boolean(target.isContentEditable);
}

/**
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
export function isPageScrollLockTextField(target) {
  // После unmount login/route смены activeElement может остаться detached INPUT —
  // без isConnected overflow/touchmove lock зависает навсегда (mobile web).
  return (
    target instanceof HTMLElement &&
    target.isConnected &&
    isPageScrollLockTextFieldType(target)
  );
}

/**
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
function allowsInternalFieldScroll(target) {
  if (!(target instanceof HTMLTextAreaElement)) {
    return false;
  }
  if (document.activeElement !== target) {
    return false;
  }
  return target.scrollHeight > target.clientHeight + 1;
}

/**
 * Лочит вертикальный скролл страницы и sheet/modal при фокусе в текстовом поле.
 * iOS: overflow:hidden на body недостаточно — дополнительно suppress touchmove/wheel.
 * Внутренний скролл длинного textarea разрешён.
 * Только web document — вызывать из client bootstrap.
 */
export function enableInputFocusPageScrollLock() {
  if (typeof document === "undefined") {
    return () => {};
  }

  /** @type {null | (() => void)} */
  let unlockBody = null;
  let gestureLockActive = false;

  /** @type {(event: TouchEvent | WheelEvent) => void} */
  let preventExternalScroll = () => {};

  const releaseGestureLock = () => {
    if (!gestureLockActive) {
      return;
    }
    gestureLockActive = false;
    document.removeEventListener("touchstart", releaseStaleLockIfNeeded, true);
    document.removeEventListener("touchmove", preventExternalScroll, NON_PASSIVE_CAPTURE);
    document.removeEventListener("wheel", preventExternalScroll, NON_PASSIVE_CAPTURE);
  };

  const releaseLocksNow = () => {
    releaseGestureLock();
    if (!unlockBody) {
      return;
    }
    unlockBody();
    unlockBody = null;
  };

  const releaseStaleLockIfNeeded = () => {
    if (!unlockBody && !gestureLockActive) {
      return;
    }
    if (isPageScrollLockTextField(document.activeElement)) {
      return;
    }
    releaseLocksNow();
  };

  preventExternalScroll = (event) => {
    if (!gestureLockActive) {
      return;
    }
    // Self-heal: login navigate / unmount без focusout — иначе touchmove глушит скролл навсегда.
    if (!isPageScrollLockTextField(document.activeElement)) {
      releaseLocksNow();
      return;
    }
    if (allowsInternalFieldScroll(event.target)) {
      return;
    }
    event.preventDefault();
  };

  const ensureLocked = () => {
    if (!unlockBody) {
      unlockBody = lockBodyScrollOverflowOnly();
    }
    if (!gestureLockActive) {
      gestureLockActive = true;
      document.addEventListener("touchstart", releaseStaleLockIfNeeded, true);
      document.addEventListener("touchmove", preventExternalScroll, NON_PASSIVE_CAPTURE);
      document.addEventListener("wheel", preventExternalScroll, NON_PASSIVE_CAPTURE);
    }
  };

  const releaseIfIdle = () => {
    queueMicrotask(() => {
      if (isPageScrollLockTextField(document.activeElement)) {
        return;
      }
      releaseLocksNow();
    });
  };

  /** @param {FocusEvent} event */
  const onFocusIn = (event) => {
    if (!isPageScrollLockTextField(event.target)) {
      return;
    }
    ensureLocked();
  };

  /** @param {FocusEvent} event */
  const onFocusOut = (event) => {
    // Type-only: focusout может идти с уже detached target при unmount.
    if (!isPageScrollLockTextFieldType(event.target)) {
      return;
    }
    if (isPageScrollLockTextField(event.relatedTarget)) {
      return;
    }
    releaseIfIdle();
  };

  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);

  return () => {
    document.removeEventListener("focusin", onFocusIn);
    document.removeEventListener("focusout", onFocusOut);
    releaseLocksNow();
  };
}
