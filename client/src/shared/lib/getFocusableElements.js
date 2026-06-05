const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

/**
 * @param {ParentNode | null | undefined} root
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(root) {
  if (!root) {
    return [];
  }

  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }
    if (element.tabIndex < 0) {
      return false;
    }
    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }
    return element.offsetWidth > 0 || element.offsetHeight > 0;
  });
}
