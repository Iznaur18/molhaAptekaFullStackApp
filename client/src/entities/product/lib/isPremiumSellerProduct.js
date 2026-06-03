import { isPremiumActive } from "../../user/lib/isPremiumActive.js";

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function isPremiumSellerProduct(product) {
  const seller = product.productSeller;
  if (seller == null || typeof seller !== "object") {
    return false;
  }
  return isPremiumActive(seller);
}

/**
 * Радужная обводка и бейдж — только публичный каталог.
 *
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   isMineMode?: boolean;
 *   isModerationQueue?: boolean;
 * }} options
 */
export function shouldShowPremiumProductCardChrome({
  product,
  isMineMode = false,
  isModerationQueue = false,
}) {
  if (isMineMode || isModerationQueue) {
    return false;
  }
  return isPremiumSellerProduct(product);
}
