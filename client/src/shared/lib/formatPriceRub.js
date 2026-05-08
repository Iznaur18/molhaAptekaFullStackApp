import { COMMON_UI } from "../config/appUiCopy.js";

const RUBLE_FORMAT = new Intl.NumberFormat(COMMON_UI.LOCALE_RU, {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

/**
 * @param {number | null | undefined} value
 * @returns {string}
 */
export const formatPriceRub = (value) =>
  typeof value === "number" && Number.isFinite(value)
    ? RUBLE_FORMAT.format(value)
    : COMMON_UI.EM_DASH;
