import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ regionCode?: string }} [options]
 * @returns {Promise<import('../model/types.js').RaffleFromApi[]>}
 */
export async function fetchFeaturedRaffles({ regionCode } = {}) {
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
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_FEATURED_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {{ regionCode?: string }} [options]
 * @returns {Promise<import('../model/types.js').RaffleFromApi | null>}
 */
export async function fetchFeaturedRaffle(options = {}) {
  const raffles = await fetchFeaturedRaffles(options);
  return raffles[0] ?? null;
}
