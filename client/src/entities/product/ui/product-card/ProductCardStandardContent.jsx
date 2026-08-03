import { MessageSquare } from "lucide-react";
import {
  PRODUCT_CARD_UI,
  PRODUCT_MODERATION_PAGE_UI,
  PRODUCT_REVIEW_UI,
} from "../../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../../shared/ui/icon/index.js";
import { formatProductFieldForDisplay } from "../../lib/formatProductFieldForDisplay.js";
import {
  getProductModerationBadgeClassName,
  getProductModerationBadgeLabel,
} from "../../lib/getProductModerationUi.js";
import { getProductFieldLabel } from "../../lib/productFieldRegistry.js";
import { ProductPriceDisplay } from "../ProductPriceDisplay.jsx";
import { hasProductCardCatalogStatusBadges } from "../../lib/hasProductCardCatalogStatusBadges.js";
import { ProductCardStatusSlot } from "./ProductCardStatusSlot.jsx";
import { renderProductCardSellerValue } from "./renderProductCardSellerValue.jsx";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} props
 */
export function ProductCardStandardContent({ vm }) {
  const hasCatalogStatusBadges = hasProductCardCatalogStatusBadges(vm);

  const renderModerationBadge = () => {
    if (!vm.isMineMode && !vm.isModerationQueue) return null;
    if (vm.showModerationPendingOverlay) return null;
    return (
      <>
        <span
          className={getProductModerationBadgeClassName(vm.product)}
          role="status"
          aria-label={getProductModerationBadgeLabel(vm.product)}
        >
          {getProductModerationBadgeLabel(vm.product)}
        </span>
        {vm.rejectionComment ? (
          <p className="product-card__moderation-comment">
            {PRODUCT_MODERATION_PAGE_UI.REJECTION_COMMENT_PREFIX} {vm.rejectionComment}
          </p>
        ) : null}
      </>
    );
  };

  return (
    <>
      <h2 id={vm.headingId} className="product-card__heading">
        {vm.heading}
      </h2>
      <ProductPriceDisplay
        product={vm.product}
        className="product-card__price"
        showLabel={false}
      />
      {!vm.isModerationQueue ? (
        <div className="product-card__meta-strip">
          <p
            className={
              vm.hasReviewRating
                ? "product-card__rating"
                : "product-card__rating product-card__rating--placeholder"
            }
            aria-label={
              vm.hasReviewRating ? vm.reviewRatingLine : PRODUCT_REVIEW_UI.NO_REVIEWS
            }
          >
            {vm.hasReviewRating && vm.reviewRatingParts ? (
              <>
                <span className="product-card__rating-score" aria-hidden="true">
                  ★ {vm.reviewRatingParts.rating}
                </span>
                <span className="product-card__rating-sep" aria-hidden="true">
                  ·
                </span>
                <span className="product-card__rating-count" aria-hidden="true">
                  <AppIcon
                    icon={MessageSquare}
                    size="xs"
                    strokeWidth={0}
                    fill="currentColor"
                    className="product-card__rating-count-icon"
                  />
                  {vm.reviewRatingParts.count}
                </span>
              </>
            ) : (
              PRODUCT_REVIEW_UI.NO_REVIEWS
            )}
          </p>
          <div
            ref={vm.statusBadgesRowRef}
            className="product-card__status-badges-row product-card__catalog-badges--web"
            role="group"
            aria-label={PRODUCT_CARD_UI.STATUS_BADGES_ARIA}
            {...vm.statusBadgesDragScrollProps}
          >
            <ProductCardStatusSlot vm={vm} />
            {vm.nearDistanceLabel ? (
              <p className="product-card__near-badge" role="status">
                {vm.nearDistanceLabel}
              </p>
            ) : null}
            {vm.showRaffleBadge ? (
              <p className="product-card__raffle-badge" role="status">
                {PRODUCT_CARD_UI.RAFFLE_BADGE}
              </p>
            ) : null}
            {vm.showAffiliateBadge ? (
              <p className="product-card__affiliate-badge" role="status">
                {PRODUCT_CARD_UI.AFFILIATE_BADGE(vm.affiliatePercent)}
              </p>
            ) : null}
            {vm.showAuctionBadge ? (
              <p className="product-card__auction-badge" role="status">
                {PRODUCT_CARD_UI.AUCTION_BADGE}
              </p>
            ) : null}
            {vm.showInstallmentBadge ? (
              <p className="product-card__installment-badge" role="status">
                {PRODUCT_CARD_UI.INSTALLMENT_BADGE}
              </p>
            ) : null}
            {vm.showWholesaleBadge ? (
              <p className="product-card__wholesale-badge" role="status">
                {vm.wholesaleBadgeLabel}
              </p>
            ) : null}
            {!hasCatalogStatusBadges ? (
              <p
                className="product-card__status-badge-placeholder"
                role="status"
                aria-label={PRODUCT_CARD_UI.NO_STATUS_BADGE}
              >
                {PRODUCT_CARD_UI.NO_STATUS_BADGE}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {renderModerationBadge()}
      <dl
        className="product-card__fields product-card__fields--preview"
        aria-label={PRODUCT_CARD_UI.PREVIEW_FIELDS_ARIA}
      >
        {vm.previewFieldKeysWithoutPrice.map((key) => {
          const raw = vm.product[key];
          const display = formatProductFieldForDisplay(key, vm.product);
          const rowClass = ["product-card__row"];
          if (key === "productDescription") {
            rowClass.push("product-card__row--description");
          }
          if (key === "productSeller") {
            rowClass.push("product-card__row--seller");
          }

          if (key === "productSeller") {
            return (
              <div key={key} className={rowClass.join(" ")}>
                <div className="product-card__value product-card__value--seller-inline">
                  {renderProductCardSellerValue({
                    raw,
                    display,
                    onSellerNameClick: vm.onSellerNameClick,
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className={rowClass.join(" ")}>
              <dt className="product-card__key">{getProductFieldLabel(key)}</dt>
              <dd
                className={
                  key === "productDescription"
                    ? "product-card__value product-card__value--multiline"
                    : "product-card__value"
                }
              >
                {display}
              </dd>
            </div>
          );
        })}
      </dl>
    </>
  );
}
