import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} requestId
 * @param {{ resolution: string; staffNote?: string }} body
 */
export async function resolveDataConfirmationRequest(requestId, body) {
  try {
    const { data } = await apiClient.patch(
      `/user/data-confirmation-requests/${requestId}/resolve`,
      body,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.RESOLVE_DATA_CONFIRMATION_FALLBACK;
    throw new Error(message);
  }
}
