import { useEffect, useMemo, useState } from "react";

import { AddToCartButton } from "../../../features/cart-add/ui/AddToCartButton.jsx";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
  PRODUCT_REVIEW_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import { isCurrentUserProductSeller } from "../lib/isCurrentUserProductSeller.js";
import { getProductPurchaseLimit } from "../lib/getProductPurchaseLimit.js";
import { isProductRaffleParticipant } from "../../raffle/lib/isProductRaffleParticipant.js";
import { resolveAuctionUiState } from "../lib/resolveAuctionUiState.js";
import { shouldShowPremiumProductCardChrome } from "../lib/isPremiumSellerProduct.js";
import {
  isCatalogPromotionActive,
} from "../lib/productPromotionStatus.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
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
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
} from "../model/productConstants.js";
import { UserPremiumDisplayName } from "../../user/ui/UserPremiumDisplayName.jsx";
import { ProductModerationDetailsFooter } from "./ProductModerationDetailsFooter.jsx";
import { PRODUCT_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductCard.css";

function isAbsoluteHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

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
 * @param {string | null} [props.currentUserId]
 * @param {() => void} [props.onRequestLoginAddToCart]
 * @param {boolean} [props.isMineMode]
 * @param {boolean} [props.isPromotionPending]
 * @param {boolean} [props.highlightCatalogPromotion]
 * @param {boolean} [props.highlightRaffleProduct]
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
  currentUserId = null,
  onRequestLoginAddToCart = () => {},
  isMineMode = false,
  isPromotionPending = false,
  highlightCatalogPromotion = false,
  highlightRaffleProduct = false,
  isModerationQueue = false,
  moderationActions = null,
}) {
  const heading = product.productName?.trim() || PRODUCT_CARD_UI.DEFAULT_TITLE;
  const galleryUrls = useMemo(() => resolveProductImageUrls(product), [product]);
  const previewFieldKeys = useMemo(() => {
    if (isModerationQueue) return PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS;
    if (isMineMode) {
      return [...PRODUCT_CARD_PREVIEW_FIELD_KEYS, "uniqueViewerCount"];
    }
    return PRODUCT_CARD_PREVIEW_FIELD_KEYS;
  }, [isMineMode, isModerationQueue]);
  const [cardImageIndex, setCardImageIndex] = useState(0);

  const primaryImageUrl = useMemo(() => {
    const url = galleryUrls[cardImageIndex];
    return isAbsoluteHttpUrl(url) ? url.trim() : null;
  }, [galleryUrls, cardImageIndex]);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  useEffect(() => {
    setCardImageIndex(0);
  }, [product._id]);

  useEffect(() => {
    setCardImageIndex((i) =>
      Math.min(i, Math.max(0, galleryUrls.length - 1)),
    );
  }, [galleryUrls.length]);

  useEffect(() => {
    setImageLoadFailed(false);
    setUseFallbackImage(primaryImageUrl == null);
  }, [primaryImageUrl, product._id]);

  const imageUrl = useFallbackImage
    ? PRODUCT_IMAGE_PLACEHOLDER_URL
    : primaryImageUrl;

  const handleImageError = () => {
    if (!useFallbackImage) {
      setUseFallbackImage(true);
      return;
    }
    setImageLoadFailed(true);
  };

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

  const renderModerationBadge = () => {
    if (!isMineMode && !isModerationQueue) return null;
    return (
      <>
        <span className={getProductModerationBadgeClassName(product)}>
          {getProductModerationBadgeLabel(product)}
        </span>
        {rejectionComment ? (
          <p className="product-card__moderation-comment">
            {PRODUCT_MODERATION_PAGE_UI.REJECTION_COMMENT_PREFIX}{" "}
            {rejectionComment}
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
  const handleCardImagePrev = (event) => {
    event.stopPropagation();
    const n = galleryUrls.length;
    if (n <= 1) return;
    setCardImageIndex((i) => (i - 1 + n) % n);
  };

  /** @param {import('react').MouseEvent<HTMLButtonElement>} event */
  const handleCardImageNext = (event) => {
    event.stopPropagation();
    const n = galleryUrls.length;
    if (n <= 1) return;
    setCardImageIndex((i) => (i + 1) % n);
  };

  const reviewRatingLine = formatProductReviewRatingLine(
    product.averageRating ?? 0,
    product.reviewCount ?? 0,
  );
  const hasReviewRating = reviewRatingLine.length > 0;

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
    if (
      !isMineMode &&
      !isModerationQueue &&
      product.productIsAvailable === false
    ) {
      return (
        <p className="product-card__hidden-badge" role="status">
          {PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE}
        </p>
      );
    }
    if (isMineMode && isPromotionPending && !isPromotionActive) {
      return (
        <p
          className="product-card__promotion-badge product-card__promotion-badge_pending"
          role="status"
        >
          {PRODUCT_CARD_UI.PROMOTION_PENDING_BADGE}
        </p>
      );
    }
    if (isPromotionActive) {
      return (
        <p className="product-card__promotion-badge" role="status">
          {PRODUCT_CARD_UI.PROMOTED_BADGE}
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
  const showPromotionChrome =
    highlightCatalogPromotion &&
    !isMineMode &&
    !isModerationQueue &&
    isPromotionActive;
  const showRaffleBadge =
    !isModerationQueue && isProductRaffleParticipant(product);
  const showAuctionBadge =
    !isModerationQueue && resolveAuctionUiState(product).auctionActive;

  /**
   * @param {import('../model/types.js').ProductFromApi['productSeller']} raw
   * @param {string} display
   */
  const renderProductSellerValue = (raw, display) => {
    const isPopulatedSeller =
      raw != null && typeof raw === "object" && raw._id != null;
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
          onClick={handleSellerClick}
        >
          {nameNode}
        </button>
      );
    }

    return nameNode;
  };

  const showRaffleParticipantChrome =
    (highlightRaffleProduct || showRaffleBadge) &&
    !isMineMode &&
    !isModerationQueue;
  const cardClassName = [
    "product-card",
    showRaffleParticipantChrome ? "product-card--raffle-participant" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const card = (
    <article className={cardClassName}>
      <div
        className={bodyClassName}
        {...(isModerationQueue
          ? {}
          : {
              tabIndex: 0,
              "aria-label": detailsSurfaceLabel,
              onClick: handleOpenDetails,
              onKeyDown: handleDetailsSurfaceKeyDown,
            })}
      >
        {imageUrl && !imageLoadFailed ? (
          <div
            className={
              galleryUrls.length > 1
                ? "product-card__image-frame product-card__image-frame--gallery"
                : "product-card__image-frame"
            }
          >
            <img
              className="product-card__image"
              src={imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              draggable={false}
            />
            {galleryUrls.length > 1 ? (
              <>
                <div className="product-card__image-nav">
                  <button
                    type="button"
                    className="product-card__image-nav-btn"
                    aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
                    onClick={handleCardImagePrev}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="product-card__image-nav-btn"
                    aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
                    onClick={handleCardImageNext}
                  >
                    ›
                  </button>
                </div>
                <span className="product-card__image-counter" aria-live="polite">
                  {cardImageIndex + 1} / {galleryUrls.length}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
        <h2 className="product-card__heading">{heading}</h2>
        {!isModerationQueue ? (
          <div className="product-card__meta-strip">
            <p
              className={
                hasReviewRating
                  ? "product-card__rating"
                  : "product-card__rating product-card__rating--placeholder"
              }
              aria-label={
                hasReviewRating
                  ? reviewRatingLine
                  : PRODUCT_REVIEW_UI.NO_REVIEWS
              }
            >
              {hasReviewRating
                ? reviewRatingLine
                : PRODUCT_REVIEW_UI.NO_REVIEWS}
            </p>
            <div className="product-card__status-badges-row">
              {renderStatusSlot()}
              {showAuctionBadge ? (
                <p className="product-card__auction-badge" role="status">
                  {PRODUCT_CARD_UI.AUCTION_BADGE}
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
        {renderModerationBadge()}
        <dl className="product-card__fields product-card__fields--preview">
          {previewFieldKeys.map((key) => {
            const raw = product[key];
            const display = formatProductFieldForDisplay(key, product);
            const rowClass = ["product-card__row"];
            if (key === "productPrice") rowClass.push("product-card__row--price");
            if (key === "productCategory")
              rowClass.push("product-card__row--category");
            if (key === "productDescription")
              rowClass.push("product-card__row--description");
            if (key === "productSeller") rowClass.push("product-card__row--seller");

            if (key === "productSeller") {
              return (
                <div key={key} className={rowClass.join(" ")}>
                  <dt className="product-card__key product-card__key--seller-inline">
                    {PRODUCT_FIELD_LABEL_RU.productSeller}:
                  </dt>
                  <dd className="product-card__value product-card__value--seller-inline">
                    {renderProductSellerValue(raw, display)}
                  </dd>
                </div>
              );
            }

            return (
              <div key={key} className={rowClass.join(" ")}>
                <dt className="product-card__key">
                  {PRODUCT_FIELD_LABEL_RU[key] ?? key}
                </dt>
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
      </div>
      <div className="product-card__footer-actions">
        {isModerationQueue && moderationActions ? (
          <ProductModerationDetailsFooter
            rejectComment={moderationActions.rejectComment}
            onRejectCommentChange={moderationActions.onRejectCommentChange}
            onApprove={moderationActions.onApprove}
            onReject={moderationActions.onReject}
            isBusy={moderationActions.isBusy}
            errorMessage={moderationActions.errorMessage}
          />
        ) : onDeleteProduct ? (
          <div className="product-card__seller-toolbar">
            {onPromoteProduct ? (
              <button
                type="button"
                className="product-card__promote"
                disabled={
                  product.productIsAvailable === false ||
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
        ) : product.productIsAvailable !== false &&
          product._id != null &&
          !isCurrentUserProductSeller(product, currentUserId) ? (
          <AddToCartButton
            productId={String(product._id)}
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLoginAddToCart}
            maxQuantity={purchaseLimit}
          />
        ) : null}
      </div>
    </article>
  );

  if (!showPromotionChrome && !showPremiumChrome) {
    return card;
  }

  const frameClassName = [
    showPromotionChrome ? "product-card-promotion-frame" : "",
    showPremiumChrome ? "product-card-premium-frame" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={frameClassName}>{card}</div>;
}
