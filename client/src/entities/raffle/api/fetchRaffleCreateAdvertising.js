import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   pricePoints: number;
 *   hasPaidUnlock: boolean;
 *   hasOpenRaffle: boolean;
 *   canPay: boolean;
 *   canOpenForm: boolean;
 *   blockReason: string | null;
 *   loyaltyPointsBalance: number;
 *   raffle: Record<string, unknown> | null;
 * }>}
 */
export async function fetchRaffleCreateAdvertising() {
  try {
    const { data } = await apiClient.get("/product/raffles/create-advertising");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        API_CLIENT_UI.FETCH_RAFFLE_CREATE_ADVERTISING_FALLBACK,
      ),
    );
  }
}
