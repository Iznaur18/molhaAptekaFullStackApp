import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveIntroAdCampaign,
  fetchPendingIntroAdCampaigns,
  rejectIntroAdCampaign,
} from "@/entities/intro-ad/api/introAdModerationApi";
import { introAdQueryKeys } from "@/shared/api";

const INTRO_AD_QUEUE_LIMIT = 50;

export const usePendingIntroAdCampaignsQuery = (enabled = true) =>
  useQuery({
    queryKey: introAdQueryKeys.moderationPending(INTRO_AD_QUEUE_LIMIT),
    queryFn: () => fetchPendingIntroAdCampaigns(INTRO_AD_QUEUE_LIMIT),
    enabled,
  });

export const useIntroAdModerationMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: introAdQueryKeys.all });
  };

  const approveMutation = useMutation({
    mutationFn: (campaignId: string) => approveIntroAdCampaign(campaignId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }: { campaignId: string; reason?: string }) =>
      rejectIntroAdCampaign(campaignId, reason ?? ""),
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation };
};
