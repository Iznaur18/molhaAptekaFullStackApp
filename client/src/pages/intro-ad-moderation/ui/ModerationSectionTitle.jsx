import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ title: string; pendingCount?: number }} props
 */
export function ModerationSectionTitle({ title, pendingCount = 0 }) {
  const showBadge = pendingCount > 0;

  return (
    <div className="intro-ad-moderation-page__section-title-row">
      <h3 className="intro-ad-moderation-page__section-title">{title}</h3>
      {showBadge ? (
        <span className="intro-ad-moderation-page__section-badge" aria-label={`${pendingCount} на модерации`}>
          {INTRO_AD_MODERATION_PAGE_UI.PENDING_BADGE(pendingCount)}
        </span>
      ) : null}
    </div>
  );
}
