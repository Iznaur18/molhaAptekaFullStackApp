import { useMemo, useState } from "react";

import { formatSearchRowRating } from "../lib/formatSearchRowRating.js";
import { pickUserProfilePhotoUrl } from "../lib/pickUserProfilePhotoUrl.js";
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
  const nickname =
    user.userName?.trim() || user.email || USER_LIST_ROW_UI.MISSING_NAME;
  const ratingText = useMemo(
    () => formatSearchRowRating(user.userRatingByVotes),
    [user.userRatingByVotes],
  );

  const handleClick = () => {
    onRowClick?.(user._id);
  };

  return (
    <button type="button" className="user-list-row" onClick={handleClick}>
      <img
        className="user-list-row__avatar"
        src={src}
        alt=""
        decoding="async"
        onError={() => setImgFailed(true)}
      />
      <span className="user-list-row__name">{nickname}</span>
      <span className="user-list-row__rating" title={USER_LIST_ROW_UI.RATING_TITLE}>
        {ratingText}
      </span>
    </button>
  );
}
