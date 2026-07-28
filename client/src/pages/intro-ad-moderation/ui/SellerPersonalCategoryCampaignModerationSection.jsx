import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  approveSellerPersonalCategoryCampaign,
  cancelSellerPersonalCategoryCampaignByStaff,
  deleteSellerPersonalCategoryCampaignByStaff,
  fetchManagedSellerPersonalCategoryCampaigns,
  fetchPendingSellerPersonalCategoryCampaigns,
  rejectSellerPersonalCategoryCampaign,
} from "../../../entities/seller-personal-category/api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "../../../entities/seller-personal-category/model/sellerPersonalCategoryQueryKeys.js";
import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";

import { filterPendingModerationCampaigns } from "../lib/filterPendingModerationCampaigns.js";
import { INTRO_AD_MODERATION_SECTION_PERSONAL } from "../lib/introAdModerationSectionFilters.js";
import { buildIntroAdModerationZonePanelClass } from "../lib/introAdModerationSectionZone.js";
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
 *   campaign: Record<string, unknown>;
 *   isPending: boolean;
 *   mode: "pending" | "managed";
 *   onApprove?: () => void;
 *   onReject?: () => void;
 *   onStaffUnpublish?: () => void;
 *   onStaffDelete?: () => void;
 *   rejectReason?: string;
 *   onRejectReasonChange?: (value: string) => void;
 *   collapsible?: boolean;
 *   expanded?: boolean;
 *   onExpandedChange?: () => void;
 * }} props
 */
