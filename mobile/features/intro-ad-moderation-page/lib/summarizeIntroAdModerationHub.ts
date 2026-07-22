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
  rafflePendingCount?: number;
};

export const summarizeIntroAdModerationHub = (
  {
    introPending = [],
    bannerPending = [],
    personalPending = [],
    rafflePendingCount = 0,
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
    pendingTotal: allPending.length + rafflePendingCount,
    introPendingCount: introPending.length,
    bannerPendingCount: bannerPending.length,
    personalPendingCount: personalPending.length,
    rafflePendingCount,
    attentionCount,
    staleCount: allPending.filter((campaign) => campaignModerationIsStale(campaign, nowMs)).length,
  };
};
