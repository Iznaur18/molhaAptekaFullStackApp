import {
  isProductPurchaseBlockedBySeller,
  isProductSellerClosedNow,
} from "@molha/api-contract";

import { isProductOutOfStock } from "@/entities/product/lib/isProductOutOfStock";
import type { UserProfileThumbItem } from "@/entities/user/model/userProfileThumbTypes";

export function isProfileProductThumbUnavailable(
  item: UserProfileThumbItem,
  options: { isSelf?: boolean } = {},
): boolean {
  const { isSelf = false } = options;

  if (!item.viewable || item.product == null) {
    return true;
  }

  if (isSelf) {
    return false;
  }

  const product = item.product as Record<string, unknown>;

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
