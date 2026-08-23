import { isCurrentUserProductSeller } from "@/entities/product/lib/isCurrentUserProductSeller";
import { productPickupLocationsFromProduct } from "@molha/api-contract";

import type { CartLine } from "./selectCartLines";

export type CartLineExclusionReason =
  | "missing"
  | "unavailable"
  | "own_product"
  | "missing_pickup";

export function getCartLineExclusionReason(
  line: CartLine,
  currentUserId?: string | null,
): CartLineExclusionReason | null {
  if (line.isMissing) {
    return "missing";
  }

  if (line.product?.productIsAvailable === false) {
    return "unavailable";
  }

  if (line.product?.productOutOfStock === true) {
    return "unavailable";
  }

  if (isCurrentUserProductSeller(line.product, currentUserId)) {
    return "own_product";
  }

  const pickupOn = line.product?.productPickupEnabled !== false;
  if (pickupOn) {
    const locations = productPickupLocationsFromProduct(line.product).filter(
      (item) => String(item.address ?? "").trim().length > 0,
    );
    if (locations.length === 0) {
      return "missing_pickup";
    }
  }

  return null;
}
