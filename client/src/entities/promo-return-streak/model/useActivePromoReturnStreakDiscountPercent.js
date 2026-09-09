import { useMyPromoReturnStreakQuery } from "./usePromoReturnStreak.js";

/**
 * Активный % только после «Забрать скидку» и до сжигания на оплате.
 *
 * @param {{ enabled?: boolean }} [params]
 * @returns {number}
 */
export function useActivePromoReturnStreakDiscountPercent({ enabled = true } = {}) {
  const query = useMyPromoReturnStreakQuery({ enabled });
  if (query.data?.claimedToday !== true) {
    return 0;
  }
  return Math.max(0, Math.floor(Number(query.data.discountPercent)) || 0);
}
