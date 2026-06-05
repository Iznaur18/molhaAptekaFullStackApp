import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} storyId
 * @param {{ resolution: string; staffNote: string }} payload
 */
export async function resolveUserStoryReports(storyId, payload) {
  try {
    const { data } = await apiClient.patch(
      `/user/stories/reports/story/${encodeURIComponent(storyId)}/resolve`,
      payload,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось обработать жалобы";
    throw new Error(message);
  }
}
