import { usersLoyaltyRaffleSettingsDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{ description: string; goal: number; updatedAt?: string | Date | null }>}
 */
export async function fetchUsersLoyaltyRaffleSettings() {
  try {
    const { data } = await apiClient.get("/users-loyalty-raffle");
    const parsed = parseApiContractData(data, usersLoyaltyRaffleSettingsDataSchema);
    return parsed.settings;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_USERS_LOYALTY_RAFFLE_SETTINGS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {{ description?: string; goal?: number }} body
 * @returns {Promise<{ description: string; goal: number; updatedAt?: string | Date | null }>}
 */
export async function patchUsersLoyaltyRaffleSettings(body) {
  try {
    const { data } = await apiClient.patch("/users-loyalty-raffle", body);
    const parsed = parseApiContractData(data, usersLoyaltyRaffleSettingsDataSchema);
    return parsed.settings;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.PATCH_USERS_LOYALTY_RAFFLE_SETTINGS_FALLBACK;
    throw new Error(message);
  }
}
