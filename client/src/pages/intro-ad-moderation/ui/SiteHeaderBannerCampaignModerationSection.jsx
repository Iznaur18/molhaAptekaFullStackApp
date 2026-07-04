import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { campaignToSiteHeaderBannerPreviewSlides } from "../../../entities/site-header-banner-campaign/lib/campaignToSiteHeaderBannerPreviewSlides.js";
import {
  approveSiteHeaderBannerCampaign,
  cancelSiteHeaderBannerCampaignByStaff,
  fetchManagedSiteHeaderBannerCampaigns,
  fetchPendingSiteHeaderBannerCampaigns,
  rejectSiteHeaderBannerCampaign,
} from "../../../entities/site-header-banner-campaign/api/siteHeaderBannerCampaignModerationApi.js";
import { siteHeaderBannerCampaignQueryKeys } from "../../../entities/site-header-banner-campaign/model/siteHeaderBannerCampaignQueryKeys.js";
import { SiteHeaderBannerCarousel } from "../../../entities/site-header-banner/ui/SiteHeaderBannerCarousel.jsx";
import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";

import { filterPendingModerationCampaigns } from "../lib/filterPendingModerationCampaigns.js";
import { buildModerationCampaignRowId } from "../lib/introAdModerationSectionFilters.js";
import { resolveModerationCampaignCollapsedPreview } from "../lib/resolveModerationCampaignCollapsedPreview.js";
import { ModerationCampaignCollapsibleFrame } from "./ModerationCampaignCollapsibleFrame.jsx";
import { ModerationSectionTitle } from "./ModerationSectionTitle.jsx";

const MODERATION_QUEUE_LIMIT = 50;

/**
 * @param {Record<string, unknown> | null | undefined} advertiser
 * @param {string} advertiserId
 */
function resolveAdvertiserName(advertiser, advertiserId) {
  return (
    advertiser?.userNickname ||
    [advertiser?.userName, advertiser?.userSurname].filter(Boolean).join(" ") ||
    advertiserId
  );
}

/**
 * @param {{
 *   campaign: Record<string, unknown>;
 *   isPending: boolean;
 *   mode: "pending" | "managed";
 *   onApprove?: () => void;
 *   onReject?: () => void;
 *   onStaffCancel?: () => void;
 *   rejectReason?: string;
 *   onRejectReasonChange?: (value: string) => void;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: () => void;
 * }} props
 */
function SiteHeaderBannerCampaignModerationCard({
  campaign,
  isPending,
  mode,
  onApprove,
  onReject,
  onStaffCancel,
  rejectReason = "",
  onRejectReasonChange,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}) {
  const [showPreview, setShowPreview] = useState(false);
  const advertiserName = resolveAdvertiserName(campaign.advertiser, String(campaign.advertiserId));
  const needsAttention = mode === "pending" && campaignModerationNeedsAttention(campaign);
  const collapsedPreview = resolveModerationCampaignCollapsedPreview(campaign);
  const createdLabel =
    mode === "pending" && campaign.createdAt
      ? new Date(String(campaign.createdAt)).toLocaleString("ru-RU")
      : null;
  const previewSlides = useMemo(
    () => campaignToSiteHeaderBannerPreviewSlides(campaign),
    [campaign],
  );
  const canPreview = previewSlides.length > 0;

  return (
    <ModerationCampaignCollapsibleFrame
      title={advertiserName}
      collapsedPreview={collapsedPreview}
      createdLabel={createdLabel}
      needsAttention={needsAttention}
      collapsible={collapsible}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      <div className="intro-ad-moderation-page__item">
      <p className="intro-ad-moderation-page__meta">
        {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.ADVERTISER_LABEL}: {advertiserName}
      </p>
      {mode === "managed" ? (
        <p className="intro-ad-moderation-page__meta">
          {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STATUS_LABEL}:{" "}
          {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STATUS_ACTIVE}
        </p>
      ) : (
        <p className="intro-ad-moderation-page__meta">
          {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.SUBMITTED_LABEL}:{" "}
          {campaign.createdAt
            ? new Date(String(campaign.createdAt)).toLocaleString("ru-RU")
            : "—"}
        </p>
      )}
      {showPreview && canPreview ? (
        <div className="intro-ad-moderation-page__banner-carousel-preview">
          <SiteHeaderBannerCarousel slides={previewSlides} />
        </div>
      ) : null}
      <div className="intro-ad-moderation-page__actions">
        {canPreview ? (
          <button
            type="button"
            className="app-btn app-btn--secondary"
            disabled={isPending}
            onClick={() => setShowPreview((prev) => !prev)}
          >
            {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.PREVIEW}
          </button>
        ) : null}
        {mode === "pending" && onApprove ? (
          <button
            type="button"
            className="app-btn app-btn--primary"
            disabled={isPending}
            onClick={onApprove}
          >
            {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE}
          </button>
        ) : null}
        {mode === "managed" && onStaffCancel ? (
          <button
            type="button"
            className="app-btn app-btn--cancel"
            disabled={isPending}
            onClick={onStaffCancel}
          >
            {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL}
          </button>
        ) : null}
      </div>
      {mode === "pending" && onReject && onRejectReasonChange ? (
        <>
          <label className="intro-ad-moderation-page__reject">
            {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_REASON_LABEL}
            <textarea
              className="intro-ad-moderation-page__textarea"
              value={rejectReason}
              onChange={(event) => onRejectReasonChange(event.target.value)}
              placeholder={
                SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER
              }
            />
          </label>
          <button
            type="button"
            className="app-btn app-btn--danger"
            disabled={isPending}
            onClick={onReject}
          >
            {SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT}
          </button>
        </>
      ) : null}
      </div>
    </ModerationCampaignCollapsibleFrame>
  );
}

