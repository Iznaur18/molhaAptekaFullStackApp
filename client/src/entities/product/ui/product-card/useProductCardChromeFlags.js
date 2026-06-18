import { useMemo } from "react";

import { SHOW_ADD_TO_CART_ON_CATALOG_CARD } from "../../lib/catalogCardPurchasePolicy.js";
import { isProductRaffleParticipant } from "../../../raffle/lib/isProductRaffleParticipant.js";
import { resolveAuctionUiState } from "../../lib/resolveAuctionUiState.js";
import { shouldShowPremiumProductCardChrome } from "../../lib/isPremiumSellerProduct.js";
import { isCatalogPromotionActive } from "../../lib/productPromotionStatus.js";
import {
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "../../lib/calculateProductPromotionPointsCost.js";
import { resolveProductDiscountPercent } from "../../lib/computeProductDiscountPercent.js";
import { shouldShowProductLoyaltyPointsBadge } from "../../lib/shouldShowProductLoyaltyPointsBadge.js";
import { isCurrentUserProductSeller } from "../../lib/isCurrentUserProductSeller.js";

/**
 * @param {Parameters<import('../ProductCard.jsx').ProductCard>[0]} props
 * @param {string} currentUserId
 */
export function useProductCardChromeFlags(props, currentUserId) {
  const {
    product,
    isMineMode = false,
    highlightCatalogPromotion = false,
    promotionFullWidth = false,
    highlightRaffleProduct = false,
    isModerationQueue = false,
    onDeleteProduct,
  } = props;

  const isPromotionActive = isCatalogPromotionActive(product);
  const promotionTier = Number(product.catalogPromotionTier) || 0;
  const { auctionActive } = resolveAuctionUiState(product);
  const discountPercent = resolveProductDiscountPercent(product);
  const showDiscountBadge = discountPercent != null && discountPercent > 0;
  const showLoyaltyPointsBadge = shouldShowProductLoyaltyPointsBadge(product);

  const showPremiumChrome = shouldShowPremiumProductCardChrome({
    product,
    isMineMode,
    isModerationQueue,
  });
  const showTier3BannerPreview =
    isMineMode &&
    promotionFullWidth &&
    isPromotionActive &&
    promotionTier === PRODUCT_PROMOTION_TIER_BANNER;
  const showPromotionChrome =
    (highlightCatalogPromotion &&
      !isMineMode &&
      !isModerationQueue &&
      isPromotionActive &&
      promotionTier > 0) ||
    showTier3BannerPreview;
  const showPromotionBoostBadge =
    showPromotionChrome && promotionTier === PRODUCT_PROMOTION_TIER_GOLD;
  const showPromotionTopBadge =
    showPromotionChrome && promotionTier === PRODUCT_PROMOTION_TIER_TOP;
  const showPromotionBannerBadge =
    showPromotionChrome &&
    promotionTier === PRODUCT_PROMOTION_TIER_BANNER &&
    !(isMineMode && isPromotionActive);
  const showRaffleBadge = !isModerationQueue && isProductRaffleParticipant(product);
  const showAuctionBadge = !isModerationQueue && auctionActive;
  const showInstallmentBadge =
    !isModerationQueue && product.productInstallmentEnabled === true;
  const showBannerLayout =
    promotionFullWidth &&
    isPromotionActive &&
    promotionTier === PRODUCT_PROMOTION_TIER_BANNER;
  const showImageOverlayBadges =
    !showBannerLayout && (showDiscountBadge || showLoyaltyPointsBadge);
  const showWishlistToggle = !isMineMode && !isModerationQueue;
  const showRaffleParticipantChrome =
    (highlightRaffleProduct || showRaffleBadge) && !isMineMode && !isModerationQueue;

  const showAddToCartButton =
    SHOW_ADD_TO_CART_ON_CATALOG_CARD &&
    !isModerationQueue &&
    product.productIsAvailable !== false &&
    product._id != null &&
    !isCurrentUserProductSeller(product, currentUserId);

  const hasSellerToolbar = onDeleteProduct != null;
  const showFooterActions =
    (isModerationQueue && props.moderationActions != null) ||
    (!showBannerLayout && hasSellerToolbar) ||
    (showAddToCartButton && !showBannerLayout);
  const showBannerActions =
    showBannerLayout && (showAddToCartButton || hasSellerToolbar);

  const cardClassName = useMemo(
    () =>
      [
        "product-card",
        showRaffleParticipantChrome ? "product-card--raffle-participant" : "",
        showBannerLayout ? "product-card--banner-layout" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [showBannerLayout, showRaffleParticipantChrome],
  );

  const frameClassName = useMemo(
    () =>
      [
        showPromotionChrome ? "product-card-promotion-frame" : "",
        showPromotionChrome && promotionTier === 1
          ? "product-card-promotion-frame--tier-1"
          : "",
        showPromotionChrome && promotionTier === 2
          ? "product-card-promotion-frame--tier-2"
          : "",
        showPromotionChrome && promotionTier === 3
          ? "product-card-promotion-frame--tier-3"
          : "",
        promotionFullWidth ? "product-card-promotion-frame--full-width" : "",
        showPremiumChrome ? "product-card-premium-frame" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [promotionFullWidth, promotionTier, showPremiumChrome, showPromotionChrome],
  );

  return {
    isPromotionActive,
    promotionTier,
    discountPercent,
    showDiscountBadge,
    showLoyaltyPointsBadge,
    showPromotionBoostBadge,
    showPromotionTopBadge,
    showPromotionBannerBadge,
    showRaffleBadge,
    showAuctionBadge,
    showInstallmentBadge,
    showBannerLayout,
    showImageOverlayBadges,
    showWishlistToggle,
    showAddToCartButton,
    showFooterActions,
    showBannerActions,
    showPromotionChrome,
    showPremiumChrome,
    cardClassName,
    frameClassName,
  };
}
