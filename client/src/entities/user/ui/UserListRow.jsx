import { useMemo, useState } from "react";

import { formatSearchRowRating } from "../lib/formatSearchRowRating.js";
import { formatSearchRowTotalSales } from "../lib/formatSearchRowTotalSales.js";
import { pickUserProfilePhotoUrl } from "../lib/pickUserProfilePhotoUrl.js";
import { UserPremiumAvatar } from "./UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "./UserPremiumDisplayName.jsx";
import {
  DEFAULT_USER_AVATAR_URL,
  USER_ROLE_LABEL_RU,
  USER_ROLE_ADMIN,
  USER_ROLE_USER,
} from "../model/userConstants.js";
import {
  FORMAT_BOOLEAN_RU,
  USER_LIST_ROW_UI,
} from "../../../shared/config/appUiCopy.js";

import "./UserListRow.css";

/**
 * @param {{
 *   user: import('../model/types.js').UserSearchListItem;
 *   onRowClick?: (userId: string) => void;
 * }} props
 */
export function UserListRow({ user, onRowClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const picked = pickUserProfilePhotoUrl(user);
  const src = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const userName = user.userName?.trim() ?? "";
  const email = user.email?.trim() ?? "";
  const displayName = userName || USER_LIST_ROW_UI.MISSING_NAME;
  const showEmail = email.length > 0 && email !== userName;
  const ratingText = useMemo(
    () => formatSearchRowRating(user.userRatingByVotes),
    [user.userRatingByVotes],
  );
  const totalSalesText = useMemo(
    () => formatSearchRowTotalSales(user.totalSalesAmount),
    [user.totalSalesAmount],
  );
  const totalPurchasesText = useMemo(
    () => formatSearchRowTotalSales(user.totalPurchasesAmount),
    [user.totalPurchasesAmount],
  );
  const isUserDataConfirmed = user.isUserDataConfirmed === true;
  const confirmedText = isUserDataConfirmed
    ? FORMAT_BOOLEAN_RU.YES
    : FORMAT_BOOLEAN_RU.NO;
  const metaBadges = useMemo(() => {
    const items = [];
    if (
      user.userRole &&
      user.userRole !== USER_ROLE_USER &&
      user.userRole !== USER_ROLE_ADMIN
    ) {
      items.push(USER_ROLE_LABEL_RU[user.userRole] ?? user.userRole);
    }
    if (user.isBlockedUser) items.push(USER_LIST_ROW_UI.BADGE_BLOCKED);
    return items;
  }, [user]);

  const handleClick = () => {
    onRowClick?.(user._id);
  };

  return (
    <button type="button" className="user-list-row" onClick={handleClick}>
      <span className="user-list-row__head">
        <UserPremiumAvatar
          className="user-list-row__avatar"
          src={src}
          isPremium={Boolean(user.isPremiumUser)}
          decoding="async"
          onError={() => setImgFailed(true)}
        />
        <UserPremiumDisplayName
          name={displayName}
          isPremium={Boolean(user.isPremiumUser)}
          className="user-list-row__name"
          textClassName="user-list-row__name-text"
        />
      </span>
      {showEmail ? (
        <span className="user-list-row__email" title={email}>
          {email}
        </span>
      ) : null}
      {metaBadges.length > 0 ? (
        <span className="user-list-row__badges">
          {metaBadges.map((label) => (
            <span key={label} className="user-list-row__badge">
              {label}
            </span>
          ))}
        </span>
      ) : null}
      <span className="user-list-row__metrics">
        <span
          className="user-list-row__metric user-list-row__metric_sales"
          aria-label={totalSalesText}
        >
          <span className="user-list-row__metric-label">
            {USER_LIST_ROW_UI.TOTAL_SALES_LABEL}
          </span>
          <span className="user-list-row__metric-value user-list-row__metric-value_amount">
            {totalSalesText}
          </span>
        </span>
        <span
          className="user-list-row__metric user-list-row__metric_rating"
          title={USER_LIST_ROW_UI.RATING_TITLE}
        >
          <span className="user-list-row__metric-label">
            {USER_LIST_ROW_UI.RATING_LABEL}
          </span>
          <span className="user-list-row__metric-value user-list-row__metric-value_muted">
            {ratingText}
          </span>
        </span>
        <span
          className="user-list-row__metric user-list-row__metric_purchases"
          aria-label={totalPurchasesText}
        >
          <span className="user-list-row__metric-label">
            {USER_LIST_ROW_UI.TOTAL_PURCHASES_LABEL}
          </span>
          <span className="user-list-row__metric-value user-list-row__metric-value_amount">
            {totalPurchasesText}
          </span>
        </span>
        <span className="user-list-row__metric user-list-row__metric_confirmed">
          <span className="user-list-row__metric-label user-list-row__metric-label_long">
            {USER_LIST_ROW_UI.USER_DATA_CONFIRMED_LABEL}
          </span>
          <span
            className={
              isUserDataConfirmed
                ? "user-list-row__metric-value user-list-row__metric-value_confirmed-yes"
                : "user-list-row__metric-value user-list-row__metric-value_confirmed-no"
            }
          >
            {confirmedText}
          </span>
        </span>
      </span>
    </button>
  );
}
