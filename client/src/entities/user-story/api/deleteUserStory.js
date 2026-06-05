import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} storyId
 */
export async function deleteUserStory(storyId) {
  try {
    const { data } = await apiClient.delete(
      `/user/stories/${encodeURIComponent(storyId)}`,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось удалить сторис";
    throw new Error(message);
  }
}
