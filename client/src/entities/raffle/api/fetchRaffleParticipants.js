import { raffleParticipantsDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /product/raffles/:raffleId/participants` — участники и сколько каждый купил.
 *
 * @param {string} raffleId
 * @returns {Promise<import('zod').infer<typeof raffleParticipantsDataSchema>>}
 */
export async function fetchRaffleParticipants(raffleId) {
  try {
    const { data } = await apiClient.get(`/product/raffles/${raffleId}/participants`);
    return parseApiContractData(data, raffleParticipantsDataSchema);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_RAFFLE_PARTICIPANTS_FALLBACK;
    throw new Error(message);
  }
}
