import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { MY_FOLLOW_LIST_DEFAULT_LIMIT } from "../model/constants.js";

/**
 * `GET /user/me/followers`
 *
 * @param {{ page?: number; limit?: number }} [options]
 */
export async function fetchMyFollowers({
  page = 1,
  limit = MY_FOLLOW_LIST_DEFAULT_LIMIT,
} = {}) {
  try {
    const { data } = await apiClient.get("/user/me/followers", {
      params: { page, limit },
    });

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      users: data.data.users ?? [],
      pagination: data.data.pagination,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_FOLLOWERS_FALLBACK;
    throw new Error(message);
  }
}
