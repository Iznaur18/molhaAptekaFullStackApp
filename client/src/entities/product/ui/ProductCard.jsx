import { useEffect, useId, useMemo, useState } from "react";

import { AddToCartButton } from "../../../features/cart-add/ui/AddToCartButton.jsx";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
  PRODUCT_REVIEW_UI,
} from "../../../shared/config/appUiCopy.js";
import { useHorizontalPointerDragScroll } from "../../../shared/lib/useHorizontalPointerDragScroll.js";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import { isCurrentUserProductSeller } from "../lib/isCurrentUserProductSeller.js";
import { getProductPurchaseLimit } from "../lib/getProductPurchaseLimit.js";
import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { resolveAuctionUiState } from "../lib/resolveAuctionUiState.js";
import { shouldShowPremiumProductCardChrome } from "../lib/isPremiumSellerProduct.js";
import {
  formatPromotionExpiresAt,
  isCatalogPromotionActive,
} from "../lib/productPromotionStatus.js";
import {
  getProductPromotionTierLabel,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "../lib/calculateProductPromotionPointsCost.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import { buildProductMediaSlides } from "../lib/buildProductMediaSlides.js";
import { resolveProductPreviewVideoUrl } from "../lib/resolveProductPreviewVideoUrl.js";
import { ProductMediaSlideContent } from "./ProductMediaSlideContent.jsx";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
  getProductModerationBadgeClassName,
  getProductModerationBadgeLabel,
} from "../lib/getProductModerationUi.js";
import { PRODUCT_MODERATION_REJECTED } from "../model/productModerationConstants.js";
import { formatProductReviewRatingLine } from "../../product-review/lib/formatProductReviewRatingLine.js";
import {
  PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS,
  PRODUCT_CARD_PREVIEW_FIELD_KEYS,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
} from "../model/productConstants.js";
import { getProductFieldLabel } from "../lib/productFieldRegistry.js";
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { resolveProductDiscountPercent } from "../lib/computeProductDiscountPercent.js";
import { resolveProductCardHeadingId } from "../lib/resolveProductCardHeadingId.js";
import { shouldShowProductLoyaltyPointsBadge } from "../lib/shouldShowProductLoyaltyPointsBadge.js";
import { ProductModerationDetailsFooter } from "./ProductModerationDetailsFooter.jsx";
import { ProductDiscountBadge, ProductPriceDisplay } from "./ProductPriceDisplay.jsx";
import { ProductLoyaltyPointsBadge } from "./ProductLoyaltyPointsBadge.jsx";
import { PRODUCT_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductCard.css";

/**
 * @param {object} props
 * @param {import('../model/types.js').ProductFromApi} props.product
 * @param {(userId: string) => void} [props.onSellerNameClick]
 * @param {(productId: string) => void | Promise<void>} [props.onDeleteProduct]
 * @param {(product: import('../model/types.js').ProductFromApi) => void} [props.onEditProduct]
 * @param {boolean} [props.isDeletePending]
 * @param {(productId: string, productIsAvailable: boolean) => void | Promise<void>} [props.onSetProductAvailability]
 * @param {(productId: string, productAuctionEnabled: boolean) => void | Promise<void>} [props.onSetProductAuction]
 * @param {boolean} [props.isAvailabilityTogglePending]
 * @param {boolean} [props.isAuctionTogglePending]
 * @param {(product: import('../model/types.js').ProductFromApi) => void} [props.onPromoteProduct]
 * @param {boolean} [props.sellerRaffleActive]
 * @param {(product: import('../model/types.js').ProductFromApi, enabled: boolean) => void} [props.onToggleRaffleParticipation]
 * @param {boolean} [props.isRaffleParticipationPending]
 * @param {(product: import('../model/types.js').ProductFromApi) => void} [props.onOpenDetails]
 * @param {boolean} [props.isAuthorized]
 * @param {boolean} [props.isPremiumUser]
 * @param {string | null} [props.currentUserId]
 * @param {() => void} [props.onRequestLoginAddToCart]
 * @param {boolean} [props.showAddToCartOnCard]
 * @param {boolean} [props.isMineMode]
 * @param {boolean} [props.highlightCatalogPromotion]
 * @param {boolean} [props.promotionFullWidth]
 * @param {boolean} [props.highlightRaffleProduct]
 * @param {boolean} [props.isLoyaltyPointsOvercommitted]
 * @param {boolean} [props.isModerationQueue]
 * @param {{
 *   rejectComment: string;
 *   onRejectCommentChange: (value: string) => void;
 *   onApprove: () => void;
 *   onReject: () => void;
 *   isBusy?: boolean;
 *   errorMessage?: string;
 * } | null} [props.moderationActions]
 */
export function ProductCard({
  product,
  onSellerNameClick,
  onDeleteProduct,
  onEditProduct,
  isDeletePending = false,
  onSetProductAvailability,
  onSetProductAuction,
  isAvailabilityTogglePending = false,
  isAuctionTogglePending = false,
  onPromoteProduct,
  sellerRaffleActive = false,
  onToggleRaffleParticipation,
  isRaffleParticipationPending = false,
  onOpenDetails,
  isAuthorized = false,
  isPremiumUser = false,
  currentUserId = null,
  onRequestLoginAddToCart = () => {},
  showAddToCartOnCard = true,
  isMineMode = false,
  highlightCatalogPromotion = false,
  promotionFullWidth = false,
  highlightRaffleProduct = false,
  isLoyaltyPointsOvercommitted = false,
  isModerationQueue = false,
  moderationActions = null,
}) {
  const fallbackHeadingId = useId();
  const heading = product.productName?.trim() || PRODUCT_CARD_UI.DEFAULT_TITLE;
  const headingId =
    resolveProductCardHeadingId(product._id) ?? fallbackHeadingId;
  const isDetailsSurfaceInteractive = !isModerationQueue && onOpenDetails != null;
  const galleryUrls = useMemo(() => resolveProductImageUrls(product), [product]);
  const previewVideoUrl = useMemo(
    () => resolveProductPreviewVideoUrl(product),
    [product],
  );
  const previewFieldKeys = useMemo(() => {
    if (isModerationQueue) return PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS;
    return PRODUCT_CARD_PREVIEW_FIELD_KEYS;
  }, [isModerationQueue]);
  const [cardSlideIndex, setCardSlideIndex] = useState(0);
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const { ref: statusBadgesRowRef, dragScrollProps: statusBadgesDragScrollProps } =
    useHorizontalPointerDragScroll();

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;
    const slides = buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls: galleryUrls,
    });
    if (!slides.some((slide) => slide.type === "image")) {
      slides.push({ type: "image", url: PRODUCT_IMAGE_PLACEHOLDER_URL });
    }
    return slides;
  }, [galleryUrls, previewVideoUrl, previewVideoFailed]);

  const activeSlide = mediaSlides[cardSlideIndex] ?? null;

  useEffect(() => {
    setCardSlideIndex(0);
  }, [product._id]);

  useEffect(() => {
    setPreviewVideoFailed(false);
  }, [product._id, previewVideoUrl]);

  useEffect(() => {
    setCardSlideIndex((i) => Math.min(i, Math.max(0, mediaSlides.length - 1)));
  }, [mediaSlides.length]);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [activeSlide, product._id]);

  const hasSlideMedia = activeSlide != null;

  const handleImageError = () => {
    if (!useFallbackImage) {
      setUseFallbackImage(true);
    }
  };

  const renderedSlide =
    activeSlide?.type === "image" && useFallbackImage
      ? { type: "image", url: PRODUCT_IMAGE_PLACEHOLDER_URL }
      : activeSlide;

  const sellerCanEdit = !isMineMode || canSellerEditProduct(product);
  const sellerCanDelete = !isMineMode || canSellerDeleteProduct(product);
  const sellerCanToggleVisibility =
    !isMineMode || canSellerToggleCatalogVisibility(product);
  const rejectionComment =
    isMineMode &&
    product.productModerationStatus === PRODUCT_MODERATION_REJECTED &&
    String(product.productModerationComment ?? "").trim() !== ""
      ? String(product.productModerationComment).trim()
      : "";
  const isPromotionActive = isCatalogPromotionActive(product);
  const promotionTier = Number(product.catalogPromotionTier) || 0;

  const renderModerationBadge = () => {
    if (!isMineMode && !isModerationQueue) return null;
    return (
      <>
        <span
          className={getProductModerationBadgeClassName(product)}
          role="status"
          aria-label={getProductModerationBadgeLabel(product)}
        >
          {getProductModerationBadgeLabel(product)}
        </span>
        {rejectionComment ? (
          <p className="product-card__moderation-comment">
            {PRODUCT_MODERATION_PAGE_UI.REJECTION_COMMENT_PREFIX} {rejectionComment}
          </p>
        ) : null}
      </>
    );
  };

  const handleOpenDetails = () => {
    onOpenDetails?.(product);
  };

  /** @param {import('react').KeyboardEvent<HTMLDivElement>} event */
  const handleDetailsSurfaceKeyDown = (event) => {
    if (isModerationQueue || onOpenDetails == null) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpenDetails(product);
  };

  /** @param {import('react').MouseEvent<HTMLButtonElement>} event */
  const handleSellerClick = (event) => {
    event.stopPropagation();
    const raw = product.productSeller;
    if (
      typeof onSellerNameClick !== "function" ||
      raw == null ||
      typeof raw !== "object" ||
      raw._id == null
    ) {
      return;
    }
    onSellerNameClick(String(raw._id));
  };

  /** @param {import('react').MouseEvent<HTMLButtonElement>} event */
  const handleCardSlidePrev = (event) => {
    event.stopPropagation();
    const n = mediaSlides.length;
    if (n <= 1) return;
    setCardSlideIndex((i) => (i - 1 + n) % n);
  };

  /** @param {import('react').MouseEvent<HTMLButtonElement>} event */
  const handleCardSlideNext = (event) => {
    event.stopPropagation();
    const n = mediaSlides.length;
    if (n <= 1) return;
    setCardSlideIndex((i) => (i + 1) % n);
  };

  const reviewRatingLine = formatProductReviewRatingLine(
    product.averageRating ?? 0,
    product.reviewCount ?? 0,
  );
  const hasReviewRating = reviewRatingLine.length > 0;
  const { auctionActive } = resolveAuctionUiState(product);
  const discountPercent = resolveProductDiscountPercent(product);
  const showDiscountBadge = discountPercent != null && discountPercent > 0;
  const showLoyaltyPointsBadge = shouldShowProductLoyaltyPointsBadge(product);
  const previewFieldKeysWithoutPrice = useMemo(
    () => previewFieldKeys.filter((key) => key !== "productPrice"),
    [previewFieldKeys],
  );

  const purchaseLimit = getProductPurchaseLimit(product);

  const renderStatusSlot = () => {
    if (
      isMineMode &&
      !isModerationQueue &&
      (product.productIsAvailable === false || purchaseLimit === 0)
    ) {
      return (
        <p className="product-card__hidden-badge" role="status">
          {PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE}
        </p>
      );
    }
    if (!isMineMode && !isModerationQueue && product.productIsAvailable === false) {
      return (
        <p className="product-card__hidden-badge" role="status">
          {PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE}
        </p>
      );
    }
    if (isMineMode && isPromotionActive) {
      const tierLabel = getProductPromotionTierLabel(promotionTier);
      const until = formatPromotionExpiresAt(product.catalogPromotionExpiresAt);
      return (
        <p className="product-card__promotion-badge" role="status">
          {PRODUCT_CARD_UI.PROMOTED_TIER_UNTIL(tierLabel, until)}
        </p>
      );
    }
    if (isMineMode && isLoyaltyPointsOvercommitted) {
      return (
        <p className="product-card__loyalty-overcommitted-badge" role="alert">
          {PRODUCT_CARD_UI.LOYALTY_POINTS_OVERCOMMITTED_BADGE}
        </p>
      );
    }
    return null;
  };

  const detailsSurfaceLabel = `${PRODUCT_CARD_UI.OPEN_DETAILS_ARIA} ${heading}`;
  const bodyClassName = isModerationQueue
    ? "product-card__body"
    : "product-card__details-surface";
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

  /**
   * @param {import('../model/types.js').ProductFromApi['productSeller']} raw
   * @param {string} display
   */
  const renderProductSellerValue = (raw, display) => {
    const isPopulatedSeller = raw != null && typeof raw === "object" && raw._id != null;
    if (!isPopulatedSeller || display === COMMON_UI.EM_DASH) {
      return display;
    }

    const canOpenSellerProfile =
      typeof onSellerNameClick === "function" && display !== COMMON_UI.EM_DASH;

    const nameNode = (
      <UserPremiumDisplayName
        name={display}
        isPremium={raw.isPremiumUser === true}
        isUserDataConfirmed={raw.isUserDataConfirmed === true}
        className="product-card__seller-display-name"
        textClassName="product-card__seller-display-name__text"
      />
    );

    if (canOpenSellerProfile) {
      return (
        <button
          type="button"
          className="product-card__seller-name"
          aria-label={PRODUCT_CARD_UI.SELLER_PROFILE_ARIA(display)}
          onClick={handleSellerClick}
        >
          {nameNode}
        </button>
      );
    }

    return nameNode;
  };

  const showBannerLayout =
    promotionFullWidth &&
    isPromotionActive &&
    promotionTier === PRODUCT_PROMOTION_TIER_BANNER;
  const showImageOverlayBadges =
    !showBannerLayout && (showDiscountBadge || showLoyaltyPointsBadge);
  const showRaffleParticipantChrome =
    (highlightRaffleProduct || showRaffleBadge) && !isMineMode && !isModerationQueue;
  const cardClassName = [
    "product-card",
    showRaffleParticipantChrome ? "product-card--raffle-participant" : "",
    showBannerLayout ? "product-card--banner-layout" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cardDetailsContent = (
    <>
      <h2 id={headingId} className="product-card__heading">
        {heading}
      </h2>
      <ProductPriceDisplay
        product={product}
        className="product-card__price"
        showLabel={false}
      />
      {!isModerationQueue ? (
        <div className="product-card__meta-strip">
          <p
            className={
              hasReviewRating
                ? "product-card__rating"
                : "product-card__rating product-card__rating--placeholder"
            }
            aria-label={
              hasReviewRating ? reviewRatingLine : PRODUCT_REVIEW_UI.NO_REVIEWS
            }
          >
            {hasReviewRating ? reviewRatingLine : PRODUCT_REVIEW_UI.NO_REVIEWS}
          </p>
          <div
            ref={statusBadgesRowRef}
            className="product-card__status-badges-row"
            role="group"
            aria-label={PRODUCT_CARD_UI.STATUS_BADGES_ARIA}
            {...statusBadgesDragScrollProps}
          >
            {renderStatusSlot()}
            {showPromotionBoostBadge ? (
              <p className="product-card__promotion-boost-badge" role="status">
                {PRODUCT_CARD_UI.PROMOTED_BADGE}
              </p>
            ) : null}
            {showPromotionTopBadge ? (
              <p className="product-card__promotion-top-badge" role="status">
                {PRODUCT_CARD_UI.PROMOTION_TOP_BADGE}
              </p>
            ) : null}
            {showPromotionBannerBadge ? (
              <p className="product-card__promotion-banner-badge" role="status">
                {PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE}
              </p>
            ) : null}
            {showAuctionBadge ? (
              <p className="product-card__auction-badge" role="status">
                {PRODUCT_CARD_UI.AUCTION_BADGE}
              </p>
            ) : null}
            {showInstallmentBadge ? (
              <p className="product-card__installment-badge" role="status">
                {PRODUCT_CARD_UI.INSTALLMENT_BADGE}
              </p>
            ) : null}
            {showRaffleBadge ? (
              <p className="product-card__raffle-badge" role="status">
                {PRODUCT_CARD_UI.RAFFLE_BADGE}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      {!showBannerLayout ? renderModerationBadge() : null}
      <dl
        className="product-card__fields product-card__fields--preview"
        aria-label={PRODUCT_CARD_UI.PREVIEW_FIELDS_ARIA}
      >
        {previewFieldKeysWithoutPrice.map((key) => {
          const raw = product[key];
          const display = formatProductFieldForDisplay(key, product);
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
                <dt className="product-card__key product-card__key--seller-inline">
                  {getProductFieldLabel("productSeller")}:
                </dt>
                <dd className="product-card__value product-card__value--seller-inline">
                  {renderProductSellerValue(raw, display)}
                </dd>
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

  const sellerDisplayName = formatProductFieldForDisplay("productSeller", product);

  const bannerCatalogContent = (
    <>
      <p className="product-card__banner-tier-badge" role="status">
        {PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE}
      </p>
      <h2 id={headingId} className="product-card__heading product-card__heading--banner">
        {heading}
      </h2>
      <div className="product-card__banner-price-row">
        <ProductPriceDisplay
          product={product}
          className="product-card__price product-card__price--banner"
          showLabel={false}
        />
        {showDiscountBadge ? (
          <ProductDiscountBadge discountPercent={discountPercent} variant="banner" />
        ) : null}
      </div>
      {!isModerationQueue ? (
        <p className="product-card__banner-meta">
          <span className="product-card__banner-meta-item">
            {getProductFieldLabel("productSeller")}:{" "}
            {renderProductSellerValue(product.productSeller, sellerDisplayName)}
          </span>
          {hasReviewRating ? (
            <>
              <span className="product-card__banner-meta-sep" aria-hidden="true">
                |
              </span>
              <span className="product-card__banner-meta-item product-card__banner-meta-item--rating">
                {reviewRatingLine}
              </span>
            </>
          ) : null}
        </p>
      ) : null}
      {isMineMode ? renderStatusSlot() : null}
    </>
  );

  /** @param {import('react').SyntheticEvent} event */
  const stopCardDetailsActivation = (event) => {
    event.stopPropagation();
  };

  const sellerToolbarNode =
    onDeleteProduct != null ? (
      <div className="product-card__seller-toolbar">
        {onPromoteProduct ? (
          <button
            type="button"
            className="product-card__promote"
            disabled={
              product.productIsAvailable === false ||
              isPromotionActive ||
              isDeletePending ||
              isAvailabilityTogglePending ||
              isAuctionTogglePending
            }
            onClick={(event) => {
              event.stopPropagation();
              onPromoteProduct(product);
            }}
          >
            {PRODUCT_CARD_UI.PROMOTION_BUTTON}
          </button>
        ) : null}
        {onEditProduct && sellerCanEdit ? (
          <button
            type="button"
            className="product-card__edit"
            disabled={isDeletePending}
            onClick={(event) => {
              event.stopPropagation();
              onEditProduct(product);
            }}
          >
            {PRODUCT_CARD_UI.EDIT_PRODUCT}
          </button>
        ) : null}
      </div>
    ) : null;

  const showAddToCartButton =
    (showAddToCartOnCard || showBannerLayout) &&
    product.productIsAvailable !== false &&
    product._id != null &&
    !isCurrentUserProductSeller(product, currentUserId);

  const showFooterActions =
    (isModerationQueue && moderationActions != null) ||
    (!showBannerLayout && sellerToolbarNode != null) ||
    (showAddToCartButton && !showBannerLayout);
  const showBannerActions =
    showBannerLayout && (showAddToCartButton || sellerToolbarNode != null);

  const card = (
    <article className={cardClassName} aria-labelledby={headingId}>
      <div
        className={bodyClassName}
        {...(isDetailsSurfaceInteractive
          ? {
              role: "button",
              tabIndex: 0,
              "aria-label": detailsSurfaceLabel,
              onClick: handleOpenDetails,
              onKeyDown: handleDetailsSurfaceKeyDown,
            }
          : {})}
      >
        <div
          className={[
            "product-card__image-frame",
            mediaSlides.length > 1 ? "product-card__image-frame--gallery" : "",
            hasSlideMedia ? "" : "product-card__image-frame--empty",
          ]
            .filter(Boolean)
            .join(" ")}
          {...(mediaSlides.length > 1
            ? {
                role: "region",
                "aria-label": PRODUCT_CARD_UI.GALLERY_REGION_ARIA,
              }
            : {})}
        >
          {hasSlideMedia ? (
            <ProductMediaSlideContent
              slide={renderedSlide}
              imageClassName="product-card__image"
              onImageError={handleImageError}
              onVideoFailed={() => setPreviewVideoFailed(true)}
            />
          ) : (
            <div className="product-card__image-placeholder" aria-hidden="true" />
          )}
          {showImageOverlayBadges ? (
            <div className="product-card__image-badges" aria-hidden="true">
              {showDiscountBadge ? (
                <ProductDiscountBadge
                  discountPercent={discountPercent}
                  variant="overlay"
                />
              ) : null}
              {showLoyaltyPointsBadge ? (
                <ProductLoyaltyPointsBadge
                  product={product}
                  isAuthorized={isAuthorized}
                  isPremiumUser={isPremiumUser}
                  variant="overlay"
                />
              ) : null}
            </div>
          ) : null}
          {mediaSlides.length > 1 ? (
            <>
              <div className="product-card__image-nav">
                <button
                  type="button"
                  className="product-card__image-nav-btn"
                  aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
                  onClick={handleCardSlidePrev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="product-card__image-nav-btn"
                  aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
                  onClick={handleCardSlideNext}
                >
                  ›
                </button>
              </div>
              <span
                className="product-card__image-counter"
                aria-live="polite"
                aria-label={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(
                  cardSlideIndex + 1,
                  mediaSlides.length,
                )}
              >
                {cardSlideIndex + 1} / {mediaSlides.length}
              </span>
            </>
          ) : null}
        </div>
        {showBannerLayout ? (
          <div className="product-card__banner-content">
            {bannerCatalogContent}
            {showBannerActions ? (
              <div
                className="product-card__banner-actions"
                aria-label={PRODUCT_CARD_UI.FOOTER_ACTIONS_ARIA}
                onClick={stopCardDetailsActivation}
                onKeyDown={stopCardDetailsActivation}
              >
                {showAddToCartButton ? (
                  <AddToCartButton
                    productId={String(product._id)}
                    isAuthorized={isAuthorized}
                    onRequestLogin={onRequestLoginAddToCart}
                    maxQuantity={purchaseLimit}
                  />
                ) : null}
                {sellerToolbarNode}
              </div>
            ) : null}
          </div>
        ) : (
          cardDetailsContent
        )}
      </div>
      {showFooterActions ? (
        <div
          className="product-card__footer-actions"
          aria-label={PRODUCT_CARD_UI.FOOTER_ACTIONS_ARIA}
        >
          {isModerationQueue && moderationActions ? (
            <ProductModerationDetailsFooter
              rejectComment={moderationActions.rejectComment}
              onRejectCommentChange={moderationActions.onRejectCommentChange}
              onApprove={moderationActions.onApprove}
              onReject={moderationActions.onReject}
              isBusy={moderationActions.isBusy}
              errorMessage={moderationActions.errorMessage}
            />
          ) : null}
          {!showBannerLayout ? sellerToolbarNode : null}
          {showAddToCartButton ? (
            <AddToCartButton
              productId={String(product._id)}
              isAuthorized={isAuthorized}
              onRequestLogin={onRequestLoginAddToCart}
              maxQuantity={purchaseLimit}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );

  if (!showPromotionChrome && !showPremiumChrome) {
    return card;
  }

  const frameClassName = [
    showPromotionChrome ? "product-card-promotion-frame" : "",
    showPromotionChrome && promotionTier === 1 ? "product-card-promotion-frame--tier-1" : "",
    showPromotionChrome && promotionTier === 2 ? "product-card-promotion-frame--tier-2" : "",
    showPromotionChrome && promotionTier === 3 ? "product-card-promotion-frame--tier-3" : "",
    promotionFullWidth ? "product-card-promotion-frame--full-width" : "",
    showPremiumChrome ? "product-card-premium-frame" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={frameClassName}>{card}</div>;
}
