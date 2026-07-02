import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  approveSellerPersonalCategoryCampaign,
  fetchPendingSellerPersonalCategoryCampaigns,
  rejectSellerPersonalCategoryCampaign,
} from "../../../entities/seller-personal-category/api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "../../../entities/seller-personal-category/model/sellerPersonalCategoryQueryKeys.js";
import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

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
 * }} props
 */
export function SellerPersonalCategoryCampaignModerationSection({
  onQueueChanged,
  actionError = "",
  onActionError,
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

  return (
    <section className="intro-ad-moderation-page__section">
      <ModerationSectionTitle
        title={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.PENDING_TITLE}
        pendingCount={campaigns.length}
      />
      {actionError ? (
        <p className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error" role="alert">
          {actionError}
        </p>
      ) : null}
      <ul className="intro-ad-moderation-page__list">
        {campaigns.map((campaign) => {
          const campaignId = String(campaign._id);
          const imageSrc = campaign.imageUrl
            ? resolveUploadedImageUrl(campaign.imageUrl)
            : null;

          return (
            <li key={campaignId} className="intro-ad-moderation-page__item">
              <p className="intro-ad-moderation-page__meta">
                {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.SELLER_LABEL}:{" "}
                {resolveSellerName(campaign.seller) || campaign.sellerId}
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}
