import { apiClient } from "../../../shared/api/index.js";
import { resolveApiClientErrorMessage } from "../../../shared/api/resolveApiClientErrorMessage.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} storyId
 * @param {{ reportText: string }} payload
 */
export async function submitUserStoryReport(storyId, payload) {
  const normalizedStoryId = String(storyId ?? "").trim();
  if (!normalizedStoryId) {
    throw new Error("Не удалось определить сторис");
  }

  try {
    const { data } = await apiClient.post(
      `/user/stories/${encodeURIComponent(normalizedStoryId)}/report`,
      payload,
    );

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return data.data;
  } catch (e) {
    throw new Error(
      resolveApiClientErrorMessage(e, "Не удалось отправить жалобу"),
    );
  }
}
