import { resolveProductImageUrls } from "../../product/lib/resolveProductImageUrls.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../../product/model/productConstants.js";

/**
 * @param {import('../model/types.js').OrderLineItem} item
 * @returns {string}
 */
export function resolveOrderLineItemProductImageUrl(item) {
  const populated = item.productId;
  if (populated == null || typeof populated !== "object") {
    return PRODUCT_IMAGE_PLACEHOLDER_URL;
  }

  const urls = resolveProductImageUrls(
    /** @type {import('../../product/model/types.js').ProductFromApi} */ (populated),
  );
  return urls[0] ?? PRODUCT_IMAGE_PLACEHOLDER_URL;
}
