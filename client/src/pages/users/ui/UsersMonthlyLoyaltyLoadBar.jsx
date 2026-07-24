import {
  formatLoyaltyPointsCount,
  resolveLoyaltyPointsProgressPercent,
} from "@izibuy/shared-lib";

import { USERS_MONTHLY_LOYALTY_LOADBAR_UI } from "../../../shared/config/appUiCopy.js";

import "./UsersMonthlyLoyaltyLoadBar.css";

/**
 * @param {{
 *   pointsAwarded: number;
 *   goal: number;
 *   description?: string;
 *   isLoading?: boolean;
 * }} props
 */
export function UsersMonthlyLoyaltyLoadBar({
  pointsAwarded,
  goal,
  description = "",
  isLoading = false,
}) {
  const pointsLabel = formatLoyaltyPointsCount(pointsAwarded);
  const goalLabel = formatLoyaltyPointsCount(goal);
  const percent = resolveLoyaltyPointsProgressPercent(pointsAwarded, goal);
  const counter = USERS_MONTHLY_LOYALTY_LOADBAR_UI.COUNTER(pointsLabel, goalLabel);
  const trimmedDescription = description.trim();

  return (
    <div
      className="users-monthly-loyalty-loadbar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={USERS_MONTHLY_LOYALTY_LOADBAR_UI.PROGRESS_ARIA(
        pointsLabel,
        goalLabel,
      )}
    >
      <div className="users-monthly-loyalty-loadbar__title-row">
        <p className="users-monthly-loyalty-loadbar__title">
          {USERS_MONTHLY_LOYALTY_LOADBAR_UI.TITLE}
        </p>
        <p className="users-monthly-loyalty-loadbar__counter">
          {isLoading ? "…" : counter}
        </p>
      </div>
      <div className="users-monthly-loyalty-loadbar__track">
        <div
          className="users-monthly-loyalty-loadbar__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      {trimmedDescription ? (
        <p className="users-monthly-loyalty-loadbar__description">
          {trimmedDescription}
        </p>
      ) : null}
    </div>
  );
}
