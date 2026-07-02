import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveSiteHeaderBannerCampaign,
  cancelSiteHeaderBannerCampaignByStaff,
  fetchManagedSiteHeaderBannerCampaigns,
  fetchPendingSiteHeaderBannerCampaigns,
  rejectSiteHeaderBannerCampaign,
} from "@/entities/site-header-banner-campaign/api/siteHeaderBannerCampaignModerationApi";
import { siteHeaderBannerCampaignQueryKeys } from "@/entities/site-header-banner-campaign/model/siteHeaderBannerCampaignQueryKeys";
import { introAdQueryKeys } from "@/shared/api";

export const SITE_HEADER_BANNER_CAMPAIGN_MODERATION_QUEUE_LIMIT = 50;

export const usePendingSiteHeaderBannerCampaignsQuery = () =>
  useQuery({
    queryKey: siteHeaderBannerCampaignQueryKeys.moderationPending(
      SITE_HEADER_BANNER_CAMPAIGN_MODERATION_QUEUE_LIMIT,
    ),
    queryFn: () =>
      fetchPendingSiteHeaderBannerCampaigns(SITE_HEADER_BANNER_CAMPAIGN_MODERATION_QUEUE_LIMIT),
  });

export const useManagedSiteHeaderBannerCampaignsQuery = () =>
  useQuery({
    queryKey: siteHeaderBannerCampaignQueryKeys.moderationManaged(),
    queryFn: fetchManagedSiteHeaderBannerCampaigns,
  });

export const useSiteHeaderBannerCampaignModerationMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: siteHeaderBannerCampaignQueryKeys.moderationPending(
        SITE_HEADER_BANNER_CAMPAIGN_MODERATION_QUEUE_LIMIT,
      ),
    });
    void queryClient.invalidateQueries({
      queryKey: siteHeaderBannerCampaignQueryKeys.moderationManaged(),
    });
    void queryClient.invalidateQueries({
      queryKey: siteHeaderBannerCampaignQueryKeys.moderationCount(),
    });
    void queryClient.invalidateQueries({ queryKey: introAdQueryKeys.moderationCount() });
  };

  const approveMutation = useMutation({
    mutationFn: approveSiteHeaderBannerCampaign,
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }: { campaignId: string; reason?: string }) =>
      rejectSiteHeaderBannerCampaign(campaignId, reason),
    onSuccess: invalidate,
  });

  const staffCancelMutation = useMutation({
    mutationFn: cancelSiteHeaderBannerCampaignByStaff,
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation, staffCancelMutation };
};
