import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
} from "../model/productConstants.js";

/**
 * @param {{ isPremiumUser?: boolean } | null | undefined} user
 */
export function getSellerProductsLimit(user) {
  return user?.isPremiumUser
    ? SELLER_PRODUCTS_LIMIT_PREMIUM
    : SELLER_PRODUCTS_LIMIT_REGULAR;
}

/**
 * @param {number | null | undefined} used
 * @param {number} limit
 */
export function formatSellerProductsQuota(used, limit) {
  const usedLabel = used == null ? "—" : String(used);
  return `${usedLabel} / ${limit}`;
}
