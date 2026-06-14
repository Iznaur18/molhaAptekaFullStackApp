import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchMyLoyaltyPointsStatus = async () => {
  try {
    const { data } = await apiClient.get("/user/me/loyalty-points/status");
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const loyaltyPointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      loyaltyPointsBalance: Number.isFinite(loyaltyPointsBalance) ? loyaltyPointsBalance : 0,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_LOYALTY_POINTS_STATUS_FALLBACK),
    );
  }
};
