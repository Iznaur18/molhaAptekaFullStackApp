import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
  PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
} from "@izibuy/shared-lib";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { INTEGER_INPUT_FIELD_PROPS, keepDigitsOnly } from "../../../shared/lib/numericInput.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useMyProductMutations } from "../model/useMyProductMutations.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";

const TITLE_ID = "product-buy-n-free-modal-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function ProductBuyNFreeModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const [threshold, setThreshold] = useState(String(PRODUCT_BUY_N_FREE_THRESHOLD_MIN));
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
    setThreshold(
      product.productBuyNFreeThreshold != null
        ? String(product.productBuyNFreeThreshold)
        : String(PRODUCT_BUY_N_FREE_THRESHOLD_MIN),
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
    const nextThreshold = Math.floor(Number(threshold));
    if (
      !Number.isFinite(nextThreshold) ||
      nextThreshold < PRODUCT_BUY_N_FREE_THRESHOLD_MIN ||
      nextThreshold > PRODUCT_BUY_N_FREE_THRESHOLD_MAX
    ) {
      setError(CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_ERROR_REQUIRED);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productBuyNFreeThreshold: nextThreshold,
          productBuyNFreeEnabled: true,
        },
      });
      onSaved?.(updated);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_ERROR_REQUIRED,
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
        aria-label={CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_CLOSE}
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
            {CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <p className="wholesale-price-modal__hint">
            {CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_HINT}
          </p>
          <label className="wholesale-price-modal__field">
            <span className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_THRESHOLD_LABEL}
            </span>
            <input
              className="wholesale-price-modal__input"
              type="number"
              inputMode="numeric"
              min={PRODUCT_BUY_N_FREE_THRESHOLD_MIN}
              max={PRODUCT_BUY_N_FREE_THRESHOLD_MAX}
              {...INTEGER_INPUT_FIELD_PROPS}
              value={threshold}
              disabled={isSubmitting}
              onChange={(event) => setThreshold(keepDigitsOnly(event.target.value))}
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
            disabled={isSubmitting || productId.length === 0}
            onClick={() => {
              void handleSave();
            }}
          >
            {isSubmitting
              ? CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_PENDING
              : CREATE_PRODUCT_MODAL_UI.BUY_N_FREE_MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
