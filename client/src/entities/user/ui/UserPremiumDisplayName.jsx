import {
  USER_DATA_CONFIRMED_UI,
  USER_PREMIUM_UI,
} from "../../../shared/config/appUiCopy.js";
import { SafeDealSellerBadgeMark } from "../../seller-safe-deal/ui/SafeDealSellerBadge.jsx";
import { UserDataConfirmedBadge } from "./UserDataConfirmedBadge.jsx";
import { UserPremiumVerifiedBadge } from "./UserPremiumVerifiedBadge.jsx";

import "./UserPremiumUi.css";

/**
 * @param {{
 *   name: string;
 *   isPremium?: boolean;
 *   isUserDataConfirmed?: boolean;
 *   hasSafeDeal?: boolean;
 *   className?: string;
 *   textClassName?: string;
 * }} props
 */
export function UserPremiumDisplayName({
  name,
  isPremium = false,
  isUserDataConfirmed = false,
  hasSafeDeal = false,
  className = "",
  textClassName = "user-premium-name__text",
}) {
  const rootClass = ["user-premium-name", className].filter(Boolean).join(" ");

  return (
    <span className={rootClass}>
      <span className={textClassName}>{name}</span>
      {isPremium ? (
        <span
          className="user-premium-check"
          aria-label={USER_PREMIUM_UI.CHECK_ARIA}
          title={USER_PREMIUM_UI.CHECK_TITLE}
        >
          <UserPremiumVerifiedBadge size={18} />
        </span>
      ) : null}
      {isUserDataConfirmed ? (
        <span
          className="user-data-confirmed-check"
          aria-label={USER_DATA_CONFIRMED_UI.BADGE_ARIA}
          title={USER_DATA_CONFIRMED_UI.BADGE_TITLE}
        >
          <UserDataConfirmedBadge size={18} />
        </span>
      ) : null}
      <SafeDealSellerBadgeMark hasSafeDeal={hasSafeDeal} size={18} />
    </span>
  );
}
