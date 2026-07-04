import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import "./IntroAdModerationPageOverview.css";

/**
 * @param {{
 *   pendingTotal: number;
 *   introPendingCount: number;
 *   bannerPendingCount: number;
 *   attentionCount: number;
 *   attentionOnly: boolean;
 *   onPendingFilterClick: () => void;
 *   onIntroFilterClick: () => void;
 *   onBannerFilterClick: () => void;
 *   onAttentionFilterChange: (value: boolean) => void;
 * }} props
 */
export function IntroAdModerationPageOverview({
  pendingTotal,
  introPendingCount,
  bannerPendingCount,
  attentionCount,
  attentionOnly,
  onPendingFilterClick,
  onIntroFilterClick,
  onBannerFilterClick,
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

      <button type="button" className="intro-ad-moderation-overview__tile" onClick={onIntroFilterClick}>
        <span className="intro-ad-moderation-overview__label">
          {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_INTRO}
        </span>
        <strong className="intro-ad-moderation-overview__value">{introPendingCount}</strong>
      </button>

      <button type="button" className="intro-ad-moderation-overview__tile" onClick={onBannerFilterClick}>
        <span className="intro-ad-moderation-overview__label">
          {INTRO_AD_MODERATION_PAGE_UI.OVERVIEW_BANNER}
        </span>
        <strong className="intro-ad-moderation-overview__value">{bannerPendingCount}</strong>
      </button>

      <button
        type="button"
        className={[
          "intro-ad-moderation-overview__tile",
          attentionOnly ? "intro-ad-moderation-overview__tile_active" : "",
          attentionCount > 0 ? "intro-ad-moderation-overview__tile_attention" : "",
        ]
          .filter(Boolean)
          .join(" ")}
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
