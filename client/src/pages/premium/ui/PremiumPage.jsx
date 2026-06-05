import { useCallback, useEffect, useState } from "react";

import { fetchMyPremiumStatus } from "../../../entities/user/api/fetchMyPremiumStatus.js";
import { purchasePremium } from "../../../entities/user/api/purchasePremium.js";
import { PREMIUM_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./PremiumPage.css";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   onRequestLogin: () => void;
 *   onPurchased?: (payload: {
 *     message: string;
 *     loyaltyPointsBalance: number;
 *   }) => void | Promise<void>;
 * }} props
 */
export function PremiumPage({ isAuthorized, onRequestLogin, onPurchased }) {
  const [phase, setPhase] = useState("loading");
  const [isActive, setIsActive] = useState(false);
  const [canPurchase, setCanPurchase] = useState(false);
  const [pricePoints, setPricePoints] = useState(0);
  const [loyaltyPointsBalance, setLoyaltyPointsBalance] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!isAuthorized) {
      setPhase("idle");
      return;
    }

    setPhase("loading");
    setErrorMessage("");
    try {
      const status = await fetchMyPremiumStatus();
      setIsActive(status.isActive);
      setCanPurchase(status.canPurchase);
      setPricePoints(status.pricePoints);
      setLoyaltyPointsBalance(status.loyaltyPointsBalance);
      setPhase("success");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : PREMIUM_PAGE_UI.FETCH_FALLBACK);
      setPhase("error");
    }
  }, [isAuthorized]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handlePurchase = async () => {
    setIsSubmitting(true);
    setFeedback("");
    setErrorMessage("");
    try {
      const result = await purchasePremium();
      setLoyaltyPointsBalance(result.loyaltyPointsBalance);
      setIsActive(result.isActive);
      setCanPurchase(false);
      setFeedback(result.message);
      await onPurchased?.({
        message: result.message,
        loyaltyPointsBalance: result.loyaltyPointsBalance,
      });
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : PREMIUM_PAGE_UI.PURCHASE_FALLBACK,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return (
      <section className="premium-page">
        <p className="premium-page__hint">{PREMIUM_PAGE_UI.LOGIN_HINT}</p>
        <button
          type="button"
          className="premium-page__login app-btn app-btn--primary"
          onClick={onRequestLogin}
        >
          {PREMIUM_PAGE_UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  if (phase === "loading") {
    return <p className="premium-page__state">{PREMIUM_PAGE_UI.LOADING}</p>;
  }

  if (phase === "error" && !pricePoints) {
    return (
      <p className="premium-page__state premium-page__state_error" role="alert">
        {errorMessage}
      </p>
    );
  }

  const hasEnoughPoints = loyaltyPointsBalance >= pricePoints;

  return (
    <section className="premium-page" aria-label={PREMIUM_PAGE_UI.PAGE_ARIA}>
      <article className="premium-page__plan">
        <h2 className="premium-page__plan-title">{PREMIUM_PAGE_UI.PLAN_TITLE}</h2>
        <p className="premium-page__plan-price">
          {PREMIUM_PAGE_UI.PLAN_PRICE(pricePoints)}
        </p>
        <p className="premium-page__plan-period">{PREMIUM_PAGE_UI.PLAN_PERIOD}</p>
        <ul className="premium-page__benefits">
          {PREMIUM_PAGE_UI.PLAN_BENEFITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="premium-page__balance">
          {PREMIUM_PAGE_UI.BALANCE(loyaltyPointsBalance)}
        </p>
      </article>

      {isActive ? (
        <p className="premium-page__active" role="status">
          {PREMIUM_PAGE_UI.ACTIVE}
        </p>
      ) : null}

      {feedback ? (
        <p className="premium-page__active" role="status">
          {feedback}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="premium-page__error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {canPurchase ? (
        <>
          {!hasEnoughPoints ? (
            <p className="premium-page__error" role="alert">
              {PREMIUM_PAGE_UI.INSUFFICIENT_POINTS(pricePoints, loyaltyPointsBalance)}
            </p>
          ) : null}
          <button
            type="button"
            className="premium-page__submit"
            disabled={isSubmitting || !hasEnoughPoints}
            onClick={() => void handlePurchase()}
          >
            {isSubmitting ? PREMIUM_PAGE_UI.SUBMIT_PENDING : PREMIUM_PAGE_UI.SUBMIT}
          </button>
        </>
      ) : null}
    </section>
  );
}
