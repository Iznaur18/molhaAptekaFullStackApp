import {
  isProductPurchaseBlockedBySeller,
  isProductSellerClosedNow,
} from "@molha/api-contract";

import { isProductOutOfStock } from "../../product/lib/isProductOutOfStock.js";

/**
 * Превью в ленте профиля продавца: серое + disabled для покупателя.
 *
 * @param {import('../model/userProfileProductThumbTypes.js').UserProfileProductThumbItem} item
 * @param {{ isSelf?: boolean }} [options]
 */
export function isProfileProductThumbUnavailable(item, options = {}) {
  const { isSelf = false } = options;

  if (!item.viewable || item.product == null) {
    return true;
  }

  if (isSelf) {
    return false;
  }

  const product = item.product;

  if (isProductPurchaseBlockedBySeller(product)) {
    return true;
  }

  if (isProductOutOfStock(product)) {
    return true;
  }

  if (isProductSellerClosedNow(product)) {
    return true;
  }

  return false;
}
