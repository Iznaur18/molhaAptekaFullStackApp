import {
  CURATED_PRODUCT_COMPACT_CARD_UI,
  PRODUCT_CARD_UI,
  PRODUCT_MODERATION_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatProductReviewRatingLine } from "../../product-review/lib/formatProductReviewRatingLine.js";
import {
  hasProductCatalogDiscount,
  resolveProductDiscountPercent,
} from "../lib/computeProductDiscountPercent.js";
import { buildMyProductCompactCardFeatureBadges } from "../lib/buildMyProductCompactCardFeatureBadges.js";
import {
  canSellerEditProduct,
  getProductModerationBadgeLabel,
  getProductModerationBadgeVariant,
  getProductModerationRejectionComment,
  isProductModerationPending,
} from "../lib/getProductModerationUi.js";
import { resolveProductPromotionCompactBadge } from "../lib/resolveProductPromotionCompactBadge.js";
import { resolveProductLoyaltyPointsPerUnit } from "../lib/resolveProductLoyaltyPointsPerUnit.js";
import { shouldShowProductLoyaltyPointsBadge } from "../lib/shouldShowProductLoyaltyPointsBadge.js";
import { isProductPromoteButtonDisabled } from "../lib/isProductPromoteButtonDisabled.js";
import { ProductPriceDisplay } from "./ProductPriceDisplay.jsx";
import { ProductCompactCardMediaThumb } from "./ProductCompactCardMediaThumb.jsx";
import { ProductCompactCardStatusPill } from "./ProductCompactCardStatusPill.jsx";

import "./MyProductCatalogCard.css";

/**
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   isLoyaltyPointsOvercommitted?: boolean;
 *   isAuthorized?: boolean;
 *   isUserDataConfirmed?: boolean;
 *   onOpenProduct?: () => void;
 *   onEditProduct?: () => void;
 *   onPromoteProduct?: () => void;
 *   isDeletePending?: boolean;
 *   isAvailabilityTogglePending?: boolean;
 *   isAuctionTogglePending?: boolean;
 * }} props
 */
export function MyProductCatalogCard({
  product,
  isLoyaltyPointsOvercommitted = false,
  isAuthorized = true,
  isUserDataConfirmed = false,
  onOpenProduct,
  onEditProduct,
  onPromoteProduct,
  isDeletePending = false,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
}) {
  const name = String(product.productName ?? "").trim() || "Без названия";
  const openProductLabel = CURATED_PRODUCT_COMPACT_CARD_UI.OPEN_ARIA(name);
  const reviewLine = formatProductReviewRatingLine(
    product.averageRating,
    product.reviewCount,
  );
  const hasDiscount = hasProductCatalogDiscount(product);
  const discountPercent = resolveProductDiscountPercent(product);
  const moderationVariant = getProductModerationBadgeVariant(product);
  const moderationLabel = getProductModerationBadgeLabel(product);
  const rejectionComment = getProductModerationRejectionComment(product, true);
  const isPending = isProductModerationPending(product);
  const promotionBadge = resolveProductPromotionCompactBadge(product);
  const featureBadges = buildMyProductCompactCardFeatureBadges({
    product,
    isLoyaltyPointsOvercommitted,
  });
  const showLoyaltyPoints = shouldShowProductLoyaltyPointsBadge(product);
  const loyaltyPoints = resolveProductLoyaltyPointsPerUnit(product);
  const loyaltyLabel = !isAuthorized
    ? PRODUCT_CARD_UI.LOYALTY_POINTS_GUEST(loyaltyPoints)
    : isUserDataConfirmed
      ? PRODUCT_CARD_UI.LOYALTY_POINTS_CONFIRMED(loyaltyPoints)
      : PRODUCT_CARD_UI.LOYALTY_POINTS_UNCONFIRMED(loyaltyPoints);

  const canEdit = canSellerEditProduct(product);
  const showPromote = typeof onPromoteProduct === "function";
  const showEdit = typeof onEditProduct === "function" && canEdit;
  const promoteDisabled = isProductPromoteButtonDisabled({
    isDeletePending,
    isAvailabilityTogglePending,
    isAuctionTogglePending,
  });

  return (
    <article className="my-product-compact-card" onClick={onOpenProduct}>
      <div className="my-product-compact-card__top">
        <ProductCompactCardMediaThumb
          product={product}
          onPress={onOpenProduct}
          accessibilityLabel={openProductLabel}
          dimmed={isPending}
        />

        <div className="my-product-compact-card__summary">
          <div className="my-product-compact-card__status-row">
            <span
              className={[
                "my-product-compact-card__status-pill",
                `my-product-compact-card__status-pill--${moderationVariant}`,
              ].join(" ")}
            >
              {moderationLabel}
            </span>
            {hasDiscount && discountPercent != null ? (
              <span className="my-product-compact-card__discount-pill">
                -{discountPercent}%
              </span>
            ) : null}
            {promotionBadge ? (
              <span
                className={[
                  "my-product-compact-card__promotion-pill",
                  `my-product-compact-card__promotion-pill--${promotionBadge.tier}`,
                ].join(" ")}
              >
                {promotionBadge.label}
              </span>
            ) : null}
            {featureBadges.map((badge) => (
              <ProductCompactCardStatusPill
                key={badge.key}
                label={badge.label}
                variant={badge.variant}
              />
            ))}
          </div>

          <button
            type="button"
            className="my-product-compact-card__title"
            onClick={onOpenProduct}
            aria-label={openProductLabel}
          >
            {name}
          </button>

          <div className="my-product-compact-card__price-row">
            <ProductPriceDisplay product={product} showLabel={false} variant="inline" />
            {showLoyaltyPoints ? (
              <span className="my-product-compact-card__loyalty-pill">{loyaltyLabel}</span>
            ) : null}
          </div>

          {reviewLine ? (
            <p className="my-product-compact-card__meta">{reviewLine}</p>
          ) : null}
        </div>
      </div>

      {rejectionComment ? (
        <p className="my-product-compact-card__rejection">
          {PRODUCT_MODERATION_PAGE_UI.REJECTION_COMMENT_PREFIX} {rejectionComment}
        </p>
      ) : null}

      {showPromote || showEdit ? (
        <>
          <div className="my-product-compact-card__divider" />
          <div
            className="my-product-compact-card__toolbar"
            aria-label={PRODUCT_CARD_UI.FOOTER_ACTIONS_ARIA}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {showPromote ? (
              <button
                type="button"
                className="my-product-compact-card__promote"
                disabled={promoteDisabled}
                onClick={onPromoteProduct}
              >
                {PRODUCT_CARD_UI.PROMOTION_BUTTON}
              </button>
            ) : null}
            {showEdit ? (
              <button
                type="button"
                className="my-product-compact-card__edit"
                disabled={isDeletePending}
                onClick={onEditProduct}
              >
                {PRODUCT_CARD_UI.EDIT_PRODUCT}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </article>
  );
}
