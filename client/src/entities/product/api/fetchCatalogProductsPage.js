import { apiClient } from "../../../shared/api/index.js";
import { parseCatalogProductsPageData } from "../../../shared/api/parseApiContract.js";
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
 *   categoryId?: string;
 *   sellerPersonalCategoryId?: string;
 *   sort?: string;
 *   includeHidden?: boolean;
 *   followingOnly?: boolean;
 *   auctionOnly?: boolean;
 *   installmentOnly?: boolean;
 *   saleOnly?: boolean;
 *   allCities?: boolean;
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
  categoryId,
  sellerPersonalCategoryId,
  sort,
  includeHidden = false,
  followingOnly = false,
  auctionOnly = false,
  installmentOnly = false,
  saleOnly = false,
  allCities = false,
} = {}) {
  try {
    const { data } = await apiClient.get("/product", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(sellerPersonalCategoryId ? { sellerPersonalCategoryId } : {}),
        ...(productCategory ? { productCategory } : {}),
        ...(sort ? { sort } : {}),
        ...(includeHidden ? { includeHidden: "true" } : {}),
        ...(followingOnly ? { followingOnly: "true" } : {}),
        ...(auctionOnly ? { auctionOnly: "true" } : {}),
        ...(installmentOnly ? { installmentOnly: "true" } : {}),
        ...(saleOnly ? { saleOnly: "true" } : {}),
        ...(allCities ? { allCities: "true" } : {}),
      },
    });

    const parsed = parseCatalogProductsPageData(data);
    return {
      products: parsed.products,
      pagination: {
        page: parsed.pagination.page,
        limit: parsed.pagination.limit,
        total: parsed.pagination.total,
        totalPages: parsed.pagination.totalPages,
      },
    };
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK;
    throw new Error(message);
  }
}
