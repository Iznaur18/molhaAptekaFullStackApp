import { useEffect } from "react";

import { SELLER_PRODUCTS_LIMIT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import {
  SELLER_PRODUCTS_LIMIT_PREMIUM,
  SELLER_PRODUCTS_LIMIT_REGULAR,
} from "../model/productConstants.js";

import "./SellerProductsLimitModal.css";

/**
 * @param {number} limit
 * @param {boolean} isPremiumUser
 * @param {boolean} hasPersonalOverride
 */
function resolveLimitModalBody(limit, isPremiumUser, hasPersonalOverride) {
  if (hasPersonalOverride) {
    return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PERSONAL(limit);
  }
  if (isPremiumUser && limit === SELLER_PRODUCTS_LIMIT_PREMIUM) {
    return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PREMIUM(limit);
  }
  if (!isPremiumUser && limit === SELLER_PRODUCTS_LIMIT_REGULAR) {
    return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_REGULAR(
      limit,
      SELLER_PRODUCTS_LIMIT_PREMIUM,
    );
  }
  return SELLER_PRODUCTS_LIMIT_MODAL_UI.BODY_PERSONAL(limit);
}

/**
 * @param {{
 *   isOpen: boolean;
 *   onClose: () => void;
 *   isPremiumUser: boolean;
 *   limit: number | null;
 *   hasPersonalOverride?: boolean;
 * }} props
 */
export function SellerProductsLimitModal({
  isOpen,
  onClose,
  isPremiumUser,
  limit,
  hasPersonalOverride = false,
}) {
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

  const body = resolveLimitModalBody(limit, isPremiumUser, hasPersonalOverride);

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
