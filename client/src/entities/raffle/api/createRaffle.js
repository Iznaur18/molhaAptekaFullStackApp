import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   title: string;
 *   description?: string;
 *   prizeMediaType?: 'image' | 'video';
 *   prizeImageUrl?: string;
 *   prizeVideoUrl?: string;
 *   prizeImageFocus?: { x: number; y: number };
 *   targetSales: number;
 *   instagramUrl: string;
 * }} body
 */
export async function createRaffle(body) {
  try {
    const { data } = await apiClient.post("/product/raffles", body);
    if (!data?.success || !data.data?.raffle) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.raffle;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.CREATE_RAFFLE_FALLBACK;
    throw new Error(message);
  }
}