/**
 * @param {{
 *   onQueueChanged?: () => void;
 *   actionError?: string;
 *   onActionError?: (message: string) => void;
 *   attentionOnly?: boolean;
 *   expandedIds?: Set<string>;
 *   onToggleExpanded?: (rowId: string) => void;
 * }} props
 */
export function SiteHeaderBannerCampaignModerationSection({
  onQueueChanged,
  actionError: parentActionError = "",
  onActionError,
  attentionOnly = false,
  expandedIds = new Set(),
  onToggleExpanded,
}) {
  const queryClient = useQueryClient();
  const [localActionError, setLocalActionError] = useState("");
  const [pendingCampaignId, setPendingCampaignId] = useState(null);
  const [rejectReasons, setRejectReasons] = useState(/** @type {Record<string, string>} */ ({}));

  const queueQuery = useQuery({
    queryKey: siteHeaderBannerCampaignQueryKeys.moderationPending(MODERATION_QUEUE_LIMIT),
    queryFn: () => fetchPendingSiteHeaderBannerCampaigns({ limit: MODERATION_QUEUE_LIMIT }),
  });

  const managedQuery = useQuery({
    queryKey: siteHeaderBannerCampaignQueryKeys.moderationManaged(),
    queryFn: fetchManagedSiteHeaderBannerCampaigns,
  });

  const approveMutation = useMutation({ mutationFn: approveSiteHeaderBannerCampaign });
  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }) => rejectSiteHeaderBannerCampaign(campaignId, reason),
  });
  const staffCancelMutation = useMutation({
    mutationFn: cancelSiteHeaderBannerCampaignByStaff,
  });

  const pendingCampaigns = queueQuery.data?.campaigns ?? [];
  const filteredPendingCampaigns = filterPendingModerationCampaigns(pendingCampaigns, {
    attentionOnly,
  });
  const managedCampaigns = managedQuery.data?.campaigns ?? [];
  const actionError = parentActionError || localActionError;

  const refreshModerationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: siteHeaderBannerCampaignQueryKeys.moderationPending(MODERATION_QUEUE_LIMIT),
      }),
      queryClient.invalidateQueries({
        queryKey: siteHeaderBannerCampaignQueryKeys.moderationManaged(),
      }),
      queryClient.invalidateQueries({
        queryKey: siteHeaderBannerCampaignQueryKeys.moderationCount(),
      }),
      queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationCount() }),
    ]);
    onQueueChanged?.();
  };

  const handleApprove = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      setLocalActionError("");
      onActionError?.("");
      await approveMutation.mutateAsync(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE_FALLBACK;
      setLocalActionError(message);
      onActionError?.(message);
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleReject = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      setLocalActionError("");
      onActionError?.("");
      await rejectMutation.mutateAsync({
        campaignId,
        reason: rejectReasons[campaignId] ?? "",
      });
      await refreshModerationQueries();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_FALLBACK;
      setLocalActionError(message);
      onActionError?.(message);
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleStaffCancel = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      setLocalActionError("");
      onActionError?.("");
      await staffCancelMutation.mutateAsync(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK;
      setLocalActionError(message);
      onActionError?.(message);
    } finally {
      setPendingCampaignId(null);
    }
  };

  if (queueQuery.isPending && managedQuery.isPending) {
    return null;
  }

  if (pendingCampaigns.length === 0 && managedCampaigns.length === 0) {
    return null;
  }

  if (attentionOnly && filteredPendingCampaigns.length === 0) {
    return null;
  }

  return (
    <>
      {actionError ? (
        <p className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error">
          {actionError}
        </p>
      ) : null}

      {!attentionOnly && managedCampaigns.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <ModerationSectionTitle
            title={SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.MANAGED_TITLE}
          />
          <ul className="intro-ad-moderation-page__list">
            {managedCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <SiteHeaderBannerCampaignModerationCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="managed"
                  onStaffCancel={() => handleStaffCancel(campaignId)}
                />
              );
            })}
          </ul>
        </section>
      ) : null}

      {filteredPendingCampaigns.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <ModerationSectionTitle
            title={SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.PENDING_TITLE}
            pendingCount={filteredPendingCampaigns.length}
          />
          <ul className="intro-ad-moderation-page__list profile-queue-content-panel">
            {filteredPendingCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              const rowId = buildModerationCampaignRowId("banner", campaignId);
              return (
                <SiteHeaderBannerCampaignModerationCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="pending"
                  collapsible
                  expanded={expandedIds.has(rowId)}
                  onExpandedChange={() => onToggleExpanded?.(rowId)}
                  onApprove={() => handleApprove(campaignId)}
                  onReject={() => handleReject(campaignId)}
                  rejectReason={rejectReasons[campaignId] ?? ""}
                  onRejectReasonChange={(value) =>
                    setRejectReasons((prev) => ({ ...prev, [campaignId]: value }))
                  }
                />
              );
            })}
          </ul>
        </section>
      ) : null}
    </>
  );
}
