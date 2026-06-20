import { WishlistToggleButton } from "../../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
import { PRODUCT_CARD_UI, PRODUCT_MODERATION_PAGE_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductMediaSlideContent } from "../ProductMediaSlideContent.jsx";
import { ProductDiscountBadge } from "../ProductPriceDisplay.jsx";
import { ProductLoyaltyPointsBadge } from "../ProductLoyaltyPointsBadge.jsx";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} props
 */
export function ProductCardMedia({ vm }) {
  const hasSlideMedia = vm.renderedSlide != null;

  return (
    <div
      className={[
        "product-card__image-frame",
        vm.mediaSlides.length > 1 ? "product-card__image-frame--gallery" : "",
        hasSlideMedia ? "" : "product-card__image-frame--empty",
      ]
        .filter(Boolean)
        .join(" ")}
      {...(vm.mediaSlides.length > 1
        ? {
            role: "region",
            "aria-label": PRODUCT_CARD_UI.GALLERY_REGION_ARIA,
          }
        : {})}
    >
      {hasSlideMedia ? (
        <ProductMediaSlideContent
          slide={vm.renderedSlide}
          imageClassName="product-card__image"
          onImageError={() => {
            if (!vm.useFallbackImage) {
              vm.setUseFallbackImage(true);
            }
          }}
          onVideoFailed={() => vm.setPreviewVideoFailed(true)}
        />
      ) : (
        <div className="product-card__image-placeholder" aria-hidden="true" />
      )}
      {vm.showWishlistToggle ? (
        <WishlistToggleButton
          productId={String(vm.product._id)}
          product={vm.product}
          isAuthorized={vm.isAuthorized}
          onRequestLogin={vm.onRequestLoginAddToCart}
          currentUserId={vm.currentUserId}
          variant="card"
        />
      ) : null}
      {vm.showModerationPendingOverlay ? (
        <span className="product-card__moderation-pending-overlay" role="status">
          {PRODUCT_MODERATION_PAGE_UI.BADGE_PENDING}
        </span>
      ) : null}
      {vm.showImageOverlayBadges ? (
        <div className="product-card__image-badges" aria-hidden="true">
          {vm.showDiscountBadge ? (
            <ProductDiscountBadge
              discountPercent={vm.discountPercent}
              variant="overlay"
            />
          ) : null}
          {vm.showLoyaltyPointsBadge ? (
            <ProductLoyaltyPointsBadge
              product={vm.product}
              isAuthorized={vm.isAuthorized}
              isPremiumUser={vm.isPremiumUser}
              variant="overlay"
            />
          ) : null}
        </div>
      ) : null}
      {vm.mediaSlides.length > 1 ? (
        <>
          <div className="product-card__image-nav">
            <button
              type="button"
              className="product-card__image-nav-btn"
              aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
              onClick={(event) => {
                event.stopPropagation();
                const count = vm.mediaSlides.length;
                if (count <= 1) return;
                vm.setCardSlideIndex((index) => (index - 1 + count) % count);
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="product-card__image-nav-btn"
              aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
              onClick={(event) => {
                event.stopPropagation();
                const count = vm.mediaSlides.length;
                if (count <= 1) return;
                vm.setCardSlideIndex((index) => (index + 1) % count);
              }}
            >
              ›
            </button>
          </div>
          <span
            className="product-card__image-counter"
            aria-live="polite"
            aria-label={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(
              vm.cardSlideIndex + 1,
              vm.mediaSlides.length,
            )}
          >
            {vm.cardSlideIndex + 1} / {vm.mediaSlides.length}
          </span>
        </>
      ) : null}
    </div>
  );
}
