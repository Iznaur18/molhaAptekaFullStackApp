import { useMemo } from "react";

import { formatProductWholesaleBadgeLabel } from "@izibuy/shared-lib";

import { isProductRaffleParticipant } from "@/entities/raffle/lib/isProductRaffleParticipant";

import { resolveAuctionUiState } from "./resolveAuctionUiState";
import { resolveProductDiscountPercent } from "./computeProductDiscountPercent";
import { resolveProductCardPromotionChrome } from "./resolveProductCardPromotionChrome";
import { shouldShowPremiumProductCardChrome } from "./shouldShowPremiumProductCardChrome";
import { shouldShowProductLoyaltyPointsBadge } from "./shouldShowProductLoyaltyPointsBadge";

const PROMOTION_TIER_GOLD = 1;
const PROMOTION_TIER_TOP = 2;
const PROMOTION_TIER_BANNER = 3;

type ChromeProduct = Record<string, unknown>;

type ProductCardChromeOptions = {
  promotionFullWidth?: boolean;
  highlightCatalogPromotion?: boolean;
  highlightRaffleProduct?: boolean;
  isMineMode?: boolean;
  isModerationQueue?: boolean;
};

export const useProductCardChromeFlags = (
  product: ChromeProduct,
  {
    promotionFullWidth = false,
    highlightCatalogPromotion = true,
    highlightRaffleProduct = false,
    isMineMode = false,
    isModerationQueue = false,
  }: ProductCardChromeOptions = {},
) => {
  return useMemo(() => {
    const promotionChrome = resolveProductCardPromotionChrome(product, {
      highlightCatalogPromotion,
      isMineMode,
      isModerationQueue,
    });
    const { isPromotionActive, promotionTier, showPromotionChrome, promotionFrameTier } =
      promotionChrome;
    const showPremiumChrome = shouldShowPremiumProductCardChrome({
      product,
      isMineMode,
      isModerationQueue,
    });
    const { auctionActive } = resolveAuctionUiState(product);
    const discountPercent = resolveProductDiscountPercent(product);
    const showDiscountBadge = discountPercent != null && discountPercent > 0;
    const showLoyaltyPointsBadge = shouldShowProductLoyaltyPointsBadge(product);
    const showRaffleBadge = !isModerationQueue && isProductRaffleParticipant(product);
    const affiliatePercent = Math.floor(Number(product.affiliatePercent) || 0);
    const showAffiliateBadge =
      !isModerationQueue &&
      product.affiliateEnabled === true &&
      affiliatePercent > 0;
    const wholesaleBadgeLabel = formatProductWholesaleBadgeLabel(product);
    const showWholesaleBadge = !isModerationQueue && wholesaleBadgeLabel != null;
    const showRaffleParticipantChrome =
      (highlightRaffleProduct || showRaffleBadge) && !isMineMode && !isModerationQueue;

    const showBannerLayout =
      promotionFullWidth && isPromotionActive && promotionTier === PROMOTION_TIER_BANNER;

    return {
      discountPercent,
      showDiscountBadge,
      showLoyaltyPointsBadge,
      showPremiumChrome,
      showPromotionChrome,
      promotionFrameTier,
      showPromotionBoostBadge:
        showPromotionChrome && promotionTier === PROMOTION_TIER_GOLD,
      showPromotionTopBadge: showPromotionChrome && promotionTier === PROMOTION_TIER_TOP,
      showPromotionBannerBadge:
        showPromotionChrome &&
        promotionTier === PROMOTION_TIER_BANNER &&
        !showBannerLayout,
      showBannerLayout,
      showImageOverlayBadges: !showBannerLayout && (showDiscountBadge || showLoyaltyPointsBadge),
      showAuctionBadge: auctionActive,
      showInstallmentBadge: product.productInstallmentEnabled === true,
      showWholesaleBadge,
      wholesaleBadgeLabel,
      showRaffleBadge,
      showAffiliateBadge,
      affiliatePercent,
      showRaffleParticipantChrome,
    };
  }, [
    product,
    promotionFullWidth,
    highlightCatalogPromotion,
    highlightRaffleProduct,
    isMineMode,
    isModerationQueue,
  ]);
};
