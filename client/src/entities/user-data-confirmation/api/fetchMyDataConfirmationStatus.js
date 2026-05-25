import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/types.js').MyDataConfirmationStatus>}
 */
export async function fetchMyDataConfirmationStatus() {
  try {
    const { data } = await apiClient.get("/user/me/data-confirmation-request");

    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      isUserDataConfirmed: data.data.isUserDataConfirmed === true,
      request: data.data.request ?? null,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_DATA_CONFIRMATION_STATUS_FALLBACK;
    throw new Error(message);
  }
}
