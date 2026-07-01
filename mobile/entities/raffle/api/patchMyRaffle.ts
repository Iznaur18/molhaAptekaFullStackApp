import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { RaffleFromApi } from "../model/types";
import type { CreateRaffleBody } from "./createRaffle";

export const patchMyRaffle = async (
  raffleId: string,
  body: Partial<CreateRaffleBody>,
): Promise<RaffleFromApi> => {
  try {
    const { data } = await apiClient.patch(`/product/raffles/${raffleId}`, body);
    if (!data?.success || !data.data?.raffle) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffle as RaffleFromApi;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.PATCH_RAFFLE_FALLBACK));
  }
};
