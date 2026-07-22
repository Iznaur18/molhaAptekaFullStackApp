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
export function FeaturedRaffleWinnerCard({ winner }) {
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
    <section
      className="featured-raffle-winner-card"
      aria-label={RAFFLE_FEATURED_BANNER_UI.WINNER_TITLE}
    >
      <p className="featured-raffle-winner-card__title">
        {RAFFLE_FEATURED_BANNER_UI.WINNER_TITLE}
      </p>
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
    </section>
  );
}
