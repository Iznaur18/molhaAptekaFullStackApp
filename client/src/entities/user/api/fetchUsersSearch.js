import { apiClient } from "../../../shared/api/index.js";
import {
  API_CLIENT_UI,
  USER_SEARCH_UI,
} from "../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   page?: number;
 *   limit?: number;
 *   search?: string;
 * }} [params]
 * @returns {Promise<{ users: import('../model/types.js').UserSearchListItem[]; total: number; page: number; limit: number }>}
 */
export async function fetchUsersSearchPage(params = {}) {
  try {
    const maxLimit = USER_SEARCH_UI.API_PAGE_LIMIT;
    const { data } = await apiClient.get("/user/search", {
      params: {
        page: params.page ?? 1,
        limit: Math.min(maxLimit, Math.max(1, params.limit ?? maxLimit)),
        ...(params.search != null && params.search !== ""
          ? { search: params.search }
          : {}),
      },
    });

    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const { users, total, page, limit } = data.data;
    const list = Array.isArray(users) ? users : [];

    return {
      users: list,
      total: Number(total) || 0,
      page: Number(page) || 1,
      limit: Number(limit) || maxLimit,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_USERS_SEARCH_FALLBACK;
    throw new Error(message);
  }
}
