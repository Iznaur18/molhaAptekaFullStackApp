/**
 * Единый менеджер блокировки скролла страницы.
 *
 * Два счётчика (`fixed` и `overflow`) делят одни и те же инлайн-стили `body`/`html`,
 * поэтому снапшот исходных стилей снимается ОДИН раз — при переходе 0 → 1 по сумме
 * локов — и восстанавливается только когда снят последний. Иначе вложенные локи
 * затирали снапшоты друг друга: `fixed`-лок сохранял `overflow: ''`, поверх вставал
 * `overflow`-лок и сохранял уже `'hidden'`, и если `fixed` снимался первым, финальное
 * восстановление возвращало `overflow: hidden` на `html` + `body` — страница
 * оставалась незакручиваемой до перезагрузки.
 *
 * Пока держится хотя бы один `fixed`-лок, он сильнее: `overflow`-лок поверх него
 * ничего не меняет, а снятие последнего `fixed` при живом `overflow` понижает
 * блокировку до `overflow` (и возвращает scroll на место).
 */

/** @typedef {"none" | "overflow" | "fixed"} ScrollLockMode */

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
/** Стили, которые ставит только `fixed`-режим: снимаются при понижении до `overflow`. */
const BODY_FIXED_KEYS = ["position", "top", "left", "right", "width", "paddingRight"];

let fixedLockCount = 0;
let overflowLockCount = 0;

/** @type {ScrollLockMode} */
let appliedMode = "none";
/** @type {{ body: Record<string, string>; html: Record<string, string> } | null} */
let savedStyles = null;
let savedScrollY = 0;

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

/**
 * @param {HTMLElement} element
 * @param {Record<string, string>} styles
 * @param {string[]} keys
 */
function applyInlineStyleSubset(element, styles, keys) {
  for (const key of keys) {
    element.style[key] = styles[key] ?? "";
  }
}

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function captureInlineStyles() {
  if (savedStyles) {
    return;
  }
  savedStyles = {
    body: readInlineStyles(document.body, BODY_LOCK_KEYS),
    html: readInlineStyles(document.documentElement, HTML_LOCK_KEYS),
  };
}

function applyOverflowLock() {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function applyFixedLock() {
  const scrollbarWidth = getScrollbarWidth();
  applyOverflowLock();
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

/** @returns {ScrollLockMode} */
function resolveDesiredMode() {
  if (fixedLockCount > 0) {
    return "fixed";
  }
  return overflowLockCount > 0 ? "overflow" : "none";
}

function syncLockStyles() {
  const desired = resolveDesiredMode();
  if (desired === appliedMode) {
    return;
  }

  const wasFixed = appliedMode === "fixed";

  if (desired === "none") {
    if (savedStyles) {
      applyInlineStyles(document.body, savedStyles.body);
      applyInlineStyles(document.documentElement, savedStyles.html);
      savedStyles = null;
    }
    appliedMode = "none";
    if (wasFixed) {
      window.scrollTo(0, savedScrollY);
    }
    return;
  }

  captureInlineStyles();

  if (desired === "fixed") {
    savedScrollY = window.scrollY;
    applyFixedLock();
    appliedMode = "fixed";
    return;
  }

  if (wasFixed && savedStyles) {
    applyInlineStyleSubset(document.body, savedStyles.body, BODY_FIXED_KEYS);
  }
  applyOverflowLock();
  appliedMode = "overflow";
  if (wasFixed) {
    window.scrollTo(0, savedScrollY);
  }
}

/**
 * @param {() => void} release
 * @returns {() => void} идемпотентный unlock
 */
function createRelease(release) {
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    release();
    syncLockStyles();
  };
}

/**
 * Блокирует скролл страницы под модалкой. Вложенные вызовы безопасны (ref counter).
 *
 * @returns {() => void} unlock
 */
export function lockBodyScroll() {
  fixedLockCount += 1;
  syncLockStyles();
  return createRelease(() => {
    fixedLockCount = Math.max(0, fixedLockCount - 1);
  });
}

/**
 * Лёгкий lock для bottom-sheet с inputs/keyboard.
 * Без `position: fixed` на body — иначе mobile WebView ломает hit-testing после клавиатуры.
 *
 * @returns {() => void} unlock
 */
export function lockBodyScrollOverflowOnly() {
  overflowLockCount += 1;
  syncLockStyles();
  return createRelease(() => {
    overflowLockCount = Math.max(0, overflowLockCount - 1);
  });
}

/**
 * @param {HTMLElement} body
 */
function isStuckBodyLockStyle(body) {
  return body.style.position === "fixed" || body.style.overflow === "hidden";
}

/**
 * Сбрасывает залипший lock: модалка/drawer размонтировались без cleanup
 * (ошибка рендера, смена роута) → body `position:fixed` + контент уехал за viewport
 * = белый «замёрзший» экран до полной перезагрузки.
 */
export function releaseStaleBodyScrollIfIdle() {
  if (typeof document === "undefined") {
    return;
  }

  const hasModal = Boolean(document.querySelector('[aria-modal="true"]'));
  if (hasModal) {
    return;
  }

  const body = document.body;
  const leakedCounter = fixedLockCount > 0 || overflowLockCount > 0;
  if (!leakedCounter && !isStuckBodyLockStyle(body)) {
    return;
  }

  fixedLockCount = 0;
  overflowLockCount = 0;
  appliedMode = "none";
  savedStyles = null;
  body.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.paddingRight = "";
  document.documentElement.style.overflow = "";
}
