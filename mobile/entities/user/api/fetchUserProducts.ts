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

export { USER_PROFILE_PRODUCTS_API_LIMIT_MAX, USER_PROFILE_PRODUCTS_PAGE_SIZE };
