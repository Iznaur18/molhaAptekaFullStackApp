import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { ModalCloseIcon } from "../../../shared/ui/icon/index.js";

import "./ProductImageLightbox.css";

function filterHttpImageUrls(imageUrls) {
  if (!Array.isArray(imageUrls)) return [];
  return imageUrls.map((s) => String(s).trim()).filter((u) => /^https?:\/\//i.test(u));
}

/**
 * Полноэкранный просмотр одного или нескольких изображений (портал в `body`).
 *
 * @param {{
 *   onClose: () => void;
 *   imageUrls: string[];
 *   startIndex?: number;
 * }} props
 */
export function ProductImageLightbox({ onClose, imageUrls, startIndex = 0 }) {
  const dialogRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const urls = useMemo(() => filterHttpImageUrls(imageUrls), [imageUrls]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const max = Math.max(0, urls.length - 1);
    setIndex(Math.min(Math.max(0, startIndex), max));
  }, [startIndex, urls]);

  const safeIndex = Math.min(index, Math.max(0, urls.length - 1));
  const src = urls[safeIndex] ?? "";
  const len = urls.length;

  const goPrev = useCallback(() => {
    if (len <= 1) return;
    setIndex((i) => (i - 1 + len) % len);
  }, [len]);

  const goNext = useCallback(() => {
    if (len <= 1) return;
    setIndex((i) => (i + 1) % len);
  }, [len]);

  useScrollLock(true);
  useDialogFocusTrap(dialogRef, {
    active: len > 0,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (len <= 1) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        setIndex((i) => (i - 1 + len) % len);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        setIndex((i) => (i + 1) % len);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [len, onClose]);

  if (len === 0) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="product-image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={
        len > 1
          ? PRODUCT_CARD_UI.IMAGE_LIGHTBOX_DIALOG_LABEL_GALLERY
          : PRODUCT_CARD_UI.IMAGE_LIGHTBOX_DIALOG_LABEL
      }
    >
      <div className="product-image-lightbox__backdrop" aria-hidden="true" />
      <div className="product-image-lightbox__surface">
        <button
          ref={closeButtonRef}
          type="button"
          className="product-image-lightbox__close"
          aria-label={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_CLOSE}
          onClick={onClose}
        >
          <ModalCloseIcon />
        </button>
        <div
          className={
            len > 1
              ? "product-image-lightbox__stage product-image-lightbox__stage--multi"
              : "product-image-lightbox__stage"
          }
        >
          {len > 1 ? (
            <button
              type="button"
              className="product-image-lightbox__nav product-image-lightbox__nav--prev"
              aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
              onClick={goPrev}
            >
              ‹
            </button>
          ) : null}
          <div className="product-image-lightbox__img-box">
            <img
              className="product-image-lightbox__img"
              src={src}
              alt=""
              decoding="async"
            />
          </div>
          {len > 1 ? (
            <button
              type="button"
              className="product-image-lightbox__nav product-image-lightbox__nav--next"
              aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
              onClick={goNext}
            >
              ›
            </button>
          ) : null}
        </div>
        {len > 1 ? (
          <p className="product-image-lightbox__counter" aria-live="polite">
            {safeIndex + 1} / {len}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
