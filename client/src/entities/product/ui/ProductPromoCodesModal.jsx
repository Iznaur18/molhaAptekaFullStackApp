import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PRODUCT_PROMO_CODES_MAX_ACTIVE,
  PRODUCT_PROMO_CODE_MAX_LENGTH,
  PRODUCT_PROMO_DISCOUNT_PERCENT_MAX,
  PRODUCT_PROMO_DISCOUNT_PERCENT_MIN,
  PRODUCT_PROMO_MAX_ACTIVATIONS_MAX,
  PRODUCT_PROMO_MAX_ACTIVATIONS_MIN,
} from "@molha/api-contract";

import {
  fetchProductPromoCodes,
  replaceProductPromoCodes,
} from "../../product-promo-code/api/productPromoCodeApi.js";
import { productPromoCodeQueryKeys } from "../../product-promo-code/model/productPromoCodeQueryKeys.js";
import { PRODUCT_PROMO_CODE_UI } from "../../../shared/config/appUiCopy.js";
import { getTopModalFocusLayer } from "../../../shared/lib/modalFocusStack.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useWholesalePriceSheetAnimation } from "./useWholesalePriceSheetAnimation.js";

import "./WholesalePriceModal.css";

const TITLE_ID = "product-promo-codes-modal-title";

const emptyRow = () => ({
  code: "",
  discountPercent: "10",
  maxActivations: "100",
  enabled: true,
  activationsUsed: 0,
});

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../model/types.js").ProductFromApi | null;
 *   onClose: () => void;
 *   onSaved?: (payload: { productHasActivePromoCodes: boolean }) => void;
 * }} props
 */
