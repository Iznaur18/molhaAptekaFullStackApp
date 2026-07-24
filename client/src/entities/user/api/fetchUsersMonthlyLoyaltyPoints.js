import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @typedef {{
 *   pointsAwarded: number;
 *   goal: number;
 *   description: string;
 *   year: number;
 *   month: number;
 * }} UsersMonthlyLoyaltyPointsSummary
 */

/**
 * @returns {Promise<UsersMonthlyLoyaltyPointsSummary>}
 */
export async function fetchUsersMonthlyLoyaltyPoints() {
  try {
    const { data } = await apiClient.get("/user/loyalty-points/monthly-awarded");
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      pointsAwarded: Math.max(0, Math.floor(Number(data.data.pointsAwarded) || 0)),
      goal: Math.max(0, Math.floor(Number(data.data.goal) || 0)),
      description: String(data.data.description ?? "").trim(),
      year: Math.floor(Number(data.data.year) || 0),
      month: Math.floor(Number(data.data.month) || 0),
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        API_CLIENT_UI.FETCH_MONTHLY_LOYALTY_POINTS_FALLBACK,
      ),
    );
  }
}
