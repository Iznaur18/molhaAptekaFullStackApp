import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { CATALOG_PAGE_SIZE, PRODUCTS_FETCH_PAGE_LIMIT } from "../model/productConstants.js";

/**
 * Одна страница `GET /product/my`.
 *
 * @param {{
 *   search?: string;
 *   page?: number;
 *   limit?: number;
 *   productCategory?: string;
 *   sort?: string;
 * }} [options]
 * @returns {Promise<{
 *   products: import('../model/types.js').ProductFromApi[];
 *   pagination: { page: number; limit: number; total: number; totalPages: number };
 * }>}
 */
export async function fetchMyProductsPage({
  search,
  page = 1,
  limit = CATALOG_PAGE_SIZE,
  productCategory,
  sort,
} = {}) {
  try {
    const { data } = await apiClient.get("/product/my", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(productCategory ? { productCategory } : {}),
        ...(sort ? { sort } : {}),
      },
    });

    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const pagination = data.data.pagination;
    if (
      !pagination ||
      typeof pagination.totalPages !== "number" ||
      typeof pagination.page !== "number"
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      products: data.data.products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_MY_PRODUCTS_FALLBACK;
    throw new Error(message);
  }
}

/**
 * Все товары продавца (цикл страниц). Для экранов, где нужен полный список id (фильтр в «Мои продажи»).
 *
 * @param {{ search?: string; productCategory?: string }} [options]
 * @returns {Promise<import('../model/types.js').ProductFromApi[]>}
 */
export async function fetchAllMyProducts(options = {}) {
  const limit = PRODUCTS_FETCH_PAGE_LIMIT;
  let page = 1;
  /** @type {import('../model/types.js').ProductFromApi[]} */
  const all = [];

  while (true) {
    const { products, pagination } = await fetchMyProductsPage({
      ...options,
      page,
      limit,
    });
    all.push(...products);
    if (page >= pagination.totalPages) break;
    page += 1;
  }

  return all;
}
