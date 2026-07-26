import { resolveProductImageUrl } from "../../product/lib/resolveProductImageUrl.js";

/**
 * @param {import('../model/types.js').PriceOfferProductPreview | null | undefined} product
 * @returns {string | null}
 */
export function resolvePriceOfferProductImageUrl(product) {
  const url = resolveProductImageUrl(product);
  return url || null;
}
