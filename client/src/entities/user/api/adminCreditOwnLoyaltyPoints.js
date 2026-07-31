import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ amount: number; idempotencyKey: string }} input
 */
export async function adminCreditOwnLoyaltyPoints({ amount, idempotencyKey }) {
  try {
    const { data } = await apiClient.post(
      "/user/me/loyalty-points/admin-free-credit",
      { amount, idempotencyKey },
    );
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const loyaltyPointsBalance = Number(data.data.loyaltyPointsBalance);
    const credited = Number(data.data.credited);
    return {
      message:
        typeof data.data.message === "string"
          ? data.data.message
          : API_CLIENT_UI.LOYALTY_POINTS_PURCHASE_SUCCESS,
      loyaltyPointsBalance: Number.isFinite(loyaltyPointsBalance)
        ? loyaltyPointsBalance
        : 0,
      credited: Number.isFinite(credited) ? credited : 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.ADMIN_FREE_CREDIT_LOYALTY_POINTS_FALLBACK;
    throw new Error(message);
  }
}
