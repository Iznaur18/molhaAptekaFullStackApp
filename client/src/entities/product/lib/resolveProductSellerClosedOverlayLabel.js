import { formatSellerClosedUntilLabel } from "@molha/api-contract";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {unknown} product
 * @returns {string}
 */
export function resolveProductSellerClosedOverlayLabel(product) {
  if (product == null || typeof product !== "object") {
    return PRODUCT_CARD_UI.SELLER_CLOSED_OVERLAY_FALLBACK;
  }

  const opensAt = product.sellerClosedOpensAt;
  if (typeof opensAt === "string" && opensAt.trim() !== "") {
    return formatSellerClosedUntilLabel(opensAt.trim());
  }

  return PRODUCT_CARD_UI.SELLER_CLOSED_OVERLAY_FALLBACK;
}
