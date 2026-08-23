import {
  PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON,
  normalizeProductOutOfStockLabel,
} from "@molha/api-contract";

import { PRODUCT_CARD_UI } from "@/shared/config";

export const resolveProductOutOfStockOverlayLabel = (product: unknown): string => {
  const source = product as { productOutOfStockLabel?: unknown } | null | undefined;
  const label = normalizeProductOutOfStockLabel(source?.productOutOfStockLabel);
  if (label === PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON) {
    return PRODUCT_CARD_UI.OUT_OF_STOCK_OVERLAY_COMING_SOON;
  }
  return PRODUCT_CARD_UI.OUT_OF_STOCK_OVERLAY;
};
