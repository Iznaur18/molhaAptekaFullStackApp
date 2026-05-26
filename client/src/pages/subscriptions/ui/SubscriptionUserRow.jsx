import { useState } from "react";

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
  const displayName =
    user.userName?.trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const avatarObjectPosition = formatProfileImageObjectPosition(
    getUserAvatarFocus(user),
  );
  const isPremium = Boolean(user.isPremiumUser);
  const isUserDataConfirmed = user.isUserDataConfirmed === true;

  const handleClick = () => {
    onRowClick?.(user._id);
  };

  return (
    <button
      type="button"
      className="subscription-user-row"
      onClick={handleClick}
    >
      <UserPremiumAvatar
        className="subscription-user-row__avatar"
        src={src}
        isPremium={isPremium}
        objectPosition={avatarObjectPosition}
        loading="lazy"
        decoding="async"
        onError={() => setImgFailed(true)}
      />
      <UserPremiumDisplayName
        name={displayName}
        isPremium={isPremium}
        isUserDataConfirmed={isUserDataConfirmed}
        className="subscription-user-row__name"
        textClassName="subscription-user-row__name-text"
      />
    </button>
  );
}
