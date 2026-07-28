import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  approveIntroAdCampaign,
  cancelIntroAdCampaignByStaff,
  fetchManagedIntroAdCampaigns,
  fetchPendingIntroAdCampaigns,
  rejectIntroAdCampaign,
} from "../../../entities/intro-ad/api/introAdModerationApi.js";
import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { formToIntroAdPreviewSettings } from "../../../entities/intro-ad/lib/index.js";
import { useStaffRafflesQueueQuery } from "../../../entities/raffle/model/useStaffRafflesQueueQuery.js";
import { fetchPendingSellerPersonalCategoryCampaigns } from "../../../entities/seller-personal-category/api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "../../../entities/seller-personal-category/model/sellerPersonalCategoryQueryKeys.js";
import {
  fetchPendingSiteHeaderBannerCampaigns,
} from "../../../entities/site-header-banner-campaign/api/siteHeaderBannerCampaignModerationApi.js";
import { siteHeaderBannerCampaignQueryKeys } from "../../../entities/site-header-banner-campaign/model/siteHeaderBannerCampaignQueryKeys.js";
import { useAuthSession } from "../../../entities/user/model/useAuthSession.js";
import { useAppIntro } from "../../../features/app-intro/model/AppIntroContext.jsx";
import { campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";
import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useRefetchOnVisible } from "../../../shared/lib/useRefetchOnVisible.js";

import { filterPendingModerationCampaigns } from "../lib/filterPendingModerationCampaigns.js";
import {
  buildModerationCampaignRowId,
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
  isIntroAdModerationSectionVisible,
} from "../lib/introAdModerationSectionFilters.js";
import { buildIntroAdModerationZonePanelClass } from "../lib/introAdModerationSectionZone.js";
import { summarizeIntroAdModerationHub } from "../lib/summarizeIntroAdModerationHub.js";
import { IntroAdModerationCampaignCard } from "./IntroAdModerationCampaignCard.jsx";
import { IntroAdModerationPageOverview } from "./IntroAdModerationPageOverview.jsx";
import { IntroAdModerationPageToolbar } from "./IntroAdModerationPageToolbar.jsx";
import { SiteHeaderBannerCampaignModerationSection } from "./SiteHeaderBannerCampaignModerationSection.jsx";
import { RaffleModerationSection } from "./RaffleModerationSection.jsx";
import { SellerPersonalCategoryCampaignModerationSection } from "./SellerPersonalCategoryCampaignModerationSection.jsx";
import { ModerationSectionTitle } from "./ModerationSectionTitle.jsx";
import { UsersLoyaltyRaffleAdminModerationSection } from "./UsersLoyaltyRaffleAdminModerationSection.jsx";

import "./IntroAdModerationPage.css";
import "./introAdModerationSectionZone.css";
import "./IntroAdModerationPageOverview.css";
import "../../../shared/ui/profileQueueContentPanel.css";

const MODERATION_QUEUE_LIMIT = 50;
const EMPTY_CAMPAIGNS = [];

/**
 * @param {{
 *   onQueueChanged?: () => void;
 *   onEditRaffle?: (raffle: import("../../../entities/raffle/model/types.js").RaffleFromApi) => void;
 * }} props
 */
