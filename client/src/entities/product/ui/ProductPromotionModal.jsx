import { useEffect, useMemo, useState } from "react";
import { PRODUCT_PROMOTION_UI } from "../../../shared/config/appUiCopy.js";
import { calculateProductPromotionPointsCost } from "../lib/calculateProductPromotionPointsCost.js";

import "./ProductPromotionModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   productName: string;
 *   tariffs: Array<{
 *     code: string;
 *     title: string;
 *     durationHours: number;
 *     priceRub: number;
 *     pricePoints?: number;
 *   }>;
 *   loyaltyPoints: number;
 *   isSubmitting?: boolean;
 *   errorMessage?: string;
 *   onClose: () => void;
 *   onSubmit: (tariffCode: string) => void | Promise<void>;
 * }} props
 */
export function ProductPromotionModal({
  isOpen,
  productName,
  tariffs,
  loyaltyPoints,
  isSubmitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
}) {
  const defaultTariff = tariffs[0]?.code ?? "";
  const [selectedTariffCode, setSelectedTariffCode] = useState(defaultTariff);

  useEffect(() => {
    setSelectedTariffCode(defaultTariff);
  }, [defaultTariff, isOpen]);

  const selectedTariff = useMemo(
    () => tariffs.find((item) => item.code === selectedTariffCode) ?? null,
    [selectedTariffCode, tariffs],
  );

  const selectedPricePoints = useMemo(() => {
    if (!selectedTariff) {
      return 0;
    }
    const fromApi = Number(selectedTariff.pricePoints);
    if (Number.isFinite(fromApi) && fromApi > 0) {
      return fromApi;
    }
    return calculateProductPromotionPointsCost(selectedTariff.priceRub);
  }, [selectedTariff]);

  const hasEnoughFunds = loyaltyPoints >= selectedPricePoints;

  const insufficientMessage =
    selectedTariff && !hasEnoughFunds
      ? PRODUCT_PROMOTION_UI.INSUFFICIENT_POINTS(
          selectedPricePoints,
          loyaltyPoints,
        )
      : "";

  if (!isOpen) {
    return null;
  }

  return (
    <div className="product-promotion-modal__backdrop" role="presentation">
      <section
        className="product-promotion-modal"
        role="dialog"
        aria-modal="true"
        aria-label={PRODUCT_PROMOTION_UI.MODAL_TITLE}
      >
        <header className="product-promotion-modal__header">
          <h3>{PRODUCT_PROMOTION_UI.MODAL_TITLE}</h3>
          <button
            type="button"
            className="app-btn app-btn--ghost"
            onClick={onClose}
          >
            {PRODUCT_PROMOTION_UI.CLOSE}
          </button>
        </header>

        <p className="product-promotion-modal__subtitle">
          {PRODUCT_PROMOTION_UI.MODAL_SUBTITLE(productName)}
        </p>
        <p className="product-promotion-modal__balance">
          {PRODUCT_PROMOTION_UI.BALANCE_POINTS(loyaltyPoints)}
        </p>
        <p className="product-promotion-modal__hint">
          {PRODUCT_PROMOTION_UI.PAYMENT_HINT_POINTS}
        </p>

        <label className="product-promotion-modal__field">
          <span>{PRODUCT_PROMOTION_UI.TARIFF_LABEL}</span>
          <select
            value={selectedTariffCode}
            disabled={isSubmitting || tariffs.length === 0}
            onChange={(event) => setSelectedTariffCode(event.target.value)}
          >
            {tariffs.map((tariff) => {
              const pricePoints =
                Number(tariff.pricePoints) > 0
                  ? Number(tariff.pricePoints)
                  : calculateProductPromotionPointsCost(tariff.priceRub);
              return (
                <option key={tariff.code} value={tariff.code}>
                  {PRODUCT_PROMOTION_UI.TARIFF_OPTION_POINTS(
                    tariff.title,
                    pricePoints,
                  )}
                </option>
              );
            })}
          </select>
        </label>
        {selectedTariff ? (
          <p className="product-promotion-modal__summary">
            {PRODUCT_PROMOTION_UI.TARIFF_DURATION(selectedTariff.durationHours)}
          </p>
        ) : null}
        {insufficientMessage ? (
          <p className="product-promotion-modal__error" role="alert">
            {insufficientMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="product-promotion-modal__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <footer className="product-promotion-modal__actions">
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            {PRODUCT_PROMOTION_UI.CANCEL}
          </button>
          <button
            type="button"
            className="app-btn app-btn--primary"
            disabled={!selectedTariff || isSubmitting || !hasEnoughFunds}
            onClick={() =>
              selectedTariff && void onSubmit(selectedTariff.code)
            }
          >
            {isSubmitting
              ? PRODUCT_PROMOTION_UI.SUBMIT_PENDING
              : PRODUCT_PROMOTION_UI.SUBMIT_POINTS}
          </button>
        </footer>
      </section>
    </div>
  );
}
