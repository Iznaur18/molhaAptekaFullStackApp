import { useMemo, useState } from "react";
import { formatLoyaltyPointsCount } from "@izibuy/shared-lib";

import { pickUserProfilePhotoUrl } from "../lib/pickUserProfilePhotoUrl.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
} from "../lib/profileImageFocus.js";
import { UserPremiumAvatar } from "./UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "./UserPremiumDisplayName.jsx";
import { DEFAULT_USER_AVATAR_URL } from "../model/userConstants.js";
import { USER_LIST_ROW_UI } from "../../../shared/config/appUiCopy.js";

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
  const avatarObjectPosition = formatProfileImageObjectPosition(
    getUserAvatarFocus(user),
  );
  const showEmail = email.length > 0 && email !== userName;
  const isUserDataConfirmed = user.isUserDataConfirmed === true;
  const donationsText = useMemo(() => {
    const n = Number(user.totalDonatedRub);
    const safe = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    return `${formatLoyaltyPointsCount(safe)} ₽`;
  }, [user.totalDonatedRub]);
  const metaBadges = useMemo(() => {
    if (!user.isBlockedUser) {
      return [];
    }
    return [USER_LIST_ROW_UI.BADGE_BLOCKED];
  }, [user.isBlockedUser]);

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
          objectPosition={avatarObjectPosition}
          decoding="async"
          onError={() => setImgFailed(true)}
        />
        <UserPremiumDisplayName
          name={displayName}
          isPremium={Boolean(user.isPremiumUser)}
          isUserDataConfirmed={isUserDataConfirmed}
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
          className="user-list-row__metric user-list-row__metric_donations"
          aria-label={`${USER_LIST_ROW_UI.DONATIONS_LABEL} ${donationsText}`}
        >
          <span className="user-list-row__metric-label">
            {USER_LIST_ROW_UI.DONATIONS_LABEL}
          </span>
          <span className="user-list-row__metric-value user-list-row__metric-value_amount">
            {donationsText}
          </span>
        </span>
      </span>
    </button>
  );
}
