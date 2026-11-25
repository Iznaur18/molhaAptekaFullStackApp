import { raffleParticipantsDataSchema } from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

/** `GET /product/raffles/:raffleId/participants` — кто сколько купил. */
export async function fetchRaffleParticipants(raffleId: string) {
  try {
    const { data } = await apiClient.get(
      `/product/raffles/${encodeURIComponent(raffleId)}/participants`,
    );
    return parseApiContractData(data, raffleParticipantsDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_RAFFLE_PARTICIPANTS_FALLBACK),
    );
  }
}
