import {
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "@/entities/product/lib/calculateProductPromotionPointsCost";
import { isCatalogPromotionActive } from "@/entities/product/lib/productPromotionStatus";
import { PRODUCT_CARD_UI } from "@/shared/config";

export type ProductPromotionCompactBadgeTier = "boost" | "top" | "banner";

export type ProductPromotionCompactBadge = {
  label: string;
  tier: ProductPromotionCompactBadgeTier;
};

export const resolveProductPromotionCompactBadge = (
  product: Record<string, unknown>,
): ProductPromotionCompactBadge | null => {
  if (!isCatalogPromotionActive(product)) {
    return null;
  }

  const tier = Number(product.catalogPromotionTier) || PRODUCT_PROMOTION_TIER_GOLD;

  if (tier === PRODUCT_PROMOTION_TIER_TOP) {
    return { label: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE, tier: "top" };
  }

  if (tier === PRODUCT_PROMOTION_TIER_BANNER) {
    return { label: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE, tier: "banner" };
  }

  return { label: PRODUCT_CARD_UI.PROMOTED_BADGE, tier: "boost" };
};
