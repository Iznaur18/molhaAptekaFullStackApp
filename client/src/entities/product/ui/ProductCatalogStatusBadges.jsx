import { formatCatalogNearDistanceLabel } from "@molha/api-contract";
import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import {
  getProductPromotionTierLabel,
} from "../lib/calculateProductPromotionPointsCost.js";
import { getProductPurchaseLimit } from "../lib/getProductPurchaseLimit.js";
import { formatPromotionExpiresAt } from "../lib/productPromotionStatus.js";
import { ProductCardStatusSlot } from "./product-card/ProductCardStatusSlot.jsx";
import { useProductCardChromeFlags } from "./product-card/useProductCardChromeFlags.js";
import { ProductLoyaltyPointsBadge } from "./ProductLoyaltyPointsBadge.jsx";

/**
 * @param {{
 *   product: import("../model/types.js").ProductFromApi;
 *   isMineMode?: boolean;
 *   isModerationQueue?: boolean;
 *   highlightCatalogPromotion?: boolean;
 *   isAuthorized?: boolean;
 *   isPremiumUser?: boolean;
 *   isLoyaltyPointsOvercommitted?: boolean;
 *   className?: string;
 *   showAuctionBadge?: boolean;
 *   showInstallmentBadge?: boolean;
 *   showLoyaltyPointsBadge?: boolean;
 * }} props
 */
export function ProductCatalogStatusBadges({
  product,
  isMineMode = false,
  isModerationQueue = false,
  highlightCatalogPromotion = true,
  isAuthorized = false,
  isPremiumUser = false,
  isLoyaltyPointsOvercommitted = false,
  className = "",
  showAuctionBadge = true,
  showInstallmentBadge = true,
  showLoyaltyPointsBadge = true,
}) {
  const flags = useProductCardChromeFlags(
    {
      product,
      isMineMode,
      isModerationQueue,
      highlightCatalogPromotion,
      promotionFullWidth: false,
      highlightRaffleProduct: false,
      isLoyaltyPointsOvercommitted,
    },
    null,
  );

  const purchaseLimit = getProductPurchaseLimit(product);
  const nearDistanceLabel = formatCatalogNearDistanceLabel(product.distanceMeters);
  const statusSlotVm = {
    isMineMode,
    isModerationQueue,
    product,
    purchaseLimit,
    isPromotionActive: flags.isPromotionActive,
    isLoyaltyPointsOvercommitted,
    getPromotionTierLabel: () => getProductPromotionTierLabel(flags.promotionTier),
    getPromotionUntil: () => formatPromotionExpiresAt(product.catalogPromotionExpiresAt),
  };

  const rootClassName = ["product-catalog-status-badges", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassName}
      role="group"
      aria-label={PRODUCT_CARD_UI.STATUS_BADGES_ARIA}
    >
      <ProductCardStatusSlot vm={statusSlotVm} />
      {nearDistanceLabel ? (
        <p className="product-card__near-badge" role="status">
          {nearDistanceLabel}
        </p>
      ) : null}
      {flags.showFlashSaleBadge && flags.flashSaleBadgeLabel ? (
        <p className="product-card__flash-sale-badge" role="status">
          {flags.flashSaleBadgeLabel}
        </p>
      ) : null}
      {flags.showRaffleBadge ? (
        <p className="product-card__raffle-badge" role="status">
          {PRODUCT_CARD_UI.RAFFLE_BADGE}
        </p>
      ) : null}
      {showAuctionBadge && flags.showAuctionBadge ? (
        <p className="product-card__auction-badge" role="status">
          {PRODUCT_CARD_UI.AUCTION_BADGE}
        </p>
      ) : null}
      {showInstallmentBadge && flags.showInstallmentBadge ? (
        <p className="product-card__installment-badge" role="status">
          {PRODUCT_CARD_UI.INSTALLMENT_BADGE}
        </p>
      ) : null}
      {flags.showWholesaleBadge && flags.wholesaleBadgeLabel ? (
        <p className="product-card__wholesale-badge" role="status">
          {flags.wholesaleBadgeLabel}
        </p>
      ) : null}
      {flags.showPromotionBoostBadge ? (
        <p className="product-card__promotion-boost-badge" role="status">
          {PRODUCT_CARD_UI.PROMOTED_BADGE}
        </p>
      ) : null}
      {flags.showPromotionTopBadge ? (
        <p className="product-card__promotion-top-badge" role="status">
          {PRODUCT_CARD_UI.PROMOTION_TOP_BADGE}
        </p>
      ) : null}
      {flags.showPromotionBannerBadge ? (
        <p className="product-card__promotion-banner-badge" role="status">
          {PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE}
        </p>
      ) : null}
      {showLoyaltyPointsBadge && flags.showLoyaltyPointsBadge ? (
        <ProductLoyaltyPointsBadge
          product={product}
          isAuthorized={isAuthorized}
          variant="inline"
        />
      ) : null}
    </div>
  );
}
