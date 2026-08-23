import { z } from "zod";

export const PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK = "out_of_stock";
export const PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON = "coming_soon";

/** @type {readonly ["out_of_stock", "coming_soon"]} */
export const PRODUCT_OUT_OF_STOCK_LABEL_VALUES = [
  PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK,
  PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON,
];

export const PRODUCT_OUT_OF_STOCK_LABEL_DEFAULT = PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK;

export const productOutOfStockLabelFieldSchema = z.enum(PRODUCT_OUT_OF_STOCK_LABEL_VALUES);

/**
 * @param {unknown} raw
 * @returns {typeof PRODUCT_OUT_OF_STOCK_LABEL_DEFAULT | typeof PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON}
 */
export const normalizeProductOutOfStockLabel = (raw) => {
  if (raw == null || raw === "") {
    return PRODUCT_OUT_OF_STOCK_LABEL_DEFAULT;
  }

  const value = String(raw).trim();
  if (PRODUCT_OUT_OF_STOCK_LABEL_VALUES.includes(value)) {
    return value;
  }

  return PRODUCT_OUT_OF_STOCK_LABEL_DEFAULT;
};
