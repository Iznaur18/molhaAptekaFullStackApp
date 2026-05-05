import { useEffect } from "react";
import { createPortal } from "react-dom";

import { COMMON_UI, PRODUCT_CARD_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductImageLightbox.css";

/**
 * Полноэкранный просмотр: монтируется только пока открыт.
 *
 * @param {{
 *   onClose: () => void;
 *   src: string;
 *   alt: string;
 * }} props
 */
export function ProductImageLightbox({ onClose, src, alt }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="product-image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_DIALOG_LABEL}
    >
      <button
        type="button"
        className="product-image-lightbox__backdrop"
        aria-label={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_CLOSE}
        onClick={onClose}
      />
      <div className="product-image-lightbox__surface">
        <button
          type="button"
          className="product-image-lightbox__close"
          aria-label={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_CLOSE}
          onClick={onClose}
        >
          {COMMON_UI.MODAL_CLOSE_GLYPH}
        </button>
        <img
          className="product-image-lightbox__img"
          src={src}
          alt={alt}
          decoding="async"
        />
      </div>
    </div>,
    document.body,
  );
}
