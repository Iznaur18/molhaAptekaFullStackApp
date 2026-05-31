import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<{
 *   groups: import('../model/types.js').UserStoryReportGroup[];
 *   totalReports: number;
 * }>}
 */
export async function fetchPendingUserStoryReports() {
  try {
    const { data } = await apiClient.get("/user/stories/reports/pending");

    if (!data?.success || !Array.isArray(data.data?.groups)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      groups: data.data.groups,
      totalReports: Number(data.data.totalReports) || 0,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      "Не удалось загрузить жалобы на сторисы";
    throw new Error(message);
  }
}
