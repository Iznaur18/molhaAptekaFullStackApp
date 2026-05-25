import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<number>}
 */
export async function fetchPendingProductReportsCount() {
  try {
    const { data } = await apiClient.get("/product/reports/pending/count");

    if (!data?.success || typeof data.data?.totalReports !== "number") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return Number(data.data.totalReports) || 0;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_REPORTS_COUNT_FALLBACK;
    throw new Error(message);
  }
}
