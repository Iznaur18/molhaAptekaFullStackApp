import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchMyLoyaltyPointsStatus } from "../../../entities/user/api/fetchMyLoyaltyPointsStatus.js";
import { LOYALTY_POINTS_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  INTEGER_INPUT_FIELD_PROPS,
  keepDigitsOnly,
} from "../../../shared/lib/numericInput.js";
import { rublesToLoyaltyPoints } from "../../../shared/config/loyaltyPointsConstants.js";
import {
  LOYALTY_POINTS_PURCHASE_MAX_RUB,
  LOYALTY_POINTS_PURCHASE_MIN_RUB,
} from "../model/loyaltyPointsPurchaseUiConstants.js";

import "./LoyaltyPointsPage.css";

/**
 * @param {string} raw
 */
function parsePurchaseAmountRub(raw) {
  const digits = keepDigitsOnly(raw);
  if (!digits) {
    return null;
  }
  const value = Math.floor(Number(digits));
  return Number.isFinite(value) ? value : null;
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 * }} props
 */
export function LoyaltyPointsPage({ isAuthorized, onRequestLogin }) {
  const [phase, setPhase] = useState("loading");
  const [loyaltyPointsBalance, setLoyaltyPointsBalance] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [purchaseAmountInput, setPurchaseAmountInput] = useState("");
  const [purchaseValidationError, setPurchaseValidationError] = useState("");
  const [comingSoonMessage, setComingSoonMessage] = useState("");

  const purchaseAmountRub = useMemo(
    () => parsePurchaseAmountRub(purchaseAmountInput),
    [purchaseAmountInput],
  );

  const purchasePointsPreview = useMemo(() => {
    if (purchaseAmountRub == null) {
      return 0;
    }
    return rublesToLoyaltyPoints(purchaseAmountRub);
  }, [purchaseAmountRub]);

  const loadStatus = useCallback(async () => {
    if (!isAuthorized) {
      setPhase("idle");
      return;
    }

    setPhase("loading");
    setErrorMessage("");
    try {
      const status = await fetchMyLoyaltyPointsStatus();
      setLoyaltyPointsBalance(status.loyaltyPointsBalance);
      setPhase("success");
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : LOYALTY_POINTS_PAGE_UI.FETCH_FALLBACK,
      );
      setPhase("error");
    }
  }, [isAuthorized]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handlePurchaseAmountChange = (event) => {
    setPurchaseAmountInput(keepDigitsOnly(event.target.value));
    setPurchaseValidationError("");
    setComingSoonMessage("");
  };

  const handlePurchaseSubmit = () => {
    setComingSoonMessage("");
    if (purchaseAmountRub == null) {
      setPurchaseValidationError(LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MIN(1));
      return;
    }
    if (purchaseAmountRub < LOYALTY_POINTS_PURCHASE_MIN_RUB) {
      setPurchaseValidationError(
        LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MIN(LOYALTY_POINTS_PURCHASE_MIN_RUB),
      );
      return;
    }
    if (purchaseAmountRub > LOYALTY_POINTS_PURCHASE_MAX_RUB) {
      setPurchaseValidationError(
        LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_MAX(LOYALTY_POINTS_PURCHASE_MAX_RUB),
      );
      return;
    }

    setPurchaseValidationError("");
    setComingSoonMessage(
      LOYALTY_POINTS_PAGE_UI.COMING_SOON_AMOUNT(
        purchaseAmountRub,
        purchasePointsPreview,
      ),
    );
  };

  if (!isAuthorized) {
    return (
      <section className="loyalty-points-page">
        <p className="loyalty-points-page__hint">{LOYALTY_POINTS_PAGE_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="loyalty-points-page__login app-btn app-btn--primary"
          onClick={onRequestLogin}
        >
          {LOYALTY_POINTS_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (phase === "loading") {
    return (
      <p className="loyalty-points-page__state">{LOYALTY_POINTS_PAGE_UI.LOADING}</p>
    );
  }

  if (phase === "error") {
    return (
      <p
        className="loyalty-points-page__state loyalty-points-page__state_error"
        role="alert"
      >
        {errorMessage}
      </p>
    );
  }

  const canSubmitPurchase =
    purchaseAmountRub != null &&
    purchaseAmountRub >= LOYALTY_POINTS_PURCHASE_MIN_RUB &&
    purchaseAmountRub <= LOYALTY_POINTS_PURCHASE_MAX_RUB;

  return (
    <section
      className="loyalty-points-page"
      aria-label={LOYALTY_POINTS_PAGE_UI.PAGE_ARIA}
    >
      <p className="loyalty-points-page__balance">
        {LOYALTY_POINTS_PAGE_UI.BALANCE_POINTS(loyaltyPointsBalance)}
      </p>
      <p className="loyalty-points-page__hint">{LOYALTY_POINTS_PAGE_UI.INFO}</p>
      <ul className="loyalty-points-page__uses">
        {LOYALTY_POINTS_PAGE_UI.USES.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="loyalty-points-page__purchase">
        <h3 className="loyalty-points-page__purchase-title">
          {LOYALTY_POINTS_PAGE_UI.PURCHASE_SECTION}
        </h3>
        <label className="loyalty-points-page__purchase-label">
          {LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_LABEL}
          <input
            {...INTEGER_INPUT_FIELD_PROPS}
            className="loyalty-points-page__purchase-input"
            name="purchaseAmountRub"
            value={purchaseAmountInput}
            onChange={handlePurchaseAmountChange}
            inputMode="numeric"
            placeholder={String(LOYALTY_POINTS_PURCHASE_MIN_RUB)}
            aria-invalid={purchaseValidationError ? true : undefined}
          />
        </label>
        <p className="loyalty-points-page__purchase-hint">
          {LOYALTY_POINTS_PAGE_UI.PURCHASE_AMOUNT_HINT}
        </p>
        {purchasePointsPreview > 0 ? (
          <p className="loyalty-points-page__purchase-preview">
            {LOYALTY_POINTS_PAGE_UI.PURCHASE_POINTS_PREVIEW(purchasePointsPreview)}
          </p>
        ) : null}
        {purchaseValidationError ? (
          <p className="loyalty-points-page__purchase-error" role="alert">
            {purchaseValidationError}
          </p>
        ) : null}
        <button
          type="button"
          className="loyalty-points-page__buy app-btn app-btn--primary"
          onClick={handlePurchaseSubmit}
          disabled={!canSubmitPurchase}
        >
          {LOYALTY_POINTS_PAGE_UI.BUY}
        </button>
        {comingSoonMessage ? (
          <p className="loyalty-points-page__soon" role="status">
            {comingSoonMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
