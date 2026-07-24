import {
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "./calculateProductPromotionPointsCost.js";
import { isCatalogPromotionActive } from "./productPromotionStatus.js";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {import('../model/types.js').ProductFromApi} product
 * @returns {{ label: string; tier: "boost" | "top" | "banner" } | null}
 */
export function resolveProductPromotionCompactBadge(product) {
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
}
