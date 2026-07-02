import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const setProductRaffleParticipation = async (
  productId: string,
  enabled: boolean,
): Promise<Record<string, unknown>> => {
  try {
    const { data } = await apiClient.patch(`/product/${productId}/raffle-participation`, {
      enabled,
    });
    if (!data?.success || !data.data?.product) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.product as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.SET_RAFFLE_PARTICIPATION_FALLBACK),
    );
  }
};
