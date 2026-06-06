let lockCount = 0;

/** @type {{ scrollY: number; body: Record<string, string>; html: Record<string, string> }} */
let saved = {
  scrollY: 0,
  body: {},
  html: {},
};

const BODY_LOCK_KEYS = [
  "overflow",
  "position",
  "top",
  "left",
  "right",
  "width",
  "paddingRight",
];
const HTML_LOCK_KEYS = ["overflow"];

/**
 * @param {HTMLElement} element
 * @param {string[]} keys
 */
function readInlineStyles(element, keys) {
  /** @type {Record<string, string>} */
  const styles = {};
  for (const key of keys) {
    styles[key] = element.style[key] ?? "";
  }
  return styles;
}

/**
 * @param {HTMLElement} element
 * @param {Record<string, string>} styles
 */
function applyInlineStyles(element, styles) {
  for (const [key, value] of Object.entries(styles)) {
    element.style[key] = value;
  }
}

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Блокирует скролл страницы под модалкой. Вложенные вызовы безопасны (ref counter).
 *
 * @returns {() => void} unlock
 */
export function lockBodyScroll() {
  if (lockCount === 0) {
    saved.scrollY = window.scrollY;
    saved.body = readInlineStyles(document.body, BODY_LOCK_KEYS);
    saved.html = readInlineStyles(document.documentElement, HTML_LOCK_KEYS);

    const scrollbarWidth = getScrollbarWidth();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${saved.scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      applyInlineStyles(document.body, saved.body);
      applyInlineStyles(document.documentElement, saved.html);
      window.scrollTo(0, saved.scrollY);
    }
  };
}