export function ProductPromoCodesModal({ isOpen, product, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const productId = product?._id != null ? String(product._id) : "";
  const [rows, setRows] = useState(() => [emptyRow()]);
  const [error, setError] = useState("");
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const { mounted, isVisible } = useWholesalePriceSheetAnimation(isOpen);

  const listQuery = useQuery({
    queryKey: productPromoCodeQueryKeys.list(productId),
    queryFn: () => fetchProductPromoCodes(productId),
    enabled: isOpen && Boolean(productId),
  });

  const saveMutation = useMutation({
    mutationFn: (promoCodes) => replaceProductPromoCodes(productId, promoCodes),
  });

  useScrollLock(mounted);
  useDialogFocusTrap(panelRef, {
    active: isOpen && isVisible,
    initialFocusRef: closeButtonRef,
  });

  useEffect(() => {
    if (!isOpen || !listQuery.data) {
      return;
    }
    setError("");
    const next = listQuery.data.promoCodes.map((row) => ({
      code: row.code,
      discountPercent: String(row.discountPercent),
      maxActivations: String(row.maxActivations),
      enabled: row.enabled === true,
      activationsUsed: row.activationsUsed ?? 0,
    }));
    setRows(next.length > 0 ? next : [emptyRow()]);
  }, [isOpen, listQuery.data]);

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

  const activeCount = rows.filter((row) => row.enabled).length;

  const handleSave = async () => {
    setError("");
    const promoCodes = [];
    for (const row of rows) {
      const code = String(row.code ?? "").trim();
      if (!code) {
        continue;
      }
      const discountPercent = Math.floor(Number(row.discountPercent));
      const maxActivations = Math.floor(Number(row.maxActivations));
      if (
        !Number.isFinite(discountPercent) ||
        discountPercent < PRODUCT_PROMO_DISCOUNT_PERCENT_MIN ||
        discountPercent > PRODUCT_PROMO_DISCOUNT_PERCENT_MAX
      ) {
        setError(
          `Скидка должна быть от ${PRODUCT_PROMO_DISCOUNT_PERCENT_MIN} до ${PRODUCT_PROMO_DISCOUNT_PERCENT_MAX}%`,
        );
        return;
      }
      if (
        !Number.isFinite(maxActivations) ||
        maxActivations < PRODUCT_PROMO_MAX_ACTIVATIONS_MIN ||
        maxActivations > PRODUCT_PROMO_MAX_ACTIVATIONS_MAX
      ) {
        setError(
          `Активации: от ${PRODUCT_PROMO_MAX_ACTIVATIONS_MIN} до ${PRODUCT_PROMO_MAX_ACTIVATIONS_MAX}`,
        );
        return;
      }
      promoCodes.push({
        code,
        discountPercent,
        maxActivations,
        enabled: row.enabled === true,
      });
    }

    try {
      const saved = await saveMutation.mutateAsync(promoCodes);
      await queryClient.invalidateQueries({
        queryKey: productPromoCodeQueryKeys.list(productId),
      });
      onSaved?.({
        productHasActivePromoCodes: saved.productHasActivePromoCodes === true,
      });
      onClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : PRODUCT_PROMO_CODE_UI.SAVE_FALLBACK,
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
            {PRODUCT_PROMO_CODE_UI.MODAL_TITLE}
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
          <p className="wholesale-price-modal__hint">{PRODUCT_PROMO_CODE_UI.MODAL_LEAD}</p>
          {listQuery.isPending ? <p>Загрузка…</p> : null}
          {listQuery.isError ? (
            <p className="wholesale-price-modal__error" role="alert">
              {listQuery.error instanceof Error
                ? listQuery.error.message
                : PRODUCT_PROMO_CODE_UI.FETCH_FALLBACK}
            </p>
          ) : null}
          <div className="wholesale-price-modal__promo-list">
            {rows.map((row, index) => (
              <div
                key={`promo-row-${index}`}
                className="wholesale-price-modal__promo-card"
              >
                <p className="wholesale-price-modal__promo-card-title">
                  {PRODUCT_PROMO_CODE_UI.CARD_TITLE(index + 1)}
                </p>
                <label className="wholesale-price-modal__field">
                  {PRODUCT_PROMO_CODE_UI.FIELD_CODE}
                  <input
                    className="wholesale-price-modal__input"
                    value={row.code}
                    maxLength={PRODUCT_PROMO_CODE_MAX_LENGTH}
                    onChange={(event) => {
                      const value = event.target.value;
                      setRows((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, code: value } : item,
                        ),
                      );
                    }}
                  />
                </label>
                <div className="wholesale-price-modal__promo-row">
                  <label className="wholesale-price-modal__field">
                    {PRODUCT_PROMO_CODE_UI.FIELD_PERCENT}
                    <input
                      className="wholesale-price-modal__input"
                      type="number"
                      min={PRODUCT_PROMO_DISCOUNT_PERCENT_MIN}
                      max={PRODUCT_PROMO_DISCOUNT_PERCENT_MAX}
                      value={row.discountPercent}
                      onChange={(event) => {
                        const value = event.target.value;
                        setRows((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, discountPercent: value }
                              : item,
                          ),
                        );
                      }}
                    />
                  </label>
                  <label className="wholesale-price-modal__field">
                    {PRODUCT_PROMO_CODE_UI.FIELD_MAX}
                    <input
                      className="wholesale-price-modal__input"
                      type="number"
                      min={PRODUCT_PROMO_MAX_ACTIVATIONS_MIN}
                      max={PRODUCT_PROMO_MAX_ACTIVATIONS_MAX}
                      value={row.maxActivations}
                      onChange={(event) => {
                        const value = event.target.value;
                        setRows((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, maxActivations: value }
                              : item,
                          ),
                        );
                      }}
                    />
                  </label>
                </div>
                <label className="wholesale-price-modal__promo-enabled">
                  <input
                    type="checkbox"
                    checked={row.enabled === true}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setRows((prev) =>
                        prev.map((item, i) =>
                          i === index ? { ...item, enabled: checked } : item,
                        ),
                      );
                    }}
                  />
                  {PRODUCT_PROMO_CODE_UI.FIELD_ENABLED}
                  {row.activationsUsed > 0
                    ? ` · ${PRODUCT_PROMO_CODE_UI.FIELD_USED}: ${row.activationsUsed}`
                    : ""}
                </label>
                <button
                  type="button"
                  className="app-btn app-btn--danger"
                  onClick={() =>
                    setRows((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  {PRODUCT_PROMO_CODE_UI.REMOVE}
                </button>
              </div>
            ))}
          </div>
          {error ? (
            <p className="wholesale-price-modal__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <footer className="wholesale-price-modal__footer wholesale-price-modal__footer--split">
          <button
            type="button"
            className="app-btn app-btn--secondary"
            disabled={
              activeCount >= PRODUCT_PROMO_CODES_MAX_ACTIVE ||
              saveMutation.isPending
            }
            onClick={() => {
              if (activeCount >= PRODUCT_PROMO_CODES_MAX_ACTIVE) {
                setError(PRODUCT_PROMO_CODE_UI.MAX_ACTIVE);
                return;
              }
              setRows((prev) => [...prev, emptyRow()]);
            }}
          >
            {PRODUCT_PROMO_CODE_UI.ADD}
          </button>
          <button
            type="button"
            className="app-btn app-btn--primary"
            disabled={saveMutation.isPending || listQuery.isPending}
            onClick={() => {
              void handleSave();
            }}
          >
            {saveMutation.isPending
              ? PRODUCT_PROMO_CODE_UI.SAVE_PENDING
              : PRODUCT_PROMO_CODE_UI.SAVE}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
