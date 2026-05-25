import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} productId
 * @returns {Promise<{ hasPendingReport: boolean }>}
 */
export async function fetchMyProductReportStatus(productId) {
  try {
    const { data } = await apiClient.get(`/product/${productId}/report/me`);

    if (!data?.success || typeof data.data?.hasPendingReport !== "boolean") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return { hasPendingReport: data.data.hasPendingReport };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_REPORT_STATUS_FALLBACK;
    throw new Error(message);
  }
}