export function IntroAdModerationPage({ onQueueChanged, onEditRaffle }) {
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const isAdmin = user?.userRole === "admin";
  const { previewIntro } = useAppIntro();
  const [sectionFilter, setSectionFilter] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
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

  const bannerPendingQuery = useQuery({
    queryKey: siteHeaderBannerCampaignQueryKeys.moderationPending(MODERATION_QUEUE_LIMIT),
    queryFn: () => fetchPendingSiteHeaderBannerCampaigns({ limit: MODERATION_QUEUE_LIMIT }),
  });

  const personalPendingQuery = useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.moderationPending(),
    queryFn: () => fetchPendingSellerPersonalCategoryCampaigns(MODERATION_QUEUE_LIMIT),
  });

  const raffleQueueQuery = useStaffRafflesQueueQuery();

  const approveMutation = useMutation({ mutationFn: approveIntroAdCampaign });
  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }) => rejectIntroAdCampaign(campaignId, reason),
  });
  const staffCancelMutation = useMutation({
    mutationFn: cancelIntroAdCampaignByStaff,
  });

  const pendingCampaigns = queueQuery.data?.campaigns ?? EMPTY_CAMPAIGNS;
  const managedCampaigns = managedQuery.data?.campaigns ?? EMPTY_CAMPAIGNS;
  const bannerPendingCampaigns = bannerPendingQuery.data?.campaigns ?? EMPTY_CAMPAIGNS;
  const personalPendingCampaigns = personalPendingQuery.data?.campaigns ?? EMPTY_CAMPAIGNS;
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

  const reload = useCallback(async () => {
    await Promise.all([
      queueQuery.refetch(),
      managedQuery.refetch(),
      bannerPendingQuery.refetch(),
      personalPendingQuery.refetch(),
      raffleQueueQuery.refetch(),
    ]);
    onQueueChanged?.();
  }, [
    bannerPendingQuery.refetch,
    managedQuery.refetch,
    onQueueChanged,
    personalPendingQuery.refetch,
    queueQuery.refetch,
    raffleQueueQuery.refetch,
  ]);

  useRefetchOnVisible(reload, !queueQuery.isPending && !managedQuery.isPending);

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      const register = (prefix, campaigns) => {
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

  const toggleExpanded = useCallback((rowId) => {
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
    const next = new Set(expandedIds);
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
    setExpandedIds(next);
  }, [
    attentionOnly,
    bannerPendingCampaigns,
    expandedIds,
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
      queryClient.setQueryData(introAdQueryKeys.moderationManaged(), (old) => {
        if (!old?.campaigns) {
          return old;
        }
        return {
          ...old,
          campaigns: old.campaigns.filter((item) => String(item._id) !== campaignId),
        };
      });
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

  const toolbar = (
    <IntroAdModerationPageToolbar
      summaryCountLabel={summaryCountLabel}
      sectionFilter={sectionFilter}
      onSectionFilterChange={setSectionFilter}
      showUsersRaffleSection={isAdmin}
      isRefreshing={isRefreshing}
      onRefresh={() => void reload()}
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
      <div className="intro-ad-moderation-page__list-actions">
        <button
          type="button"
          className="intro-ad-moderation-page__list-action"
          onClick={expandAllVisible}
        >
          {INTRO_AD_MODERATION_PAGE_UI.EXPAND_ALL}
        </button>
        <button
          type="button"
          className="intro-ad-moderation-page__list-action"
          onClick={collapseAll}
        >
          {INTRO_AD_MODERATION_PAGE_UI.COLLAPSE_ALL}
        </button>
        {attentionOnly ? (
          <p className="intro-ad-moderation-page__filter-hint">
            {INTRO_AD_MODERATION_PAGE_UI.ATTENTION_FILTER_HINT}
          </p>
        ) : null}
      </div>
    ) : null;

  if (queueQuery.isPending && managedQuery.isPending) {
    return (
      <div className="intro-ad-moderation-page">
        {toolbar}
        <p className="intro-ad-moderation-page__state">{INTRO_AD_MODERATION_PAGE_UI.LOADING}</p>
      </div>
    );
  }

  const isIntroEmpty = pendingCampaigns.length === 0 && managedCampaigns.length === 0;
  const hasLoadError =
    (queueQuery.isError && pendingCampaigns.length === 0) ||
    (managedQuery.isError && managedCampaigns.length === 0);

  if (hasLoadError && isIntroEmpty && totalPendingAll === 0) {
    const error =
      queueQuery.error instanceof Error
        ? queueQuery.error
        : managedQuery.error instanceof Error
          ? managedQuery.error
          : null;
    return (
      <div className="intro-ad-moderation-page">
        {toolbar}
        <p className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error">
          {error?.message ?? INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK}
        </p>
      </div>
    );
  }

  const emptyMessage = hasFilters
    ? INTRO_AD_MODERATION_PAGE_UI.EMPTY_BY_FILTER
    : INTRO_AD_MODERATION_PAGE_UI.EMPTY;

  const introHasVisibleContent =
    showIntroSection &&
    (( !attentionOnly && managedCampaigns.length > 0) || filteredIntroPending.length > 0);

  const moderationSections = (
    <>
      {showIntroSection && !attentionOnly && managedCampaigns.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <ModerationSectionTitle title={INTRO_AD_MODERATION_PAGE_UI.INTRO_MANAGED_TITLE} />
          <ul
            className={`intro-ad-moderation-page__list ${buildIntroAdModerationZonePanelClass(INTRO_AD_MODERATION_SECTION_INTRO)}`}
          >
            {managedCampaigns.map((campaign) => {
              const campaignId = String(campaign._id);
              return (
                <IntroAdModerationCampaignCard
                  key={campaignId}
                  campaign={campaign}
                  isPending={pendingCampaignId === campaignId}
                  mode="managed"
                  onPreview={buildPreviewHandler(campaign)}
                  onStaffCancel={() => void handleStaffCancel(campaignId)}
                />
              );
            })}
          </ul>
        </section>
      ) : null}

      {showIntroSection && filteredIntroPending.length > 0 ? (
        <section className="intro-ad-moderation-page__section">
          <ModerationSectionTitle
            title={INTRO_AD_MODERATION_PAGE_UI.INTRO_PENDING_TITLE}
            pendingCount={filteredIntroPending.length}
          />
          <ul
            className={`intro-ad-moderation-page__list ${buildIntroAdModerationZonePanelClass(INTRO_AD_MODERATION_SECTION_INTRO)}`}
          >
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
                  onApprove={() => void handleApprove(campaignId)}
                  onReject={() => void handleReject(campaignId)}
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

      {showBannerSection ? (
        <SiteHeaderBannerCampaignModerationSection
          onQueueChanged={onQueueChanged}
          actionError={actionError}
          onActionError={setActionError}
          attentionOnly={attentionOnly}
          expandedIds={expandedIds}
          onToggleExpanded={toggleExpanded}
        />
      ) : null}

      {showPersonalSection ? (
        <SellerPersonalCategoryCampaignModerationSection
          onQueueChanged={onQueueChanged}
          actionError={actionError}
          onActionError={setActionError}
          attentionOnly={attentionOnly}
          expandedIds={expandedIds}
          onToggleExpanded={toggleExpanded}
        />
      ) : null}

      {showRaffleSection && !attentionOnly ? (
        <RaffleModerationSection
          onQueueChanged={onQueueChanged}
          onEditRaffle={onEditRaffle}
          actionError={actionError}
          onActionError={setActionError}
        />
      ) : null}

      {showUsersRaffleSection ? <UsersLoyaltyRaffleAdminModerationSection /> : null}

      {!introHasVisibleContent &&
      !showBannerSection &&
      !showPersonalSection &&
      !showRaffleSection &&
      !showUsersRaffleSection &&
      totalPendingAll === 0 &&
      isIntroEmpty ? (
        <p className="intro-ad-moderation-page__state">{INTRO_AD_MODERATION_PAGE_UI.EMPTY}</p>
      ) : null}

      {hasFilters && visiblePendingCount === 0 && !attentionOnly && !showUsersRaffleSection && totalPendingAll > 0 ? (
        <p className="intro-ad-moderation-page__state">{emptyMessage}</p>
      ) : null}

      {attentionOnly && visiblePendingCount === 0 ? (
        <p className="intro-ad-moderation-page__state">{emptyMessage}</p>
      ) : null}
    </>
  );

  return (
    <div className="intro-ad-moderation-page">
      {toolbar}
      {overview}
      {actionError ? (
        <p className="intro-ad-moderation-page__state intro-ad-moderation-page__state_error">
          {actionError}
        </p>
      ) : null}
      {listActions}
      {moderationSections}
    </div>
  );
}
