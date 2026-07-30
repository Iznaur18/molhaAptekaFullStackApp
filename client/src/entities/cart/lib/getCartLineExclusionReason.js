import { isCurrentUserProductSeller } from "../../product/lib/isCurrentUserProductSeller.js";

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

  if (isCurrentUserProductSeller(line.product, currentUserId)) {
    return "own_product";
  }

  const pickupOn = line.product?.productPickupEnabled !== false;
  if (pickupOn) {
    const pickup = String(line.product?.productPickupAddress ?? "").trim();
    if (!pickup) {
      return "missing_pickup";
    }
  }

  return null;
}
