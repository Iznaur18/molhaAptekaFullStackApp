import { useMemo, useState } from "react";

import { formatSearchRowRating } from "../lib/formatSearchRowRating.js";
import { pickUserProfilePhotoUrl } from "../lib/pickUserProfilePhotoUrl.js";
import { UserPremiumAvatar } from "./UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "./UserPremiumDisplayName.jsx";
import {
  DEFAULT_USER_AVATAR_URL,
  USER_ROLE_LABEL_RU,
  USER_ROLE_ADMIN,
  USER_ROLE_USER,
} from "../model/userConstants.js";
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
  const nickname =
    user.userName?.trim() || user.email || USER_LIST_ROW_UI.MISSING_NAME;
  const ratingText = useMemo(
    () => formatSearchRowRating(user.userRatingByVotes),
    [user.userRatingByVotes],
  );
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
    if (user.isActiveUser === false) items.push(USER_LIST_ROW_UI.BADGE_INACTIVE);
    return items;
  }, [user]);

  const handleClick = () => {
    onRowClick?.(user._id);
  };

  return (
    <button type="button" className="user-list-row" onClick={handleClick}>
      <UserPremiumAvatar
        className="user-list-row__avatar"
        src={src}
        isPremium={Boolean(user.isPremiumUser)}
        decoding="async"
        onError={() => setImgFailed(true)}
      />
      <span className="user-list-row__main">
        <UserPremiumDisplayName
          name={nickname}
          isPremium={Boolean(user.isPremiumUser)}
          className="user-list-row__name"
          textClassName="user-list-row__name-text"
        />
        {metaBadges.length > 0 ? (
          <span className="user-list-row__badges">
            {metaBadges.map((label) => (
              <span key={label} className="user-list-row__badge">
                {label}
              </span>
            ))}
          </span>
        ) : null}
      </span>
      <span className="user-list-row__rating" title={USER_LIST_ROW_UI.RATING_TITLE}>
        {ratingText}
      </span>
    </button>
  );
}
