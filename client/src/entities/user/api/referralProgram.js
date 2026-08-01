import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @returns {Promise<{
 *   referralCode: string;
 *   inviteUrl: string;
 *   cashbackPercent: number;
 *   loyaltyPointsBalance: number;
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
