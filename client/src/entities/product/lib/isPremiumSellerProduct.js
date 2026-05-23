import { USER_ROLE_ADMIN } from "../../user/model/userConstants.js";

/**
 * @param {import('../model/types.js').ProductFromApi} product
 */
export function isPremiumSellerProduct(product) {
  const seller = product.productSeller;
  if (seller == null || typeof seller !== "object") {
    return false;
  }
  if (seller.userRole === USER_ROLE_ADMIN) {
    return false;
  }
  return Boolean(seller.isPremiumUser);
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
