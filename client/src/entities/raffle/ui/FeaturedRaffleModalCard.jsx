import { useMemo } from "react";

import { RAFFLE_FEATURED_BANNER_UI } from "../../../shared/config/appUiCopy.js";
import { buildFeaturedRaffleProgress } from "../lib/buildFeaturedRaffleProgressLabel.js";
import { FeaturedRaffleWinnerCard } from "./FeaturedRaffleWinnerCard.jsx";
import { RaffleManageActions } from "./RaffleManageActions.jsx";
import { RafflePrizeMedia } from "./RafflePrizeMedia.jsx";

import "./FeaturedRaffleModalCard.css";

/**
 * @param {{
 *   raffle: import('../model/types.js').RaffleFromApi;
 *   visualSize: number;
 *   manage?: {
 *     showEdit?: boolean;
 *     showDelete?: boolean;
 *     showPause?: boolean;
 *     onEdit?: () => void;
 *     onDelete?: () => void;
 *     onPause?: () => void;
 *     busy?: boolean;
 *   } | null;
 *   isVideoActive?: boolean;
 * }} props
 */
export function FeaturedRaffleModalCard({
  raffle,
  visualSize,
  manage = null,
  isVideoActive = true,
}) {
  const { isCompleted, progress, target, percent, label, participantsCount } = useMemo(
    () => buildFeaturedRaffleProgress(raffle),
    [raffle],
  );
  const hasManage = Boolean(
    manage && (manage.showEdit || manage.showDelete || manage.showPause),
  );
  const instagramUrl = raffle.instagramUrl?.trim() ?? "";

  const handleOpenInstagram = () => {
    if (!instagramUrl) {
      return;
    }
    window.open(instagramUrl, "_blank", "noopener,noreferrer");
  };

  const visualStyle = {
    width: `${visualSize}px`,
    height: `${visualSize}px`,
  };

  return (
    <article className="featured-raffle-modal-card" aria-label={raffle.title}>
      <div className="featured-raffle-modal-card__visual-wrap" style={visualStyle}>
        <div className="featured-raffle-modal-card__visual-card" style={visualStyle}>
          <div className="featured-raffle-modal-card__visual" style={visualStyle}>
            <RafflePrizeMedia
              raffle={raffle}
              className="featured-raffle-modal-card__media"
              imageClassName="featured-raffle-modal-card__media"
              videoClassName="featured-raffle-modal-card__media"
              autoplayVideo
              showSoundToggle
              isVideoActive={isVideoActive}
            />
          </div>
        </div>

        <div className="featured-raffle-modal-card__visual-top">
          <span className="featured-raffle-modal-card__badge">
            {RAFFLE_FEATURED_BANNER_UI.BADGE}
          </span>
          {hasManage && manage ? (
            <div
              className="featured-raffle-modal-card__manage-wrap"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <RaffleManageActions
                className="featured-raffle-modal-card__manage"
                showEdit={manage.showEdit}
                showDelete={manage.showDelete}
                showPause={manage.showPause}
                onEdit={manage.onEdit}
                onDelete={manage.onDelete}
                onPause={manage.onPause}
                busy={manage.busy}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="featured-raffle-modal-card__body">
        <div
          className={[
            "featured-raffle-modal-card__progress-bar",
            isCompleted && "featured-raffle-modal-card__progress-bar_completed",
          ]
            .filter(Boolean)
            .join(" ")}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={target}
          aria-valuenow={progress}
        >
          <div
            className={[
              "featured-raffle-modal-card__progress-fill",
              isCompleted && "featured-raffle-modal-card__progress-fill_completed",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ width: `${percent}%` }}
          />
        </div>

        {isCompleted && raffle.winner?._id ? (
          <FeaturedRaffleWinnerCard winner={raffle.winner} />
        ) : null}

        <div className="featured-raffle-modal-card__stats" aria-label={label}>
          <div className="featured-raffle-modal-card__stat">
            <span className="featured-raffle-modal-card__stat-label">
              {RAFFLE_FEATURED_BANNER_UI.STAT_GOAL}
            </span>
            <strong className="featured-raffle-modal-card__stat-value">{target}</strong>
          </div>
          <div className="featured-raffle-modal-card__stat featured-raffle-modal-card__stat_accent">
            <span className="featured-raffle-modal-card__stat-label">
              {RAFFLE_FEATURED_BANNER_UI.STAT_SOLD}
            </span>
            <strong className="featured-raffle-modal-card__stat-value">
              {RAFFLE_FEATURED_BANNER_UI.STAT_SOLD_VALUE(progress, target)}
            </strong>
          </div>
          <div className="featured-raffle-modal-card__stat">
            <span className="featured-raffle-modal-card__stat-label">
              {RAFFLE_FEATURED_BANNER_UI.STAT_PARTICIPANTS}
            </span>
            <strong className="featured-raffle-modal-card__stat-value">{participantsCount}</strong>
          </div>
        </div>

        {isCompleted ? (
          <div className="featured-raffle-modal-card__secondary">
            {instagramUrl ? (
              <button
                type="button"
                className="featured-raffle-modal-card__instagram"
                onClick={handleOpenInstagram}
              >
                {RAFFLE_FEATURED_BANNER_UI.OPEN_INSTAGRAM}
              </button>
            ) : null}
            <span className="featured-raffle-modal-card__completed">
              {RAFFLE_FEATURED_BANNER_UI.COMPLETED}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
