import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

type RequestProductPromotionBody = {
  tier: number;
  tariffCode: string;
  idempotencyKey: string;
};

export const requestProductPromotion = async (
  productId: string,
  body: RequestProductPromotionBody,
) => {
  try {
    const { data } = await apiClient.post(`/product/${productId}/promotions/request`, body);
    if (!data?.success || !data.data?.promotion) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const pointsBalance = Number(data.data.loyaltyPointsBalance);
    return {
      promotion: data.data.promotion as Record<string, unknown>,
      loyaltyPointsBalance: Number.isFinite(pointsBalance) ? pointsBalance : null,
      message: typeof data.data.message === "string" ? data.data.message : null,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.REQUEST_PRODUCT_PROMOTION_FALLBACK),
    );
  }
};
