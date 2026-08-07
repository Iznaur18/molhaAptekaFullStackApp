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
 * Text-like control (connected).
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
export function isPageScrollLockTextField(target) {
  return (
    target instanceof HTMLElement &&
    target.isConnected &&
    isPageScrollLockTextFieldType(target)
  );
}

/**
 * Formerly locked page scroll on text-field focus (broke Samsung / typing UX).
 * Kept as no-op so call sites stay safe; scroll remains free while focused.
 *
 * @returns {() => void}
 */
export function enableInputFocusPageScrollLock() {
  return () => {};
}
