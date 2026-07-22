import { useCallback, useRef } from "react";

import { WishlistToggleButton } from "../../../../features/wishlist-toggle/ui/WishlistToggleButton.jsx";
import { PRODUCT_CARD_UI, PRODUCT_MODERATION_PAGE_UI } from "../../../../shared/config/appUiCopy.js";
import { useHorizontalSwipeNavigation } from "../../../../shared/lib/useHorizontalSwipeNavigation.js";
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
  const hasSlideMedia = vm.renderedSlide != null;
  const slideCount = vm.mediaSlides.length;
  const hasMultipleSlides = slideCount > 1;
  const setCardSlideIndex = vm.setCardSlideIndex;
  const suppressOpenAfterSwipeRef = useRef(false);

  const goToPreviousSlide = useCallback(() => {
    setCardSlideIndex((index) => Math.max(0, index - 1));
  }, [setCardSlideIndex]);

  const goToNextSlide = useCallback(() => {
    setCardSlideIndex((index) => Math.min(slideCount - 1, index + 1));
  }, [setCardSlideIndex, slideCount]);

  const gallerySwipeHandlers = useHorizontalSwipeNavigation({
    enabled: hasMultipleSlides,
    onSwipeLeft: goToNextSlide,
    onSwipeRight: goToPreviousSlide,
    onSwipe: () => {
      suppressOpenAfterSwipeRef.current = true;
    },
  });

  const handleGalleryClickCapture = useCallback((event) => {
    if (!suppressOpenAfterSwipeRef.current) {
      return;
    }
    suppressOpenAfterSwipeRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const promotionRibbon = vm.showPromotionBoostBadge
    ? { tier: 1, label: PRODUCT_CARD_UI.PROMOTED_BADGE }
    : vm.showPromotionTopBadge
      ? { tier: 2, label: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE }
      : vm.showPromotionBannerBadge
        ? { tier: 3, label: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE }
        : null;

  const canGoPrevious = vm.cardSlideIndex > 0;
  const canGoNext = vm.cardSlideIndex < slideCount - 1;

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
            ...gallerySwipeHandlers,
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
        <>
          <div className="product-card__image-nav">
            <button
              type="button"
              className="product-card__image-nav-btn"
              aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
              disabled={!canGoPrevious}
              onClick={(event) => {
                event.stopPropagation();
                goToPreviousSlide();
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="product-card__image-nav-btn"
              aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
              disabled={!canGoNext}
              onClick={(event) => {
                event.stopPropagation();
                goToNextSlide();
              }}
            >
              ›
            </button>
          </div>
          <ProductCardGalleryDots
            slideIndex={vm.cardSlideIndex}
            slideCount={slideCount}
          />
        </>
      ) : null}
    </div>
  );
}
