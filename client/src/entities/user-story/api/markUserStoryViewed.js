import { apiClient } from "../../../shared/api/index.js";
import { reportClientIssue } from "../../../shared/lib/reportClientIssue.js";

/**
 * @param {string} storyId
 */
export async function markUserStoryViewed(storyId) {
  try {
    await apiClient.post(`/user/stories/${encodeURIComponent(storyId)}/view`);
  } catch (error) {
    // просмотр не блокирует UX
    reportClientIssue("markUserStoryViewed", error);
  }
}
