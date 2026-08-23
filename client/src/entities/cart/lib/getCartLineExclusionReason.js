import { isCurrentUserProductSeller } from "../../product/lib/isCurrentUserProductSeller.js";
import { productPickupLocationsFromProduct } from "@molha/api-contract";

/**
 * @typedef {"missing" | "unavailable" | "own_product" | "missing_pickup"} CartLineExclusionReason
 */

/**
 * @param {import("./selectCartLines.js").CartLine} line
 * @param {string | null | undefined} currentUserId
 * @returns {CartLineExclusionReason | null}
 */
export function getCartLineExclusionReason(line, currentUserId) {
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
