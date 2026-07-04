import { campaignModerationIsStale, campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";

/**
 * @param {{
 *   introPending?: Array<{ createdAt?: string | Date | null }>;
 *   bannerPending?: Array<{ createdAt?: string | Date | null }>;
 *   personalPending?: Array<{ createdAt?: string | Date | null; imageUrl?: string | null }>;
 * }} queues
 * @param {number} [nowMs]
 */
export function summarizeIntroAdModerationHub(
  { introPending = [], bannerPending = [], personalPending = [] },
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
    pendingTotal: allPending.length,
    introPendingCount: introPending.length,
    bannerPendingCount: bannerPending.length,
    personalPendingCount: personalPending.length,
    attentionCount,
    staleCount: allPending.filter((campaign) => campaignModerationIsStale(campaign, nowMs)).length,
  };
}
