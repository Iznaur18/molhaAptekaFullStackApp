import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductDiscountBadge, ProductPriceDisplay } from "../ProductPriceDisplay.jsx";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 *   renderSellerValue: (raw: unknown, display: string) => import('react').ReactNode;
 *   statusSlot: import('react').ReactNode;
 * }} props
 */
export function ProductCardBannerContent({ vm, renderSellerValue, statusSlot }) {
  return (
    <>
      <p className="product-card__banner-tier-badge" role="status">
        {PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE}
      </p>
      <h2 id={vm.headingId} className="product-card__heading product-card__heading--banner">
        {vm.heading}
      </h2>
      <div className="product-card__banner-price-row">
        <ProductPriceDisplay
          product={vm.product}
          className="product-card__price product-card__price--banner"
          showLabel={false}
        />
        {vm.showDiscountBadge ? (
          <ProductDiscountBadge
            discountPercent={vm.discountPercent}
            variant="banner"
          />
        ) : null}
      </div>
      {!vm.isModerationQueue ? (
        <p className="product-card__banner-meta">
          <span className="product-card__banner-meta-item">
            {renderSellerValue(vm.product.productSeller, vm.sellerDisplayName)}
          </span>
          {vm.hasReviewRating ? (
            <>
              <span className="product-card__banner-meta-sep" aria-hidden="true">
                |
              </span>
              <span className="product-card__banner-meta-item product-card__banner-meta-item--rating">
                {vm.reviewRatingLine}
              </span>
            </>
          ) : null}
        </p>
      ) : null}
      {vm.isMineMode ? statusSlot : null}
    </>
  );
}
