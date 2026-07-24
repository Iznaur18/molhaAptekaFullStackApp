import { useCallback, useRef } from "react";

import { WishlistToggleButton } from "../../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
import { PRODUCT_CARD_UI, PRODUCT_MODERATION_PAGE_UI } from "../../../../shared/config/appUiCopy.js";
import { ProductMediaHorizontalPager } from "../ProductMediaHorizontalPager.jsx";
import { ProductMediaSlideContent } from "../ProductMediaSlideContent.jsx";
import { ProductDiscountBadge } from "../ProductPriceDisplay.jsx";
import { ProductLoyaltyPointsBadge } from "../ProductLoyaltyPointsBadge.jsx";

import { ProductCardGalleryDots } from "./ProductCardGalleryDots.jsx";

/**
 * @param {{
 *   vm: ReturnType<import('./useProductCardViewModel.js').useProductCardViewModel>;
 * }} props
 */
export function ProductCardMedia({ vm }) {
  const slideCount = Math.max(vm.mediaSlides.length, 0);
  const hasSlideMedia = slideCount > 0;
  const hasMultipleSlides = slideCount > 1;
  const setCardSlideIndex = vm.setCardSlideIndex;
  const suppressOpenAfterSwipeRef = useRef(false);

  const handleIndexChange = useCallback(
    (index) => {
      suppressOpenAfterSwipeRef.current = true;
      setCardSlideIndex(index);
    },
    [setCardSlideIndex],
  );

  const handleGalleryClickCapture = useCallback((event) => {
    if (!suppressOpenAfterSwipeRef.current) {
      return;
    }
    suppressOpenAfterSwipeRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const renderSlide = useCallback(
    (index) => {
      const slide = vm.mediaSlides[index] ?? null;
      if (slide == null) {
        return <div className="product-card__image-placeholder" aria-hidden="true" />;
      }

      return (
        <ProductMediaSlideContent
          slide={slide}
          imageClassName="product-card__image"
          onImageError={() => {
            if (!vm.useFallbackImage) {
              vm.setUseFallbackImage(true);
            }
          }}
          onVideoFailed={() => vm.setPreviewVideoFailed(true)}
        />
      );
    },
    [vm],
  );

  const promotionRibbon = vm.showPromotionBoostBadge
    ? { tier: 1, label: PRODUCT_CARD_UI.PROMOTED_BADGE }
    : vm.showPromotionTopBadge
      ? { tier: 2, label: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE }
      : vm.showPromotionBannerBadge
        ? { tier: 3, label: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE }
        : null;

  return (
    <div
      className={[
        "product-card__image-frame",
        hasMultipleSlides ? "product-card__image-frame--gallery" : "",
        hasSlideMedia ? "" : "product-card__image-frame--empty",
      ]
        .filter(Boolean)
        .join(" ")}
      {...(hasMultipleSlides
        ? {
            role: "region",
            "aria-label": PRODUCT_CARD_UI.GALLERY_REGION_ARIA,
            onClickCapture: handleGalleryClickCapture,
          }
        : {})}
    >
      {hasSlideMedia ? (
        <ProductMediaHorizontalPager
          className="product-card__media-pager"
          slideCount={slideCount}
          activeIndex={vm.cardSlideIndex}
          onIndexChange={handleIndexChange}
          renderSlide={renderSlide}
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
      {promotionRibbon ? (
        <span
          className={`product-card__promotion-ribbon product-card__promotion-ribbon--tier-${promotionRibbon.tier}`}
          role="status"
        >
          {promotionRibbon.label}
        </span>
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
              variant="overlay"
            />
          ) : null}
        </div>
      ) : null}
      {hasMultipleSlides ? (
        <ProductCardGalleryDots
          slideIndex={vm.cardSlideIndex}
          slideCount={slideCount}
        />
      ) : null}
    </div>
  );
}
