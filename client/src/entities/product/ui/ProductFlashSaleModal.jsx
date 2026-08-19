import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  PRODUCT_FLASH_SALE_DURATION_MAX_MINUTES,
  PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES,
  PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT,
  resolveProductFlashSaleDurationMinutes,
} from "@molha/api-contract";

import { PRODUCT_FLASH_SALE_UI } from "../../../shared/config/appUiCopy.js";
import { computeProductDiscountPercent } from "../lib/computeProductDiscountPercent.js";
import { resolveFlashSaleRestoreBasePrice } from "../lib/isProductFlashSaleActive.js";
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

const TITLE_ID = "product-flash-sale-modal-title";

/** @type {ReadonlyArray<{ value: "minutes" | "hours" | "days"; label: string }>} */
const DURATION_UNITS = [
  { value: "minutes", label: PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_MINUTES },
  { value: "hours", label: PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_HOURS },
  { value: "days", label: PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_DAYS },
];

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function ProductFlashSaleModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const [salePrice, setSalePrice] = useState("");
  const [durationValue, setDurationValue] = useState("60");
  const [durationUnit, setDurationUnit] = useState(/** @type {"minutes"|"hours"|"days"} */ ("minutes"));
  const [error, setError] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const productId = product?._id != null ? String(product._id) : "";
  const isActive = product?.productFlashSaleEnabled === true;
  const basePrice = (() => {
    if (isActive) {
      const restoredBase = resolveFlashSaleRestoreBasePrice(product);
      if (restoredBase != null) {
        return restoredBase;
      }
    }

    return Math.floor(Number(product?.productPrice) || 0);
  })();
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
    setSalePrice(
      isActive
        ? formatIntegerGroupRu(Math.floor(Number(product.productPrice) || 0))
        : "",
    );
    const storedDurationMinutes = Math.floor(Number(product.productFlashSaleDurationMinutes));
    if (isActive && Number.isFinite(storedDurationMinutes) && storedDurationMinutes > 0) {
      setDurationValue(String(storedDurationMinutes));
      setDurationUnit("minutes");
    } else {
      setDurationValue("60");
      setDurationUnit("minutes");
    }
  }, [isOpen, product, isActive]);

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
    const nextSalePrice = parseRubPriceInput(salePrice);
    const durationMinutes = resolveProductFlashSaleDurationMinutes(
      durationValue,
      durationUnit,
    );
    if (nextSalePrice == null || durationMinutes == null) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_REQUIRED);
      return;
    }
    if (nextSalePrice >= basePrice) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_PRICE);
      return;
    }
    const discountPercent = computeProductDiscountPercent(basePrice, nextSalePrice);
    if (
      discountPercent == null ||
      discountPercent > PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT
    ) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_MAX_DISCOUNT);
      return;
    }
    if (
      durationMinutes < PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES ||
      durationMinutes > PRODUCT_FLASH_SALE_DURATION_MAX_MINUTES
    ) {
      setError(PRODUCT_FLASH_SALE_UI.MODAL_ERROR_REQUIRED);
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: {
          productFlashSaleEnabled: true,
          productFlashSalePrice: nextSalePrice,
          productFlashSaleDurationValue: Math.floor(Number(durationValue)),
          productFlashSaleDurationUnit: durationUnit,
        },
      });
      onSaved?.({
        ...(product ?? {}),
        ...updated,
        productFlashSaleEnabled: true,
        productFlashSaleBasePrice: basePrice,
        productFlashSaleDurationMinutes: durationMinutes,
        productPrice: nextSalePrice,
        productOldPrice: basePrice,
        productFlashSaleEndsAt:
          updated?.productFlashSaleEndsAt ??
          new Date(Date.now() + durationMinutes * 60_000).toISOString(),
      });
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : PRODUCT_FLASH_SALE_UI.MODAL_ERROR_REQUIRED,
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
        aria-label={PRODUCT_FLASH_SALE_UI.MODAL_CLOSE}
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
            {PRODUCT_FLASH_SALE_UI.MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {PRODUCT_FLASH_SALE_UI.MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <p className="wholesale-price-modal__hint">{PRODUCT_FLASH_SALE_UI.MODAL_HINT}</p>
          {basePrice > 0 ? (
            <p className="wholesale-price-modal__retail">
              {PRODUCT_FLASH_SALE_UI.MODAL_BASE_PRICE_LABEL}:{" "}
              <span className="wholesale-price-modal__retail-price">
                {basePrice.toLocaleString("ru-RU")} ₽
              </span>
            </p>
          ) : null}
          <label className="wholesale-price-modal__field">
            <span className="wholesale-price-modal__label">
              {PRODUCT_FLASH_SALE_UI.MODAL_SALE_PRICE_LABEL}
            </span>
            <input
              className="wholesale-price-modal__input"
              {...INTEGER_INPUT_FIELD_PROPS}
              value={salePrice}
              disabled={isSubmitting}
              onChange={(event) => setSalePrice(formatRubPriceInput(event.target.value))}
            />
          </label>
          <div className="wholesale-price-modal__field-row">
            <label className="wholesale-price-modal__field wholesale-price-modal__field--half">
              <span className="wholesale-price-modal__label">
                {PRODUCT_FLASH_SALE_UI.MODAL_DURATION_VALUE_LABEL}
              </span>
              <input
                className="wholesale-price-modal__input"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={durationValue}
                disabled={isSubmitting}
                onChange={(event) => setDurationValue(event.target.value)}
              />
            </label>
            <label className="wholesale-price-modal__field wholesale-price-modal__field--half">
              <span className="wholesale-price-modal__label">
                {PRODUCT_FLASH_SALE_UI.MODAL_DURATION_UNIT_LABEL}
              </span>
              <select
                className="wholesale-price-modal__input"
                value={durationUnit}
                disabled={isSubmitting}
                onChange={(event) =>
                  setDurationUnit(
                    /** @type {"minutes"|"hours"|"days"} */ (event.target.value),
                  )
                }
              >
                {DURATION_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
              ? PRODUCT_FLASH_SALE_UI.TOGGLE_PENDING
              : isActive
                ? PRODUCT_FLASH_SALE_UI.MODAL_SAVE_UPDATE
                : PRODUCT_FLASH_SALE_UI.MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
