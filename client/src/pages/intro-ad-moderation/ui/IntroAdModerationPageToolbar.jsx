import {
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
} from "../lib/introAdModerationSectionFilters.js";
import { buildIntroAdModerationSectionChipClass } from "../lib/introAdModerationSectionZone.js";
import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ showUsersRaffleSection?: boolean }} params
 */
function buildSectionFilterOptions({ showUsersRaffleSection = false } = {}) {
  const options = [
    { value: "", label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_ALL },
    { value: INTRO_AD_MODERATION_SECTION_INTRO, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_INTRO },
    { value: INTRO_AD_MODERATION_SECTION_BANNER, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_BANNER },
    {
      value: INTRO_AD_MODERATION_SECTION_PERSONAL,
      label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_PERSONAL,
    },
    {
      value: INTRO_AD_MODERATION_SECTION_RAFFLE,
      label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_RAFFLE,
    },
  ];

  if (showUsersRaffleSection) {
    options.push({
      value: INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
      label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_USERS_RAFFLE,
    });
  }

  return options;
}

/**
 * @param {{
 *   summaryCountLabel: string;
 *   sectionFilter: string;
 *   onSectionFilterChange: (value: string) => void;
 *   showUsersRaffleSection?: boolean;
 *   isRefreshing?: boolean;
 *   onRefresh?: () => void;
 * }} props
 */
export function IntroAdModerationPageToolbar({
  summaryCountLabel,
  sectionFilter,
  onSectionFilterChange,
  showUsersRaffleSection = false,
  isRefreshing = false,
  onRefresh,
}) {
  const sectionFilterOptions = buildSectionFilterOptions({ showUsersRaffleSection });

  return (
    <div className="intro-ad-moderation-page__toolbar">
      <div className="intro-ad-moderation-page__toolbar-head">
        <h3 className="intro-ad-moderation-page__heading">{INTRO_AD_MODERATION_PAGE_UI.TITLE}</h3>
        <div className="intro-ad-moderation-page__toolbar-meta">
          <span className="intro-ad-moderation-page__count">{summaryCountLabel}</span>
          {onRefresh ? (
            <button
              type="button"
              className="intro-ad-moderation-page__refresh"
              disabled={isRefreshing}
              onClick={onRefresh}
            >
              {INTRO_AD_MODERATION_PAGE_UI.REFRESH}
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="intro-ad-moderation-page__section-chips"
        role="tablist"
        aria-label={INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_LABEL}
      >
        {sectionFilterOptions.map((option) => {
          const isActive = sectionFilter === option.value;
          return (
            <button
              key={option.value || "all"}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={buildIntroAdModerationSectionChipClass(option.value, isActive)}
              onClick={() => onSectionFilterChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
