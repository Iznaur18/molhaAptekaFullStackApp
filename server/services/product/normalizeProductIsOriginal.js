import { AppError } from "../../errors/AppError.js";

export const PRODUCT_IS_ORIGINAL_REQUIRED_MESSAGE =
  "Укажите, является ли товар оригиналом";

/**
 * @param {unknown} raw
 * @param {{ required?: boolean }} [options]
 * @returns {boolean | undefined}
 */
export const normalizeProductIsOriginal = (raw, { required = false } = {}) => {
  if (raw == null || raw === "") {
    if (required) {
      throw new AppError(400, PRODUCT_IS_ORIGINAL_REQUIRED_MESSAGE);
    }
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

  throw new AppError(400, PRODUCT_IS_ORIGINAL_REQUIRED_MESSAGE);
};
