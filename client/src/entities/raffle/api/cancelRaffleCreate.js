import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { formatApiErrorMessage } from "../../../shared/lib/formatApiErrorMessage.js";

/**
 * @returns {Promise<{ message: string; loyaltyPointsBalance: number; hasPaidUnlock: boolean }>}
 */
export async function cancelRaffleCreate() {
  try {
    const { data } = await apiClient.post("/product/raffles/cancel-create");
    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.CANCEL_RAFFLE_CREATE_FALLBACK));
  }
}
