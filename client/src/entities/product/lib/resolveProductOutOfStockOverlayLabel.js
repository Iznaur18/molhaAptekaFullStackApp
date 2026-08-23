import {
  PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON,
  normalizeProductOutOfStockLabel,
} from "@molha/api-contract";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import("../model/types.js").ProductFromApi | Record<string, unknown> | null | undefined} product
 */
export function resolveProductOutOfStockOverlayLabel(product) {
  const label = normalizeProductOutOfStockLabel(product?.productOutOfStockLabel);
  if (label === PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON) {
    return PRODUCT_CARD_UI.OUT_OF_STOCK_OVERLAY_COMING_SOON;
  }
  return PRODUCT_CARD_UI.OUT_OF_STOCK_OVERLAY;
}
