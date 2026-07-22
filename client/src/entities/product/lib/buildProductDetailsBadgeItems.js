import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { resolveProductListingOriginPresentation } from "./productListingOrigin.js";

/**
 * @typedef {{
 *   key: string;
 *   label: string;
 * } & (
 *   | { kind: "raffle" }
 *   | { kind: "listingOrigin"; Icon: import("react").ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }> }
 * )} ProductDetailsBadgeItem
 */

/**
 * @template {{ key: string; label: string }} T
 * @param {readonly T[]} items
 * @returns {T[]}
 */
export function sortProductDetailsBadgesByLabelLength(items) {
  return [...items].sort((left, right) => {
    const byLength = left.label.length - right.label.length;
    if (byLength !== 0) {
      return byLength;
    }
    return left.key.localeCompare(right.key);
  });
}

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 * }} input
 * @returns {ProductDetailsBadgeItem[]}
 */
export function buildProductDetailsBadgeItems({ product }) {
  /** @type {ProductDetailsBadgeItem[]} */
  const items = [];

  if (isProductRaffleParticipant(product)) {
    items.push({
      key: "raffle",
      kind: "raffle",
      label: PRODUCT_CARD_UI.RAFFLE_BADGE,
    });
  }

  const listingOrigin = resolveProductListingOriginPresentation(
    product.productListingOrigin,
  );
  items.push({
    key: "listing-origin",
    kind: "listingOrigin",
    Icon: listingOrigin.Icon,
    label: listingOrigin.label,
  });

  return sortProductDetailsBadgesByLabelLength(items);
}
