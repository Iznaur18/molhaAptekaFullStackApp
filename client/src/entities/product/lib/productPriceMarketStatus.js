import {
  PRODUCT_PRICE_MARKET_STATUS_ABOVE,
  PRODUCT_PRICE_MARKET_STATUS_AT,
  PRODUCT_PRICE_MARKET_STATUS_BELOW,
  PRODUCT_PRICE_MARKET_STATUS_DEFAULT,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
  PRODUCT_PRICE_MARKET_STATUS_VALUES,
} from "@molha/api-contract";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {'above_market' | 'at_market' | 'below_market' | 'unknown'} ProductPriceMarketStatus */

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
};

const LABELS = {
  [PRODUCT_PRICE_MARKET_STATUS_ABOVE]: PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_ABOVE,
  [PRODUCT_PRICE_MARKET_STATUS_AT]: PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_AT,
  [PRODUCT_PRICE_MARKET_STATUS_BELOW]: PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_BELOW,
  [PRODUCT_PRICE_MARKET_STATUS_UNKNOWN]:
    PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_UNKNOWN,
};

/**
 * @param {unknown} value
 * @returns {value is ProductPriceMarketStatus}
 */
export function isProductPriceMarketStatus(value) {
  return (
    typeof value === "string" && PRODUCT_PRICE_MARKET_STATUS_VALUES.includes(value)
  );
}

/**
 * @param {unknown} value
 * @returns {ProductPriceMarketStatus}
 */
export function resolveProductPriceMarketStatus(value) {
  return isProductPriceMarketStatus(value) ? value : PRODUCT_PRICE_MARKET_STATUS_DEFAULT;
}

/**
 * @param {unknown} value
 */
export function resolveProductPriceMarketStatusPresentation(value) {
  const status = resolveProductPriceMarketStatus(value);
  return {
    status,
    label: LABELS[status],
    ...PRODUCT_PRICE_MARKET_STATUS_COLORS[status],
  };
}
