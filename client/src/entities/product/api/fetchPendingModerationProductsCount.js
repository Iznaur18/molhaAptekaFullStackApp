import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<number>}
 */
export async function fetchPendingModerationProductsCount() {
  try {
    const { data } = await apiClient.get("/product/moderation/pending/count");

    if (!data?.success || typeof data.data?.totalPending !== "number") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return Number(data.data.totalPending) || 0;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MODERATION_COUNT_FALLBACK;
    throw new Error(message);
  }
}
