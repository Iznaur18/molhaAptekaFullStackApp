import { apiClient, parseUserSellerProductsPageData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import {
  USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
  USER_PROFILE_PRODUCTS_PAGE_SIZE,
} from "../model/constants";

type FetchUserProductsParams = {
  page?: number;
  limit?: number;
};

export const fetchUserProducts = async (userId: string, params: FetchUserProductsParams = {}) => {
  try {
    const page = params.page ?? 1;
    const limit = params.limit ?? USER_PROFILE_PRODUCTS_PAGE_SIZE;

    const { data } = await apiClient.get(`/user/${encodeURIComponent(userId)}/products`, {
      params: { page, limit },
    });

    return parseUserSellerProductsPageData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK));
  }
};

export const fetchAllUserProducts = async (userId: string) => {
  const merged = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchUserProducts(userId, {
      page,
      limit: USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
    });
    merged.push(...result.items);
    hasMore = Boolean(result.pagination?.hasMore);
    page += 1;
  }

  const total = merged.length;

  return {
    items: merged,
    pagination: {
      page: 1,
      limit: total,
      total,
      totalPages: 1,
      hasMore: false,
    },
  };
};

export { USER_PROFILE_PRODUCTS_API_LIMIT_MAX, USER_PROFILE_PRODUCTS_PAGE_SIZE };
