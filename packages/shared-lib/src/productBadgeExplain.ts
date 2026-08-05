/** CMS-слоты описаний бейджей деталей товара. SSOT: `@molha/api-contract`. */

import {
  PRODUCT_BADGE_EXPLAIN_KEY_VALUES,
  PRODUCT_BADGE_EXPLAIN_DESCRIPTION_MAX_LENGTH,
} from "@molha/api-contract";

export {
  PRODUCT_BADGE_EXPLAIN_KEY_VALUES,
  PRODUCT_BADGE_EXPLAIN_DESCRIPTION_MAX_LENGTH,
};

export type ProductBadgeExplainKey =
  | "original"
  | "raffle"
  | "affiliate"
  | "listing_origin_own"
  | "listing_origin_resale"
  | "listing_origin_manufacturer"
  | "price_market_above"
  | "price_market_at"
  | "price_market_below"
  | "discount"
  | "loyalty"
  | "auction"
  | "installment"
  | "wholesale"
  | "near_distance";

export type ProductBadgeExplainAdminRow = {
  badgeKey: ProductBadgeExplainKey;
  imageUrl?: string | null;
  description?: string | null;
};

export type ProductBadgeExplainResolved = {
  badgeKey: ProductBadgeExplainKey;
  description: string;
  imageUrl: string | null;
};

export function isProductBadgeExplainKey(
  value: unknown,
): value is ProductBadgeExplainKey {
  return (
    typeof value === "string" &&
    (PRODUCT_BADGE_EXPLAIN_KEY_VALUES as readonly string[]).includes(value)
  );
}

/**
 * @param listingOrigin `own` | `resale` | `manufacturer` | unknown
 */
export function resolveListingOriginBadgeExplainKey(
  listingOrigin: unknown,
): ProductBadgeExplainKey | null {
  if (listingOrigin === "own") {
    return "listing_origin_own";
  }
  if (listingOrigin === "resale") {
    return "listing_origin_resale";
  }
  if (listingOrigin === "manufacturer") {
    return "listing_origin_manufacturer";
  }
  return null;
}

/**
 * @param priceMarketStatus `above_market` | `at_market` | `below_market` | …
 */
export function resolvePriceMarketBadgeExplainKey(
  priceMarketStatus: unknown,
): ProductBadgeExplainKey | null {
  if (priceMarketStatus === "above_market") {
    return "price_market_above";
  }
  if (priceMarketStatus === "at_market") {
    return "price_market_at";
  }
  if (priceMarketStatus === "below_market") {
    return "price_market_below";
  }
  return null;
}

export function resolveProductBadgeExplainContent(input: {
  badgeKey: ProductBadgeExplainKey;
  adminRow?: Pick<ProductBadgeExplainAdminRow, "imageUrl" | "description"> | null;
  fallbackDescription: string;
}): ProductBadgeExplainResolved {
  const adminDescription =
    typeof input.adminRow?.description === "string"
      ? input.adminRow.description.trim()
      : "";
  const adminImageUrl =
    typeof input.adminRow?.imageUrl === "string"
      ? input.adminRow.imageUrl.trim()
      : "";

  return {
    badgeKey: input.badgeKey,
    description: adminDescription || input.fallbackDescription,
    imageUrl: adminImageUrl || null,
  };
}
