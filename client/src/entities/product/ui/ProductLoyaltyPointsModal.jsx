import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

import { CREATE_PRODUCT_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useMyLoyaltyPointsStatusQuery } from "../../user/model/useMyLoyaltyPointsStatusQuery.js";
import { fetchAllMyProducts } from "../api/fetchMyProducts.js";
import { resolveProductLoyaltyPointsPerUnit } from "../lib/resolveProductLoyaltyPointsPerUnit.js";
import { resolveSellerMaxLoyaltyPointsPerUnit } from "../lib/resolveSellerMaxLoyaltyPointsPerUnit.js";
import { useMyProductMutations } from "../model/useMyProductMutations.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";

const TITLE_ID = "product-loyalty-points-modal-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (product: import("../model/types.js").ProductFromApi) => void;
 * }} props
 */
export function ProductLoyaltyPointsModal({ isOpen, product, onClose, onSaved }) {
  const { patchMutation } = useMyProductMutations();
  const loyaltyStatusQuery = useMyLoyaltyPointsStatusQuery({ enabled: isOpen });
  const sellerProductsQuery = useQuery({
    queryKey: ["my-products", "loyalty-budget"],
    queryFn: () => fetchAllMyProducts(),
    enabled: isOpen,
    staleTime: 30_000,
  });
  const [points, setPoints] = useState("0");
  const [error, setError] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const productId = product?._id != null ? String(product._id) : "";
  const isSubmitting = patchMutation.isPending;

  const budget = useMemo(
    () =>
      resolveSellerMaxLoyaltyPointsPerUnit({
        loyaltyPointsBalance: loyaltyStatusQuery.data?.loyaltyPointsBalance ?? 0,
        loyaltyPointsReserved: loyaltyStatusQuery.data?.loyaltyPointsReserved ?? 0,
        sellerProducts: sellerProductsQuery.data ?? [],
        editingProductId: productId || null,
      }),
    [
      loyaltyStatusQuery.data?.loyaltyPointsBalance,
      loyaltyStatusQuery.data?.loyaltyPointsReserved,
      productId,
      sellerProductsQuery.data,
    ],
  );

  const fieldDisabled = budget.maxPerUnit <= 0;

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
    setPoints(String(resolveProductLoyaltyPointsPerUnit(product)));
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
    const nextPoints = Math.floor(Number(points));
    if (!Number.isFinite(nextPoints) || nextPoints < 0) {
      setError(CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_ERROR_REQUIRED);
      return;
    }
    if (nextPoints > budget.maxPerUnit) {
      setError(
        CREATE_PRODUCT_MODAL_UI.ERROR_LOYALTY_POINTS_MAX(
          budget.maxPerUnit,
          budget.catalogCommitted,
        ),
      );
      return;
    }

    try {
      const updated = await patchMutation.mutateAsync({
        productId,
        body: { loyaltyPointsPerUnit: nextPoints },
      });
      onSaved?.(updated);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_ERROR_REQUIRED,
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
        aria-label={CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_CLOSE}
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
            {CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <label className="wholesale-price-modal__field">
            <span className="wholesale-price-modal__label">
              {CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_POINTS_LABEL}
            </span>
            <input
              className="wholesale-price-modal__input"
              {...INTEGER_INPUT_FIELD_PROPS}
              value={points}
              disabled={isSubmitting}
              maxLength={8}
              onChange={(event) => {
                const digits = keepDigitsOnly(event.target.value);
                setPoints(digits.replace(/^0+(?=\d)/, ""));
              }}
            />
          </label>
          <p className="wholesale-price-modal__hint">
            {fieldDisabled
              ? CREATE_PRODUCT_MODAL_UI.HINT_LOYALTY_POINTS_ZERO_BALANCE
              : CREATE_PRODUCT_MODAL_UI.HINT_LOYALTY_POINTS_PER_UNIT(
                  budget.available,
                  budget.catalogCommitted,
                  budget.maxPerUnit,
                )}
          </p>
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
              ? CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_PENDING
              : CREATE_PRODUCT_MODAL_UI.LOYALTY_MODAL_SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
