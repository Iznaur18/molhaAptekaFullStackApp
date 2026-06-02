import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /price-offers/incoming/pending-count`
 *
 * @returns {Promise<number>}
 */
export async function fetchIncomingPriceOffersPendingCount() {
  try {
    const { data } = await apiClient.get("/price-offers/incoming/pending-count");

    if (!data?.success || typeof data.data?.count !== "number") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.count;
  } catch {
    return 0;
  }
}
