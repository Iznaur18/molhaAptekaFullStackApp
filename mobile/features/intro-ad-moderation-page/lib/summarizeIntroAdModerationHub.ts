import {
  campaignModerationIsStale,
  campaignModerationNeedsAttention,
} from "@/shared/lib/campaignModerationAttention";

type PendingCampaign = {
  createdAt?: string | Date | null;
  imageUrl?: string | null;
};

type SummarizeIntroAdModerationHubInput = {
  introPending?: PendingCampaign[];
  bannerPending?: PendingCampaign[];
  personalPending?: PendingCampaign[];
};

export const summarizeIntroAdModerationHub = (
  {
    introPending = [],
    bannerPending = [],
    personalPending = [],
  }: SummarizeIntroAdModerationHubInput,
  nowMs = Date.now(),
) => {
  const allPending = [...introPending, ...bannerPending, ...personalPending];
  let attentionCount = 0;

  for (const campaign of allPending) {
    if (campaignModerationNeedsAttention(campaign, nowMs)) {
      attentionCount += 1;
    }
  }

  return {
    pendingTotal: allPending.length,
    introPendingCount: introPending.length,
    bannerPendingCount: bannerPending.length,
    personalPendingCount: personalPending.length,
    attentionCount,
    staleCount: allPending.filter((campaign) => campaignModerationIsStale(campaign, nowMs)).length,
  };
};
