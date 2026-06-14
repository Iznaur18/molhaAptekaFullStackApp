import { useMemo } from "react";

import { resolveAuctionUiState } from "./resolveAuctionUiState";
import { resolveProductDiscountPercent } from "./computeProductDiscountPercent";
import { isCatalogPromotionActive } from "./productPromotionStatus";
import { shouldShowProductLoyaltyPointsBadge } from "./shouldShowProductLoyaltyPointsBadge";

const PROMOTION_TIER_GOLD = 1;
const PROMOTION_TIER_TOP = 2;
const PROMOTION_TIER_BANNER = 3;

type ChromeProduct = Record<string, unknown>;

export const useProductCardChromeFlags = (product: ChromeProduct) => {
  return useMemo(() => {
    const isPromotionActive = isCatalogPromotionActive(product);
    const promotionTier = Number(product.catalogPromotionTier) || 0;
    const { auctionActive } = resolveAuctionUiState(product);
    const discountPercent = resolveProductDiscountPercent(product);
    const showDiscountBadge = discountPercent != null && discountPercent > 0;
    const showLoyaltyPointsBadge = shouldShowProductLoyaltyPointsBadge(product);

    return {
      discountPercent,
      showDiscountBadge,
      showLoyaltyPointsBadge,
      showPromotionBoostBadge: isPromotionActive && promotionTier === PROMOTION_TIER_GOLD,
      showPromotionTopBadge: isPromotionActive && promotionTier === PROMOTION_TIER_TOP,
      showPromotionBannerBadge: isPromotionActive && promotionTier === PROMOTION_TIER_BANNER,
      showAuctionBadge: auctionActive,
      showInstallmentBadge: product.productInstallmentEnabled === true,
      showRaffleBadge:
        Boolean(product.activeRaffleId) && Boolean(product.raffleParticipationEnabledAt),
    };
  }, [product]);
};
