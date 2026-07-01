import { useMutation, useQuery } from "@tanstack/react-query";

import {
  approveIntroAdCampaign,
  cancelIntroAdCampaignByStaff,
  fetchManagedIntroAdCampaigns,
  fetchPendingIntroAdCampaigns,
  rejectIntroAdCampaign,
} from "@/entities/intro-ad/api/introAdModerationApi";
import { introAdQueryKeys } from "@/shared/api";

export const INTRO_AD_MODERATION_QUEUE_LIMIT = 50;

export const usePendingIntroAdCampaignsQuery = (enabled = true) =>
  useQuery({
    queryKey: introAdQueryKeys.moderationPending(INTRO_AD_MODERATION_QUEUE_LIMIT),
    queryFn: () => fetchPendingIntroAdCampaigns(INTRO_AD_MODERATION_QUEUE_LIMIT),
    enabled,
  });

export const useManagedIntroAdCampaignsQuery = (enabled = true) =>
  useQuery({
    queryKey: introAdQueryKeys.moderationManaged(),
    queryFn: fetchManagedIntroAdCampaigns,
    enabled,
  });

export const useIntroAdModerationMutations = () => {
  const approveMutation = useMutation({
    mutationFn: (campaignId: string) => approveIntroAdCampaign(campaignId),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }: { campaignId: string; reason?: string }) =>
      rejectIntroAdCampaign(campaignId, reason ?? ""),
  });

  const staffCancelMutation = useMutation({
    mutationFn: (campaignId: string) => cancelIntroAdCampaignByStaff(campaignId),
  });

  return { approveMutation, rejectMutation, staffCancelMutation };
};
