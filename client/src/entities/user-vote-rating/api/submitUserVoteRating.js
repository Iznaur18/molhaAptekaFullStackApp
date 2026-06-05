import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `POST /vote/:userVoteTargetIdClient` — поставить или изменить оценку 1–10 (Bearer).
 *
 * @param {string} targetUserId MongoDB id пользователя, которого оценивают
 * @param {number} userVoteValueClient целое 1–10
 * @returns {Promise<{ user: import('../../user/model/types.js').UserPublicProfile; message?: string }>}
 */
export async function submitUserVoteRating(targetUserId, userVoteValueClient) {
  try {
    const { data } = await apiClient.post(`/vote/${encodeURIComponent(targetUserId)}`, {
      userVoteValueClient,
    });

    if (!data?.success || data.data?.user == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      user: data.data.user,
      message: data.data.message,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.VOTE_SUBMIT_FALLBACK;
    throw new Error(message);
  }
}
