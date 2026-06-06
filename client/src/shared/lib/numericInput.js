import { COMMON_UI } from "../config/appUiCopy.js";

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

const INTEGER_GROUP_FORMAT = new Intl.NumberFormat(COMMON_UI.LOCALE_RU, {
  maximumFractionDigits: 0,
});

/** Максимум значащих цифр для цены в ₽ (совпадает с PRODUCT_PRICE_RUB_MAX). */
export const RUB_PRICE_INPUT_MAX_DIGITS = 9;

/**
 * Форматирует целое число с группировкой разрядов (ru-RU): `1000000` → `1 000 000`.
 * @param {unknown} raw
 * @returns {string}
 */
export function formatIntegerGroupRu(raw) {
  const digits = keepDigitsOnly(raw);
  if (!digits) {
    return "";
  }
  const value = Number(digits);
  if (!Number.isFinite(value)) {
    return "";
  }
  return INTEGER_GROUP_FORMAT.format(value);
}

/**
 * @param {unknown} raw
 * @param {number} [maxDigits]
 * @returns {string}
 */
export function formatRubPriceInput(raw, maxDigits = RUB_PRICE_INPUT_MAX_DIGITS) {
  let digits = keepDigitsOnly(raw);
  if (maxDigits > 0 && digits.length > maxDigits) {
    digits = digits.slice(0, maxDigits);
  }
  return formatIntegerGroupRu(digits);
}

/**
 * @param {unknown} raw
 * @returns {number | null}
 */
export function parseRubPriceInput(raw) {
  const digits = keepDigitsOnly(raw);
  if (!digits) {
    return null;
  }
  const value = Math.floor(Number(digits));
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
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
