import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import {
  SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
  usePendingSellerPersonalCategoryCampaignsQuery,
  useSellerPersonalCategoryModerationMutations,
} from "@/entities/seller-personal-category/model/useSellerPersonalCategoryModerationMutations";
import {
  SellerPersonalCategoryModerationCampaignCard,
  type SellerPersonalCategoryModerationCampaign,
} from "@/entities/seller-personal-category/ui/SellerPersonalCategoryModerationCampaignCard";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { sellerPersonalCategoryQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import {
  MY_PROFILE_PAGE_UI,
  SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI,
} from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useSellerPersonalCategoryModerationPageStyles } from "@/shared/theme/sellerPersonalCategoryModerationPageStyles";
import { ScreenErrorState } from "@/shared/ui/ScreenStates";

export const SellerPersonalCategoryModerationPage = () => {
  const router = useRouter();
  const styles = useSellerPersonalCategoryModerationPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const queueQuery = usePendingSellerPersonalCategoryCampaignsQuery();
  const { approveMutation, rejectMutation } = useSellerPersonalCategoryModerationMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
  const [rejectReasonById, setRejectReasonById] = useState<Record<string, string>>({});
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const campaigns = queueQuery.data ?? [];

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
    }, [queueQuery.refetch]),
  );

  const removeFromQueue = useCallback(
    (campaignId: string) => {
      queryClient.setQueryData(
        sellerPersonalCategoryQueryKeys.moderationPending(
          SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
        ),
        (old: SellerPersonalCategoryModerationCampaign[] | undefined) => {
          if (!Array.isArray(old)) {
            return old;
          }
          return old.filter((item) => String(item._id) !== campaignId);
        },
      );
      setRejectReasonById((prev) => {
        const next = { ...prev };
        delete next[campaignId];
        return next;
      });
      setCardErrors((prev) => {
        const next = { ...prev };
        delete next[campaignId];
        return next;
      });
    },
    [queryClient],
  );

  const refreshModerationQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.moderationPending(
          SELLER_PERSONAL_CATEGORY_MODERATION_QUEUE_LIMIT,
        ),
      }),
      queryClient.invalidateQueries({
        queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(),
      }),
      queryClient.invalidateQueries({
        queryKey: [...staffBadgeQueryKeys.all, "seller-personal-category"],
      }),
    ]);
  }, [queryClient]);

  const handleApprove = async (campaignId: string) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [campaignId]: "" }));
      await approveMutation.mutateAsync(campaignId);
      removeFromQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      const message = formatApiErrorMessage(
        error,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE_FALLBACK,
      );
      setActionError(message);
      setCardErrors((prev) => ({ ...prev, [campaignId]: message }));
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleReject = async (campaignId: string) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      setCardErrors((prev) => ({ ...prev, [campaignId]: "" }));
      await rejectMutation.mutateAsync({
        campaignId,
        reason: rejectReasonById[campaignId] ?? "",
      });
      removeFromQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      const message = formatApiErrorMessage(
        error,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_FALLBACK,
      );
      setActionError(message);
      setCardErrors((prev) => ({ ...prev, [campaignId]: message }));
    } finally {
      setPendingCampaignId(null);
    }
  };

  const sectionToggle = (
    <ProfileMobileSectionToggle
      activeLabel={MY_PROFILE_PAGE_UI.TAB_SELLER_PERSONAL_CATEGORY_MODERATION}
      onPress={() => setNavSheetVisible(true)}
    />
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="seller-personal-category-moderation"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  const listHeader = (
    <View style={styles.header}>
      {sectionToggle}
      {actionError ? (
        <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
          {actionError}
        </Text>
      ) : null}
    </View>
  );

  if (queueQuery.isPending && campaigns.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <Text style={styles.state}>{SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.LOADING}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  if (queueQuery.isError && campaigns.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          <View style={styles.header}>{sectionToggle}</View>
          <ScreenErrorState
            message={formatApiErrorMessage(
              queueQuery.error,
              SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK,
            )}
            onRetry={() => queueQuery.refetch()}
          />
        </View>
        {navSheet}
      </>
    );
  }

  if (campaigns.length === 0) {
    return (
      <>
        <View style={[styles.container, centeredContentStyle, styles.centered]}>
          {listHeader}
          <Text style={styles.empty}>{SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.EMPTY}</Text>
        </View>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[styles.scroll, { paddingBottom: contentPaddingBottom }]}
        accessibilityLabel={SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.TITLE}
        refreshControl={
          <ThemedRefreshControl
            refreshing={queueQuery.isFetching}
            onRefresh={async () => {
              await queueQuery.refetch();
              await refreshModerationQueries();
            }}
          />
        }
      >
        {listHeader}

        <View style={styles.list}>
          {campaigns.map((campaign) => {
            const campaignId = String(campaign._id);
            return (
              <SellerPersonalCategoryModerationCampaignCard
                key={campaignId}
                campaign={campaign}
                isPending={pendingCampaignId === campaignId}
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
      </ScrollView>

      {navSheet}
    </>
  );
};
