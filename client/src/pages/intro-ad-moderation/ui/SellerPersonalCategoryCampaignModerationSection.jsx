import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  approveSellerPersonalCategoryCampaign,
  fetchPendingSellerPersonalCategoryCampaigns,
  rejectSellerPersonalCategoryCampaign,
} from "../../../entities/seller-personal-category/api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "../../../entities/seller-personal-category/model/sellerPersonalCategoryQueryKeys.js";
import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

import { filterPendingModerationCampaigns } from "../lib/filterPendingModerationCampaigns.js";
import { buildModerationCampaignRowId } from "../lib/introAdModerationSectionFilters.js";
import { resolveModerationCampaignCollapsedPreview } from "../lib/resolveModerationCampaignCollapsedPreview.js";
import { ModerationCampaignCollapsibleFrame } from "./ModerationCampaignCollapsibleFrame.jsx";
import { ModerationSectionTitle } from "./ModerationSectionTitle.jsx";

const MODERATION_QUEUE_LIMIT = 50;

/**
 * @param {Record<string, unknown> | null | undefined} seller
 */
function resolveSellerName(seller) {
  return (
    seller?.userNickname ||
    [seller?.userName, seller?.userSurname].filter(Boolean).join(" ") ||
    ""
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
export function SellerPersonalCategoryCampaignModerationSection({
  onQueueChanged,
  actionError = "",
  onActionError,
  attentionOnly = false,
  expandedIds = new Set(),
  onToggleExpanded,
}) {
  const queryClient = useQueryClient();
  const [rejectReasonById, setRejectReasonById] = useState({});

  const pendingQuery = useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.moderationPending(),
    queryFn: () => fetchPendingSellerPersonalCategoryCampaigns(MODERATION_QUEUE_LIMIT),
  });

  const approveMutation = useMutation({
    mutationFn: approveSellerPersonalCategoryCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.moderationPending(),
      });
      await queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(),
      });
      await queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationCount() });
      onQueueChanged?.();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }) =>
      rejectSellerPersonalCategoryCampaign(campaignId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.moderationPending(),
      });
      await queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationCount() });
      onQueueChanged?.();
    },
  });

  const campaigns = pendingQuery.data ?? [];
  const filteredCampaigns = useMemo(
    () => filterPendingModerationCampaigns(campaigns, { attentionOnly }),
    [attentionOnly, campaigns],
  );
  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async (campaignId) => {
    try {
      onActionError?.("");
      await approveMutation.mutateAsync(campaignId);
    } catch (error) {
      onActionError?.(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE_FALLBACK,
      );
    }
  };

  const handleReject = async (campaignId) => {
    try {
      onActionError?.("");
      await rejectMutation.mutateAsync({
        campaignId,
        reason: rejectReasonById[campaignId] ?? "",
      });
    } catch (error) {
      onActionError?.(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_FALLBACK,
      );
    }
  };

  if (campaigns.length === 0) {
    return null;
  }

  if (filteredCampaigns.length === 0) {
    return null;
  }

  return (
    <section className="intro-ad-moderation-page__section">
      <ModerationSectionTitle
        title={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.PENDING_TITLE}
        pendingCount={filteredCampaigns.length}
      />
      {actionError ? (
        <p className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error" role="alert">
          {actionError}
        </p>
      ) : null}
      <div className="intro-ad-moderation-page__list profile-queue-content-panel">
        {filteredCampaigns.map((campaign) => {
          const campaignId = String(campaign._id);
          const rowId = buildModerationCampaignRowId("personal", campaignId);
          const sellerName = resolveSellerName(campaign.seller) || campaign.sellerId;
          const imageSrc = campaign.imageUrl
            ? resolveUploadedImageUrl(campaign.imageUrl)
            : null;
          const needsAttention = campaignModerationNeedsAttention(campaign);
          const collapsedPreview = resolveModerationCampaignCollapsedPreview(campaign);
          const createdLabel =
            campaign.createdAt != null
              ? new Date(String(campaign.createdAt)).toLocaleString("ru-RU")
              : null;

          return (
            <ModerationCampaignCollapsibleFrame
              key={campaignId}
              title={String(sellerName)}
              collapsedPreview={collapsedPreview}
              createdLabel={createdLabel}
              needsAttention={needsAttention}
              collapsible
              expanded={expandedIds.has(rowId)}
              onExpandedChange={() => onToggleExpanded?.(rowId)}
            >
              <div className="intro-ad-moderation-page__item">
                <p className="intro-ad-moderation-page__meta">
                  {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.SELLER_LABEL}: {sellerName}
                </p>
                <p className="intro-ad-moderation-page__meta">
                  {campaign.labelRu} — {campaign.amountPoints} баллов ({campaign.tariffCode})
                </p>
                {imageSrc ? (
                  <img
                    className="intro-ad-moderation-page__banner-preview"
                    src={imageSrc}
                    alt=""
                  />
                ) : null}
                <textarea
                  className="intro-ad-moderation-page__textarea"
                  placeholder={
                    SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER
                  }
                  value={rejectReasonById[campaignId] ?? ""}
                  onChange={(event) =>
                    setRejectReasonById((prev) => ({
                      ...prev,
                      [campaignId]: event.target.value,
                    }))
                  }
                />
                <div className="intro-ad-moderation-page__actions">
                  <button
                    type="button"
                    className="app-btn app-btn--primary"
                    disabled={isPending}
                    onClick={() => handleApprove(campaignId)}
                  >
                    {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE}
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn--secondary"
                    disabled={isPending}
                    onClick={() => handleReject(campaignId)}
                  >
                    {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT}
                  </button>
                </div>
              </div>
            </ModerationCampaignCollapsibleFrame>
          );
        })}
      </div>
    </section>
  );
}
