import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { RaffleFromApi } from "../model/types";

export type FeaturedRaffle = RaffleFromApi;

export const fetchFeaturedRaffles = async ({
  regionCode,
}: { regionCode?: string } = {}): Promise<FeaturedRaffle[]> => {
  try {
    const { data } = await apiClient.get("/product/raffles/featured", {
      params: regionCode ? { regionCode } : undefined,
    });
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    const raffles = data.data?.raffles;
    if (Array.isArray(raffles)) {
      return raffles;
    }
    if (data.data?.raffle) {
      return [data.data.raffle];
    }
    return [];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить розыгрыши"));
  }
};
