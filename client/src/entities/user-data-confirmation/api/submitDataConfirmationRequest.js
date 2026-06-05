import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   passport: import('../model/types.js').PassportSnapshot;
 *   passportSelfiePhotoUrl: string;
 * }} body
 */
export async function submitDataConfirmationRequest(body) {
  try {
    const { data } = await apiClient.post("/user/me/data-confirmation-request", body);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.SUBMIT_DATA_CONFIRMATION_FALLBACK;
    throw new Error(message);
  }
}
