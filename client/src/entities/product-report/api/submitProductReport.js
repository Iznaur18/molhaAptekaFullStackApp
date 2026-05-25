import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @param {string} reportText
 */
export async function submitProductReport(productId, reportText) {
  try {
    const { data } = await apiClient.post(`/product/${productId}/report`, {
      reportText,
    });

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.SUBMIT_PRODUCT_REPORT_FALLBACK;
    throw new Error(message);
  }
}
