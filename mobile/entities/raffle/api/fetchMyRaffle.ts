import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { RaffleFromApi } from "@/entities/raffle/model/types";

// Эндпоинт `/product/raffles/my` возвращает полный публичный payload розыгрыша
// (toPublicRafflePayload с includePrivateFields), т.е. форму RaffleFromApi.
export type MyRaffleRecord = RaffleFromApi;

export type MyRafflePayload = {
  raffle: MyRaffleRecord | null;
  archive: MyRaffleRecord[];
};

export const fetchMyRaffle = async (): Promise<MyRafflePayload> => {
  try {
    const { data } = await apiClient.get("/product/raffles/my");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      raffle: data.data?.raffle ?? null,
      archive: Array.isArray(data.data?.archive) ? data.data.archive : [],
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MY_RAFFLE_FALLBACK));
  }
};
