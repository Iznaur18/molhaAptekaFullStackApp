import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AFFILIATE_MANAGE_DEFAULT_PERCENT,
  AFFILIATE_PERCENT_MIN,
  isProductAffiliateConfigured,
  resolveAffiliateEnableLoyaltyGate,
} from "@izibuy/shared-lib";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useMyLoyaltyPointsStatusQuery } from "../../user/model/useMyLoyaltyPointsStatusQuery.js";
import { useMyProductMutations } from "../model/useMyProductMutations.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";

const TITLE_ID = "affiliate-percent-modal-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function AffiliatePercentModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const loyaltyStatusQuery = useMyLoyaltyPointsStatusQuery({ enabled: isOpen });
  const [percent, setPercent] = useState(String(AFFILIATE_MANAGE_DEFAULT_PERCENT));
  const [error, setError] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen || !product) {
      return;
    }
    setError("");
    const existing = Math.floor(Number(product.affiliatePercent) || 0);
    setPercent(
      String(
        existing >= AFFILIATE_PERCENT_MIN
          ? existing
          : AFFILIATE_MANAGE_DEFAULT_PERCENT,
      ),
    );
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.container !== panelRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    setError("");
    const nextPercent = Math.floor(Number(percent));
    if (
      !Number.isFinite(nextPercent) ||
      !isProductAffiliateConfigured({ affiliatePercent: nextPercent })
    ) {
      setError(CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_ERROR_REQUIRED);
      return;
    }

    if (product?.affiliateEnabled !== true) {
      const gate = resolveAffiliateEnableLoyaltyGate({
        productPrice: product?.productPrice,
        affiliatePercent: nextPercent,
        loyaltyPointsBalance: loyaltyStatusQuery.data?.loyaltyPointsBalance ?? 0,
        loyaltyPointsReserved: loyaltyStatusQuery.data?.loyaltyPointsReserved ?? 0,
      });
      if (!gate.ok) {
        setError(gate.message);
        return;
      }
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          affiliatePercent: nextPercent,
          affiliateEnabled: true,
        },
      });
      onSaved?.(updated);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_ERROR_REQUIRED,
      );
    }
  };

  if (!mounted) {
    return null;
  }

  const backdropClassName = [
    "wholesale-price-modal__backdrop",
    isVisible ? "wholesale-price-modal__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div className={backdropClassName} role="presentation">
      <div className="wholesale-price-modal__scrim" aria-hidden="true" />
      <button
        type="button"
        className="wholesale-price-modal__dismiss"
        aria-label={CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_CLOSE}
        onClick={onClose}
      />
      <div className="wholesale-price-modal__keyboard-bleed" aria-hidden="true" />
      <div
        ref={panelRef}
        className="wholesale-price-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
      >
        <header className="wholesale-price-modal__header">
          <h2 id={TITLE_ID} className="wholesale-price-modal__title">
            {CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <p className="wholesale-price-modal__hint">
            {CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_HINT}
          </p>
          <p className="wholesale-price-modal__hint">
            {CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_BUDGET_HINT}
          </p>
          <label className="wholesale-price-modal__field">
            <span className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_PERCENT_LABEL}
            </span>
            <input
              className="wholesale-price-modal__input"
              {...INTEGER_INPUT_FIELD_PROPS}
              value={percent}
              disabled={isSubmitting}
              maxLength={2}
              onChange={(event) => setPercent(keepDigitsOnly(event.target.value))}
            />
          </label>
          {error ? (
            <p className="wholesale-price-modal__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <footer className="wholesale-price-modal__footer">
          <button
            type="button"
            className="wholesale-price-modal__save"
            disabled={isSubmitting || !productId}
            onClick={() => {
              void handleSave();
            }}
          >
            {isSubmitting
              ? CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_PENDING
              : CREATE_PRODUCT_MODAL_UI.AFFILIATE_MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
