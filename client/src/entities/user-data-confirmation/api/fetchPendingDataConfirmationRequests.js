import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/types.js').DataConfirmationRequest[]>}
 */
export async function fetchPendingDataConfirmationRequests() {
  try {
    const { data } = await apiClient.get("/user/data-confirmation-requests/pending");

    if (!data?.success || !Array.isArray(data.data?.requests)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.requests;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_DATA_CONFIRMATION_QUEUE_FALLBACK;
    throw new Error(message);
  }
}
