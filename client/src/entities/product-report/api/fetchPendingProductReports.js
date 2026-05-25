import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   groups: import('../model/types.js').ProductReportGroup[];
 *   totalReports: number;
 *   totalGroups: number;
 * }>}
 */
export async function fetchPendingProductReports() {
  try {
    const { data } = await apiClient.get("/product/reports/pending");

    if (!data?.success || !Array.isArray(data.data?.groups)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      groups: data.data.groups,
      totalReports: Number(data.data.totalReports) || 0,
      totalGroups: Number(data.data.totalGroups) || 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_REPORTS_FALLBACK;
    throw new Error(message);
  }
}
