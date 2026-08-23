import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON,
  PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK,
  normalizeProductOutOfStockLabel,
} from "@molha/api-contract";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useMyProductMutations } from "../model/useMyProductMutations.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";
import "./ProductRentalManageModal.css";

const TITLE_ID = "product-out-of-stock-label-modal-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function ProductOutOfStockLabelModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const [selectedLabel, setSelectedLabel] = useState(PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK);
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
    setSelectedLabel(normalizeProductOutOfStockLabel(product.productOutOfStockLabel));
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
    if (productId.length === 0) {
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: { productOutOfStockLabel: selectedLabel },
      });
      onSaved?.(updated);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_PENDING,
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
        aria-label={CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_CLOSE}
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
            {CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <p className="wholesale-price-modal__hint">
            {CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_HINT}
          </p>
          <fieldset className="rental-manage-modal__unit" disabled={isSubmitting}>
            <legend className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_TITLE}
            </legend>
            <div className="rental-manage-modal__unit-track">
              <label className="rental-manage-modal__unit-option">
                <input
                  className="rental-manage-modal__unit-input"
                  type="radio"
                  name="productOutOfStockLabel"
                  value={PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK}
                  checked={selectedLabel === PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK}
                  onChange={() => setSelectedLabel(PRODUCT_OUT_OF_STOCK_LABEL_OUT_OF_STOCK)}
                />
                <span className="rental-manage-modal__unit-face">
                  <span>{CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_OPTION_OUT_OF_STOCK}</span>
                </span>
              </label>
              <label className="rental-manage-modal__unit-option">
                <input
                  className="rental-manage-modal__unit-input"
                  type="radio"
                  name="productOutOfStockLabel"
                  value={PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON}
                  checked={selectedLabel === PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON}
                  onChange={() => setSelectedLabel(PRODUCT_OUT_OF_STOCK_LABEL_COMING_SOON)}
                />
                <span className="rental-manage-modal__unit-face">
                  <span>{CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_OPTION_COMING_SOON}</span>
                </span>
              </label>
            </div>
          </fieldset>
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
              ? CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_PENDING
              : CREATE_PRODUCT_MODAL_UI.OUT_OF_STOCK_LABEL_MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