function SellerPersonalCategoryCampaignModerationCard({
  campaign,
  isPending,
  mode,
  onApprove,
  onReject,
  onStaffUnpublish,
  onStaffDelete,
  rejectReason = "",
  onRejectReasonChange,
  collapsible = false,
  expanded = true,
  onExpandedChange,
}) {
  const sellerName = resolveSellerName(campaign.seller) || String(campaign.sellerId);
  const imageSrc = campaign.imageUrl ? resolveUploadedImageUrl(String(campaign.imageUrl)) : null;
  const needsAttention = mode === "pending" && campaignModerationNeedsAttention(campaign);
  const collapsedPreview = resolveModerationCampaignCollapsedPreview(campaign);
  const createdLabel =
    mode === "pending" && campaign.createdAt
      ? new Date(String(campaign.createdAt)).toLocaleString("ru-RU")
      : null;

  const cardBody = (
    <div className="intro-ad-moderation-page__item">
      <p className="intro-ad-moderation-page__meta">
        {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.SELLER_LABEL}: {sellerName}
      </p>
      <p className="intro-ad-moderation-page__meta">
        {campaign.labelRu} — {campaign.amountPoints} баллов ({campaign.tariffCode})
      </p>
      {mode === "managed" ? (
        <p className="intro-ad-moderation-page__meta">
          {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STATUS_ACTIVE}
          {campaign.activeUntil
            ? ` · до ${new Date(String(campaign.activeUntil)).toLocaleString("ru-RU")}`
            : ""}
        </p>
      ) : null}
      {imageSrc ? (
        <img className="intro-ad-moderation-page__banner-preview" src={imageSrc} alt="" />
      ) : null}
      {mode === "pending" && onRejectReasonChange ? (
        <textarea
          className="intro-ad-moderation-page__textarea"
          placeholder={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_REASON_PLACEHOLDER}
          value={rejectReason}
          onChange={(event) => onRejectReasonChange(event.target.value)}
        />
      ) : null}
      <div className="intro-ad-moderation-page__actions">
        {mode === "pending" && onApprove ? (
          <button
            type="button"
            className="app-btn app-btn--primary"
            disabled={isPending}
            onClick={onApprove}
          >
            {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE}
          </button>
        ) : null}
        {mode === "pending" && onReject ? (
          <button
            type="button"
            className="app-btn app-btn--secondary"
            disabled={isPending}
            onClick={onReject}
          >
            {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT}
          </button>
        ) : null}
        {mode === "pending" && onStaffDelete ? (
          <button
            type="button"
            className="app-btn app-btn--danger"
            disabled={isPending}
            onClick={onStaffDelete}
          >
            {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE}
          </button>
        ) : null}
        {mode === "managed" && onStaffUnpublish ? (
          <button
            type="button"
            className="app-btn app-btn--cancel"
            disabled={isPending}
            onClick={onStaffUnpublish}
          >
            {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH}
          </button>
        ) : null}
        {mode === "managed" && onStaffDelete ? (
          <button
            type="button"
            className="app-btn app-btn--danger"
            disabled={isPending}
            onClick={onStaffDelete}
          >
            {SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE}
          </button>
        ) : null}
      </div>
    </div>
  );

  if (!collapsible) {
    return cardBody;
  }

  return (
    <ModerationCampaignCollapsibleFrame
      title={sellerName}
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
  const [pendingCampaignId, setPendingCampaignId] = useState(null);

  const pendingQuery = useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.moderationPending(),
    queryFn: () => fetchPendingSellerPersonalCategoryCampaigns(MODERATION_QUEUE_LIMIT),
  });

  const managedQuery = useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.moderationManaged(),
    queryFn: fetchManagedSellerPersonalCategoryCampaigns,
  });

  const approveMutation = useMutation({ mutationFn: approveSellerPersonalCategoryCampaign });
  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }) =>
      rejectSellerPersonalCategoryCampaign(campaignId, reason),
  });
  const staffUnpublishMutation = useMutation({
    mutationFn: cancelSellerPersonalCategoryCampaignByStaff,
  });
  const staffDeleteMutation = useMutation({
    mutationFn: deleteSellerPersonalCategoryCampaignByStaff,
  });

  const campaigns = pendingQuery.data ?? [];
  const managedCampaigns = managedQuery.data ?? [];
  const filteredCampaigns = useMemo(
    () => filterPendingModerationCampaigns(campaigns, { attentionOnly }),
    [attentionOnly, campaigns],
  );
  const isActionPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    staffUnpublishMutation.isPending ||
    staffDeleteMutation.isPending;

  const refreshModerationQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.moderationPending(),
      }),
      queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.moderationManaged(),
      }),
      queryClient.invalidateQueries({
        queryKey: [...sellerPersonalCategoryQueryKeys.all, "catalog-tiles"],
      }),
      queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationCount() }),
    ]);
    onQueueChanged?.();
  };

  const handleApprove = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      onActionError?.("");
      await approveMutation.mutateAsync(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      onActionError?.(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE_FALLBACK,
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleReject = async (campaignId) => {
    try {
      setPendingCampaignId(campaignId);
      onActionError?.("");
      await rejectMutation.mutateAsync({
        campaignId,
        reason: rejectReasonById[campaignId] ?? "",
      });
      await refreshModerationQueries();
    } catch (error) {
      onActionError?.(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_FALLBACK,
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleStaffUnpublish = async (campaignId) => {
    if (
      !window.confirm(
        `${SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH}?\n\nКатегория исчезнет из каталога, баллы будут возвращены.`,
      )
    ) {
      return;
    }

    try {
      setPendingCampaignId(campaignId);
      onActionError?.("");
      await staffUnpublishMutation.mutateAsync(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      onActionError?.(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH_FALLBACK,
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleStaffDelete = async (campaignId) => {
    if (
      !window.confirm(
        `${SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE}?\n\nДействие необратимо.`,
      )
    ) {
      return;
    }

    try {
      setPendingCampaignId(campaignId);
      onActionError?.("");
      await staffDeleteMutation.mutateAsync(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      onActionError?.(
        error instanceof Error
          ? error.message
          : SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE_FALLBACK,
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  if (pendingQuery.isPending && managedQuery.isPending) {
    return null;
  }

  if (campaigns.length === 0 && managedCampaigns.length === 0) {
    return null;
  }

  if (attentionOnly && filteredCampaigns.length === 0) {
    return null;
  }

  return (
    <>
      {!attentionOnly && managedCampaigns.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <ModerationSectionTitle
            title={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.MANAGED_TITLE}
          />
          {actionError ? (
            <p
              className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}
          <div
            className={`intro-ad-moderation-page__list ${buildIntroAdModerationZonePanelClass(INTRO_AD_MODERATION_SECTION_PERSONAL)}`}
          >
            {managedCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <SellerPersonalCategoryCampaignModerationCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId || isActionPending}
                  mode="managed"
                  onStaffUnpublish={() => void handleStaffUnpublish(campaignId)}
                  onStaffDelete={() => void handleStaffDelete(campaignId)}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {filteredCampaigns.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <ModerationSectionTitle
            title={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.PENDING_TITLE}
            pendingCount={filteredCampaigns.length}
          />
          {actionError && managedCampaigns.length === 0 ? (
            <p
              className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}
          <div
            className={`intro-ad-moderation-page__list ${buildIntroAdModerationZonePanelClass(INTRO_AD_MODERATION_SECTION_PERSONAL)}`}
          >
            {filteredCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              const rowId = buildModerationCampaignRowId("personal", campaignId);
              return (
                <SellerPersonalCategoryCampaignModerationCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId || isActionPending}
                  mode="pending"
                  collapsible
                  expanded={expandedIds.has(rowId)}
                  onExpandedChange={() => onToggleExpanded?.(rowId)}
                  rejectReason={rejectReasonById[campaignId] ?? ""}
                  onRejectReasonChange={(value) =>
                    setRejectReasonById((prev) => ({ ...prev, [campaignId]: value }))
                  }
                  onApprove={() => void handleApprove(campaignId)}
                  onReject={() => void handleReject(campaignId)}
                  onStaffDelete={() => void handleStaffDelete(campaignId)}
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}
