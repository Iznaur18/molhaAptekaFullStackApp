import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";

import type { CartLine } from "./selectCartLines";

export type CartLineExclusionReason =
  | "missing"
  | "unavailable"
  | "own_product"
  | "missing_pickup";

export const getCartLineExclusionReason = (
  line: CartLine,
  currentUserId?: string | null,
): CartLineExclusionReason | null => {
  if (line.isMissing) {
    return "missing";
  }

  if (line.product?.productIsAvailable === false) {
    return "unavailable";
  }

  if (isCurrentUserProductSeller(line.product, currentUserId)) {
    return "own_product";
  }

  const pickup = String(line.product?.productPickupAddress ?? "").trim();
  if (!pickup) {
    return "missing_pickup";
  }

  return null;
};
