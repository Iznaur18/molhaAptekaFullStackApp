import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { RaffleFromApi } from "../model/types";

export const fetchRaffleById = async (raffleId: string): Promise<RaffleFromApi> => {
  try {
    const { data } = await apiClient.get(`/product/raffles/${raffleId}`);
    if (!data?.success || !data.data?.raffle) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffle as RaffleFromApi;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_RAFFLE_FALLBACK),
    );
  }
};
