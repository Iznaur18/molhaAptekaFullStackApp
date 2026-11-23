import { useMyPromoReturnStreakQuery } from "@/entities/promo-return-streak/model/usePromoReturnStreak";

/**
 * Активный % только после «Забрать скидку» и до сжигания на оплате.
 * Паритет web `useActivePromoReturnStreakDiscountPercent`.
 */
export function useActivePromoReturnStreakDiscountPercent({
  enabled = true,
}: { enabled?: boolean } = {}): number {
  const query = useMyPromoReturnStreakQuery({ enabled });
  if (query.data?.claimedToday !== true) {
    return 0;
  }
  return Math.max(0, Math.floor(Number(query.data.discountPercent)) || 0);
}
