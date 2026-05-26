import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { CATALOG_PAGE_SIZE } from "../model/productConstants.js";

/**
 * Одна страница `GET /product` (пагинация + поиск + категория на сервере).
 *
 * @param {{
 *   page?: number;
 *   limit?: number;
 *   search?: string;
 *   productCategory?: string;
 *   sort?: string;
 *   includeHidden?: boolean;
 *   followingOnly?: boolean;
 *   auctionOnly?: boolean;
 * }} [options]
 * @returns {Promise<{
 *   products: import('../model/types.js').ProductFromApi[];
 *   pagination: { page: number; limit: number; total: number; totalPages: number };
 * }>}
 */
export async function fetchCatalogProductsPage({
  page = 1,
  limit = CATALOG_PAGE_SIZE,
  search,
  productCategory,
  sort,
  includeHidden = false,
  followingOnly = false,
  auctionOnly = false,
} = {}) {
  try {
    const { data } = await apiClient.get("/product", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(productCategory ? { productCategory } : {}),
        ...(sort ? { sort } : {}),
        ...(includeHidden ? { includeHidden: "true" } : {}),
        ...(followingOnly ? { followingOnly: "true" } : {}),
        ...(auctionOnly ? { auctionOnly: "true" } : {}),
      },
    });

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const { products = [], pagination } = data.data;

    if (
      !pagination ||
      typeof pagination.totalPages !== "number" ||
      typeof pagination.page !== "number"
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      products,
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
      API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK;
    throw new Error(message);
  }
}
