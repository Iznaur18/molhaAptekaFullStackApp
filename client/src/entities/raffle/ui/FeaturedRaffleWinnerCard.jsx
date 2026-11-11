import { useState } from "react";

import { DEFAULT_USER_AVATAR_URL } from "../../user/model/userConstants.js";
import { pickUserProfilePhotoUrl } from "../../user/lib/pickUserProfilePhotoUrl.js";
import { RAFFLE_FEATURED_BANNER_UI } from "../../../shared/config/appUiCopy.js";
import { dispatchOpenUserProfileEvent } from "../../../shared/lib/openUserProfileEvent.js";

import "./FeaturedRaffleWinnerCard.css";

/**
 * @param {{
 *   winner: { _id: string; userName?: string | null; userAvatarUrl?: string | null };
 * }} props
 */
function WinnerRow({ winner }) {
  const [imgFailed, setImgFailed] = useState(false);
  const userName =
    typeof winner.userName === "string" && winner.userName.trim()
      ? winner.userName.trim()
      : RAFFLE_FEATURED_BANNER_UI.WINNER_FALLBACK_NAME;
  const picked = pickUserProfilePhotoUrl({
    userAvatarUrl: winner.userAvatarUrl,
  });
  const src = !imgFailed && picked ? picked : DEFAULT_USER_AVATAR_URL;

  return (
    <button
      type="button"
      className="featured-raffle-winner-card__row"
      aria-label={RAFFLE_FEATURED_BANNER_UI.WINNER_OPEN_PROFILE_ARIA(userName)}
      onClick={() => dispatchOpenUserProfileEvent(winner._id)}
    >
      <img
        className="featured-raffle-winner-card__avatar"
        src={src}
        alt=""
        width={40}
        height={40}
        onError={() => setImgFailed(true)}
      />
      <span className="featured-raffle-winner-card__name">{userName}</span>
    </button>
  );
}

/**
 * @param {{
 *   winner?: { _id: string; userName?: string | null; userAvatarUrl?: string | null } | null;
 *   winners?: Array<{ _id: string; userName?: string | null; userAvatarUrl?: string | null }> | null;
 * }} props
 */
export function FeaturedRaffleWinnerCard({ winner = null, winners = null }) {
  const list =
    Array.isArray(winners) && winners.length > 0
      ? winners
      : winner?._id
        ? [winner]
        : [];

  if (list.length === 0) {
    return null;
  }

  const title =
    list.length > 1
      ? RAFFLE_FEATURED_BANNER_UI.WINNERS_TITLE
      : RAFFLE_FEATURED_BANNER_UI.WINNER_TITLE;

  return (
    <section className="featured-raffle-winner-card" aria-label={title}>
      <p className="featured-raffle-winner-card__title">{title}</p>
      <div className="featured-raffle-winner-card__list">
        {list.map((entry) => (
          <WinnerRow key={String(entry._id)} winner={entry} />
        ))}
      </div>
    </section>
  );
}
