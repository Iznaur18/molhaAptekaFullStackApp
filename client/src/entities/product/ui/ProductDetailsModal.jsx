import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { recordProductView } from "../api/recordProductView.js";
import {
  COMMON_UI,
  PRODUCT_CARD_UI,
  PRODUCT_DETAILS_MODAL_UI,
  USER_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import { resolveProductImageUrls } from "../lib/resolveProductImageUrls.js";
import {
  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
} from "../model/productConstants.js";
import { ProductImageLightbox } from "./ProductImageLightbox.jsx";

import "./ProductDetailsModal.css";

/**
 * @param {import("../model/types.js").ProductFromApi} product
 * @param {readonly string[]} keys
 * @param {{ onClose: () => void; onSellerNameClick?: (userId: string) => void }} handlers
 */
function renderFieldRows(product, keys, handlers) {
  const { onClose, onSellerNameClick } = handlers;

  return keys.map((key) => {
    const raw = product[key];
    const display = formatProductFieldForDisplay(key, product);
    const canOpenSellerProfile =
      key === "productSeller" &&
      typeof onSellerNameClick === "function" &&
      raw != null &&
      typeof raw === "object" &&
      raw._id != null &&
      display !== COMMON_UI.EM_DASH;

    const ddClass =
      key === "productDescription"
        ? "product-details-modal__value product-details-modal__value--multiline"
        : "product-details-modal__value";

    const valueNode = canOpenSellerProfile ? (
      <button
        type="button"
        className="product-details-modal__seller-link"
        onClick={() => {
          onClose();
          onSellerNameClick(String(raw._id));
        }}
      >
        {display}
      </button>
    ) : (
      display
    );

    return (
      <div key={key} className="product-details-modal__row">
        <dt className="product-details-modal__key">
          {PRODUCT_FIELD_LABEL_RU[key] ?? key}
        </dt>
        <dd className={ddClass}>{valueNode}</dd>
      </div>
    );
  });
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onSellerNameClick?: (userId: string) => void;
 *   isAuthorized?: boolean;
 *   onProductStatsUpdate?: (
 *     productId: string,
 *     stats: { uniqueViewerCount: number },
 *   ) => void;
 * }} props
 */
export function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onSellerNameClick,
  isAuthorized = false,
  onProductStatsUpdate,
}) {
  const imageUrls = useMemo(
    () => (product ? resolveProductImageUrls(product) : []),
    [product],
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setLightboxOpen(false);
  }, [product?._id]);

  useEffect(() => {
    if (!isOpen || !product?._id || !isAuthorized) return undefined;
    let cancelled = false;
    void (async () => {
      try {
        const { uniqueViewerCount } = await recordProductView(
          String(product._id),
        );
        if (cancelled) return;
        onProductStatsUpdate?.(String(product._id), { uniqueViewerCount });
      } catch {
        // метрика не должна ломать модалку
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, product?._id, isAuthorized, onProductStatsUpdate]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const len = imageUrls.length;
    const onKeyDown = (event) => {
      if (lightboxOpen) return;
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (len <= 1) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveImageIndex((i) => (i - 1 + len) % len);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveImageIndex((i) => (i + 1) % len);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, lightboxOpen, imageUrls.length]);

  const handleSliderPrev = (event) => {
    event.stopPropagation();
    const len = imageUrls.length;
    if (len <= 1) return;
    setActiveImageIndex((i) => (i - 1 + len) % len);
  };

  const handleSliderNext = (event) => {
    event.stopPropagation();
    const len = imageUrls.length;
    if (len <= 1) return;
    setActiveImageIndex((i) => (i + 1) % len);
  };

  if (!isOpen || !product) return null;

  const title = product.productName?.trim() || "Товар";
  const displayUrls =
    imageUrls.length > 0 ? imageUrls : [PRODUCT_IMAGE_PLACEHOLDER_URL];
  const safeIndex = Math.min(activeImageIndex, displayUrls.length - 1);
  const mainSrc = displayUrls[safeIndex];

  return createPortal(
    <>
      <div
        className="product-details-modal__backdrop"
        role="presentation"
        onClick={onClose}
      >
        <div
          className="product-details-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-details-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="product-details-modal__header">
            <h2
              id="product-details-modal-title"
              className="product-details-modal__title"
            >
              {title}
            </h2>
            <button
              type="button"
              className="product-details-modal__close"
              onClick={onClose}
              aria-label={USER_DETAILS_MODAL_UI.ARIA_CLOSE}
            >
              {COMMON_UI.MODAL_CLOSE_GLYPH}
            </button>
          </header>

          <div className="product-details-modal__body">
            <div className="product-details-modal__row-top">
              <div className="product-details-modal__image-aside">
                <div
                  className={
                    imageUrls.length > 1
                      ? "product-details-modal__hero product-details-modal__hero--multi"
                      : "product-details-modal__hero"
                  }
                  {...(imageUrls.length > 1
                    ? {
                        role: "region",
                        "aria-label":
                          PRODUCT_DETAILS_MODAL_UI.SLIDER_REGION_ARIA,
                      }
                    : {})}
                >
                  {imageUrls.length > 1 ? (
                    <>
                      <div className="product-details-modal__slider-nav">
                        <button
                          type="button"
                          className="product-details-modal__slider-btn"
                          aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
                          onClick={handleSliderPrev}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="product-details-modal__slider-btn"
                          aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
                          onClick={handleSliderNext}
                        >
                          ›
                        </button>
                      </div>
                      <span
                        className="product-details-modal__slider-counter"
                        aria-live="polite"
                      >
                        {safeIndex + 1} / {imageUrls.length}
                      </span>
                    </>
                  ) : null}
                  {imageUrls.length > 0 ? (
                    <button
                      type="button"
                      className="product-details-modal__image-zoom"
                      onClick={(event) => {
                        event.stopPropagation();
                        setLightboxOpen(true);
                      }}
                      aria-label={
                        PRODUCT_DETAILS_MODAL_UI.OPEN_GALLERY_FULLSCREEN
                      }
                    >
                      <img
                        className="product-details-modal__image"
                        src={mainSrc}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ) : (
                    <img
                      className="product-details-modal__image product-details-modal__image--fill-hero"
                      src={mainSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                {imageUrls.length > 1 ? (
                  <div
                    className="product-details-modal__thumbs"
                    role="tablist"
                    aria-label={PRODUCT_DETAILS_MODAL_UI.GALLERY_THUMBS_ARIA}
                  >
                    {imageUrls.map((url, index) => (
                      <button
                        key={`${index}-${url}`}
                        type="button"
                        role="tab"
                        aria-selected={index === safeIndex}
                        className={
                          index === safeIndex
                            ? "product-details-modal__thumb product-details-modal__thumb--active"
                            : "product-details-modal__thumb"
                        }
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <dl className="product-details-modal__list product-details-modal__list--top">
                {renderFieldRows(
                  product,
                  PRODUCT_DETAILS_MODAL_TOP_ROW_FIELD_KEYS,
                  { onClose, onSellerNameClick },
                )}
              </dl>
            </div>

            <div className="product-details-modal__row-bottom">
              <dl className="product-details-modal__list product-details-modal__list--bottom">
                {renderFieldRows(
                  product,
                  PRODUCT_DETAILS_MODAL_BOTTOM_ROW_FIELD_KEYS,
                  { onClose, onSellerNameClick },
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
      {lightboxOpen && imageUrls.length > 0 ? (
        <ProductImageLightbox
          imageUrls={imageUrls}
          startIndex={safeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>,
    document.body,
  );
}
