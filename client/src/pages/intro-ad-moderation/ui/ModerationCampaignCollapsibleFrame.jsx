import { campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";
import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { resolveModerationCampaignCollapsedPreview } from "../lib/resolveModerationCampaignCollapsedPreview.js";

/**
 * @param {{
 *   title: string;
 *   collapsedPreview?: string | null;
 *   createdLabel?: string | null;
 *   needsAttention: boolean;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: () => void;
 *   children: import('react').ReactNode;
 * }} props
 */
export function ModerationCampaignCollapsibleFrame({
  title,
  collapsedPreview = null,
  createdLabel = null,
  needsAttention,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  children,
}) {
  const isExpanded = !collapsible || expanded;

  return (
    <div
      className={[
        "intro-ad-moderation-campaign-frame",
        needsAttention ? "intro-ad-moderation-campaign-frame_attention" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {collapsible ? (
        <button
          type="button"
          className={[
            "intro-ad-moderation-campaign-frame__toggle",
            needsAttention ? "intro-ad-moderation-campaign-frame__toggle_attention" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-expanded={isExpanded}
          onClick={onExpandedChange}
        >
          <span className="intro-ad-moderation-campaign-frame__main">
            <strong className="intro-ad-moderation-campaign-frame__title">{title}</strong>
            {collapsedPreview && !isExpanded ? (
              <span className="intro-ad-moderation-campaign-frame__preview">{collapsedPreview}</span>
            ) : null}
          </span>
          <span className="intro-ad-moderation-campaign-frame__meta">
            {createdLabel ? (
              <span className="intro-ad-moderation-campaign-frame__created">{createdLabel}</span>
            ) : null}
            <span className="intro-ad-moderation-campaign-frame__chevron" aria-hidden="true">
              {isExpanded ? "▾" : "▸"}
            </span>
            <span className="intro-ad-moderation-campaign-frame__expand-label">
              {INTRO_AD_MODERATION_PAGE_UI.EXPAND_TOGGLE(isExpanded)}
            </span>
          </span>
        </button>
      ) : null}
      {isExpanded ? children : null}
    </div>
  );
}

export { campaignModerationNeedsAttention, resolveModerationCampaignCollapsedPreview };
