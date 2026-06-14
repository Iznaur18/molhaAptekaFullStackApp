import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, USER_SEARCH_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type UserSearchListItem = Record<string, unknown> & {
  _id: string;
  userName?: string;
  email?: string;
};

type FetchUsersSearchPageParams = {
  page?: number;
  limit?: number;
  search?: string;
};

type FetchUsersSearchPageResult = {
  users: UserSearchListItem[];
  total: number;
  page: number;
  limit: number;
};

export const fetchUsersSearchPage = async (
  params: FetchUsersSearchPageParams = {},
): Promise<FetchUsersSearchPageResult> => {
  try {
    const maxLimit = USER_SEARCH_UI.API_PAGE_LIMIT;
    const { data } = await apiClient.get("/user/search", {
      params: {
        page: params.page ?? 1,
        limit: Math.min(maxLimit, Math.max(1, params.limit ?? maxLimit)),
        ...(params.search != null && params.search !== "" ? { search: params.search } : {}),
      },
    });

    if (!data?.success || data.data == null) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const { users, total, page, limit } = data.data;
    const list = Array.isArray(users) ? users : [];

    return {
      users: list as UserSearchListItem[],
      total: Number(total) || 0,
      page: Number(page) || 1,
      limit: Number(limit) || maxLimit,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_USERS_SEARCH_FALLBACK));
  }
};
