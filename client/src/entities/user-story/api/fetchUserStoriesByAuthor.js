import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} authorUserId
 * @returns {Promise<import('../model/types.js').UserStoryFromApi[]>}
 */
export async function fetchUserStoriesByAuthor(authorUserId) {
  try {
    const { data } = await apiClient.get(
      `/user/stories/author/${encodeURIComponent(authorUserId)}`,
    );

    if (!data?.success || !Array.isArray(data.data?.stories)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data.stories;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить сторисы автора";
    throw new Error(message);
  }
}
