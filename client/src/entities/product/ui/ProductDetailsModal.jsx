import { useEffect } from "react";
import { createPortal } from "react-dom";

import { formatProductFieldForDisplay } from "../lib/formatProductFieldForDisplay.js";
import {
  PRODUCT_FIELD_LABEL_RU,
  PRODUCT_IMAGE_PLACEHOLDER_URL,
  PRODUCT_MODEL_FIELD_KEYS,
} from "../model/productConstants.js";
import { COMMON_UI, USER_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";

import "./ProductDetailsModal.css";

function isAbsoluteHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

const pickImageUrl = (product) =>
  isAbsoluteHttpUrl(product?.productImageUrl)
    ? product.productImageUrl.trim()
    : PRODUCT_IMAGE_PLACEHOLDER_URL;

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   product: import("../model/types.js").ProductFromApi | null;
 * }} props
 */
export function ProductDetailsModal({ isOpen, onClose, product }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const title = product.productName?.trim() || "Товар";
  const imageUrl = pickImageUrl(product);

  return createPortal(
    <div className="product-details-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="product-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="product-details-modal__header">
          <h2 id="product-details-modal-title" className="product-details-modal__title">
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
          <img
            className="product-details-modal__image"
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <dl className="product-details-modal__list">
            {PRODUCT_MODEL_FIELD_KEYS.map((key) => (
              <div key={key} className="product-details-modal__row">
                <dt className="product-details-modal__key">
                  {PRODUCT_FIELD_LABEL_RU[key] ?? key}
                </dt>
                <dd className="product-details-modal__value">
                  {formatProductFieldForDisplay(key, product)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>,
    document.body,
  );
}
