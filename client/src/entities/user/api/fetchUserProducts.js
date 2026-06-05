import { apiClient } from "../../../shared/api/index.js";
import { parseUserSellerProductsPageData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

export const USER_PROFILE_PRODUCTS_PAGE_SIZE = 5;

/** Совпадает с `USER_SELLER_PRODUCTS_PAGE_SIZE_MAX` на сервере. */
export const USER_PROFILE_PRODUCTS_API_LIMIT_MAX = 20;

/**
 * `GET /user/:userId/products` — товары продавца в каталоге (Bearer).
 *
 * @param {string} userId
 * @param {{ page?: number; limit?: number }} [params]
 */
export async function fetchUserProducts(userId, params = {}) {
  try {
    const page = params.page ?? 1;
    const limit = params.limit ?? USER_PROFILE_PRODUCTS_PAGE_SIZE;

    const { data } = await apiClient.get(
      `/user/${encodeURIComponent(userId)}/products`,
      { params: { page, limit } },
    );

    const parsed = parseUserSellerProductsPageData(data);
    return {
      items: parsed.items,
      pagination: parsed.pagination,
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * Все товары продавца (несколько страниц, если `total` > лимита API).
 *
 * @param {string} userId
 */
export async function fetchAllUserProducts(userId) {
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
}
