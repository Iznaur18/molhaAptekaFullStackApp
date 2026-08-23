import { AppError } from "../../errors/AppError.js";

export const PRODUCT_OUT_OF_STOCK_INVALID_MESSAGE =
  "Некорректный признак «Нет в наличии»";

/**
 * @param {unknown} raw
 * @returns {boolean | undefined}
 */
export const normalizeProductOutOfStock = (raw) => {
  if (raw == null || raw === "") {
    return undefined;
  }

  if (typeof raw === "boolean") {
    return raw;
  }

  if (raw === "true" || raw === 1 || raw === "1") {
    return true;
  }

  if (raw === "false" || raw === 0 || raw === "0") {
    return false;
  }

  throw new AppError(400, PRODUCT_OUT_OF_STOCK_INVALID_MESSAGE);
};
