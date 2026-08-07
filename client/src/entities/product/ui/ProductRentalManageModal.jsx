import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  PRODUCT_RENTAL_PRICE_UNIT_DAY,
  PRODUCT_RENTAL_PRICE_UNIT_HOUR,
  isProductRentalConfigured,
} from "@izibuy/shared-lib";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  formatIntegerGroupRu,
  formatRubPriceInput,
  parseRubPriceInput,
} from "../../../shared/lib/numericInput.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useMyProductMutations } from "../model/useMyProductMutations.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";
import "./ProductRentalManageModal.css";

const TITLE_ID = "rental-manage-modal-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function ProductRentalManageModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState(PRODUCT_RENTAL_PRICE_UNIT_DAY);
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
    setPrice(
      product.productRentalPriceRub != null
        ? formatIntegerGroupRu(product.productRentalPriceRub)
        : "",
    );
    setUnit(
      product.productRentalPriceUnit === PRODUCT_RENTAL_PRICE_UNIT_HOUR
        ? PRODUCT_RENTAL_PRICE_UNIT_HOUR
        : PRODUCT_RENTAL_PRICE_UNIT_DAY,
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
    const nextPrice = parseRubPriceInput(price);
    if (nextPrice == null || nextPrice < 1) {
      setError(CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_ERROR_REQUIRED);
      return;
    }
    if (
      !isProductRentalConfigured({
        productRentalPriceRub: nextPrice,
        productRentalPriceUnit: unit,
      })
    ) {
      setError(CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_ERROR_REQUIRED);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productRentalPriceRub: nextPrice,
          productRentalPriceUnit: unit,
        },
      });
      onSaved?.(updated);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_ERROR_REQUIRED,
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
        aria-label={CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_CLOSE}
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
            {CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <p className="wholesale-price-modal__hint">
            {CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_HINT}
          </p>
          <label className="wholesale-price-modal__field">
            <span className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_PRICE_LABEL}
            </span>
            <input
              className="wholesale-price-modal__input"
              {...INTEGER_INPUT_FIELD_PROPS}
              value={price}
              disabled={isSubmitting}
              onChange={(event) => setPrice(formatRubPriceInput(event.target.value))}
            />
          </label>
          <fieldset className="rental-manage-modal__unit" disabled={isSubmitting}>
            <legend className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_UNIT_LABEL}
            </legend>
            <div className="rental-manage-modal__unit-track">
              <label className="rental-manage-modal__unit-option">
                <input
                  className="rental-manage-modal__unit-input"
                  type="radio"
                  name="productRentalPriceUnit"
                  checked={unit === PRODUCT_RENTAL_PRICE_UNIT_DAY}
                  onChange={() => setUnit(PRODUCT_RENTAL_PRICE_UNIT_DAY)}
                />
                <span className="rental-manage-modal__unit-face">
                  <span>{CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_UNIT_DAY}</span>
                  <span className="rental-manage-modal__unit-face-sub">
                    {CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_UNIT_DAY_HINT}
                  </span>
                </span>
              </label>
              <label className="rental-manage-modal__unit-option">
                <input
                  className="rental-manage-modal__unit-input"
                  type="radio"
                  name="productRentalPriceUnit"
                  checked={unit === PRODUCT_RENTAL_PRICE_UNIT_HOUR}
                  onChange={() => setUnit(PRODUCT_RENTAL_PRICE_UNIT_HOUR)}
                />
                <span className="rental-manage-modal__unit-face">
                  <span>{CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_UNIT_HOUR}</span>
                  <span className="rental-manage-modal__unit-face-sub">
                    {CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_UNIT_HOUR_HINT}
                  </span>
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
            disabled={isSubmitting || !productId}
            onClick={() => {
              void handleSave();
            }}
          >
            {isSubmitting
              ? CREATE_PRODUCT_MODAL_UI.MANAGE_RENTAL_PENDING
              : CREATE_PRODUCT_MODAL_UI.RENTAL_MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
