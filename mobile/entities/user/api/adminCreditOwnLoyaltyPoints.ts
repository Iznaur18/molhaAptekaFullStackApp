import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type AdminCreditOwnLoyaltyPointsResult = {
  message: string;
  loyaltyPointsBalance: number;
  credited: number;
};

export const adminCreditOwnLoyaltyPoints = async ({
  amount,
  idempotencyKey,
}: {
  amount: number;
  idempotencyKey: string;
}): Promise<AdminCreditOwnLoyaltyPointsResult> => {
  try {
    const { data } = await apiClient.post("/user/me/loyalty-points/admin-free-credit", {
      amount,
      idempotencyKey,
    });
    if (!data?.success || !data.data) {
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
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        API_CLIENT_UI.ADMIN_FREE_CREDIT_LOYALTY_POINTS_FALLBACK,
      ),
    );
  }
};
