import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
import { usePendingSellerPersonalCategoryCampaignsQuery } from "@/entities/seller-personal-category/model/useSellerPersonalCategoryModerationMutations";
import { usePendingSiteHeaderBannerCampaignsQuery } from "@/entities/site-header-banner-campaign/model/useSiteHeaderBannerCampaignModerationMutations";
import { useStaffRafflesQueueQuery } from "@/entities/raffle/model/useRaffleStaffMutations";
import { useUserAccess } from "@/entities/access/model/useUserAccess";
import { useAppIntro } from "@/features/app-intro/model/AppIntroProvider";
import { filterPendingModerationCampaigns } from "@/features/intro-ad-moderation-page/lib/filterPendingModerationCampaigns";
import {
  buildModerationCampaignRowId,
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
  isIntroAdModerationSectionVisible,
} from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";
import { resolveIntroAdModerationListPanelStyles } from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionZone";
import { summarizeIntroAdModerationHub } from "@/features/intro-ad-moderation-page/lib/summarizeIntroAdModerationHub";
import { IntroAdModerationPageOverview } from "@/features/intro-ad-moderation-page/ui/IntroAdModerationPageOverview";
import { IntroAdModerationPageToolbar } from "@/features/intro-ad-moderation-page/ui/IntroAdModerationPageToolbar";
import { ModerationSectionTitle } from "@/features/intro-ad-moderation-page/ui/ModerationSectionTitle";
import { RaffleModerationSection } from "@/features/intro-ad-moderation-page/ui/RaffleModerationSection";
import { SellerPersonalCategoryCampaignModerationSection } from "@/features/intro-ad-moderation-page/ui/SellerPersonalCategoryCampaignModerationSection";
import { SiteHeaderBannerCampaignModerationSection } from "@/features/intro-ad-moderation-page/ui/SiteHeaderBannerCampaignModerationSection";
import { UsersLoyaltyRaffleAdminModerationSection } from "@/features/intro-ad-moderation-page/ui/UsersLoyaltyRaffleAdminModerationSection";
import { useProfileAccountNestedListScroll } from "@/features/profile-tab/model/ProfileAccountScrollContext";
import { ProfileAccountScrollBody } from "@/features/profile-tab/ui/ProfileAccountScrollBody";
import { ProfileMobileNavSheet } from "@/features/profile-tab/ui/ProfileMobileNavSheet";
import { ProfileMobileSectionToggle } from "@/features/profile-tab/ui/ProfileMobileSectionToggle";
import { introAdQueryKeys, staffBadgeQueryKeys } from "@/shared/api";
import { INTRO_AD_MODERATION_PAGE_UI, MY_PROFILE_PAGE_UI } from "@/shared/config";
import { campaignModerationNeedsAttention } from "@/shared/lib/campaignModerationAttention";
import { formatApiErrorMessage } from "@/shared/lib";
import { useProfileAdaptiveLayout } from "@/shared/model/useProfileAdaptiveLayout";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { useIntroAdModerationPageStyles } from "@/shared/theme/introAdModerationPageStyles";
import { ScreenErrorState, ScreenLoadingState } from "@/shared/ui/ScreenStates";

const EMPTY_CAMPAIGNS: never[] = [];

