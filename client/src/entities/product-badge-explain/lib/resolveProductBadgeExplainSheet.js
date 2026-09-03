import {
  resolveListingOriginBadgeExplainKey,
  resolvePriceMarketBadgeExplainKey,
  resolveProductBadgeExplainContent,
} from "@izibuy/shared-lib";

import { PRODUCT_BADGE_EXPLAIN_UI } from "../../../shared/config/appUiCopy.js";
import { resolveSafeDealBadgeCopy } from "../../seller-safe-deal/lib/safeDealBadgeCopy.js";

/**
 * @param {string | null | undefined} badgeKey
 * @returns {string}
 */
export function resolveProductBadgeExplainFallbackDescription(badgeKey) {
  // Текст зависит от того, работает ли заморозка денег, поэтому берём его из
  // общего места, а не из статичной таблицы.
  if (badgeKey === "safe_deal") {
    return resolveSafeDealBadgeCopy().EXPLAIN;
  }
  const fallbacks = PRODUCT_BADGE_EXPLAIN_UI.FALLBACK;
  if (badgeKey && Object.prototype.hasOwnProperty.call(fallbacks, badgeKey)) {
    return fallbacks[badgeKey];
  }
  return fallbacks.listing_origin_unspecified;
}

/**
 * @param {{
 *   kind: string;
 *   label: string;
 *   origin?: string | null;
 *   priceMarketStatus?: string | null;
 * }} item
 * @returns {{
 *   title: string;
 *   badgeKey: import("@izibuy/shared-lib").ProductBadgeExplainKey | null;
 *   fallbackKey: string;
 * } | null}
 */
export function resolveProductDetailsBadgeExplainRequest(item) {
  if (!item?.kind || !item.label) {
    return null;
  }

  if (item.kind === "original") {
    return { title: item.label, badgeKey: "original", fallbackKey: "original" };
  }
  if (item.kind === "safeDeal") {
    return { title: item.label, badgeKey: "safe_deal", fallbackKey: "safe_deal" };
  }
  if (item.kind === "raffle") {
    return { title: item.label, badgeKey: "raffle", fallbackKey: "raffle" };
  }
  if (item.kind === "affiliate") {
    return { title: item.label, badgeKey: "affiliate", fallbackKey: "affiliate" };
  }
  if (item.kind === "auction") {
    return { title: item.label, badgeKey: "auction", fallbackKey: "auction" };
  }
  if (item.kind === "installment") {
    return {
      title: item.label,
      badgeKey: "installment",
      fallbackKey: "installment",
    };
  }
  if (item.kind === "wholesale") {
    return { title: item.label, badgeKey: "wholesale", fallbackKey: "wholesale" };
  }
  if (item.kind === "rental") {
    return { title: item.label, badgeKey: "rental", fallbackKey: "rental" };
  }
  if (item.kind === "promo") {
    return { title: item.label, badgeKey: "promo", fallbackKey: "promo" };
  }
  if (item.kind === "nearDistance") {
    return {
      title: item.label,
      badgeKey: "near_distance",
      fallbackKey: "near_distance",
    };
  }
  if (item.kind === "listingOrigin") {
    const badgeKey = resolveListingOriginBadgeExplainKey(item.origin);
    return {
      title: item.label,
      badgeKey,
      fallbackKey: badgeKey ?? "listing_origin_unspecified",
    };
  }
  if (item.kind === "priceMarket") {
    const badgeKey = resolvePriceMarketBadgeExplainKey(item.priceMarketStatus);
    if (!badgeKey) {
      return null;
    }
    return { title: item.label, badgeKey, fallbackKey: badgeKey };
  }
  if (item.kind === "discount") {
    return { title: item.label, badgeKey: "discount", fallbackKey: "discount" };
  }
  if (item.kind === "loyalty") {
    return { title: item.label, badgeKey: "loyalty", fallbackKey: "loyalty" };
  }
  return null;
}

/**
 * @param {{
 *   badgeKey: import("@izibuy/shared-lib").ProductBadgeExplainKey | null;
 *   fallbackKey: string;
 *   adminRow?: { imageUrl?: string | null; description?: string | null } | null;
 * }} input
 */
export function resolveProductBadgeExplainSheetContent(input) {
  const fallbackDescription = resolveProductBadgeExplainFallbackDescription(
    input.fallbackKey,
  );
  if (!input.badgeKey) {
    return {
      description: fallbackDescription,
      imageUrl: null,
    };
  }
  return resolveProductBadgeExplainContent({
    badgeKey: input.badgeKey,
    adminRow: input.adminRow,
    fallbackDescription,
  });
}
