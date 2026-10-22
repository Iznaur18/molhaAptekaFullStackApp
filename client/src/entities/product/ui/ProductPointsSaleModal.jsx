import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT,
  PRODUCT_POINTS_PER_BUYER_LIMIT_MAX,
  PRODUCT_POINTS_PRICE_MAX,
  PRODUCT_POINTS_PRICE_MIN,
  isProductPointsSaleActive,
  normalizeProductPointsPerBuyerLimit,
} from "@molha/api-contract";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useMyProductMutations } from "../model/useMyProductMutations.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";

const TITLE_ID = "product-points-sale-modal-title";

/**
 * Продажа за баллы: цена в баллах, лимит в одни руки, включить / выключить.
 *
 * Окно само сохраняет товар, как «Бесплатно от N»: тумблер в управлении
 * только открывает его, потому что и включение, и выключение — решение с
 * последствиями (акции гаснут), его стоит видеть целиком.
 *
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function ProductPointsSaleModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const [price, setPrice] = useState("");
  const [limit, setLimit] = useState(String(PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT));
  const [noLimit, setNoLimit] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;
  const isEnabled = isProductPointsSaleActive(product);

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
      product.productPointsPrice != null ? String(product.productPointsPrice) : "",
    );
    const currentLimit = normalizeProductPointsPerBuyerLimit(
      product.productPointsPerBuyerLimit,
    );
    setNoLimit(currentLimit == null);
    setLimit(String(currentLimit ?? PRODUCT_POINTS_PER_BUYER_LIMIT_DEFAULT));
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

  /** @param {Record<string, unknown>} body */
  const save = async (body) => {
    try {
      const updated = await patchMutation.mutateAsync({ productId, body });
      onSaved?.(updated);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_ERROR_PRICE,
      );
    }
  };

  const handleSave = async () => {
    setError("");
    const nextPrice = Math.floor(Number(price));
    if (
      !Number.isFinite(nextPrice) ||
      nextPrice < PRODUCT_POINTS_PRICE_MIN ||
      nextPrice > PRODUCT_POINTS_PRICE_MAX
    ) {
      setError(CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_ERROR_PRICE);
      return;
    }
    const nextLimit = noLimit ? null : Math.floor(Number(limit));
    if (
      nextLimit != null &&
      (!Number.isFinite(nextLimit) ||
        nextLimit < 1 ||
        nextLimit > PRODUCT_POINTS_PER_BUYER_LIMIT_MAX)
    ) {
      setError(CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_ERROR_LIMIT);
      return;
    }
    await save({
      productPointsSaleEnabled: true,
      productPointsPrice: nextPrice,
      productPointsPerBuyerLimit: nextLimit,
    });
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
        aria-label={CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_CLOSE}
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
            {CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <div className="wholesale-price-modal__field-row">
            <label className="wholesale-price-modal__field wholesale-price-modal__field--half">
              <span className="wholesale-price-modal__label">
                {CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_PRICE_LABEL}
              </span>
              <input
                className="wholesale-price-modal__input"
                type="number"
                inputMode="numeric"
                min={PRODUCT_POINTS_PRICE_MIN}
                max={PRODUCT_POINTS_PRICE_MAX}
                {...INTEGER_INPUT_FIELD_PROPS}
                value={price}
                disabled={isSubmitting}
                onChange={(event) => setPrice(keepDigitsOnly(event.target.value))}
              />
            </label>
            <label className="wholesale-price-modal__field wholesale-price-modal__field--half">
              <span className="wholesale-price-modal__label">
                {CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_LIMIT_LABEL}
              </span>
              <input
                className="wholesale-price-modal__input"
                type="number"
                inputMode="numeric"
                min={1}
                max={PRODUCT_POINTS_PER_BUYER_LIMIT_MAX}
                {...INTEGER_INPUT_FIELD_PROPS}
                value={noLimit ? "" : limit}
                disabled={isSubmitting || noLimit}
                onChange={(event) => setLimit(keepDigitsOnly(event.target.value))}
              />
            </label>
          </div>
          <label className="wholesale-price-modal__promo-enabled">
            <input
              type="checkbox"
              checked={noLimit}
              disabled={isSubmitting}
              onChange={(event) => setNoLimit(event.target.checked)}
            />
            {CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_NO_LIMIT}
          </label>
          {error ? (
            <p className="wholesale-price-modal__error" role="alert">
              {error}
            </p>
          ) : null}
          <p className="wholesale-price-modal__hint">
            {CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_HINT}
          </p>
        </div>
        <footer
          className={[
            "wholesale-price-modal__footer",
            isEnabled ? "wholesale-price-modal__footer--split" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isEnabled ? (
            <button
              type="button"
              className="app-btn app-btn--secondary"
              disabled={isSubmitting || productId.length === 0}
              onClick={() => {
                setError("");
                void save({ productPointsSaleEnabled: false });
              }}
            >
              {CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_DISABLE}
            </button>
          ) : null}
          <button
            type="button"
            className="wholesale-price-modal__save"
            disabled={isSubmitting || productId.length === 0}
            onClick={() => {
              void handleSave();
            }}
          >
            {isSubmitting
              ? CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_PENDING
              : isEnabled
                ? CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_UPDATE
                : CREATE_PRODUCT_MODAL_UI.POINTS_SALE_MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
