import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   message: string;
 *   loyaltyPointsBalance: number;
 *   hasPaidUnlock: boolean;
 * }>}
 */
export async function unlockRaffleCreate() {
  try {
    const { data } = await apiClient.post("/product/raffles/unlock-create");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.UNLOCK_RAFFLE_CREATE_FALLBACK),
    );
  }
}
