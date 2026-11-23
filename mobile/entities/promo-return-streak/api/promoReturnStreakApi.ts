import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type PromoReturnStreak = {
  day: number;
  discountPercent: number;
  displayDay: number;
  displayDiscountPercent: number;
  canClaim: boolean;
  claimedToday: boolean;
  tomorrowDiscountPercent: number;
  nextClaimDay?: number;
  today: string;
};

const normalizeStreak = (raw: unknown): PromoReturnStreak => {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    day: Math.max(0, Math.floor(Number(row.day)) || 0),
    discountPercent: Math.max(0, Math.floor(Number(row.discountPercent)) || 0),
    displayDay: Math.max(1, Math.floor(Number(row.displayDay)) || 1),
    displayDiscountPercent: Math.max(
      0,
      Math.floor(Number(row.displayDiscountPercent)) || 0,
    ),
    canClaim: row.canClaim === true,
    claimedToday: row.claimedToday === true,
    tomorrowDiscountPercent: Math.max(
      0,
      Math.floor(Number(row.tomorrowDiscountPercent)) || 0,
    ),
    nextClaimDay:
      row.nextClaimDay != null
        ? Math.max(1, Math.floor(Number(row.nextClaimDay)) || 1)
        : undefined,
    today: typeof row.today === "string" ? row.today : "",
  };
};

/** `GET /user/me/promo-return-streak` */
export const fetchMyPromoReturnStreak = async (): Promise<PromoReturnStreak> => {
  try {
    const { data } = await apiClient.get("/user/me/promo-return-streak");
    if (!data?.success || !data?.data?.streak) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return normalizeStreak(data.data.streak);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось загрузить скидку за возвращение"),
    );
  }
};

/** `POST /user/me/promo-return-streak/claim` */
export const claimMyPromoReturnStreak = async (): Promise<{
  message: string;
  streak: PromoReturnStreak;
}> => {
  try {
    const { data } = await apiClient.post("/user/me/promo-return-streak/claim");
    if (!data?.success || !data?.data?.streak) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      message: typeof data.data.message === "string" ? data.data.message : "",
      streak: normalizeStreak(data.data.streak),
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось забрать скидку за сегодня"),
    );
  }
};
