import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const deleteMyRaffle = async (raffleId: string) => {
  try {
    const { data } = await apiClient.delete(`/product/raffles/${raffleId}`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.DELETE_RAFFLE_FALLBACK));
  }
};
