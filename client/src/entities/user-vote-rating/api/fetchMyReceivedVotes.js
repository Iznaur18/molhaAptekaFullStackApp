import { USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /vote/me/received`
 *
 * @param {{ page?: number; limit?: number }} [options]
 */
export async function fetchMyReceivedVotes({
  page = 1,
  limit = USER_VOTE_RECEIVED_DEFAULT_LIST_LIMIT,
} = {}) {
  try {
    const { data } = await apiClient.get("/vote/me/received", {
      params: { page, limit },
    });

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      votes: data.data.votes ?? [],
      summary: data.data.summary ?? {
        countVotes: 0,
        totalRating: 0,
        averageRating: 0,
      },
      pagination: data.data.pagination,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_RECEIVED_VOTES_FALLBACK;
    throw new Error(message);
  }
}
