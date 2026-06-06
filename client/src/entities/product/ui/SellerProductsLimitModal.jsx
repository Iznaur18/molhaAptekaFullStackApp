import { useEffect } from "react";

import { SELLER_PRODUCTS_LIMIT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { SELLER_PRODUCTS_LIMIT_PREMIUM } from "../model/productConstants.js";

import "./SellerProductsLimitModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   isPremiumUser: boolean;
 *   limit: number | null;
 * }} props
 */
export function SellerProductsLimitModal({ isOpen, onClose, isPremiumUser, limit }) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || limit == null) return null;

  const body = isPremiumUser
    ? SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PREMIUM(limit)
    : SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_REGULAR(limit, SELLER_PRODUCTS_LIMIT_PREMIUM);

  return (
    <div className="seller-products-limit-modal" role="presentation">
      <div className="seller-products-limit-modal__backdrop" aria-hidden="true" />
      <div
        className="seller-products-limit-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-products-limit-modal-title"
      >
        <h2
          id="seller-products-limit-modal-title"
          className="seller-products-limit-modal__title"
        >
          {SELLER_PRODUCTS_LIMIT_MODAL_UI.TITLE}
        </h2>
        <p className="seller-products-limit-modal__body">{body}</p>
        <div className="seller-products-limit-modal__actions">
          <button
            type="button"
            className="seller-products-limit-modal__btn"
            onClick={onClose}
          >
            {SELLER_PRODUCTS_LIMIT_MODAL_UI.CLOSE}
          </button>
        </div>
      </div>
    </div>
  );
}