export const IntroAdModerationPage = () => {
  const router = useRouter();
  const styles = useIntroAdModerationPageStyles();
  const { isDrawerLayout } = useProfileAdaptiveLayout();
  const { centeredContentStyle, contentPaddingBottom } = useScreenLayout();
  const { outerScrollOwns, scrollEnabled } = useProfileAccountNestedListScroll();
  const queryClient = useQueryClient();
  const { previewIntro } = useAppIntro();
  const { isAdmin } = useUserAccess();
  const queueQuery = usePendingIntroAdCampaignsQuery();
  const managedQuery = useManagedIntroAdCampaignsQuery();
  const bannerPendingQuery = usePendingSiteHeaderBannerCampaignsQuery();
  const personalPendingQuery = usePendingSellerPersonalCategoryCampaignsQuery();
  const raffleQueueQuery = useStaffRafflesQueueQuery();
  const { approveMutation, rejectMutation, staffCancelMutation } = useIntroAdModerationMutations();
  const [navSheetVisible, setNavSheetVisible] = useState(false);
  const [sectionFilter, setSectionFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set<string>());
  const [actionError, setActionError] = useState("");
  const [pendingCampaignId, setPendingCampaignId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  const pendingCampaigns = queueQuery.data ?? EMPTY_CAMPAIGNS;
  const managedCampaigns = managedQuery.data ?? EMPTY_CAMPAIGNS;
  const bannerPendingCampaigns = bannerPendingQuery.data ?? EMPTY_CAMPAIGNS;
  const personalPendingCampaigns = personalPendingQuery.data ?? EMPTY_CAMPAIGNS;
  const rafflePendingCount = raffleQueueQuery.data?.pendingRaffles?.length ?? 0;

  const summary = useMemo(
    () =>
      summarizeIntroAdModerationHub({
        introPending: pendingCampaigns,
        bannerPending: bannerPendingCampaigns,
        personalPending: personalPendingCampaigns,
        rafflePendingCount,
      }),
    [bannerPendingCampaigns, pendingCampaigns, personalPendingCampaigns, rafflePendingCount],
  );

  const filteredIntroPending = useMemo(
    () => filterPendingModerationCampaigns(pendingCampaigns, { attentionOnly }),
    [attentionOnly, pendingCampaigns],
  );

  const showIntroSection = isIntroAdModerationSectionVisible(
    sectionFilter,
    INTRO_AD_MODERATION_SECTION_INTRO,
  );
  const showBannerSection = isIntroAdModerationSectionVisible(
    sectionFilter,
    INTRO_AD_MODERATION_SECTION_BANNER,
  );
  const showPersonalSection = isIntroAdModerationSectionVisible(
    sectionFilter,
    INTRO_AD_MODERATION_SECTION_PERSONAL,
  );
  const showRaffleSection = isIntroAdModerationSectionVisible(
    sectionFilter,
    INTRO_AD_MODERATION_SECTION_RAFFLE,
  );
  const showUsersRaffleSection =
    isAdmin &&
    isIntroAdModerationSectionVisible(sectionFilter, INTRO_AD_MODERATION_SECTION_USERS_RAFFLE);

  const totalPendingAll = summary.pendingTotal;
  const visiblePendingCount =
    (showIntroSection ? filteredIntroPending.length : 0) +
    (showBannerSection
      ? filterPendingModerationCampaigns(bannerPendingCampaigns, { attentionOnly }).length
      : 0) +
    (showPersonalSection
      ? filterPendingModerationCampaigns(personalPendingCampaigns, { attentionOnly }).length
      : 0) +
    (showRaffleSection && !attentionOnly ? rafflePendingCount : 0);

  const hasFilters = Boolean(sectionFilter) || attentionOnly;
  const summaryCountLabel = hasFilters
    ? INTRO_AD_MODERATION_PAGE_UI.COUNT_FILTERED(visiblePendingCount, totalPendingAll)
    : INTRO_AD_MODERATION_PAGE_UI.COUNT_ITEMS(totalPendingAll);

  const isRefreshing =
    queueQuery.isFetching ||
    managedQuery.isFetching ||
    bannerPendingQuery.isFetching ||
    personalPendingQuery.isFetching ||
    raffleQueueQuery.isFetching;

  useFocusEffect(
    useCallback(() => {
      void queueQuery.refetch();
      void managedQuery.refetch();
      void bannerPendingQuery.refetch();
      void personalPendingQuery.refetch();
      void raffleQueueQuery.refetch();
    }, [
      bannerPendingQuery.refetch,
      managedQuery.refetch,
      personalPendingQuery.refetch,
      queueQuery.refetch,
      raffleQueueQuery.refetch,
    ]),
  );

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      const register = (prefix: string, campaigns: IntroAdModerationCampaign[]) => {
        campaigns
          .filter(campaignModerationNeedsAttention)
          .forEach((campaign) => {
            const rowId = buildModerationCampaignRowId(prefix, String(campaign._id));
            if (!next.has(rowId)) {
              next.add(rowId);
              changed = true;
            }
          });
      };
      register("intro", pendingCampaigns);
      register("banner", bannerPendingCampaigns);
      register("personal", personalPendingCampaigns);
      return changed ? next : prev;
    });
  }, [bannerPendingCampaigns, pendingCampaigns, personalPendingCampaigns]);

  const toggleExpanded = useCallback((rowId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  const expandAllVisible = useCallback(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      filteredIntroPending.forEach((campaign) =>
        next.add(buildModerationCampaignRowId("intro", String(campaign._id))),
      );
      if (showBannerSection) {
        filterPendingModerationCampaigns(bannerPendingCampaigns, { attentionOnly }).forEach(
          (campaign) => next.add(buildModerationCampaignRowId("banner", String(campaign._id))),
        );
      }
      if (showPersonalSection) {
        filterPendingModerationCampaigns(personalPendingCampaigns, { attentionOnly }).forEach(
          (campaign) => next.add(buildModerationCampaignRowId("personal", String(campaign._id))),
        );
      }
      return next;
    });
  }, [
    attentionOnly,
    bannerPendingCampaigns,
    filteredIntroPending,
    personalPendingCampaigns,
    showBannerSection,
    showPersonalSection,
  ]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handlePendingFilterClick = useCallback(() => {
    setSectionFilter("");
    setAttentionOnly(false);
  }, []);

  const handleIntroFilterClick = useCallback(() => {
    setSectionFilter(INTRO_AD_MODERATION_SECTION_INTRO);
    setAttentionOnly(false);
  }, []);

  const handleBannerFilterClick = useCallback(() => {
    setSectionFilter(INTRO_AD_MODERATION_SECTION_BANNER);
    setAttentionOnly(false);
  }, []);

  const handleRaffleFilterClick = useCallback(() => {
    setSectionFilter(INTRO_AD_MODERATION_SECTION_RAFFLE);
    setAttentionOnly(false);
  }, []);

  const handleUsersRaffleFilterClick = useCallback(() => {
    setSectionFilter(INTRO_AD_MODERATION_SECTION_USERS_RAFFLE);
    setAttentionOnly(false);
  }, []);

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
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(buildModerationCampaignRowId("intro", campaignId));
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
      queryClient.invalidateQueries({
        queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
      }),
    ]);
  }, [queryClient]);

  const reload = useCallback(async () => {
    await Promise.all([
      queueQuery.refetch(),
      managedQuery.refetch(),
      bannerPendingQuery.refetch(),
      personalPendingQuery.refetch(),
      raffleQueueQuery.refetch(),
    ]);
    await refreshModerationQueries();
  }, [
    bannerPendingQuery,
    managedQuery,
    personalPendingQuery,
    queueQuery,
    raffleQueueQuery,
    refreshModerationQueries,
  ]);

  const handleApprove = async (campaignId: string) => {
    try {
      setPendingCampaignId(campaignId);
      setActionError("");
      await approveMutation.mutateAsync(campaignId);
      removeFromPendingQueue(campaignId);
      await refreshModerationQueries();
    } catch (error) {
      setActionError(formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.APPROVE_FALLBACK));
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
      setActionError(formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.REJECT_FALLBACK));
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
      onOverviewPress={() => router.replace("/(tabs)/me")}
    />
  );

  const toolbar = (
    <IntroAdModerationPageToolbar
      summaryCountLabel={summaryCountLabel}
      sectionFilter={sectionFilter}
      onSectionFilterChange={setSectionFilter}
      showUsersRaffleSection={isAdmin}
      isRefreshing={isRefreshing}
      onRefresh={() => {
        void reload();
      }}
    />
  );

  const overview = (
    <IntroAdModerationPageOverview
      pendingTotal={summary.pendingTotal}
      introPendingCount={summary.introPendingCount}
      bannerPendingCount={summary.bannerPendingCount}
      rafflePendingCount={summary.rafflePendingCount}
      attentionCount={summary.attentionCount}
      attentionOnly={attentionOnly}
      onPendingFilterClick={handlePendingFilterClick}
      onIntroFilterClick={handleIntroFilterClick}
      onBannerFilterClick={handleBannerFilterClick}
      onRaffleFilterClick={handleRaffleFilterClick}
      showUsersRaffleOverview={isAdmin}
      onUsersRaffleFilterClick={handleUsersRaffleFilterClick}
      onAttentionFilterChange={setAttentionOnly}
    />
  );

  const listActions =
    visiblePendingCount > 0 ? (
      <View style={styles.listActions}>
        <Pressable style={styles.listAction} onPress={expandAllVisible}>
          <Text style={styles.listActionText}>{INTRO_AD_MODERATION_PAGE_UI.EXPAND_ALL}</Text>
        </Pressable>
        <Pressable style={styles.listAction} onPress={collapseAll}>
          <Text style={styles.listActionText}>{INTRO_AD_MODERATION_PAGE_UI.COLLAPSE_ALL}</Text>
        </Pressable>
        {attentionOnly ? (
          <Text style={styles.filterHint}>{INTRO_AD_MODERATION_PAGE_UI.ATTENTION_FILTER_HINT}</Text>
        ) : null}
      </View>
    ) : null;

  if (queueQuery.isPending && managedQuery.isPending) {
    return <ScreenLoadingState message={INTRO_AD_MODERATION_PAGE_UI.LOADING} />;
  }

  const isIntroEmpty = pendingCampaigns.length === 0 && managedCampaigns.length === 0;
  const hasLoadError =
    (queueQuery.isError && pendingCampaigns.length === 0) ||
    (managedQuery.isError && managedCampaigns.length === 0);

  if (hasLoadError && isIntroEmpty && totalPendingAll === 0) {
    const error = queueQuery.error ?? managedQuery.error;
    return (
      <ScreenErrorState
        message={formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK)}
        onRetry={reload}
      />
    );
  }

  const emptyMessage = hasFilters
    ? INTRO_AD_MODERATION_PAGE_UI.EMPTY_BY_FILTER
    : INTRO_AD_MODERATION_PAGE_UI.EMPTY;

  const introHasVisibleContent =
    showIntroSection &&
    ((!attentionOnly && managedCampaigns.length > 0) || filteredIntroPending.length > 0);

  const moderationSections = (
    <>
      {showIntroSection && !attentionOnly && managedCampaigns.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle title={INTRO_AD_MODERATION_PAGE_UI.INTRO_MANAGED_TITLE} />
          <View style={resolveIntroAdModerationListPanelStyles(INTRO_AD_MODERATION_SECTION_INTRO, styles)}>
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

      {showIntroSection && filteredIntroPending.length > 0 ? (
        <View style={styles.section}>
          <ModerationSectionTitle
            title={INTRO_AD_MODERATION_PAGE_UI.INTRO_PENDING_TITLE}
            pendingCount={filteredIntroPending.length}
          />
          <View style={resolveIntroAdModerationListPanelStyles(INTRO_AD_MODERATION_SECTION_INTRO, styles)}>
            {filteredIntroPending.map((campaign) => {
              const campaignId = String(campaign._id);
              const rowId = buildModerationCampaignRowId("intro", campaignId);
              return (
                <IntroAdModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="pending"
                  collapsible
                  expanded={expandedIds.has(rowId)}
                  onExpandedChange={() => toggleExpanded(rowId)}
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

      {showBannerSection ? (
        <SiteHeaderBannerCampaignModerationSection
          onActionError={setActionError}
          attentionOnly={attentionOnly}
          expandedIds={expandedIds}
          onToggleExpanded={toggleExpanded}
        />
      ) : null}

      {showPersonalSection ? (
        <SellerPersonalCategoryCampaignModerationSection
          onActionError={setActionError}
          attentionOnly={attentionOnly}
          expandedIds={expandedIds}
          onToggleExpanded={toggleExpanded}
        />
      ) : null}

      {showRaffleSection && !attentionOnly ? (
        <RaffleModerationSection onActionError={setActionError} />
      ) : null}

      {showUsersRaffleSection ? <UsersLoyaltyRaffleAdminModerationSection /> : null}

      {!introHasVisibleContent &&
      !showBannerSection &&
      !showPersonalSection &&
      !showRaffleSection &&
      !showUsersRaffleSection &&
      totalPendingAll === 0 &&
      isIntroEmpty ? (
        <Text style={styles.empty}>{INTRO_AD_MODERATION_PAGE_UI.EMPTY}</Text>
      ) : null}

      {hasFilters && visiblePendingCount === 0 && !attentionOnly && !showUsersRaffleSection && totalPendingAll > 0 ? (
        <Text style={styles.empty}>{emptyMessage}</Text>
      ) : null}

      {attentionOnly && visiblePendingCount === 0 ? (
        <Text style={styles.empty}>{emptyMessage}</Text>
      ) : null}
    </>
  );

  return (
    <>
      <ProfileAccountScrollBody
        style={[styles.container, scrollEnabled ? centeredContentStyle : null]}
        contentContainerStyle={[
          styles.scroll,
          !isDrawerLayout ? styles.scrollInAccountShell : null,
          { paddingBottom: outerScrollOwns ? 0 : contentPaddingBottom },
        ]}
        refreshControl={
          <ThemedRefreshControl refreshing={isRefreshing} onRefresh={reload} />
        }
      >
        {listHeader}
        {toolbar}
        {overview}
        {actionError ? (
          <Text style={[styles.state, styles.stateError]} accessibilityRole="alert">
            {actionError}
          </Text>
        ) : null}
        {listActions}
        {moderationSections}
      </ProfileAccountScrollBody>
      {navSheet}
    </>
  );
};
