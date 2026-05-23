import { useEffect, useMemo, useState } from "react";

import { AddToCartButton } from "../../../features/cart-add/ui/AddToCartButton.jsx";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import { shouldShowPremiumProductCardChrome } from "../lib/isPremiumSellerProduct.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import {
  canSellerDeleteProduct,
  canSellerEditProduct,
  canSellerToggleCatalogVisibility,
  getProductModerationBadgeClassName,
  getProductModerationBadgeLabel,
} from "../lib/getProductModerationUi.js";
import { PRODUCT_MODERATION_REJECTED } from "../model/productModerationConstants.js";
import {
  PRODUCT_CARD_MODERATION_PREVIEW_FIELD_KEYS,
  PRODUCT_CARD_PREVIEW_FIELD_KEYS,
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
} from "../model/productConstants.js";
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
 * @param {boolean} [props.isAvailabilityTogglePending]
 * @param {(product: import('../model/types.js').ProductFromApi) => void} [props.onOpenDetails]
 * @param {boolean} [props.isAuthorized]
 * @param {() => void} [props.onRequestLoginAddToCart]
 * @param {boolean} [props.isMineMode]
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
  isAvailabilityTogglePending = false,
  onOpenDetails,
  isAuthorized = false,
  onRequestLoginAddToCart = () => {},
  isMineMode = false,
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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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

  useEffect(() => {
    setIsDeleteConfirmOpen(false);
  }, [product._id]);

  useEffect(() => {
    if (onDeleteProduct == null) setIsDeleteConfirmOpen(false);
  }, [onDeleteProduct]);

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

  const handleDeleteIntentClick = () => {
    if (hasOpenSalesLocked) return;
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmCancel = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteConfirmYes = () => {
    if (onDeleteProduct == null || product._id == null) return;
    void onDeleteProduct(String(product._id));
  };

  const isListedForOthers = product.productIsAvailable !== false;
  const hasOpenSalesLocked = product.hasOpenSales === true;
  const sellerCanEdit = !isMineMode || canSellerEditProduct(product);
  const sellerCanDelete = !isMineMode || canSellerDeleteProduct(product);
  const sellerCanToggleVisibility =
    !isMineMode || canSellerToggleCatalogVisibility(product);
  const ownerActionsLocked =
    isDeletePending ||
    isAvailabilityTogglePending ||
    isDeleteConfirmOpen ||
    hasOpenSalesLocked ||
    !sellerCanEdit;
  const rejectionComment =
    isMineMode &&
    product.productModerationStatus === PRODUCT_MODERATION_REJECTED &&
    String(product.productModerationComment ?? "").trim() !== ""
      ? String(product.productModerationComment).trim()
      : "";

  const handleEditClick = (event) => {
    event.stopPropagation();
    if (onEditProduct == null || product._id == null) return;
    onEditProduct(product);
  };

  const renderEditButton = () => {
    if (onEditProduct == null) return null;
    return (
      <button
        type="button"
        className="product-card__edit"
        onClick={handleEditClick}
        disabled={ownerActionsLocked}
      >
        {PRODUCT_CARD_UI.EDIT_PRODUCT}
      </button>
    );
  };

  const handleAvailabilityToggle = () => {
    if (onSetProductAvailability == null || product._id == null) return;
    if (ownerActionsLocked) return;
    void onSetProductAvailability(String(product._id), !isListedForOthers);
  };

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

  const renderOwnerCatalogVisibility = () => {
    if (onSetProductAvailability == null || !sellerCanToggleVisibility) {
      return null;
    }

    if (isAvailabilityTogglePending) {
      return (
        <p
          className="product-card__availability-pending"
          aria-live="polite"
        >
          {PRODUCT_CARD_UI.AVAILABILITY_TOGGLE_PENDING}
        </p>
      );
    }

    return (
      <div className="product-card__availability">
        <p className="product-card__availability-status">
          {isListedForOthers
            ? PRODUCT_CARD_UI.AVAILABILITY_STATUS_VISIBLE
            : PRODUCT_CARD_UI.AVAILABILITY_STATUS_HIDDEN}
        </p>
        <button
          type="button"
          className="product-card__availability-toggle"
          onClick={handleAvailabilityToggle}
          disabled={ownerActionsLocked}
        >
          {isListedForOthers
            ? PRODUCT_CARD_UI.HIDE_FROM_CATALOG
            : PRODUCT_CARD_UI.SHOW_IN_CATALOG}
        </button>
      </div>
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

  const renderDeleteFooter = () => {
    if (onDeleteProduct == null || !sellerCanDelete) return null;

    if (isDeletePending) {
      return (
        <p
          className="product-card__delete-pending"
          aria-live="polite"
        >
          {PRODUCT_CARD_UI.DELETE_PRODUCT_PENDING}
        </p>
      );
    }

    if (isDeleteConfirmOpen) {
      return (
        <div className="product-card__delete-confirm">
          <p className="product-card__delete-confirm-question">
            {PRODUCT_CARD_UI.DELETE_CONFIRM_QUESTION}
          </p>
          <div className="product-card__delete-confirm-actions">
            <button
              type="button"
              className="product-card__delete-confirm-yes"
              onClick={handleDeleteConfirmYes}
            >
              {PRODUCT_CARD_UI.DELETE_CONFIRM_YES}
            </button>
            <button
              type="button"
              className="product-card__delete-confirm-cancel"
              onClick={handleDeleteConfirmCancel}
            >
              {PRODUCT_CARD_UI.DELETE_CONFIRM_CANCEL}
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        className="product-card__delete"
        onClick={handleDeleteIntentClick}
        disabled={hasOpenSalesLocked}
      >
        {PRODUCT_CARD_UI.DELETE_PRODUCT}
      </button>
    );
  };

  const renderOpenSalesHint = () => {
    if (onDeleteProduct == null || !hasOpenSalesLocked) return null;
    return (
      <p className="product-card__open-sales-hint">
        {PRODUCT_CARD_UI.OPEN_SALES_LOCKED_HINT}
      </p>
    );
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
  const card = (
    <article className="product-card">
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
        {renderModerationBadge()}
        {!isMineMode && !isModerationQueue && product.productIsAvailable === false ? (
          <p className="product-card__hidden-badge" role="status">
            {PRODUCT_CARD_UI.HIDDEN_FROM_CATALOG_BADGE}
          </p>
        ) : null}
        <dl className="product-card__fields product-card__fields--preview">
          {previewFieldKeys.map((key) => {
            const raw = product[key];
            const display = formatProductFieldForDisplay(key, product);
            const canOpenSellerProfile =
              key === "productSeller" &&
              typeof onSellerNameClick === "function" &&
              raw != null &&
              typeof raw === "object" &&
              raw._id != null &&
              display !== COMMON_UI.EM_DASH;
            const rowClass = ["product-card__row"];
            if (key === "productPrice") rowClass.push("product-card__row--price");
            if (key === "productCategory")
              rowClass.push("product-card__row--category");
            if (key === "productDescription")
              rowClass.push("product-card__row--description");

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
                  {canOpenSellerProfile ? (
                    <button
                      type="button"
                      className="product-card__seller-name"
                      onClick={handleSellerClick}
                    >
                      {display}
                    </button>
                  ) : (
                    display
                  )}
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
          <>
            {renderOpenSalesHint()}
            {renderOwnerCatalogVisibility()}
            {renderEditButton()}
            {renderDeleteFooter()}
          </>
        ) : product.productIsAvailable !== false && product._id != null ? (
          <AddToCartButton
            productId={String(product._id)}
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLoginAddToCart}
          />
        ) : null}
      </div>
    </article>
  );

  if (!showPremiumChrome) {
    return card;
  }

  return <div className="product-card-premium-frame">{card}</div>;
}
