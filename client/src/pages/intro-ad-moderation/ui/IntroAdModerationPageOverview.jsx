import {
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
} from "../lib/introAdModerationSectionFilters.js";
import { buildIntroAdModerationOverviewTileClass } from "../lib/introAdModerationSectionZone.js";
import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./IntroAdModerationPageOverview.css";

/**
 * @param {{
 *   pendingTotal: number;
 *   introPendingCount: number;
 *   bannerPendingCount: number;
 *   rafflePendingCount: number;
 *   attentionCount: number;
 *   attentionOnly: boolean;
 *   onPendingFilterClick: () => void;
 *   onIntroFilterClick: () => void;
 *   onBannerFilterClick: () => void;
 *   onRaffleFilterClick: () => void;
 *   showUsersRaffleOverview?: boolean;
 *   onUsersRaffleFilterClick?: () => void;
 *   onAttentionFilterChange: (value: boolean) => void;
 * }} props
 */
export function IntroAdModerationPageOverview({
  pendingTotal,
  introPendingCount,
  bannerPendingCount,
  rafflePendingCount,
  attentionCount,
  attentionOnly,
  onPendingFilterClick,
  onIntroFilterClick,
  onBannerFilterClick,
  onRaffleFilterClick,
  showUsersRaffleOverview = false,
  onUsersRaffleFilterClick,
  onAttentionFilterChange,
}) {
  return (
    <div className="intro-ad-moderation-overview" role="region" aria-label={INTRO_AD_MODERATION_PAGE_UI.TITLE}>
      <button type="button" className="intro-ad-moderation-overview__tile" onClick={onPendingFilterClick}>
        <span className="intro-ad-moderation-overview__label">
          {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_PENDING}
        </span>
        <strong className="intro-ad-moderation-overview__value">{pendingTotal}</strong>
      </button>

      <button
        type="button"
        className={buildIntroAdModerationOverviewTileClass(INTRO_AD_MODERATION_SECTION_INTRO)}
        onClick={onIntroFilterClick}
      >
        <span className="intro-ad-moderation-overview__label">
          {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_INTRO}
        </span>
        <strong className="intro-ad-moderation-overview__value">{introPendingCount}</strong>
      </button>

      <button
        type="button"
        className={buildIntroAdModerationOverviewTileClass(INTRO_AD_MODERATION_SECTION_BANNER)}
        onClick={onBannerFilterClick}
      >
        <span className="intro-ad-moderation-overview__label">
          {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_BANNER}
        </span>
        <strong className="intro-ad-moderation-overview__value">{bannerPendingCount}</strong>
      </button>

      <button
        type="button"
        className={buildIntroAdModerationOverviewTileClass(INTRO_AD_MODERATION_SECTION_RAFFLE)}
        onClick={onRaffleFilterClick}
      >
        <span className="intro-ad-moderation-overview__label">
          {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_RAFFLE}
        </span>
        <strong className="intro-ad-moderation-overview__value">{rafflePendingCount}</strong>
      </button>

      {showUsersRaffleOverview && onUsersRaffleFilterClick ? (
        <button
          type="button"
          className={buildIntroAdModerationOverviewTileClass(INTRO_AD_MODERATION_SECTION_USERS_RAFFLE)}
          onClick={onUsersRaffleFilterClick}
        >
          <span className="intro-ad-moderation-overview__label">
            {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_USERS_RAFFLE}
          </span>
          <strong className="intro-ad-moderation-overview__value intro-ad-moderation-overview__value_muted">
            —
          </strong>
        </button>
      ) : null}

      <button
        type="button"
        className={buildIntroAdModerationOverviewTileClass(null, {
          active: attentionOnly,
          attention: attentionCount > 0,
        })}
        aria-pressed={attentionOnly}
        onClick={() => onAttentionFilterChange(!attentionOnly)}
      >
        <span className="intro-ad-moderation-overview__label">
          {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_ATTENTION}
        </span>
        <strong className="intro-ad-moderation-overview__value">{attentionCount}</strong>
      </button>
    </div>
  );
}
