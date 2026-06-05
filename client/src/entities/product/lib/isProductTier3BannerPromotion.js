import { PRODUCT_PROMOTION_TIER_BANNER } from "../lib/calculateProductPromotionPointsCost.js";
import { isCatalogPromotionActive } from "../lib/productPromotionStatus.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function isProductTier3BannerPromotion(product) {
  return (
    Number(product?.catalogPromotionTier) === PRODUCT_PROMOTION_TIER_BANNER &&
    isCatalogPromotionActive(product)
  );
}
