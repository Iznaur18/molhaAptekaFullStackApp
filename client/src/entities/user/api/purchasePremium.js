import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   message: string;
 *   loyaltyPointsBalance: number;
 *   premiumExpiresAt: string | null;
 *   isActive: boolean;
 * }>}
 */
export async function purchasePremium() {
  try {
    const { data } = await apiClient.post("/user/me/premium/purchase");
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const loyaltyPointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      message:
        typeof data.data.message === "string"
          ? data.data.message
          : API_CLIENT_UI.PREMIUM_PURCHASE_SUCCESS,
      loyaltyPointsBalance: Number.isFinite(loyaltyPointsBalance)
        ? loyaltyPointsBalance
        : 0,
      premiumExpiresAt:
        typeof data.data.premiumExpiresAt === "string"
          ? data.data.premiumExpiresAt
          : null,
      isActive: Boolean(data.data.isActive),
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.PURCHASE_PREMIUM_FALLBACK;
    throw new Error(message);
  }
}
