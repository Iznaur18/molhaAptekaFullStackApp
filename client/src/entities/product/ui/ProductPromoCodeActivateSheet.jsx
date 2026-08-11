import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PRODUCT_PROMO_CODE_MAX_LENGTH } from "@molha/api-contract";

import {
  activateProductPromoCode,
  fetchMyAppliedProductPromos,
} from "../../product-promo-code/api/productPromoCodeApi.js";
import { productPromoCodeQueryKeys } from "../../product-promo-code/model/productPromoCodeQueryKeys.js";
import { PRODUCT_PROMO_CODE_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";

const TITLE_ID = "product-promo-activate-sheet-title";

/**
 * @param {{
 *   isOpen: boolean;
 *   productId: string;
 *   isAuthorized: boolean;
 *   onRequestLogin?: () => void;
 *   onClose: () => void;
 *   onActivated?: (payload: { code: string; discountPercent: number }) => void;
 * }} props
 */
export function ProductPromoCodeActivateSheet({
  isOpen,
  productId,
  isAuthorized,
  onRequestLogin,
  onClose,
  onActivated,
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const appliedQuery = useQuery({
    queryKey: productPromoCodeQueryKeys.appliedMine(),
    queryFn: fetchMyAppliedProductPromos,
    enabled: isOpen && isAuthorized,
  });

  const applied = (appliedQuery.data?.appliedPromos ?? []).find(
    (row) => String(row.productId) === String(productId),
  );

  const activateMutation = useMutation({
    mutationFn: () => activateProductPromoCode(productId, code),
  });

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setCode("");
    setError("");
    setSuccess("");
  }, [isOpen, productId]);

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
      onClose();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  const handleActivate = async () => {
    setError("");
    setSuccess("");
    if (!isAuthorized) {
      onRequestLogin?.();
      setError(PRODUCT_PROMO_CODE_UI.LOGIN_REQUIRED);
      return;
    }
    if (applied) {
      setError(PRODUCT_PROMO_CODE_UI.ALREADY_APPLIED);
      return;
    }
    try {
      const result = await activateMutation.mutateAsync();
      await queryClient.invalidateQueries({
        queryKey: productPromoCodeQueryKeys.appliedMine(),
      });
      setSuccess(result.message || PRODUCT_PROMO_CODE_UI.APPLIED(result.discountPercent));
      onActivated?.({
        code: result.code,
        discountPercent: result.discountPercent,
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : PRODUCT_PROMO_CODE_UI.ACTIVATE_FALLBACK,
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
        aria-label={PRODUCT_PROMO_CODE_UI.CLOSE}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="wholesale-price-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
      >
        <header className="wholesale-price-modal__header">
          <h2 id={TITLE_ID} className="wholesale-price-modal__title">
            {PRODUCT_PROMO_CODE_UI.SHEET_TITLE}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="wholesale-price-modal__close"
            onClick={onClose}
          >
            {PRODUCT_PROMO_CODE_UI.CLOSE}
          </button>
        </header>
        <div className="wholesale-price-modal__body">
          <p className="wholesale-price-modal__hint">{PRODUCT_PROMO_CODE_UI.SHEET_LEAD}</p>
          {applied ? (
            <p role="status">{PRODUCT_PROMO_CODE_UI.APPLIED(applied.discountPercent)}</p>
          ) : (
            <label className="wholesale-price-modal__field">
              {PRODUCT_PROMO_CODE_UI.CODE_LABEL}
              <input
                className="wholesale-price-modal__input"
                value={code}
                maxLength={PRODUCT_PROMO_CODE_MAX_LENGTH}
                placeholder={PRODUCT_PROMO_CODE_UI.CODE_PLACEHOLDER}
                autoCapitalize="characters"
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
          )}
          {error ? (
            <p className="wholesale-price-modal__error" role="alert">
              {error}
            </p>
          ) : null}
          {success ? <p role="status">{success}</p> : null}
        </div>
        <footer className="wholesale-price-modal__footer">
          {!applied ? (
            <button
              type="button"
              className="app-btn app-btn--primary"
              disabled={activateMutation.isPending || !code.trim()}
              onClick={() => {
                void handleActivate();
              }}
            >
              {activateMutation.isPending
                ? PRODUCT_PROMO_CODE_UI.ACTIVATE_PENDING
                : PRODUCT_PROMO_CODE_UI.ACTIVATE}
            </button>
          ) : null}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
