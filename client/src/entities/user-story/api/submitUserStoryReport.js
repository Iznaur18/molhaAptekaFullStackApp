import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} storyId
 * @param {{ reportText: string }} payload
 */
export async function submitUserStoryReport(storyId, payload) {
  try {
    const { data } = await apiClient.post(
      `/user/stories/${encodeURIComponent(storyId)}/report`,
      payload,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось отправить жалобу";
    throw new Error(message);
  }
}
