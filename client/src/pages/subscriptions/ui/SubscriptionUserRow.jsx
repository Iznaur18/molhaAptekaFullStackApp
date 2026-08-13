import { useMemo, useState } from "react";

import { formatSearchRowRatingCompact } from "../../../entities/user/lib/formatSearchRowRating.js";
import {
  formatProfileImageObjectPosition,
  getUserAvatarFocus,
} from "../../../entities/user/lib/profileImageFocus.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import { DEFAULT_USER_AVATAR_URL } from "../../../entities/user/model/userConstants.js";
import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { USER_LIST_ROW_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   user: import('../../../entities/user/model/types.js').UserSearchListItem;
 *   onRowClick?: (userId: string) => void;
 * }} props
 */
export function SubscriptionUserRow({ user, onRowClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const picked = pickUserProfilePhotoUrl(user);
  const src = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;
  const displayName = user.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const avatarObjectPosition = formatProfileImageObjectPosition(
    getUserAvatarFocus(user),
  );
  const isPremium = Boolean(user.isPremiumUser);
  const isUserDataConfirmed = user.isUserDataConfirmed === true;

  const ratingText = useMemo(
    () => formatSearchRowRatingCompact(user.userRatingByVotes),
    [user.userRatingByVotes],
  );
  const followersText = useMemo(() => {
    const n = Number(user.followersCount);
    return Number.isFinite(n) ? String(Math.max(0, Math.floor(n))) : "0";
  }, [user.followersCount]);
  const loyaltyPointsText = useMemo(() => {
    const n = Number(user.userLoyaltyPoints);
    return Number.isFinite(n) ? String(Math.max(0, Math.floor(n))) : "0";
  }, [user.userLoyaltyPoints]);

  const handleClick = () => {
    onRowClick?.(user._id);
  };

  return (
    <button type="button" className="subscription-user-row" onClick={handleClick}>
      <UserPremiumAvatar
        className="subscription-user-row__avatar"
        src={src}
        isPremium={isPremium}
        objectPosition={avatarObjectPosition}
        loading="lazy"
        decoding="async"
        onError={() => setImgFailed(true)}
      />
      <span className="subscription-user-row__body">
        <UserPremiumDisplayName
          name={displayName}
          isPremium={isPremium}
          isUserDataConfirmed={isUserDataConfirmed}
          className="subscription-user-row__name"
          textClassName="subscription-user-row__name-text"
        />
        <span className="subscription-user-row__metrics">
          <span
            className="subscription-user-row__metric"
            title={USER_LIST_ROW_UI.RATING_TITLE}
          >
            <span className="subscription-user-row__metric-label">
              {USER_LIST_ROW_UI.RATING_SCORE_LABEL}
            </span>
            <span className="subscription-user-row__metric-value">
              {ratingText}
            </span>
          </span>
          <span className="subscription-user-row__metric-sep" aria-hidden="true" />
          <span
            className="subscription-user-row__metric"
            aria-label={`${USER_LIST_ROW_UI.FOLLOWERS_LABEL} ${followersText}`}
          >
            <span className="subscription-user-row__metric-label">
              {USER_LIST_ROW_UI.FOLLOWERS_LABEL}
            </span>
            <span className="subscription-user-row__metric-value">
              {followersText}
            </span>
          </span>
          <span className="subscription-user-row__metric-sep" aria-hidden="true" />
          <span
            className="subscription-user-row__metric"
            aria-label={`${USER_LIST_ROW_UI.LOYALTY_POINTS_LABEL} ${loyaltyPointsText}`}
          >
            <span className="subscription-user-row__metric-label">
              {USER_LIST_ROW_UI.LOYALTY_POINTS_LABEL}
            </span>
            <span className="subscription-user-row__metric-value">
              {loyaltyPointsText}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
