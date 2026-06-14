import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const pauseMyRaffle = async (raffleId: string) => {
  try {
    const { data } = await apiClient.patch(`/product/raffles/${raffleId}/pause`);
    if (!data?.success || !data.data?.raffle) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffle;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.PAUSE_RAFFLE_FALLBACK));
  }
};
