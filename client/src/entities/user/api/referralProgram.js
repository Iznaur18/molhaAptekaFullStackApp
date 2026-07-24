import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @returns {Promise<{
 *   referralCode: string;
 *   inviteUrl: string;
 *   cashbackPercent: number;
 *   partnerBalance: number;
 *   totalReferrals: number;
 *   totalReferralsSpend: number;
 *   totalCashbackEarned: number;
 *   referrals: Array<{
 *     userId: string;
 *     userName: string;
 *     registeredAt: string | null;
 *     isDeleted: boolean;
 *     pointsSpentTotal: number;
 *     cashbackEarnedTotal: number;
 *   }>;
 * }>}
 */
export async function fetchMyReferralProgram() {
  try {
    const { data } = await apiClient.get("/user/me/referral");
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить партнёрскую программу"));
  }
}

/**
 * @param {number} amount
 * @param {string} [idempotencyKey]
 */
export async function convertPartnerBalance(amount, idempotencyKey) {
  try {
    const payload = { amount };
    if (idempotencyKey) {
      payload.idempotencyKey = idempotencyKey;
    }
    const { data } = await apiClient.post("/user/me/referral/convert", payload);
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось конвертировать баланс"));
  }
}
