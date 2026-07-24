import { useMemo, useState } from "react";
import { orderUsersPodiumForDisplay } from "@izibuy/shared-lib";

import { formatSearchRowRatingCompact } from "../../../entities/user/lib/formatSearchRowRating.js";
import { formatSearchRowTotalSalesCount } from "../../../entities/user/lib/formatSearchRowTotalSalesCount.js";
import { pickUserProfilePhotoUrl } from "../../../entities/user/lib/pickUserProfilePhotoUrl.js";
import { DEFAULT_USER_AVATAR_URL } from "../../../entities/user/model/userConstants.js";
import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import {
  USER_LIST_ROW_UI,
  USERS_PODIUM_UI,
} from "../../../shared/config/appUiCopy.js";
import { AppIcon, Trophy } from "../../../shared/ui/icon/index.js";

import "./UsersPodium.css";

const PLACE_LABEL = {
  1: USERS_PODIUM_UI.PLACE_1,
  2: USERS_PODIUM_UI.PLACE_2,
  3: USERS_PODIUM_UI.PLACE_3,
};

/**
 * @param {unknown} value
 * @returns {string}
 */
function formatCount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(Math.max(0, Math.floor(parsed))) : "0";
}

/**
 * @param {{
 *   entry: import("@izibuy/shared-lib").UsersPodiumEntry<
 *     import("../../../entities/user/model/types.js").UserSearchListItem
 *   >;
 *   onUserPress?: (userId: string) => void;
 * }} props
 */
function UsersPodiumSlot({ entry, onUserPress }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { place, user } = entry;
  const pickedAvatar = pickUserProfilePhotoUrl(user);
  const avatarSrc =
    !avatarFailed && pickedAvatar ? pickedAvatar : DEFAULT_USER_AVATAR_URL;
  const displayName =
    String(user.userName ?? "").trim() || USER_LIST_ROW_UI.MISSING_NAME;
  const isPremium = user.isPremiumUser === true;
  const isConfirmed = user.isUserDataConfirmed === true;

  const metrics = useMemo(
    () => [
      {
        key: "points",
        label: USER_LIST_ROW_UI.LOYALTY_POINTS_LABEL,
        value: formatCount(user.userLoyaltyPoints),
      },
      {
        key: "sales",
        label: USER_LIST_ROW_UI.TOTAL_SALES_COUNT_LABEL,
        value: formatSearchRowTotalSalesCount(user.totalSalesCount),
      },
      {
        key: "rating",
        label: USER_LIST_ROW_UI.RATING_SCORE_LABEL,
        value: formatSearchRowRatingCompact(user.userRatingByVotes),
      },
      {
        key: "followers",
        label: USER_LIST_ROW_UI.FOLLOWERS_LABEL,
        value: formatCount(user.followersCount),
      },
    ],
    [user],
  );

  const slotClassName = [
    "users-podium__slot",
    place === 1 && "users-podium__slot_place-1",
    place === 2 && "users-podium__slot_place-2",
    place === 3 && "users-podium__slot_place-3",
  ]
    .filter(Boolean)
    .join(" ");

  const badgeClassName = [
    "users-podium__place-badge",
    place === 1 && "users-podium__place-badge_1",
    place === 2 && "users-podium__place-badge_2",
    place === 3 && "users-podium__place-badge_3",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={slotClassName}
      onClick={() => onUserPress?.(String(user._id))}
      aria-label={`${PLACE_LABEL[place]} ${displayName}`}
    >
      <span className={badgeClassName}>
        {place === 1 ? (
          <AppIcon icon={Trophy} size="sm" />
        ) : (
          <span className="users-podium__place-badge-text">{place}</span>
        )}
      </span>
      <UserPremiumAvatar
        className={
          place === 1
            ? "users-podium__avatar users-podium__avatar_place-1"
            : "users-podium__avatar users-podium__avatar_place-other"
        }
        src={avatarSrc}
        isPremium={isPremium}
        decoding="async"
        onError={() => setAvatarFailed(true)}
      />
      <UserPremiumDisplayName
        name={displayName}
        isPremium={isPremium}
        isUserDataConfirmed={isConfirmed}
        className="users-podium__name"
        textClassName="users-podium__name-text"
      />
      <span className="users-podium__place-label">{PLACE_LABEL[place]}</span>
      <span className="users-podium__metrics">
        {metrics.map((metric) => (
          <span key={metric.key} className="users-podium__metric-row">
            <span className="users-podium__metric-label">{metric.label}</span>
            <span className="users-podium__metric-value">{metric.value}</span>
          </span>
        ))}
      </span>
    </button>
  );
}

/**
 * @param {{
 *   entries: import("@izibuy/shared-lib").UsersPodiumEntry<
 *     import("../../../entities/user/model/types.js").UserSearchListItem
 *   >[];
 *   onUserPress?: (userId: string) => void;
 * }} props
 */
export function UsersPodium({ entries, onUserPress }) {
  const displayEntries = useMemo(
    () => orderUsersPodiumForDisplay(entries),
    [entries],
  );

  if (displayEntries.length === 0) {
    return null;
  }

  return (
    <section className="users-podium" aria-label={USERS_PODIUM_UI.TITLE}>
      <h2 className="users-podium__title">{USERS_PODIUM_UI.TITLE}</h2>
      <div className="users-podium__row">
        {displayEntries.map((entry) => (
          <UsersPodiumSlot
            key={String(entry.user._id)}
            entry={entry}
            onUserPress={onUserPress}
          />
        ))}
      </div>
    </section>
  );
}
