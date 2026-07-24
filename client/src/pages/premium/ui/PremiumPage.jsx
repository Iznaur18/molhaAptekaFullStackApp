import { useState } from "react";

import { usePurchasePremiumMutation } from "../../../entities/user/model/usePurchasePremiumMutation.js";
import { useMyPremiumStatusQuery } from "../../../entities/user/model/useMyPremiumStatusQuery.js";
import { UserPremiumVerifiedBadge } from "../../../entities/user/ui/UserPremiumVerifiedBadge.jsx";
import { PREMIUM_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { pluralizeRuBall } from "../../../shared/lib/pluralizeRuBall.js";

import "./PremiumPage.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="8" r="6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11" />
    </svg>
  );
}

function StatusVerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4M12 16h.01" />
    </svg>
  );
}

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
      <section className="premium-page premium-page_centered">
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
    return (
      <section className="premium-page">
        <p className="premium-page__state">{PREMIUM_PAGE_UI.LOADING}</p>
      </section>
    );
  }

  if (phase === "error" && !pricePoints) {
    return (
      <section className="premium-page">
        <p className="premium-page__state premium-page__state_error" role="alert">
          {fetchError}
        </p>
      </section>
    );
  }

  const hasEnoughPoints = loyaltyPointsBalance >= pricePoints;

  return (
    <section className="premium-page" aria-label={PREMIUM_PAGE_UI.PAGE_ARIA}>
      <div
        className="premium-page__hero"
        aria-label={`${PREMIUM_PAGE_UI.PLAN_TITLE}: ${PREMIUM_PAGE_UI.PLAN_PRICE(pricePoints)}`}
      >
        <div className="premium-page__hero-text">
          <p className="premium-page__hero-caption">{PREMIUM_PAGE_UI.PLAN_TITLE}</p>
          <p className="premium-page__hero-row">
            <span className="premium-page__hero-value">{pricePoints}</span>
            <span className="premium-page__hero-unit">{pluralizeRuBall(pricePoints)}</span>
          </p>
          <p className="premium-page__hero-info">{PREMIUM_PAGE_UI.PLAN_PERIOD}</p>
        </div>
        <div className="premium-page__hero-icon" aria-hidden="true">
          <UserPremiumVerifiedBadge size={26} />
        </div>
      </div>

      <article className="premium-page__benefits-card">
        <h3 className="premium-page__benefits-title">{PREMIUM_PAGE_UI.BENEFITS_TITLE}</h3>
        <ul className="premium-page__benefits">
          {PREMIUM_PAGE_UI.PLAN_BENEFITS.map((item) => (
            <li key={item} className="premium-page__benefit-row">
              <span className="premium-page__benefit-icon" aria-hidden="true">
                <CheckIcon />
              </span>
              <span className="premium-page__benefit-text">{item}</span>
            </li>
          ))}
        </ul>
      </article>

      <div className="premium-page__balance-card">
        <span className="premium-page__balance-icon" aria-hidden="true">
          <AwardIcon />
        </span>
        <p className="premium-page__balance">{PREMIUM_PAGE_UI.BALANCE(loyaltyPointsBalance)}</p>
      </div>

      {isActive ? (
        <div className="premium-page__banner premium-page__banner_ok" role="status">
          <span className="premium-page__banner-icon" aria-hidden="true">
            <StatusVerifiedIcon />
          </span>
          <p className="premium-page__banner-text">{PREMIUM_PAGE_UI.ACTIVE}</p>
        </div>
      ) : null}

      {feedback ? (
        <div className="premium-page__banner premium-page__banner_info" role="status">
          <span className="premium-page__banner-icon" aria-hidden="true">
            <InfoIcon />
          </span>
          <p className="premium-page__banner-text">{feedback}</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="premium-page__banner premium-page__banner_danger" role="alert">
          <span className="premium-page__banner-icon" aria-hidden="true">
            <ErrorIcon />
          </span>
          <p className="premium-page__banner-text">{errorMessage}</p>
        </div>
      ) : null}

      {canPurchase ? (
        <div className="premium-page__actions">
          {!hasEnoughPoints ? (
            <div className="premium-page__banner premium-page__banner_danger" role="alert">
              <span className="premium-page__banner-icon" aria-hidden="true">
                <ErrorIcon />
              </span>
              <p className="premium-page__banner-text">
                {PREMIUM_PAGE_UI.INSUFFICIENT_POINTS(pricePoints, loyaltyPointsBalance)}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            className="premium-page__submit"
            disabled={isSubmitting || !hasEnoughPoints}
            onClick={() => {
              void handlePurchase();
            }}
          >
            {isSubmitting ? PREMIUM_PAGE_UI.SUBMIT_PENDING : PREMIUM_PAGE_UI.SUBMIT}
          </button>
        </div>
      ) : null}
    </section>
  );
}
