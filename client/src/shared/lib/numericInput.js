/** Разрешённые нецифровые клавиши (навигация, редактирование). */
const NON_CHAR_KEYS_ALLOWED = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

/**
 * Оставляет только цифры 0–9 (для целых полей: цена, остаток, баллы).
 * @param {unknown} raw
 * @returns {string}
 */
export function keepDigitsOnly(raw) {
  return String(raw ?? "").replace(/\D/g, "");
}

/**
 * Блокирует ввод символов, кроме цифр (paste обрабатывается через onChange + keepDigitsOnly).
 * @param {import('react').KeyboardEvent<HTMLInputElement>} event
 */
export function blockNonDigitKeyDown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  if (NON_CHAR_KEYS_ALLOWED.has(event.key)) {
    return;
  }
  if (event.key.length !== 1) {
    return;
  }
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

/** @type {import('react').InputHTMLAttributes<HTMLInputElement>} */
export const INTEGER_INPUT_FIELD_PROPS = {
  type: "text",
  inputMode: "numeric",
  autoComplete: "off",
  onKeyDown: blockNonDigitKeyDown,
};
