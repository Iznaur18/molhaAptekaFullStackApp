import {
  formatCatalogNearDistanceLabel,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
} from "@molha/api-contract";
import { isProductRentalConfigured, isProductWholesaleConfigured } from "@izibuy/shared-lib";

import {
  PRODUCT_CARD_UI,
  PRODUCT_DETAILS_MODAL_UI,
  PRODUCT_RENTAL_UI,
  PRODUCT_WHOLESALE_UI,
} from "../../../shared/config/appUiCopy.js";
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
 *   | { kind: "auction" }
 *   | { kind: "installment" }
 *   | { kind: "wholesale" }
 *   | { kind: "rental" }
 *   | { kind: "nearDistance" }
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

  if (product.productAuctionEnabled === true) {
    items.push({
      key: "auction",
      kind: "auction",
      label: PRODUCT_CARD_UI.AUCTION_BADGE,
    });
  }

  if (product.productInstallmentEnabled === true) {
    items.push({
      key: "installment",
      kind: "installment",
      label: PRODUCT_CARD_UI.INSTALLMENT_BADGE,
    });
  }

  if (
    product.productWholesaleEnabled === true &&
    isProductWholesaleConfigured(product)
  ) {
    items.push({
      key: "wholesale",
      kind: "wholesale",
      label: PRODUCT_WHOLESALE_UI.DETAILS_OFFER_KICKER,
    });
  }

  if (
    product.productRentalEnabled === true &&
    isProductRentalConfigured(product)
  ) {
    items.push({
      key: "rental",
      kind: "rental",
      label: PRODUCT_RENTAL_UI.DETAILS_BADGE,
    });
  }

  const nearDistanceLabel = formatCatalogNearDistanceLabel(product.distanceMeters);
  if (nearDistanceLabel) {
    items.push({
      key: "near-distance",
      kind: "nearDistance",
      label: nearDistanceLabel,
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
