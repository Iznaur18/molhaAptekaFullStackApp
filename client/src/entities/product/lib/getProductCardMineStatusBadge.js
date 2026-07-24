import { getProductPurchaseLimit } from "./getProductPurchaseLimit.js";
import { getProductPromotionTierLabel } from "./calculateProductPromotionPointsCost.js";
import {
  formatPromotionExpiresAt,
  isCatalogPromotionActive,
} from "./productPromotionStatus.js";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   isLoyaltyPointsOvercommitted?: boolean;
 * }} params
 * @returns {{ key: string; label: string; variant: string } | null}
 */
export function getProductCardMineStatusBadge({
  product,
  isLoyaltyPointsOvercommitted = false,
}) {
  const purchaseLimit = getProductPurchaseLimit(product);

  if (product.productIsAvailable === false || purchaseLimit === 0) {
    return {
      key: "hidden",
      label: PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE,
      variant: "hidden",
    };
  }

  if (isCatalogPromotionActive(product)) {
    const tierLabel = getProductPromotionTierLabel(
      Number(product.catalogPromotionTier) || 0,
    );
    const until = formatPromotionExpiresAt(product.catalogPromotionExpiresAt);
    return {
      key: "promotion-active",
      label: PRODUCT_CARD_UI.PROMOTED_TIER_UNTIL(tierLabel, until),
      variant: "promotionActive",
    };
  }

  if (isLoyaltyPointsOvercommitted) {
    return {
      key: "loyalty-overcommit",
      label: PRODUCT_CARD_UI.LOYALTY_POINTS_OVERCOMMITTED_BADGE,
      variant: "loyaltyOvercommit",
    };
  }

  return null;
}
