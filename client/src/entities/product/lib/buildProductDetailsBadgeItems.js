import { PRODUCT_PRICE_MARKET_STATUS_UNKNOWN } from "@molha/api-contract";

import { PRODUCT_CARD_UI, PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { isProductOriginalBadgeVisible } from "./productIsOriginal.js";
import { resolveProductListingOriginPresentation } from "./productListingOrigin.js";
import { resolveProductPriceMarketStatusPresentation } from "./productPriceMarketStatus.js";
import { resolveProductAffiliateOffer } from "./resolveProductAffiliateOffer.js";

/**
 * @typedef {{
 *   key: string;
 *   label: string;
 * } & (
 *   | { kind: "original" }
 *   | { kind: "raffle" }
 *   | { kind: "affiliate" }
 *   | { kind: "listingOrigin"; origin: string | null; Icon: import("react").ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }> }
 *   | { kind: "priceMarket"; priceMarketStatus: string; backgroundColor: string; color: string }
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

  if (isProductOriginalBadgeVisible(product.productIsOriginal)) {
    items.push({
      key: "original",
      kind: "original",
      label: PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE,
    });
  }

  if (isProductRaffleParticipant(product)) {
    items.push({
      key: "raffle",
      kind: "raffle",
      label: PRODUCT_CARD_UI.RAFFLE_BADGE,
    });
  }

  const affiliate = resolveProductAffiliateOffer(product);
  if (affiliate.enabled) {
    items.push({
      key: "affiliate",
      kind: "affiliate",
      label: PRODUCT_DETAILS_MODAL_UI.AFFILIATE_BADGE(affiliate.percent),
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
    origin:
      typeof product.productListingOrigin === "string"
        ? product.productListingOrigin
        : null,
  });

  const priceMarket = resolveProductPriceMarketStatusPresentation(
    product.productPriceMarketStatus,
  );
  if (priceMarket.status !== PRODUCT_PRICE_MARKET_STATUS_UNKNOWN) {
    items.push({
      key: "price-market",
      kind: "priceMarket",
      label: priceMarket.label,
      priceMarketStatus: priceMarket.status,
      backgroundColor: priceMarket.backgroundColor,
      color: priceMarket.color,
    });
  }

  return sortProductDetailsBadgesByLabelLength(items);
}
