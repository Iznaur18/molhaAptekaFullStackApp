import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ThemedRefreshControl } from "@/shared/ui/ThemedRefreshControl";

import { campaignToIntroAdPreviewSettings } from "@/entities/intro-ad/lib/campaignToIntroAdPreviewSettings";
import {
  INTRO_AD_MODERATION_QUEUE_LIMIT,
  useIntroAdModerationMutations,
  useManagedIntroAdCampaignsQuery,
  usePendingIntroAdCampaignsQuery,
} from "@/entities/intro-ad/model/useIntroAdModerationMutations";
import {
  IntroAdModerationCampaignCard,
  type IntroAdModerationCampaign,
} from "@/entities/intro-ad/ui/IntroAdModerationCampaignCard";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import { ModerationSectionTitle } from "@/features/intro-ad-moderation-page/ui/ModerationSectionTitle";
import { SellerPersonalCategoryCampaignModerationSection } from "@/features/intro-ad-moderation-page/ui/SellerPersonalCategoryCampaignModerationSection";
import { SiteHeaderBannerCampaignModerationSection } from "@/features/intro-ad-moderation-page/ui/SiteHeaderBannerCampaignModerationSection";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { introAdQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { INTRO_AD_MODERATION_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

export const IntroAdModerationPage = () => {
  const router = useRouter();
  const styles = useIntroAdModerationPageStyles();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const queryClient = useQueryClient();
  const { previewIntro } = useAppIntro();
  const queueQuery = usePendingIntroAdCampaignsQuery();
  const managedQuery = useManagedIntroAdCampaignsQuery();
  const { approveMutation, rejectMutation, staffCancelMutation } = useIntroAdModerationMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const pendingCampaigns = queueQuery.data ?? [];
  const managedCampaigns = managedQuery.data ?? [];

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
      void managedQuery.refetch();
    }, [managedQuery.refetch, queueQuery.refetch]),
  );

  const removeFromPendingQueue = useCallback(
    (campaignId: string) => {
      queryClient.setQueryData(
        introAdQueryKeys.moderationPending(INTRO_AD_MODERATION_QUEUE_LIMIT),
        (old: IntroAdModerationCampaign[] | undefined) => {
          if (!Array.isArray(old)) {
            return old;
          }
          return old.filter((item) => String(item._id) !== campaignId);
        },
      );
      setRejectReasons((prev) => {
        const next = { ...prev };
        delete next[campaignId];
        return next;
      });
    },
    [queryClient],
  );

  const removeFromManagedQueue = useCallback(
    (campaignId: string) => {
      queryClient.setQueryData(
        introAdQueryKeys.moderationManaged(),
        (old: IntroAdModerationCampaign[] | undefined) => {
          if (!Array.isArray(old)) {
            return old;
          }
          return old.filter((item) => String(item._id) !== campaignId);
        },
      );
    },
    [queryClient],
  );

  const refreshModerationQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: introAdQueryKeys.moderationPending(INTRO_AD_MODERATION_QUEUE_LIMIT),
      }),
      queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationManaged() }),
      queryClient.invalidateQueries({ queryKey: [...staffBadgeQueryKeys.all, "intro-ad"] }),
    ]);
  }, [queryClient]);

  const handleApprove = async (campaignId: string) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      await approveMutation.mutateAsync(campaignId);
      removeFromPendingQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      setActionError(
        formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.APPROVE_FALLBACK),
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleReject = async (campaignId: string) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      await rejectMutation.mutateAsync({
        campaignId,
        reason: rejectReasons[campaignId] ?? "",
      });
      removeFromPendingQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      setActionError(
        formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.REJECT_FALLBACK),
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const handleStaffCancel = async (campaignId: string) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      await staffCancelMutation.mutateAsync(campaignId);
      removeFromManagedQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      setActionError(
        formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK),
      );
    } finally {
      setPendingCampaignId(null);
    }
  };

  const buildPreviewHandler = (campaign: IntroAdModerationCampaign) => () => {
    previewIntro(campaignToIntroAdPreviewSettings(campaign));
  };

  const listHeader = (
    <View style={styles.header}>
      <ProfileMobileSectionToggle
        activeLabel={MY_PROFILE_PAGE_UI.TAB_INTRO_AD_MODERATION}
        onPress={() => setNavSheetVisible(true)}
      />
    </View>
  );

  const navSheet = (
    <ProfileMobileNavSheet
      visible={navSheetVisible}
      activeSectionId="intro-ad-moderation"
      onClose={() => setNavSheetVisible(false)}
      onOverviewPress={() => router.replace("/(tabs)/profile")}
    />
  );

  if (queueQuery.isPending && managedQuery.isPending) {
    return <ScreenLoadingState message={INTRO_AD_MODERATION_PAGE_UI.LOADING} />;
  }

  const hasIntroLoadError =
    (queueQuery.isError && pendingCampaigns.length === 0) ||
    (managedQuery.isError && managedCampaigns.length === 0);
  const isIntroEmpty = pendingCampaigns.length === 0 && managedCampaigns.length === 0;

  if (hasIntroLoadError && isIntroEmpty) {
    const error = queueQuery.error ?? managedQuery.error;
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK)}
        onRetry={async () => {
          await Promise.all([queueQuery.refetch(), managedQuery.refetch()]);
        }}
      />
    );
  }

  const moderationSections = (
    <>
      {isIntroEmpty ? (
        <Text style={styles.empty}>{INTRO_AD_MODERATION_PAGE_UI.EMPTY}</Text>
      ) : null}

      {managedCampaigns.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle title={INTRO_AD_MODERATION_PAGE_UI.INTRO_MANAGED_TITLE} />
          <View style={styles.list}>
            {managedCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <IntroAdModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="managed"
                  onPreview={buildPreviewHandler(campaign)}
                  onStaffCancel={() => {
                    void handleStaffCancel(campaignId);
                  }}
                />
              );
            })}
          </View>
        </View>
      ) : null}

      {pendingCampaigns.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle
            title={INTRO_AD_MODERATION_PAGE_UI.INTRO_PENDING_TITLE}
            pendingCount={pendingCampaigns.length}
          />
          <View style={styles.list}>
            {pendingCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <IntroAdModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="pending"
                  onPreview={buildPreviewHandler(campaign)}
                  onApprove={() => {
                    void handleApprove(campaignId);
                  }}
                  onReject={() => {
                    void handleReject(campaignId);
                  }}
                  rejectReason={rejectReasons[campaignId] ?? ""}
                  onRejectReasonChange={(value) =>
                    setRejectReasons((prev) => ({ ...prev, [campaignId]: value }))
                  }
                />
              );
            })}
          </View>
        </View>
      ) : null}

      <SiteHeaderBannerCampaignModerationSection onActionError={setActionError} />
      <SellerPersonalCategoryCampaignModerationSection onActionError={setActionError} />
    </>
  );

  if (isIntroEmpty) {
    return (
      <>
        <ScrollView
          style={[styles.container, centeredContentStyle]}
          contentContainerStyle={[styles.scroll, { paddingBottom: contentPaddingBottom }]}
        >
          {listHeader}
          {actionError ? (
            <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
              {actionError}
            </Text>
          ) : null}
          {moderationSections}
        </ScrollView>
        {navSheet}
      </>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, centeredContentStyle]}
        contentContainerStyle={[styles.scroll, { paddingBottom: contentPaddingBottom }]}
        refreshControl={
          <ThemedRefreshControl
            refreshing={queueQuery.isFetching || managedQuery.isFetching}
            onRefresh={async () => {
              await Promise.all([queueQuery.refetch(), managedQuery.refetch()]);
              await refreshModerationQueries();
            }}
          />
        }
      >
        {listHeader}

        {actionError ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {actionError}
          </Text>
        ) : null}

        {moderationSections}
      </ScrollView>

      {navSheet}
    </>
  );
};
