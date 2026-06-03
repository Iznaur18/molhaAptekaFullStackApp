import { isPremiumActive } from "../../user/lib/isPremiumActive.js";
import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
} from "../model/productConstants.js";

/**
 * @param {{ isPremiumUser?: boolean; premiumExpiresAt?: string | Date | null } | null | undefined} user
 */
export function getSellerProductsLimit(user) {
  return isPremiumActive(user)
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
