import { campaignModerationIsStale, campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";

/**
 * @param {{
 *   introPending?: Array<{ createdAt?: string | Date | null }>;
 *   bannerPending?: Array<{ createdAt?: string | Date | null }>;
 *   personalPending?: Array<{ createdAt?: string | Date | null; imageUrl?: string | null }>;
 *   rafflePendingCount?: number;
 * }} queues
 * @param {number} [nowMs]
 */
export function summarizeIntroAdModerationHub(
  { introPending = [], bannerPending = [], personalPending = [], rafflePendingCount = 0 },
  nowMs = Date.now(),
) {
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
}
