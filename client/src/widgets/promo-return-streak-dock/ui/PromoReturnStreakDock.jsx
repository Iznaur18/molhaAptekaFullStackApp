import {
  PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY,
  PROMO_RETURN_STREAK_MAX_DAY,
} from "../../../entities/promo-return-streak/lib/promoReturnStreakPricing.js";
import {
  useClaimPromoReturnStreakMutation,
  useMyPromoReturnStreakQuery,
} from "../../../entities/promo-return-streak/model/usePromoReturnStreak.js";
import { PROMO_RETURN_STREAK_DOCK_UI } from "../../../shared/config/appUiCopy.js";
import { useAppShellStateContext } from "../../app-shell/model/AppShellStateContext.jsx";

import "./PromoReturnStreakDock.css";

function StreakDiscountIcon() {
  return (
    <svg
      className="promo-return-streak-dock__icon-svg"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="promo-return-streak-dock__icon-tag"
        d="M4.2 14.8 14.8 4.2A2.8 2.8 0 0 1 16.8 3.4H26.6A2 2 0 0 1 28.6 5.4V15.2a2.8 2.8 0 0 1-.8 2L17.2 27.8a2.8 2.8 0 0 1-4 0L4.2 18.8a2.8 2.8 0 0 1 0-4Z"
      />
      <circle
        className="promo-return-streak-dock__icon-hole"
        cx="22.2"
        cy="9.8"
        r="1.85"
      />
      <path
        className="promo-return-streak-dock__icon-percent"
        d="M11.4 19.8 19.2 12M12.5 12.4a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0ZM20.9 20a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z"
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {{ currentDay: number; maxDay: number }} props
 */
function StreakDayTrack({ currentDay, maxDay }) {
  const safeDay = Math.max(1, Math.min(maxDay, currentDay));

  return (
    <ol className="promo-return-streak-dock__track">
      {Array.from({ length: maxDay }, (_, index) => {
        const dayNumber = index + 1;
        const percent =
          PROMO_RETURN_STREAK_DISCOUNT_PERCENT_BY_DAY[dayNumber] ?? 0;
        const isCurrent = dayNumber === safeDay;
        const isDone = dayNumber < safeDay;

        const tickClass = [
          "promo-return-streak-dock__tick",
          isDone ? "promo-return-streak-dock__tick_done" : "",
          isCurrent ? "promo-return-streak-dock__tick_current" : "",
          !isDone && !isCurrent
            ? "promo-return-streak-dock__tick_pending"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={dayNumber} className={tickClass}>
            <span className="promo-return-streak-dock__tick-dot">
              {isDone ? (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M3.2 8.4 6.5 11.6 12.8 4.4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <span className="promo-return-streak-dock__tick-label">
              {PROMO_RETURN_STREAK_DOCK_UI.DAY_TICK(dayNumber)}
            </span>
            <span className="promo-return-streak-dock__tick-percent">
              {PROMO_RETURN_STREAK_DOCK_UI.DISCOUNT(percent)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Нижний dock: день streak и кнопка «Забрать скидку».
 * После успешного claim скрывается до следующего дня.
 */
export function PromoReturnStreakDock() {
  const { isAuthorized } = useAppShellStateContext();
  const streakQuery = useMyPromoReturnStreakQuery({ enabled: isAuthorized });
  const claimMutation = useClaimPromoReturnStreakMutation();

  if (!isAuthorized) {
    return null;
  }

  const streak = streakQuery.data;
  if (!streak && streakQuery.isLoading) {
    return null;
  }
  if (!streak?.canClaim) {
    return null;
  }

  const shownDay = streak.displayDay;
  const shownPercent = streak.displayDiscountPercent;

  const handleClaim = () => {
    if (claimMutation.isPending) {
      return;
    }
    claimMutation.mutate(undefined, {
      onError: () => {
        // Ошибка видна в mutation и в UI ниже.
      },
    });
  };

  const errorMessage =
    claimMutation.error instanceof Error
      ? claimMutation.error.message
      : streakQuery.error instanceof Error
        ? streakQuery.error.message
        : "";

  return (
    <aside
      className="promo-return-streak-dock promo-return-streak-dock--claimable"
      aria-label={PROMO_RETURN_STREAK_DOCK_UI.TITLE}
    >
      <header className="promo-return-streak-dock__top">
        <div className="promo-return-streak-dock__icon" aria-hidden="true">
          <StreakDiscountIcon />
        </div>

        <div className="promo-return-streak-dock__headline">
          <p className="promo-return-streak-dock__eyebrow">
            {PROMO_RETURN_STREAK_DOCK_UI.EYEBROW}
          </p>
          <p className="promo-return-streak-dock__days">
            {PROMO_RETURN_STREAK_DOCK_UI.DAY_BOLD(
              shownDay,
              PROMO_RETURN_STREAK_MAX_DAY,
            )}
          </p>
          <p className="promo-return-streak-dock__subline">
            {`${PROMO_RETURN_STREAK_DOCK_UI.DISCOUNT(shownPercent)} · ${PROMO_RETURN_STREAK_DOCK_UI.TOMORROW(streak.tomorrowDiscountPercent)}`}
          </p>
        </div>

        <button
          type="button"
          className="promo-return-streak-dock__claim"
          disabled={claimMutation.isPending}
          aria-label={PROMO_RETURN_STREAK_DOCK_UI.CLAIM_ARIA}
          onClick={handleClaim}
        >
          {claimMutation.isPending
            ? PROMO_RETURN_STREAK_DOCK_UI.CLAIM_PENDING
            : PROMO_RETURN_STREAK_DOCK_UI.CLAIM}
        </button>
      </header>

      <p className="promo-return-streak-dock__description">
        {PROMO_RETURN_STREAK_DOCK_UI.DESCRIPTION}
      </p>

      <div className="promo-return-streak-dock__rule" aria-hidden="true" />

      <StreakDayTrack
        currentDay={shownDay}
        maxDay={PROMO_RETURN_STREAK_MAX_DAY}
      />

      {errorMessage ? (
        <p className="promo-return-streak-dock__error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </aside>
  );
}
