import { useEffect, useMemo, useState } from "react";

import { AddToCartButton } from "../../../features/cart-add/ui/AddToCartButton.jsx";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import {
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
  PRODUCT_MODEL_FIELD_KEYS,
} from "../model/productConstants.js";

import { ProductImageLightbox } from "./ProductImageLightbox.jsx";

import "./ProductCard.css";

function isAbsoluteHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * @param {object} props
 * @param {import('../model/types.js').ProductFromApi} props.product
 * @param {(userId: string) => void} [props.onSellerNameClick]
 * @param {(productId: string) => void | Promise<void>} [props.onDeleteProduct]
 * @param {boolean} [props.isDeletePending]
 */
export function ProductCard({
  product,
  onSellerNameClick,
  onDeleteProduct,
  isDeletePending = false,
}) {
  const heading = product.productName?.trim() || PRODUCT_CARD_UI.DEFAULT_TITLE;
  const primaryImageUrl = useMemo(
    () =>
      isAbsoluteHttpUrl(product.productImageUrl)
        ? product.productImageUrl.trim()
        : null,
    [product.productImageUrl],
  );
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);

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

  useEffect(() => {
    setIsImageLightboxOpen(false);
  }, [product._id]);

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
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmCancel = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteConfirmYes = () => {
    if (onDeleteProduct == null || product._id == null) return;
    void onDeleteProduct(String(product._id));
  };

  const handleOpenImageLightbox = () => {
    setIsImageLightboxOpen(true);
  };

  const handleCloseImageLightbox = () => {
    setIsImageLightboxOpen(false);
  };

  const renderDeleteFooter = () => {
    if (onDeleteProduct == null) return null;

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
      >
        {PRODUCT_CARD_UI.DELETE_PRODUCT}
      </button>
    );
  };

  return (
    <article className="product-card" aria-label={heading}>
      {imageUrl && !imageLoadFailed ? (
        <>
          <button
            type="button"
            className="product-card__image-trigger"
            aria-label={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_OPEN_LABEL}
            onClick={handleOpenImageLightbox}
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
          </button>
          {isImageLightboxOpen ? (
            <ProductImageLightbox
              onClose={handleCloseImageLightbox}
              src={imageUrl}
              alt={heading}
            />
          ) : null}
        </>
      ) : null}
      <h2 className="product-card__heading">{heading}</h2>
      <dl className="product-card__fields">
        {PRODUCT_MODEL_FIELD_KEYS.map((key) => {
          const raw = product[key];
          const display = formatProductFieldForDisplay(key, product);
          const canOpenSellerProfile =
            key === "productSeller" &&
            typeof onSellerNameClick === "function" &&
            raw != null &&
            typeof raw === "object" &&
            raw._id != null &&
            display !== COMMON_UI.EM_DASH;

          return (
            <div key={key} className="product-card__row">
              <dt className="product-card__key">
                {PRODUCT_FIELD_LABEL_RU[key] ?? key}
              </dt>
              <dd className="product-card__value">
                {canOpenSellerProfile ? (
                  <button
                    type="button"
                    className="product-card__seller-name"
                    onClick={() => onSellerNameClick(String(raw._id))}
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
      <div className="product-card__footer-actions">
        {onDeleteProduct
          ? renderDeleteFooter()
          : product.productIsAvailable !== false && product._id != null ? (
              <AddToCartButton productId={String(product._id)} />
            ) : null}
      </div>
    </article>
  );
}
