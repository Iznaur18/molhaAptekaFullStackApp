import { useEffect, useMemo, useState } from "react";
import { PRODUCT_PROMOTION_UI } from "../../../shared/config/appUiCopy.js";
import { calculateProductPromotionPointsCost } from "../lib/calculateProductPromotionPointsCost.js";

import "./ProductPromotionModal.css";

/**
 * @param {{
 *   isOpen: boolean;
 *   productName: string;
 *   productPrice: number;
 *   tiers: Array<{ tier: number; title: string; description: string }>;
 *   durations: Array<{ code: string; title: string; durationHours: number; durationMult: number }>;
 *   loyaltyPoints: number;
 *   isSubmitting?: boolean;
 *   errorMessage?: string;
 *   onClose: () => void;
 *   onSubmit: (tier: number, tariffCode: string) => void | Promise<void>;
 * }} props
 */
export function ProductPromotionModal({
  isOpen,
  productName,
  productPrice,
  tiers,
  durations,
  loyaltyPoints,
  isSubmitting = false,
  errorMessage = "",
  onClose,
  onSubmit,
}) {
  const defaultTier = tiers[0]?.tier ?? 1;
  const defaultDuration = durations[0]?.code ?? "";
  const [selectedTier, setSelectedTier] = useState(defaultTier);
  const [selectedDurationCode, setSelectedDurationCode] = useState(defaultDuration);

  useEffect(() => {
    setSelectedTier(defaultTier);
    setSelectedDurationCode(defaultDuration);
  }, [defaultDuration, defaultTier, isOpen]);

  const selectedTierMeta = useMemo(
    () => tiers.find((item) => item.tier === selectedTier) ?? null,
    [selectedTier, tiers],
  );

  const selectedDuration = useMemo(
    () => durations.find((item) => item.code === selectedDurationCode) ?? null,
    [durations, selectedDurationCode],
  );

  const selectedPricePoints = useMemo(() => {
    if (!selectedDuration) {
      return 0;
    }
    return calculateProductPromotionPointsCost({
      productPrice,
      tier: selectedTier,
      durationCode: selectedDuration.code,
    });
  }, [productPrice, selectedDuration, selectedTier]);

  const hasEnoughFunds = loyaltyPoints >= selectedPricePoints;

  const insufficientMessage =
    selectedDuration && !hasEnoughFunds
      ? PRODUCT_PROMOTION_UI.INSUFFICIENT_POINTS(selectedPricePoints, loyaltyPoints)
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
          <button type="button" className="app-btn app-btn--ghost" onClick={onClose}>
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
          <span>{PRODUCT_PROMOTION_UI.TIER_LABEL}</span>
          <select
            value={selectedTier}
            disabled={isSubmitting || tiers.length === 0}
            onChange={(event) => setSelectedTier(Number(event.target.value))}
          >
            {tiers.map((tier) => (
              <option key={tier.tier} value={tier.tier}>
                {PRODUCT_PROMOTION_UI.TIER_OPTION(tier.title, tier.description)}
              </option>
            ))}
          </select>
        </label>

        {selectedTierMeta ? (
          <p className="product-promotion-modal__summary">
            {selectedTierMeta.description}
          </p>
        ) : null}

        <label className="product-promotion-modal__field">
          <span>{PRODUCT_PROMOTION_UI.DURATION_LABEL}</span>
          <select
            value={selectedDurationCode}
            disabled={isSubmitting || durations.length === 0}
            onChange={(event) => setSelectedDurationCode(event.target.value)}
          >
            {durations.map((duration) => {
              const pricePoints = calculateProductPromotionPointsCost({
                productPrice,
                tier: selectedTier,
                durationCode: duration.code,
              });
              return (
                <option key={duration.code} value={duration.code}>
                  {PRODUCT_PROMOTION_UI.DURATION_OPTION_POINTS(
                    duration.title,
                    pricePoints,
                  )}
                </option>
              );
            })}
          </select>
        </label>

        {selectedDuration ? (
          <p className="product-promotion-modal__summary">
            {PRODUCT_PROMOTION_UI.TARIFF_DURATION(selectedDuration.durationHours)}
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
            disabled={
              !selectedDuration || isSubmitting || !hasEnoughFunds || tiers.length === 0
            }
            onClick={() =>
              selectedDuration &&
              void onSubmit(selectedTier, selectedDuration.code)
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
