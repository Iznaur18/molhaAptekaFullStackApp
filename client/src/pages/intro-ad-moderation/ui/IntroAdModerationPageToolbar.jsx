import {
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
} from "../lib/introAdModerationSectionFilters.js";
import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

const SECTION_FILTER_OPTIONS = [
  { value: "", label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_ALL },
  { value: INTRO_AD_MODERATION_SECTION_INTRO, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_INTRO },
  { value: INTRO_AD_MODERATION_SECTION_BANNER, label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_BANNER },
  {
    value: INTRO_AD_MODERATION_SECTION_PERSONAL,
    label: INTRO_AD_MODERATION_PAGE_UI.SECTION_FILTER_PERSONAL,
  },
];

/**
 * @param {{
 *   summaryCountLabel: string;
 *   sectionFilter: string;
 *   onSectionFilterChange: (value: string) => void;
 *   isRefreshing?: boolean;
 *   onRefresh?: () => void;
 * }} props
 */
export function IntroAdModerationPageToolbar({
  summaryCountLabel,
  sectionFilter,
  onSectionFilterChange,
  isRefreshing = false,
  onRefresh,
}) {
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
        {SECTION_FILTER_OPTIONS.map((option) => {
          const isActive = sectionFilter === option.value;
          return (
            <button
              key={option.value || "all"}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                "intro-ad-moderation-page__section-chip",
                isActive ? "intro-ad-moderation-page__section-chip_active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
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
