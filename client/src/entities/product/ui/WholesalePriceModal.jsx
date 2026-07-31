import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  PRODUCT_WHOLESALE_MIN_QTY_MIN,
  isProductWholesaleConfigured,
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

const TITLE_ID = "wholesale-price-modal-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function WholesalePriceModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const [minQty, setMinQty] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const productId = product?._id != null ? String(product._id) : "";
  const retailPrice = Math.floor(Number(product?.productPrice) || 0);
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
    setMinQty(
      product.productWholesaleMinQty != null
        ? String(product.productWholesaleMinQty)
        : String(PRODUCT_WHOLESALE_MIN_QTY_MIN),
    );
    setPrice(
      product.productWholesalePrice != null
        ? formatIntegerGroupRu(product.productWholesalePrice)
        : "",
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
    const nextMinQty = Math.floor(Number(minQty));
    const nextPrice = parseRubPriceInput(price);
    if (!Number.isFinite(nextMinQty) || nextPrice == null) {
      setError(CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_ERROR_REQUIRED);
      return;
    }
    if (nextMinQty < PRODUCT_WHOLESALE_MIN_QTY_MIN) {
      setError(CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_ERROR_MIN_QTY);
      return;
    }
    if (
      !isProductWholesaleConfigured({
        productPrice: retailPrice,
        productWholesaleMinQty: nextMinQty,
        productWholesalePrice: nextPrice,
      })
    ) {
      setError(CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_ERROR_PRICE);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productWholesaleMinQty: nextMinQty,
          productWholesalePrice: nextPrice,
        },
      });
      onSaved?.(updated);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_ERROR_REQUIRED,
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
        aria-label={CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_CLOSE}
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
            {CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <p className="wholesale-price-modal__hint">
            {CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_HINT}
          </p>
          {retailPrice > 0 ? (
            <p className="wholesale-price-modal__retail">
              Обычная цена:{" "}
              <span className="wholesale-price-modal__retail-price">
                {retailPrice.toLocaleString("ru-RU")} ₽
              </span>
            </p>
          ) : null}
          <label className="wholesale-price-modal__field">
            <span className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_MIN_QTY_LABEL}
            </span>
            <input
              className="wholesale-price-modal__input"
              type="number"
              inputMode="numeric"
              min={PRODUCT_WHOLESALE_MIN_QTY_MIN}
              step={1}
              value={minQty}
              disabled={isSubmitting}
              onChange={(event) => setMinQty(event.target.value)}
            />
          </label>
          <label className="wholesale-price-modal__field">
            <span className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_PRICE_LABEL}
            </span>
            <input
              className="wholesale-price-modal__input"
              {...INTEGER_INPUT_FIELD_PROPS}
              value={price}
              disabled={isSubmitting}
              onChange={(event) => setPrice(formatRubPriceInput(event.target.value))}
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
              ? CREATE_PRODUCT_MODAL_UI.MANAGE_WHOLESALE_PENDING
              : CREATE_PRODUCT_MODAL_UI.WHOLESALE_MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
