import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * `GET /user/me/following`
 *
 * @param {{ page?: number; limit?: number }} [options]
 */
export async function fetchMyFollowing({ page = 1, limit = 50 } = {}) {
  try {
    const { data } = await apiClient.get("/user/me/following", {
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
      API_CLIENT_UI.FETCH_MY_FOLLOWING_FALLBACK;
    throw new Error(message);
  }
}
