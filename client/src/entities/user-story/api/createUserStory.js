import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   mediaType: 'image' | 'video';
 *   mediaUrl: string;
 *   captionText?: string;
 * }} payload
 */
export async function createUserStory(payload) {
  try {
    const { data } = await apiClient.post("/user/stories", payload);

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось опубликовать сторис";
    throw new Error(message);
  }
}
