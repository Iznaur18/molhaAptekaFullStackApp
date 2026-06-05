import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('../model/types.js').UserStoriesFeedFromApi>}
 */
export async function fetchUserStoriesFeed() {
  try {
    const { data } = await apiClient.get("/user/stories/feed");

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      rings: Array.isArray(data.data.rings) ? data.data.rings : [],
      canPublish: Boolean(data.data.canPublish),
      showStrip: Boolean(data.data.showStrip),
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось загрузить сторисы";
    throw new Error(message);
  }
}
