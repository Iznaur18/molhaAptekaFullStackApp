import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{ loyaltyPointsBalance: number }>}
 */
export async function fetchMyLoyaltyPointsStatus() {
  try {
    const { data } = await apiClient.get("/user/me/loyalty-points/status");
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const loyaltyPointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      loyaltyPointsBalance: Number.isFinite(loyaltyPointsBalance)
        ? loyaltyPointsBalance
        : 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_LOYALTY_POINTS_STATUS_FALLBACK;
    throw new Error(message);
  }
}
