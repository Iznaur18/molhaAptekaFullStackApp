import { useEffect, useMemo, useState } from "react";

import { PRODUCT_CARD_UI, PRODUCT_PROMOTION_UI } from "../../../shared/config/appUiCopy.js";
import { ProductModalShell } from "../../../shared/ui/ProductModalShell/ProductModalShell.jsx";
import {
  calculateProductPromotionPointsCost,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_RATES,
  PRODUCT_PROMOTION_TIER_TOP,
} from "../lib/calculateProductPromotionPointsCost.js";

import "./ProductPromotionModal.css";

const PRODUCT_PROMOTION_MODAL_TITLE_ID = "product-promotion-modal-title";

/** @type {Record<number, string>} */
const TIER_BADGE_LABELS = {
  [PRODUCT_PROMOTION_TIER_GOLD]: PRODUCT_CARD_UI.PROMOTED_BADGE,
  [PRODUCT_PROMOTION_TIER_TOP]: PRODUCT_CARD_UI.PROMOTION_TOP_BADGE,
  [PRODUCT_PROMOTION_TIER_BANNER]: PRODUCT_CARD_UI.PROMOTION_BANNER_BADGE,
};

/**
 * @param {number} tier
 */
function formatTierRatePercent(tier) {
  const rate = PRODUCT_PROMOTION_TIER_RATES[Number(tier)];
  if (rate == null) {
    return "";
  }
  const percent = rate * 100;
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(1).replace(/\.0$/, "");
}

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

  const selectedDuration = useMemo(
    () => durations.find((item) => item.code === selectedDurationCode) ?? null,
    [durations, selectedDurationCode],
  );

  const selectedTierMeta = useMemo(
    () => tiers.find((item) => item.tier === selectedTier) ?? null,
    [selectedTier, tiers],
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

  const handleTierChange = (tier) => {
    if (isSubmitting || tiers.length === 0) {
      return;
    }
    setSelectedTier(tier);
  };

  const handleDurationChange = (code) => {
    if (isSubmitting || durations.length === 0) {
      return;
    }
    setSelectedDurationCode(code);
  };

  const handleSubmit = () => {
    if (!selectedDuration || isSubmitting || !hasEnoughFunds || tiers.length === 0) {
      return;
    }
    void onSubmit(selectedTier, selectedDuration.code);
  };

  const footer = (
    <div className="product-promotion-modal__actions">
      <button
        type="button"
        className="app-btn app-btn--secondary"
        onClick={onClose}
        disabled={isSubmitting}
      >
        {PRODUCT_PROMOTION_UI.CANCEL}
      </button>
      <button
        type="button"
        className="app-btn app-btn--primary"
        disabled={
          !selectedDuration || isSubmitting || !hasEnoughFunds || tiers.length === 0
        }
        onClick={handleSubmit}
      >
        {isSubmitting
          ? PRODUCT_PROMOTION_UI.SUBMIT_PENDING
          : PRODUCT_PROMOTION_UI.SUBMIT_POINTS}
      </button>
    </div>
  );

  return (
    <ProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={PRODUCT_PROMOTION_UI.MODAL_TITLE}
      titleId={PRODUCT_PROMOTION_MODAL_TITLE_ID}
      size="md"
      panelClassName={`product-promotion-modal product-promotion-modal--tier-${selectedTier}`}
      bodyClassName="product-promotion-modal__body"
      footer={footer}
      footerClassName="product-promotion-modal__footer"
    >
      <p className="product-promotion-modal__product">
        {PRODUCT_PROMOTION_UI.MODAL_SUBTITLE(productName)}
      </p>

      <div
        className={[
          "product-promotion-modal__balance-card",
          hasEnoughFunds
            ? "product-promotion-modal__balance-card_ok"
            : "product-promotion-modal__balance-card_low",
        ].join(" ")}
      >
        <span className="product-promotion-modal__balance-label">
          {PRODUCT_PROMOTION_UI.BALANCE_LABEL}
        </span>
        <strong className="product-promotion-modal__balance-value">
          {PRODUCT_PROMOTION_UI.BALANCE_POINTS(loyaltyPoints)}
        </strong>
      </div>

      <p className="product-promotion-modal__hint">
        {PRODUCT_PROMOTION_UI.PAYMENT_HINT_POINTS}
      </p>

      <fieldset
        className="product-promotion-modal__section"
        disabled={isSubmitting || tiers.length === 0}
      >
        <legend className="product-promotion-modal__section-title">
          {PRODUCT_PROMOTION_UI.TIER_LABEL}
        </legend>
        <div className="product-promotion-modal__tier-grid">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.tier;
            const badgeLabel = TIER_BADGE_LABELS[tier.tier] ?? tier.title;
            const ratePercent = formatTierRatePercent(tier.tier);

            return (
              <label
                key={tier.tier}
                className={[
                  "product-promotion-modal__tier-card",
                  `product-promotion-modal__tier-card--tier-${tier.tier}`,
                  isSelected ? "product-promotion-modal__tier-card_selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="product-promotion-tier"
                  value={tier.tier}
                  checked={isSelected}
                  onChange={() => handleTierChange(tier.tier)}
                  className="product-promotion-modal__visually-hidden"
                />
                <span className="product-promotion-modal__tier-badge">{badgeLabel}</span>
                <span className="product-promotion-modal__tier-title">{tier.title}</span>
                {ratePercent ? (
                  <span className="product-promotion-modal__tier-rate">
                    {PRODUCT_PROMOTION_UI.TIER_RATE_HINT(ratePercent)}
                  </span>
                ) : null}
                <span className="product-promotion-modal__tier-description">
                  {tier.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset
        className="product-promotion-modal__section"
        disabled={isSubmitting || durations.length === 0}
      >
        <legend className="product-promotion-modal__section-title">
          {PRODUCT_PROMOTION_UI.DURATION_LABEL}
        </legend>
        <div className="product-promotion-modal__duration-row">
          {durations.map((duration) => {
            const pricePoints = calculateProductPromotionPointsCost({
              productPrice,
              tier: selectedTier,
              durationCode: duration.code,
            });
            const isSelected = selectedDurationCode === duration.code;

            return (
              <button
                key={duration.code}
                type="button"
                className={[
                  "product-promotion-modal__duration-chip",
                  isSelected ? "product-promotion-modal__duration-chip_selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleDurationChange(duration.code)}
              >
                <span className="product-promotion-modal__duration-title">
                  {duration.title}
                </span>
                <span className="product-promotion-modal__duration-price">
                  {PRODUCT_PROMOTION_UI.DURATION_PRICE_POINTS(pricePoints)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {selectedDuration && selectedTierMeta ? (
        <div className="product-promotion-modal__summary">
          <div className="product-promotion-modal__summary-row">
            <span>{PRODUCT_PROMOTION_UI.SUMMARY_TIER}</span>
            <strong>{selectedTierMeta.title}</strong>
          </div>
          <div className="product-promotion-modal__summary-row">
            <span>{PRODUCT_PROMOTION_UI.SUMMARY_DURATION}</span>
            <strong>
              {PRODUCT_PROMOTION_UI.TARIFF_DURATION(selectedDuration.durationHours)}
            </strong>
          </div>
          <div className="product-promotion-modal__summary-row product-promotion-modal__summary-row_total">
            <span>{PRODUCT_PROMOTION_UI.TOTAL_LABEL}</span>
            <strong>{PRODUCT_PROMOTION_UI.TOTAL_POINTS(selectedPricePoints)}</strong>
          </div>
        </div>
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
    </ProductModalShell>
  );
}
