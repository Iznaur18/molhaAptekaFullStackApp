import { AppError } from "../../errors/AppError.js";
import {
  normalizeProductOutOfStockLabel as normalizeProductOutOfStockLabelFromContract,
  productOutOfStockLabelFieldSchema,
} from "@molha/api-contract";

export const PRODUCT_OUT_OF_STOCK_LABEL_INVALID_MESSAGE =
  "Некорректная надпись для карточки «нет в наличии»";

/**
 * @param {unknown} raw
 * @returns {string | undefined}
 */
export const normalizeProductOutOfStockLabel = (raw) => {
  if (raw == null || raw === "") {
    return undefined;
  }

  const parsed = productOutOfStockLabelFieldSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError(400, PRODUCT_OUT_OF_STOCK_LABEL_INVALID_MESSAGE);
  }

  return normalizeProductOutOfStockLabelFromContract(parsed.data);
};
