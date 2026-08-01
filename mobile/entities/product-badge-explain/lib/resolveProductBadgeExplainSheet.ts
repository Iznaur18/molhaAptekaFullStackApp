import {
  resolveListingOriginBadgeExplainKey,
  resolvePriceMarketBadgeExplainKey,
  resolveProductBadgeExplainContent,
  type ProductBadgeExplainKey,
} from "@izibuy/shared-lib";

import { PRODUCT_BADGE_EXPLAIN_UI } from "@/shared/config";

export const resolveProductBadgeExplainFallbackDescription = (
  badgeKey: string | null | undefined,
): string => {
  const fallbacks = PRODUCT_BADGE_EXPLAIN_UI.FALLBACK;
  if (badgeKey && Object.prototype.hasOwnProperty.call(fallbacks, badgeKey)) {
    return fallbacks[badgeKey as keyof typeof fallbacks];
  }
  return fallbacks.listing_origin_unspecified;
};

export type ProductBadgeExplainRequest = {
  title: string;
  badgeKey: ProductBadgeExplainKey | null;
  fallbackKey: string;
};

export const resolveProductDetailsBadgeExplainRequest = (item: {
  kind: string;
  label: string;
  origin?: string | null;
  priceMarketStatus?: string | null;
}): ProductBadgeExplainRequest | null => {
  if (!item?.kind || !item.label) {
    return null;
  }

  if (item.kind === "original") {
    return { title: item.label, badgeKey: "original", fallbackKey: "original" };
  }
  if (item.kind === "raffle") {
    return { title: item.label, badgeKey: "raffle", fallbackKey: "raffle" };
  }
  if (item.kind === "affiliate") {
    return { title: item.label, badgeKey: "affiliate", fallbackKey: "affiliate" };
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
};

export const resolveProductBadgeExplainSheetContent = (input: {
  badgeKey: ProductBadgeExplainKey | null;
  fallbackKey: string;
  adminRow?: { imageUrl?: string | null; description?: string | null } | null;
}) => {
  const fallbackDescription = resolveProductBadgeExplainFallbackDescription(
    input.fallbackKey,
  );
  if (!input.badgeKey) {
    return {
      description: fallbackDescription,
      imageUrl: null as string | null,
    };
  }
  return resolveProductBadgeExplainContent({
    badgeKey: input.badgeKey,
    adminRow: input.adminRow,
    fallbackDescription,
  });
};
