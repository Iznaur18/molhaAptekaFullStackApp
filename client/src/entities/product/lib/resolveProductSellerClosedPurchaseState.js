import {
  isProductSellerClosedNow,
  formatSellerClosedUntilLabel,
} from "@molha/api-contract";

import { ADD_TO_CART_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {Record<string, unknown> | null | undefined} product
 * @returns {{ isSellerClosed: boolean; closedLabel: string }}
 */
export function resolveProductSellerClosedPurchaseState(product) {
  const isSellerClosed = isProductSellerClosedNow(product);
  const opensAt =
    product != null && typeof product === "object" && typeof product.sellerClosedOpensAt === "string"
      ? product.sellerClosedOpensAt.trim()
      : "";
  const closedLabel =
    opensAt.length > 0
      ? formatSellerClosedUntilLabel(opensAt)
      : ADD_TO_CART_UI.SELLER_CLOSED;

  return {
    isSellerClosed,
    closedLabel,
  };
}
