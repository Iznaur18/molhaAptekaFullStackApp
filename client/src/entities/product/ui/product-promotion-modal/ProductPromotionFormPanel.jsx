import {
  PRODUCT_CARD_UI,
  PRODUCT_PROMOTION_UI,
} from "../../../../shared/config/appUiCopy.js";
import { applyPromoReturnStreakDiscount } from "../../../promo-return-streak/lib/promoReturnStreakPricing.js";
import {
  calculateProductPromotionAmountRub,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_RATES,
} from "../../lib/calculateProductPromotionPointsCost.js";
import { ProductManageToggleRow } from "../ProductManageToggleRow.jsx";

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
  return Number.isInteger(percent)
    ? String(percent)
    : percent.toFixed(1).replace(/\.0$/, "");
}

/**
 * @param {{
 *   productName: string;
 *   tiers: Array<{ tier: number; title: string; description: string }>;
 *   durations: Array<{ code: string; title: string; durationHours: number; durationMult: number }>;
 *   productPrice: number;
 *   selectedTier: number;
 *   selectedDurationCode: string;
 *   selectedDuration: { code: string; title: string; durationHours: number } | null;
 *   selectedTierMeta: { tier: number; title: string; description: string } | null;
 *   selectedAmountRub: number;
 *   listAmountRub?: number | null;
 *   streakDiscountPercent?: number;
 *   payWithPoints: boolean;
 *   loyaltyPointsAvailable: number;
 *   errorMessage: string;
 *   isSubmitting: boolean;
 *   onTierChange: (tier: number) => void;
 *   onDurationChange: (code: string) => void;
 *   onPayWithPointsChange: (value: boolean) => void;
 *   onTopUpPoints: () => void;
 * }} props
 */
export function ProductPromotionFormPanel({
  productName,
  tiers,
  durations,
  productPrice,
  selectedTier,
  selectedDurationCode,
  selectedDuration,
  selectedTierMeta,
  selectedAmountRub,
  listAmountRub = null,
  streakDiscountPercent = 0,
  payWithPoints,
  loyaltyPointsAvailable,
  errorMessage,
  isSubmitting,
  onTierChange,
  onDurationChange,
  onPayWithPointsChange,
  onTopUpPoints,
}) {
  const selectedAmountPoints = selectedAmountRub;
  const hasEnoughPoints = loyaltyPointsAvailable >= selectedAmountPoints;
  const showInsufficientHint =
    payWithPoints && selectedDuration != null && !hasEnoughPoints;
  const showStreakDiscount =
    streakDiscountPercent > 0 &&
    listAmountRub != null &&
    listAmountRub > selectedAmountRub;

  return (
    <>
      <p className="product-promotion-modal__product">
        {PRODUCT_PROMOTION_UI.MODAL_SUBTITLE(productName)}
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
                  onChange={() => onTierChange(tier.tier)}
                  className="product-promotion-modal__visually-hidden"
                />
                <span className="product-promotion-modal__tier-badge">
                  {badgeLabel}
                </span>
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
            const listAmountRub = calculateProductPromotionAmountRub({
              productPrice,
              tier: selectedTier,
              durationCode: duration.code,
            });
            const amountRub = applyPromoReturnStreakDiscount(
              listAmountRub,
              streakDiscountPercent,
            );
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
                onClick={() => onDurationChange(duration.code)}
              >
                <span className="product-promotion-modal__duration-title">
                  {duration.title}
                </span>
                <span className="product-promotion-modal__duration-price">
                  {PRODUCT_PROMOTION_UI.DURATION_PRICE_RUB(amountRub)}
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
            <strong>
              {payWithPoints
                ? PRODUCT_PROMOTION_UI.TOTAL_POINTS(selectedAmountPoints)
                : PRODUCT_PROMOTION_UI.TOTAL_RUB(selectedAmountRub)}
            </strong>
          </div>
          {showStreakDiscount ? (
            <>
              <div className="product-promotion-modal__summary-row">
                <span>{PRODUCT_PROMOTION_UI.STREAK_DISCOUNT_BADGE(streakDiscountPercent)}</span>
                <strong>
                  {payWithPoints
                    ? PRODUCT_PROMOTION_UI.STREAK_LIST_PRICE(listAmountRub, "баллов")
                    : PRODUCT_PROMOTION_UI.STREAK_LIST_PRICE(listAmountRub, "руб.")}
                </strong>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="product-promotion-modal__pay-toggle">
        <ProductManageToggleRow
          title={PRODUCT_PROMOTION_UI.PAY_WITH_POINTS_LABEL}
          description={`${PRODUCT_PROMOTION_UI.PAY_WITH_POINTS_HINT}. ${PRODUCT_PROMOTION_UI.POINTS_BALANCE(loyaltyPointsAvailable)}`}
          checked={payWithPoints}
          disabled={isSubmitting}
          onCheckedChange={onPayWithPointsChange}
        />
      </div>

      {showInsufficientHint ? (
        <p className="product-promotion-modal__points-hint" role="status">
          {PRODUCT_PROMOTION_UI.INSUFFICIENT_POINTS(
            selectedAmountPoints,
            loyaltyPointsAvailable,
          )}{" "}
          <button
            type="button"
            className="product-promotion-modal__top-up-link"
            onClick={onTopUpPoints}
            disabled={isSubmitting}
          >
            {PRODUCT_PROMOTION_UI.TOP_UP_POINTS}
          </button>
        </p>
      ) : null}

      {errorMessage ? (
        <p className="product-promotion-modal__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
