import { useMemo } from "react";

import { SHOW_ADD_TO_CART_ON_CATALOG_CARD } from "../../lib/catalogCardPurchasePolicy.js";
import { isProductOutOfStock } from "../../lib/isProductOutOfStock.js";
import { isProductSellerClosedNow } from "@molha/api-contract";
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
import { formatProductWholesaleBadgeLabel } from "@izibuy/shared-lib";

import { PRODUCT_FLASH_SALE_UI } from "../../../../shared/config/appUiCopy.js";
import { isProductFlashSaleActive } from "../../lib/isProductFlashSaleActive.js";

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
  // Бейдж/рамка — везде при активном промо. Поднятие в sort и full-width L3 —
  // только в регионе продажи (viewerRegionCode на сетке/сервере).
  const showPromotionChrome =
    highlightCatalogPromotion &&
    !isMineMode &&
    !isModerationQueue &&
    isPromotionActive &&
    promotionTier > 0;
  const showPromotionBoostBadge =
    showPromotionChrome && promotionTier === PRODUCT_PROMOTION_TIER_GOLD;
  const showPromotionTopBadge =
    showPromotionChrome && promotionTier === PRODUCT_PROMOTION_TIER_TOP;
  const showPromotionBannerBadge =
    showPromotionChrome && promotionTier === PRODUCT_PROMOTION_TIER_BANNER;
  const showRaffleBadge = !isModerationQueue && isProductRaffleParticipant(product);
  const showAuctionBadge = !isModerationQueue && auctionActive;
  const showInstallmentBadge =
    !isModerationQueue && product.productInstallmentEnabled === true;
  const affiliatePercent = Math.floor(Number(product.affiliatePercent) || 0);
  const showAffiliateBadge =
    !isModerationQueue &&
    product.affiliateEnabled === true &&
    affiliatePercent > 0;
  const wholesaleBadgeLabel = !isModerationQueue
    ? formatProductWholesaleBadgeLabel(product)
    : null;
  const showWholesaleBadge = wholesaleBadgeLabel != null;
  const showFlashSaleBadge =
    !isModerationQueue && isProductFlashSaleActive(product);
  const flashSaleBadgeLabel = showFlashSaleBadge
    ? PRODUCT_FLASH_SALE_UI.CATALOG_BADGE(discountPercent)
    : null;
  const showBannerLayout =
    promotionFullWidth &&
    isPromotionActive &&
    promotionTier === PRODUCT_PROMOTION_TIER_BANNER;
  const showImageOverlayBadges =
    !showBannerLayout && (showDiscountBadge || showLoyaltyPointsBadge);
  const showWishlistToggle =
    !isMineMode && !isModerationQueue && !isProductSellerClosedNow(product);
  const showRaffleParticipantChrome =
    (highlightRaffleProduct || showRaffleBadge) && !isMineMode && !isModerationQueue;
  const showOutOfStockChrome =
    !isModerationQueue && isProductOutOfStock(product);
  const showSellerClosedChrome =
    !isModerationQueue && !showOutOfStockChrome && isProductSellerClosedNow(product);

  const showAddToCartButton =
    SHOW_ADD_TO_CART_ON_CATALOG_CARD &&
    !isModerationQueue &&
    product.productIsAvailable !== false &&
    product._id != null &&
    !isCurrentUserProductSeller(product, currentUserId) &&
    !isProductSellerClosedNow(product);

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
        showOutOfStockChrome ? "product-card--out-of-stock" : "",
        showSellerClosedChrome ? "product-card--seller-closed" : "",
        showRaffleParticipantChrome ? "product-card--raffle-participant" : "",
        showBannerLayout ? "product-card--banner-layout" : "",
        isModerationQueue ? "product-card--list" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [isModerationQueue, showBannerLayout, showOutOfStockChrome, showSellerClosedChrome, showRaffleParticipantChrome],
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
    showAffiliateBadge,
    affiliatePercent,
    showWholesaleBadge,
    wholesaleBadgeLabel,
    showFlashSaleBadge,
    flashSaleBadgeLabel,
    showBannerLayout,
    showImageOverlayBadges,
    showWishlistToggle,
    showAddToCartButton,
    showFooterActions,
    showBannerActions,
    showPromotionChrome,
    showPremiumChrome,
    showOutOfStockChrome,
    showSellerClosedChrome,
    cardClassName,
    frameClassName,
  };
};
