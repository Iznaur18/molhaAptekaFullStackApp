import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import {
  SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
  useManagedSellerPersonalCategoryCampaignsQuery,
  usePendingSellerPersonalCategoryCampaignsQuery,
  useSellerPersonalCategoryModerationMutations,
} from "@/entities/seller-personal-category/model/useSellerPersonalCategoryModerationMutations";
import {
  SellerPersonalCategoryModerationCampaignCard,
  type SellerPersonalCategoryModerationCampaign,
} from "@/entities/seller-personal-category/ui/SellerPersonalCategoryModerationCampaignCard";
import { filterPendingModerationCampaigns } from "@/features/intro-ad-moderation-page/lib/filterPendingModerationCampaigns";
import { INTRO_AD_MODERATION_SECTION_PERSONAL } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { buildModerationCampaignRowId } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { resolveIntroAdModerationListPanelStyles } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionZone";
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

const invalidateModerationQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: sellerPersonalCategoryQueryKeys.moderationPending(
        SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
      ),
    }),
    queryClient.invalidateQueries({
      queryKey: sellerPersonalCategoryQueryKeys.moderationManaged(),
    }),
    queryClient.invalidateQueries({
      queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(),
    }),
    queryClient.invalidateQueries({
      queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
    }),
  ]);
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
  const managedQuery = useManagedSellerPersonalCategoryCampaignsQuery();
  const {
    approveMutation,
    rejectMutation,
    staffUnpublishMutation,
    staffDeleteMutation,
  } = useSellerPersonalCategoryModerationMutations();
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const campaigns = queueQuery.data ?? [];
  const managedCampaigns = managedQuery.data ?? [];
  const filteredCampaigns = filterPendingModerationCampaigns(campaigns, { attentionOnly });
  const isActionPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    staffUnpublishMutation.isPending ||
    staffDeleteMutation.isPending;

  const handleApprove = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        setCardErrors((prev) => ({ ...prev, [campaignId]: "" }));
        await approveMutation.mutateAsync(campaignId);
        await invalidateModerationQueries(queryClient);
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
        await invalidateModerationQueries(queryClient);
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

  const runStaffUnpublish = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        setCardErrors((prev) => ({ ...prev, [campaignId]: "" }));
        await staffUnpublishMutation.mutateAsync(campaignId);
        await invalidateModerationQueries(queryClient);
      } catch (error) {
        const message = formatApiErrorMessage(
          error,
          SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH_FALLBACK,
        );
        onActionError?.(message);
        setCardErrors((prev) => ({ ...prev, [campaignId]: message }));
      } finally {
        setPendingCampaignId(null);
      }
    },
    [onActionError, queryClient, staffUnpublishMutation],
  );

  const runStaffDelete = useCallback(
    async (campaignId: string) => {
      try {
        setPendingCampaignId(campaignId);
        onActionError?.("");
        setCardErrors((prev) => ({ ...prev, [campaignId]: "" }));
        await staffDeleteMutation.mutateAsync(campaignId);
        await invalidateModerationQueries(queryClient);
      } catch (error) {
        const message = formatApiErrorMessage(
          error,
          SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE_FALLBACK,
        );
        onActionError?.(message);
        setCardErrors((prev) => ({ ...prev, [campaignId]: message }));
      } finally {
        setPendingCampaignId(null);
      }
    },
    [onActionError, queryClient, staffDeleteMutation],
  );

  const handleStaffUnpublish = useCallback(
    (campaignId: string) => {
      Alert.alert(
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH,
        "Категория исчезнет из каталога, баллы будут возвращены.",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH,
            style: "destructive",
            onPress: () => {
              void runStaffUnpublish(campaignId);
            },
          },
        ],
      );
    },
    [runStaffUnpublish],
  );

  const handleStaffDelete = useCallback(
    (campaignId: string) => {
      Alert.alert(
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE,
        "Действие необратимо.",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE,
            style: "destructive",
            onPress: () => {
              void runStaffDelete(campaignId);
            },
          },
        ],
      );
    },
    [runStaffDelete],
  );

  if (campaigns.length === 0 && managedCampaigns.length === 0) {
    return null;
  }

  if (filteredCampaigns.length === 0 && attentionOnly) {
    return null;
  }

  return (
    <>
      {!attentionOnly && managedCampaigns.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle
            title={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.MANAGED_TITLE}
          />
          <View style={resolveIntroAdModerationListPanelStyles(INTRO_AD_MODERATION_SECTION_PERSONAL, styles)}>
            {managedCampaigns.map((campaign: SellerPersonalCategoryModerationCampaign) => {
              const campaignId = String(campaign._id);
              return (
                <SellerPersonalCategoryModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  mode="managed"
                  isPending={pendingCampaignId === campaignId || isActionPending}
                  onStaffUnpublish={() => handleStaffUnpublish(campaignId)}
                  onStaffDelete={() => handleStaffDelete(campaignId)}
                  errorMessage={cardErrors[campaignId] ?? ""}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {filteredCampaigns.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle
            title={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.PENDING_TITLE}
            pendingCount={filteredCampaigns.length}
          />
          <View style={resolveIntroAdModerationListPanelStyles(INTRO_AD_MODERATION_SECTION_PERSONAL, styles)}>
            {filteredCampaigns.map((campaign: SellerPersonalCategoryModerationCampaign) => {
              const campaignId = String(campaign._id);
              const rowId = buildModerationCampaignRowId("personal", campaignId);
              return (
                <SellerPersonalCategoryModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  mode="pending"
                  isPending={pendingCampaignId === campaignId || isActionPending}
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
                  onStaffDelete={() => handleStaffDelete(campaignId)}
                  errorMessage={cardErrors[campaignId] ?? ""}
                />
              );
            })}
          </View>
        </View>
      ) : null}
    </>
  );
};

export { SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT };
