import { useCallback, useState } from "react";
import { View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import {
  SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
  usePendingSellerPersonalCategoryCampaignsQuery,
  useSellerPersonalCategoryModerationMutations,
} from "@/entities/seller-personal-category/model/useSellerPersonalCategoryModerationMutations";
import {
  SellerPersonalCategoryModerationCampaignCard,
  type SellerPersonalCategoryModerationCampaign,
} from "@/entities/seller-personal-category/ui/SellerPersonalCategoryModerationCampaignCard";
import { filterPendingModerationCampaigns } from "@/features/intro-ad-moderation-page/lib/filterPendingModerationCampaigns";
import { buildModerationCampaignRowId } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { ModerationSectionTitle } from "@/features/intro-ad-moderation-page/ui/ModerationSectionTitle";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";
import { sellerPersonalCategoryQueryKeys, staffBadgeQueryKeys } from "@/shared/api";

type SellerPersonalCategoryCampaignModerationSectionProps = {
  onActionError?: (message: string) => void;
  attentionOnly?: boolean;
  expandedIds?: Set<string>;
  onToggleExpanded?: (rowId: string) => void;
};

export const SellerPersonalCategoryCampaignModerationSection = ({
  onActionError,
  attentionOnly = false,
  expandedIds = new Set(),
  onToggleExpanded,
}: SellerPersonalCategoryCampaignModerationSectionProps) => {
  const styles = useIntroAdModerationPageStyles();
  const queryClient = useQueryClient();
  const queueQuery = usePendingSellerPersonalCategoryCampaignsQuery();
  const { approveMutation, rejectMutation } = useSellerPersonalCategoryModerationMutations();
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const campaigns = queueQuery.data ?? [];
  const filteredCampaigns = filterPendingModerationCampaigns(campaigns, { attentionOnly });

  const handleApprove = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        setCardErrors((prev) => ({ ...prev, [campaignId]: "" }));
        await approveMutation.mutateAsync(campaignId);
        await queryClient.invalidateQueries({
          queryKey: sellerPersonalCategoryQueryKeys.moderationPending(
            SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
          ),
        });
        await queryClient.invalidateQueries({
          queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
        });
      } catch (error) {
        const message = formatApiErrorMessage(
          error,
          SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE_FALLBACK,
        );
        onActionError?.(message);
        setCardErrors((prev) => ({ ...prev, [campaignId]: message }));
      } finally {
        setPendingCampaignId(null);
      }
    },
    [approveMutation, onActionError, queryClient],
  );

  const handleReject = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        setCardErrors((prev) => ({ ...prev, [campaignId]: "" }));
        await rejectMutation.mutateAsync({
          campaignId,
          reason: rejectReasonById[campaignId] ?? "",
        });
        await queryClient.invalidateQueries({
          queryKey: sellerPersonalCategoryQueryKeys.moderationPending(
            SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
          ),
        });
        await queryClient.invalidateQueries({
          queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
        });
      } catch (error) {
        const message = formatApiErrorMessage(
          error,
          SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_FALLBACK,
        );
        onActionError?.(message);
        setCardErrors((prev) => ({ ...prev, [campaignId]: message }));
      } finally {
        setPendingCampaignId(null);
      }
    },
    [onActionError, queryClient, rejectMutation, rejectReasonById],
  );

  if (campaigns.length === 0) {
    return null;
  }

  if (filteredCampaigns.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <ModerationSectionTitle
        title={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.PENDING_TITLE}
        pendingCount={filteredCampaigns.length}
      />
      <View style={styles.list}>
        {filteredCampaigns.map((campaign: SellerPersonalCategoryModerationCampaign) => {
          const campaignId = String(campaign._id);
          const rowId = buildModerationCampaignRowId("personal", campaignId);
          return (
            <SellerPersonalCategoryModerationCampaignCard
              key={campaignId}
              campaign={campaign}
              isPending={pendingCampaignId === campaignId}
              collapsible
              expanded={expandedIds.has(rowId)}
              onExpandedChange={() => onToggleExpanded?.(rowId)}
              rejectReason={rejectReasonById[campaignId] ?? ""}
              onRejectReasonChange={(value) =>
                setRejectReasonById((prev) => ({ ...prev, [campaignId]: value }))
              }
              onApprove={() => {
                void handleApprove(campaignId);
              }}
              onReject={() => {
                void handleReject(campaignId);
              }}
              errorMessage={cardErrors[campaignId] ?? ""}
            />
          );
        })}
      </View>
    </View>
  );
};

export { SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT };
