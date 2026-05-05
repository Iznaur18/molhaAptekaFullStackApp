import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /vote/me/:userVoteTargetIdClient` — ваша оценка этому пользователю (Bearer) или `null`.
 *
 * @param {string} targetUserId
 * @returns {Promise<number | null>}
 */
export async function fetchMyVoteForTarget(targetUserId) {
  try {
    const { data } = await apiClient.get(
      `/vote/me/${encodeURIComponent(targetUserId)}`,
    );

    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const raw = data.data.myVoteValue;
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_VOTE_FALLBACK;
    throw new Error(message);
  }
}
