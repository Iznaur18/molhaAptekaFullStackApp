import { useState } from "react";

import { usePurchasePremiumMutation } from "../../../entities/user/model/usePurchasePremiumMutation.js";
import { useMyPremiumStatusQuery } from "../../../entities/user/model/useMyPremiumStatusQuery.js";
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
  const purchasePremiumMutation = usePurchasePremiumMutation();
  const statusQuery = useMyPremiumStatusQuery({ enabled: isAuthorized });
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = purchasePremiumMutation.isPending;

  const status = statusQuery.data;
  const phase = !isAuthorized
    ? "idle"
    : statusQuery.isPending
      ? "loading"
      : statusQuery.isError
        ? "error"
        : "success";

  const isActive = status?.isActive ?? false;
  const canPurchase = status?.canPurchase ?? false;
  const pricePoints = status?.pricePoints ?? 0;
  const loyaltyPointsBalance = status?.loyaltyPointsBalance ?? 0;

  const fetchError =
    statusQuery.error instanceof Error
      ? statusQuery.error.message
      : PREMIUM_PAGE_UI.FETCH_FALLBACK;

  const handlePurchase = async () => {
    setFeedback("");
    setErrorMessage("");
    try {
      const result = await purchasePremiumMutation.mutateAsync();
      setFeedback(result.message);
      await onPurchased?.({
        message: result.message,
        loyaltyPointsBalance: result.loyaltyPointsBalance,
      });
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : PREMIUM_PAGE_UI.PURCHASE_FALLBACK,
      );
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
        {fetchError}
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
