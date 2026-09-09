import {
  isSellerProductsLimitUnlimited,
  resolveSellerProductsLimit,
  SELLER_PRODUCTS_LIMIT_UNLIMITED,
} from "@molha/api-contract";

import { isPremiumActive } from "../../user/lib/isPremiumActive.js";

/**
 * Сколько товаров разрешено продавцу (как `server/.../sellerProductsLimit.js`).
 *
 * @param {{
 *   isPremiumUser?: boolean;
 *   premiumExpiresAt?: string | Date | null;
 *   sellerProductsLimitOverride?: number | null;
 * } | null | undefined} user
 * @returns {number} `-1` — без ограничений
 */
export function getSellerProductsLimit(user) {
  return resolveSellerProductsLimit(user, isPremiumActive(user));
}

/**
 * @param {number | null | undefined} used
 * @param {number} limit
 */
export function formatSellerProductsQuota(used, limit) {
  const usedLabel = used == null ? "—" : String(used);
  if (isSellerProductsLimitUnlimited(limit)) {
    return `${usedLabel} / ∞`;
  }
  return `${usedLabel} / ${limit}`;
}

/**
 * @param {number | null | undefined} limit
 * @param {number | null | undefined} used
 */
export function isSellerProductsLimitReached(limit, used) {
  if (limit == null || used == null) {
    return false;
  }
  if (isSellerProductsLimitUnlimited(limit)) {
    return false;
  }
  return used >= limit;
}

export { SELLER_PRODUCTS_LIMIT_UNLIMITED, isSellerProductsLimitUnlimited };
