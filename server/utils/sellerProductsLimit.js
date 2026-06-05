import { ProductModel } from "../models/index.js";
import {
  SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE,
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
} from "../constants/productConstants.js";
import { isPremiumActive } from "./premiumAccess.js";

/**
 * @param {{ isPremiumUser?: boolean; premiumExpiresAt?: Date | string | null } | null | undefined} user
 */
export function getSellerProductsLimit(user) {
  return isPremiumActive(user)
    ? SELLER_PRODUCTS_LIMIT_PREMIUM
    : SELLER_PRODUCTS_LIMIT_REGULAR;
}

/**
 * @param {string} sellerId
 * @returns {Promise<number>}
 */
export async function countSellerProducts(sellerId) {
  return ProductModel.countDocuments({ productSeller: sellerId });
}

/**
 * @param {{ isPremiumUser?: boolean } | null | undefined} user
 * @param {number} currentCount
 */
export function isSellerProductsLimitReached(user, currentCount) {
  return currentCount >= getSellerProductsLimit(user);
}

/**
 * @param {string} sellerId
 * @param {{ isPremiumUser?: boolean } | null | undefined} user
 * @returns {Promise<{ ok: true } | { ok: false; message: string }>}
 */
export async function assertSellerCanCreateProduct(sellerId, user) {
  const count = await countSellerProducts(sellerId);
  if (isSellerProductsLimitReached(user, count)) {
    return { ok: false, message: SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE };
  }
  return { ok: true };
}
