import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  approveIntroAdCampaign,
  cancelIntroAdCampaignByStaff,
  fetchManagedIntroAdCampaigns,
  fetchPendingIntroAdCampaigns,
  rejectIntroAdCampaign,
} from "../../../entities/intro-ad/api/introAdModerationApi.js";
import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { useAppIntro } from "../../../features/app-intro/model/AppIntroContext.jsx";
import { formToIntroAdPreviewSettings } from "../../../entities/intro-ad/lib/index.js";
import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

import { SiteHeaderBannerCampaignModerationSection } from "./SiteHeaderBannerCampaignModerationSection.jsx";

import "./IntroAdModerationPage.css";

const MODERATION_QUEUE_LIMIT = 50;

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
 * }} props
 */
function IntroAdModerationCampaignCard({
  campaign,
  isPending,
  onPreview,
  onApprove,
  onReject,
  onStaffCancel,
  rejectReason = "",
  onRejectReasonChange,
  mode,
}) {
  const campaignId = String(campaign._id);
  const advertiserName = resolveAdvertiserName(campaign);

  return (
    <li className="intro-ad-moderation-page__item">
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
            className="app-btn app-btn--danger"
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
    </li>
  );
}

/**
 * @param {{
 *   onQueueChanged?: () => void;
 * }} props
 */
export function IntroAdModerationPage({ onQueueChanged }) {
  const queryClient = useQueryClient();
  const { previewIntro } = useAppIntro();
  const [actionError, setActionError] = useState("");
  const [pendingCampaignId, setPendingCampaignId] = useState(null);
  const [rejectReasons, setRejectReasons] = useState(
    /** @type {Record<string, string>} */ ({}),
  );

  const queueQuery = useQuery({
    queryKey: introAdQueryKeys.moderationPending(MODERATION_QUEUE_LIMIT),
    queryFn: () => fetchPendingIntroAdCampaigns({ limit: MODERATION_QUEUE_LIMIT }),
  });

  const managedQuery = useQuery({
    queryKey: introAdQueryKeys.moderationManaged(),
    queryFn: fetchManagedIntroAdCampaigns,
  });

  const approveMutation = useMutation({ mutationFn: approveIntroAdCampaign });
  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }) => rejectIntroAdCampaign(campaignId, reason),
  });
  const staffCancelMutation = useMutation({
    mutationFn: cancelIntroAdCampaignByStaff,
  });

  const pendingCampaigns = queueQuery.data?.campaigns ?? [];
  const managedCampaigns = managedQuery.data?.campaigns ?? [];

  const removeFromPendingQueue = (campaignId) => {
    queryClient.setQueryData(
      introAdQueryKeys.moderationPending(MODERATION_QUEUE_LIMIT),
      (old) => {
        if (!old?.campaigns) {
          return old;
        }
        return {
          ...old,
          campaigns: old.campaigns.filter((item) => String(item._id) !== campaignId),
        };
      },
    );
  };

  const removeFromManagedQueue = (campaignId) => {
    queryClient.setQueryData(introAdQueryKeys.moderationManaged(), (old) => {
      if (!old?.campaigns) {
        return old;
      }
      return {
        ...old,
        campaigns: old.campaigns.filter((item) => String(item._id) !== campaignId),
      };
    });
  };

  const refreshModerationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: introAdQueryKeys.moderationPending(MODERATION_QUEUE_LIMIT),
      }),
      queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationManaged() }),
      queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationCount() }),
    ]);
    onQueueChanged?.();
  };

  const handleApprove = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      await approveMutation.mutateAsync(campaignId);
      removeFromPendingQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : INTRO_AD_MODERATION_PAGE_UI.APPROVE_FALLBACK,
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleReject = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      await rejectMutation.mutateAsync({
        campaignId,
        reason: rejectReasons[campaignId] ?? "",
      });
      removeFromPendingQueue(campaignId);
      onQueueChanged?.();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : INTRO_AD_MODERATION_PAGE_UI.REJECT_FALLBACK,
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleStaffCancel = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      await staffCancelMutation.mutateAsync(campaignId);
      removeFromManagedQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : INTRO_AD_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK,
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const buildPreviewHandler = (campaign) => () =>
    previewIntro(
      formToIntroAdPreviewSettings({
        videoMp4Url: campaign.videoMp4Url,
        videoWebmUrl: campaign.videoWebmUrl,
        posterUrl: campaign.posterUrl,
        fallbackTitle: campaign.fallbackTitle,
        fallbackHint: campaign.fallbackHint,
        minMs: campaign.minMs,
        maxMs: campaign.maxMs,
        fadeOutMs: campaign.fadeOutMs,
      }),
    );

  if (queueQuery.isPending && managedQuery.isPending) {
    return (
      <p className="intro-ad-moderation-page__state">
        {INTRO_AD_MODERATION_PAGE_UI.LOADING}
      </p>
    );
  }

  const isEmpty = pendingCampaigns.length === 0 && managedCampaigns.length === 0;
  const hasLoadError =
    (queueQuery.isError && pendingCampaigns.length === 0) ||
    (managedQuery.isError && managedCampaigns.length === 0);

  if (hasLoadError && isEmpty) {
    const error =
      queueQuery.error instanceof Error
        ? queueQuery.error
        : managedQuery.error instanceof Error
          ? managedQuery.error
          : null;
    return (
      <p className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error">
        {error?.message ?? INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK}
      </p>
    );
  }

  if (isEmpty) {
    return (
      <>
        <p className="intro-ad-moderation-page__state">{INTRO_AD_MODERATION_PAGE_UI.EMPTY}</p>
        <SiteHeaderBannerCampaignModerationSection onQueueChanged={onQueueChanged} />
      </>
    );
  }

  return (
    <div className="intro-ad-moderation-page">
      {actionError ? (
        <p className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error">
          {actionError}
        </p>
      ) : null}

      {managedCampaigns.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <h3 className="intro-ad-moderation-page__section-title">
            {INTRO_AD_MODERATION_PAGE_UI.MANAGED_TITLE}
          </h3>
          <ul className="intro-ad-moderation-page__list">
            {managedCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <IntroAdModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="managed"
                  onPreview={buildPreviewHandler(campaign)}
                  onStaffCancel={() => handleStaffCancel(campaignId)}
                />
              );
            })}
          </ul>
        </section>
      ) : null}

      {pendingCampaigns.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <h3 className="intro-ad-moderation-page__section-title">
            {INTRO_AD_MODERATION_PAGE_UI.PENDING_TITLE}
          </h3>
          <ul className="intro-ad-moderation-page__list">
            {pendingCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <IntroAdModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="pending"
                  onPreview={buildPreviewHandler(campaign)}
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

      <SiteHeaderBannerCampaignModerationSection
        onQueueChanged={onQueueChanged}
        actionError={actionError}
        onActionError={setActionError}
      />
    </div>
  );
}
