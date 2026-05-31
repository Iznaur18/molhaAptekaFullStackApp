import { apiClient } from "../../../shared/api/index.js";

/**
 * @param {string} storyId
 */
export async function markUserStoryViewed(storyId) {
  try {
    await apiClient.post(`/user/stories/${encodeURIComponent(storyId)}/view`);
  } catch {
    // просмотр не блокирует UX
  }
}
