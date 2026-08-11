import { apiClient } from "../../../shared/api/index.js";
import { parseCatalogProductsPageData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { CATALOG_PAGE_SIZE } from "../model/productConstants.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

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
 *   rentalOnly?: boolean;
 *   affiliateOnly?: boolean;
 *   wholesaleOnly?: boolean;
 *   originalOnly?: boolean;
 *   near?: boolean;
 *   regionCode?: string;
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
  rentalOnly = false,
  affiliateOnly = false,
  wholesaleOnly = false,
  originalOnly = false,
  near = false,
  regionCode,
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
        ...(rentalOnly ? { rentalOnly: "true" } : {}),
        ...(affiliateOnly ? { affiliateOnly: "true" } : {}),
        ...(wholesaleOnly ? { wholesaleOnly: "true" } : {}),
        ...(originalOnly ? { originalOnly: "true" } : {}),
        ...(near ? { near: "true" } : {}),
        ...(regionCode ? { regionCode } : {}),
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
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK));
  }
}
