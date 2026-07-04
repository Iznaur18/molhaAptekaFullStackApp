import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";
import { resolveModerationCampaignCollapsedPreview } from "../lib/resolveModerationCampaignCollapsedPreview.js";
import { ModerationCampaignCollapsibleFrame } from "./ModerationCampaignCollapsibleFrame.jsx";

/**
 * @param {import('@molha/api-contract').IntroAdCampaignContract & { advertiser?: Record<string, unknown> | null }} campaign
 */
function resolveAdvertiserName(campaign) {
  const advertiser = campaign.advertiser;
  return (
    advertiser?.userNickname ||
    [advertiser?.userName, advertiser?.userSurname].filter(Boolean).join(" ") ||
    campaign.advertiserId
  );
}

/**
 * @param {string | null | undefined} status
 */
function resolveManagedStatusLabel(status) {
  if (status === "active") {
    return INTRO_AD_MODERATION_PAGE_UI.STATUS_ACTIVE;
  }
  if (status === "queued") {
    return INTRO_AD_MODERATION_PAGE_UI.STATUS_QUEUED;
  }
  return status ?? "—";
}

/**
 * @param {{
 *   campaign: import('@molha/api-contract').IntroAdCampaignContract & { advertiser?: Record<string, unknown> | null };
 *   isPending: boolean;
 *   onPreview: () => void;
 *   onApprove?: () => void;
 *   onReject?: () => void;
 *   onStaffCancel?: () => void;
 *   rejectReason?: string;
 *   onRejectReasonChange?: (value: string) => void;
 *   mode: "pending" | "managed";
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: () => void;
 * }} props
 */
export function IntroAdModerationCampaignCard({
  campaign,
  isPending,
  onPreview,
  onApprove,
  onReject,
  onStaffCancel,
  rejectReason = "",
  onRejectReasonChange,
  mode,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}) {
  const advertiserName = resolveAdvertiserName(campaign);
  const needsAttention = mode === "pending" && campaignModerationNeedsAttention(campaign);
  const collapsedPreview = resolveModerationCampaignCollapsedPreview(campaign);
  const createdLabel =
    mode === "pending" && campaign.createdAt
      ? new Date(campaign.createdAt).toLocaleString("ru-RU")
      : null;

  const cardBody = (
    <div className="intro-ad-moderation-page__item">
      <p className="intro-ad-moderation-page__meta">
        {INTRO_AD_MODERATION_PAGE_UI.ADVERTISER_LABEL}: {advertiserName}
      </p>
      {mode === "managed" ? (
        <p className="intro-ad-moderation-page__meta">
          {INTRO_AD_MODERATION_PAGE_UI.STATUS_LABEL}:{" "}
          {resolveManagedStatusLabel(campaign.status)}
        </p>
      ) : (
        <p className="intro-ad-moderation-page__meta">
          {INTRO_AD_MODERATION_PAGE_UI.SUBMITTED_LABEL}:{" "}
          {campaign.createdAt
            ? new Date(campaign.createdAt).toLocaleString("ru-RU")
            : "—"}
        </p>
      )}
      <div className="intro-ad-moderation-page__actions">
        <button
          type="button"
          className="app-btn app-btn--secondary"
          disabled={isPending}
          onClick={onPreview}
        >
          {INTRO_AD_MODERATION_PAGE_UI.PREVIEW}
        </button>
        {mode === "pending" && onApprove ? (
          <button
            type="button"
            className="app-btn app-btn--primary"
            disabled={isPending}
            onClick={onApprove}
          >
            {INTRO_AD_MODERATION_PAGE_UI.APPROVE}
          </button>
        ) : null}
        {mode === "managed" && onStaffCancel ? (
          <button
            type="button"
            className="app-btn app-btn--cancel"
            disabled={isPending}
            onClick={onStaffCancel}
          >
            {INTRO_AD_MODERATION_PAGE_UI.STAFF_CANCEL}
          </button>
        ) : null}
      </div>
      {mode === "pending" && onReject && onRejectReasonChange ? (
        <>
          <label className="intro-ad-moderation-page__reject">
            {INTRO_AD_MODERATION_PAGE_UI.REJECT_REASON_LABEL}
            <textarea
              className="intro-ad-moderation-page__textarea"
              value={rejectReason}
              onChange={(event) => onRejectReasonChange(event.target.value)}
              placeholder={INTRO_AD_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
            />
          </label>
          <button
            type="button"
            className="app-btn app-btn--danger"
            disabled={isPending}
            onClick={onReject}
          >
            {INTRO_AD_MODERATION_PAGE_UI.REJECT}
          </button>
        </>
      ) : null}
    </div>
  );

  if (!collapsible) {
    return cardBody;
  }

  return (
    <ModerationCampaignCollapsibleFrame
      title={advertiserName}
      collapsedPreview={collapsedPreview}
      createdLabel={createdLabel}
      needsAttention={needsAttention}
      collapsible
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      {cardBody}
    </ModerationCampaignCollapsibleFrame>
  );
}
