import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const purchasePremium = async ({
  idempotencyKey,
}: {
  idempotencyKey: string;
}) => {
  try {
    const { data } = await apiClient.post("/user/me/premium/purchase", {
      idempotencyKey,
    });
    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const loyaltyPointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      message:
        typeof data.data.message === "string"
          ? data.data.message
          : API_CLIENT_UI.PREMIUM_PURCHASE_SUCCESS,
      loyaltyPointsBalance: Number.isFinite(loyaltyPointsBalance) ? loyaltyPointsBalance : 0,
      isActive: Boolean(data.data.isActive),
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.PURCHASE_PREMIUM_FALLBACK));
  }
};
