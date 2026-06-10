import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  approveSellerPersonalCategoryCampaign,
  fetchPendingSellerPersonalCategoryCampaigns,
  rejectSellerPersonalCategoryCampaign,
} from "../../../entities/seller-personal-category/api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "../../../entities/seller-personal-category/model/sellerPersonalCategoryQueryKeys.js";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

import "./SellerPersonalCategoryModerationPage.css";

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
 *   refreshPendingSellerPersonalCategoryModerationCount?: () => void;
 * }} props
 */
export function SellerPersonalCategoryModerationPage({
  refreshPendingSellerPersonalCategoryModerationCount,
}) {
  const queryClient = useQueryClient();
  const [rejectReasonById, setRejectReasonById] = useState({});
  const [actionError, setActionError] = useState("");

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
      refreshPendingSellerPersonalCategoryModerationCount?.();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }) =>
      rejectSellerPersonalCategoryCampaign(campaignId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.moderationPending(),
      });
      refreshPendingSellerPersonalCategoryModerationCount?.();
    },
  });

  const campaigns = pendingQuery.data ?? [];
  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = async (campaignId) => {
    try {
      setActionError("");
      await approveMutation.mutateAsync(campaignId);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE_FALLBACK,
      );
    }
  };

  const handleReject = async (campaignId) => {
    try {
      setActionError("");
      await rejectMutation.mutateAsync({
        campaignId,
        reason: rejectReasonById[campaignId] ?? "",
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_FALLBACK,
      );
    }
  };

  if (pendingQuery.isPending) {
    return <p className="seller-personal-category-moderation-page__state">Загрузка…</p>;
  }

  if (pendingQuery.isError) {
    return (
      <p className="seller-personal-category-moderation-page__state_error" role="alert">
        {pendingQuery.error instanceof Error
          ? pendingQuery.error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK}
      </p>
    );
  }

  return (
    <section
      className="seller-personal-category-moderation-page"
      aria-label={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.TITLE}
    >
      {actionError ? (
        <p className="seller-personal-category-moderation-page__state_error" role="alert">
          {actionError}
        </p>
      ) : null}

      {campaigns.length === 0 ? (
        <p className="seller-personal-category-moderation-page__state">
          {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.EMPTY}
        </p>
      ) : (
        <ul className="seller-personal-category-moderation-page__list">
          {campaigns.map((campaign) => {
            const campaignId = String(campaign._id);
            const imageSrc = campaign.imageUrl
              ? resolveUploadedImageUrl(campaign.imageUrl)
              : null;

            return (
              <li key={campaignId} className="seller-personal-category-moderation-page__item">
                <p className="seller-personal-category-moderation-page__meta">
                  {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.SELLER_LABEL}:{" "}
                  {resolveSellerName(campaign.seller) || campaign.sellerId}
                </p>
                <p className="seller-personal-category-moderation-page__meta">
                  {campaign.labelRu} — {campaign.amountPoints} баллов ({campaign.tariffCode})
                </p>
                {imageSrc ? (
                  <img
                    className="seller-personal-category-moderation-page__preview"
                    src={imageSrc}
                    alt=""
                  />
                ) : null}
                <textarea
                  className="seller-personal-category-moderation-page__reason"
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
                <div className="seller-personal-category-moderation-page__actions">
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
      )}
    </section>
  );
}
