import {
  PRODUCT_PRICE_MARKET_STATUS_ABOVE,
  PRODUCT_PRICE_MARKET_STATUS_AT,
  PRODUCT_PRICE_MARKET_STATUS_BELOW,
  PRODUCT_PRICE_MARKET_STATUS_DEFAULT,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
  PRODUCT_PRICE_MARKET_STATUS_VALUES,
} from "@molha/api-contract";

import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";

export type ProductPriceMarketStatus =
  (typeof PRODUCT_PRICE_MARKET_STATUS_VALUES)[number];

/** Палитра блока 2 (фон / текст). */
export const PRODUCT_PRICE_MARKET_STATUS_COLORS = {
  [PRODUCT_PRICE_MARKET_STATUS_ABOVE]: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  [PRODUCT_PRICE_MARKET_STATUS_AT]: {
    backgroundColor: "#facc15",
    color: "#111827",
  },
  [PRODUCT_PRICE_MARKET_STATUS_BELOW]: {
    backgroundColor: "#22c55e",
    color: "#ffffff",
  },
  [PRODUCT_PRICE_MARKET_STATUS_UNKNOWN]: {
    backgroundColor: "#9ca3af",
    color: "#111827",
  },
} as const;

const LABELS: Record<ProductPriceMarketStatus, string> = {
  [PRODUCT_PRICE_MARKET_STATUS_ABOVE]:
    PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_ABOVE,
  [PRODUCT_PRICE_MARKET_STATUS_AT]: PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_AT,
  [PRODUCT_PRICE_MARKET_STATUS_BELOW]:
    PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_BELOW,
  [PRODUCT_PRICE_MARKET_STATUS_UNKNOWN]:
    PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_UNKNOWN,
};

export const isProductPriceMarketStatus = (
  value: unknown,
): value is ProductPriceMarketStatus =>
  typeof value === "string" &&
  (PRODUCT_PRICE_MARKET_STATUS_VALUES as readonly string[]).includes(value);

export const resolveProductPriceMarketStatus = (
  value: unknown,
): ProductPriceMarketStatus =>
  isProductPriceMarketStatus(value) ? value : PRODUCT_PRICE_MARKET_STATUS_DEFAULT;

export const resolveProductPriceMarketStatusPresentation = (value: unknown) => {
  const status = resolveProductPriceMarketStatus(value);
  return {
    status,
    label: LABELS[status],
    ...PRODUCT_PRICE_MARKET_STATUS_COLORS[status],
  };
};
