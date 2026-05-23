import { USER_PREMIUM_UI } from "../../../shared/config/appUiCopy.js";
import { UserPremiumVerifiedBadge } from "./UserPremiumVerifiedBadge.jsx";

import "./UserPremiumUi.css";
/**
 * @param {{
 *   name: string;
 *   isPremium?: boolean;
 *   className?: string;
 *   textClassName?: string;
 * }} props
 */
export function UserPremiumDisplayName({
  name,
  isPremium = false,
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
    </span>
  );
}
