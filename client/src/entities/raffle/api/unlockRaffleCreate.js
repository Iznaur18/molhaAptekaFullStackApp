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
    const message =
      error?.response?.data?.message ??
      error?.message ??
      API_CLIENT_UI.UNLOCK_RAFFLE_CREATE_FALLBACK;
    throw new Error(message);
  }
}
