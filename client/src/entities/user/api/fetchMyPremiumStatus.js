import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   isActive: boolean;
 *   premiumExpiresAt: string | null;
 *   canPurchase: boolean;
 *   pricePoints: number;
 *   loyaltyPointsBalance: number;
 * }>}
 */
export async function fetchMyPremiumStatus() {
  try {
    const { data } = await apiClient.get("/user/me/premium/status");
    if (!data?.success || !data?.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const loyaltyPointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      isActive: Boolean(data.data.isActive),
      premiumExpiresAt:
        typeof data.data.premiumExpiresAt === "string"
          ? data.data.premiumExpiresAt
          : null,
      canPurchase: Boolean(data.data.canPurchase),
      pricePoints: Number(data.data.pricePoints) || 0,
      loyaltyPointsBalance: Number.isFinite(loyaltyPointsBalance)
        ? loyaltyPointsBalance
        : 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PREMIUM_STATUS_FALLBACK;
    throw new Error(message);
  }
}
