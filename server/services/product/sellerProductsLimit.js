import {
  isSellerProductsLimitUnlimited,
  resolveSellerProductsLimit,
  sellerProductsLimitErrorMessage,
} from "@molha/api-contract";

import { ProductModel } from "../../models/index.js";
import { isPremiumActive } from "../user/premiumAccess.js";

/**
 * Сколько товаров разрешено продавцу.
 *
 * Три источника, по убыванию силы: персональный лимит от админа, премиум,
 * обычный порог. Персональный сильнее премиума намеренно — админ назначает его
 * точечно и бессрочно, а премиум продавец покупает сам и на месяц; иначе
 * покупка премиума могла бы опустить выданный вручную лимит.
 *
 * @param {{
 *   isPremiumUser?: boolean;
 *   premiumExpiresAt?: Date | string | null;
 *   sellerProductsLimitOverride?: number | null;
 * } | null | undefined} user
 * @returns {number} `-1` — без ограничений
 */
export function getSellerProductsLimit(user) {
  return resolveSellerProductsLimit(user, isPremiumActive(user));
}

/**
 * @param {string} sellerId
 * @returns {Promise<number>}
 */
export async function countSellerProducts(sellerId) {
  return ProductModel.countDocuments({ productSeller: sellerId });
}

/**
 * @param {Parameters<typeof getSellerProductsLimit>[0]} user
 * @param {number} currentCount
 */
export function isSellerProductsLimitReached(user, currentCount) {
  const limit = getSellerProductsLimit(user);
  if (isSellerProductsLimitUnlimited(limit)) {
    return false;
  }
  return currentCount >= limit;
}

/**
 * @param {string} sellerId
 * @param {Parameters<typeof getSellerProductsLimit>[0]} user
 * @returns {Promise<{ ok: true } | { ok: false; message: string }>}
 */
export async function assertSellerCanCreateProduct(sellerId, user) {
  const limit = getSellerProductsLimit(user);
  if (isSellerProductsLimitUnlimited(limit)) {
    return { ok: true };
  }

  const count = await countSellerProducts(sellerId);
  if (count >= limit) {
    // Сообщение называет ДЕЙСТВУЮЩИЙ лимит: прежняя константа всегда говорила
    // про 50 и 100 и продавцу с персональным лимитом врала.
    return { ok: false, message: sellerProductsLimitErrorMessage(limit) };
  }
  return { ok: true };
}
