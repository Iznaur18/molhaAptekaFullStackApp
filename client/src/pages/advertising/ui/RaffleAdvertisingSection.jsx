import { useState } from "react";
import { Clock } from "lucide-react";

import { useRaffleCreateAdvertisingQuery } from "../../../entities/raffle/model/useRaffleCreateAdvertisingQuery.js";
import { useUnlockRaffleCreateMutation } from "../../../entities/raffle/model/useUnlockRaffleCreateMutation.js";
import { RAFFLE_ADVERTISING_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

/**
 * @param {string | null | undefined} status
 */
function resolveRaffleStatusLabel(status) {
  if (status === "pending_staff") {
    return RAFFLE_ADVERTISING_PAGE_UI.STATUS_PENDING;
  }
  if (status === "active") {
    return RAFFLE_ADVERTISING_PAGE_UI.STATUS_ACTIVE;
  }
  if (status === "paused") {
    return RAFFLE_ADVERTISING_PAGE_UI.STATUS_PAUSED;
  }
  return "";
}

/**
 * @param {string | null | undefined} status
 */
function resolveStatusPanelClass(status) {
  if (status === "active") {
    return "advertising-page__status advertising-page__status_active";
  }
  if (status === "pending_staff") {
    return "advertising-page__status advertising-page__status_pending";
  }
  return "advertising-page__status";
}

/**
 * @param {{
 *   isAuthorized: boolean;
 *   loyaltyBalance: number;
 *   onOpenCreateRaffle?: () => void;
 * }} props
 */
export function RaffleAdvertisingSection({
  isAuthorized,
  loyaltyBalance,
  onOpenCreateRaffle,
}) {
  const statusQuery = useRaffleCreateAdvertisingQuery({ enabled: isAuthorized });
  const unlockMutation = useUnlockRaffleCreateMutation();
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  const openCreateForm = () => {
    onOpenCreateRaffle?.();
  };

  const handleUnlock = async () => {
    try {
      setActionError("");
      setFeedback("");
      await unlockMutation.mutateAsync();
      setFeedback(RAFFLE_ADVERTISING_PAGE_UI.UNLOCK_SUCCESS);
      openCreateForm();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : RAFFLE_ADVERTISING_PAGE_UI.UNLOCK_FALLBACK,
      );
    }
  };

  if (statusQuery.isPending) {
    return (
      <article className="advertising-page__card advertising-page__card_category">
        <h2 className="advertising-page__card-title">{RAFFLE_ADVERTISING_PAGE_UI.CARD_TITLE}</h2>
        <p className="advertising-page__state">{RAFFLE_ADVERTISING_PAGE_UI.LOADING}</p>
      </article>
    );
  }

  if (statusQuery.isError) {
    return (
      <article className="advertising-page__card advertising-page__card_category">
        <h2 className="advertising-page__card-title">{RAFFLE_ADVERTISING_PAGE_UI.CARD_TITLE}</h2>
        <p className="advertising-page__state advertising-page__state_error" role="alert">
          {statusQuery.error instanceof Error
            ? statusQuery.error.message
            : RAFFLE_ADVERTISING_PAGE_UI.FETCH_FALLBACK}
        </p>
      </article>
    );
  }

  const status = statusQuery.data ?? {};
  const pricePoints = status.pricePoints ?? 3_000;
  const raffle = status.raffle ?? null;
  const hasOpenRaffle = status.hasOpenRaffle === true;
  const canOpenForm = status.canOpenForm === true;
  const canPay = status.canPay === true;
  const isSubmitting = unlockMutation.isPending;
  const insufficientPoints =
    !hasOpenRaffle && !canOpenForm && loyaltyBalance < pricePoints;
  const blockReason = status.blockReason;

  return (
    <article className="advertising-page__card advertising-page__card_category">
      <div className="advertising-page__card-head">
        <h2 className="advertising-page__card-title">{RAFFLE_ADVERTISING_PAGE_UI.CARD_TITLE}</h2>
        <span className="advertising-page__card-badge">{RAFFLE_ADVERTISING_PAGE_UI.CARD_BADGE}</span>
      </div>

      <p className="advertising-page__card-lead">{RAFFLE_ADVERTISING_PAGE_UI.DESCRIPTION}</p>

      <dl className="advertising-page__meta">
        <div className="advertising-page__meta-item">
          <dt>{RAFFLE_ADVERTISING_PAGE_UI.COST_LABEL}</dt>
          <dd>{RAFFLE_ADVERTISING_PAGE_UI.PRICE(pricePoints)}</dd>
        </div>
      </dl>

      {raffle ? (
        <div className={resolveStatusPanelClass(raffle.status)}>
          <div className="advertising-page__status-main">
            <p className="advertising-page__status-text">
              {resolveRaffleStatusLabel(raffle.status)}
            </p>
            {raffle.status === "pending_staff" ? (
              <span className="advertising-page__status-icon" aria-hidden="true">
                <AppIcon icon={Clock} size="sm" strokeWidth={2.15} />
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {!hasOpenRaffle && blockReason ? (
        <p className="advertising-page__hint">{blockReason}</p>
      ) : null}

      {insufficientPoints && !blockReason ? (
        <p className="advertising-page__hint">{RAFFLE_ADVERTISING_PAGE_UI.INSUFFICIENT_POINTS}</p>
      ) : null}

      {canOpenForm ? (
        <button type="button" className="app-btn app-btn--primary" onClick={openCreateForm}>
          {RAFFLE_ADVERTISING_PAGE_UI.CONTINUE_CREATE}
        </button>
      ) : null}

      {canPay ? (
        <button
          type="button"
          className="app-btn app-btn--primary"
          disabled={isSubmitting || insufficientPoints}
          onClick={() => {
            void handleUnlock();
          }}
        >
          {RAFFLE_ADVERTISING_PAGE_UI.PAY_AND_CREATE_WITH_PRICE(pricePoints)}
        </button>
      ) : null}

      {actionError ? (
        <p className="advertising-page__state advertising-page__state_error" role="alert">
          {actionError}
        </p>
      ) : null}

      {feedback ? (
        <p className="advertising-page__feedback" role="status">
          {feedback}
        </p>
      ) : null}
    </article>
  );
}
