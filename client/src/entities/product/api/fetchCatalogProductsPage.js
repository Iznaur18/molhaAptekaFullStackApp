import { apiClient } from "../../../shared/api/index.js";
import { parseCatalogProductsPageData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { CATALOG_PAGE_SIZE } from "../model/productConstants.js";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @typedef {{
 *   search?: string | null;
 *   productCategory?: string | null;
 *   categoryId?: string | null;
 *   sellerPersonalCategoryId?: string | null;
 *   sort?: string | null;
 *   includeHidden?: boolean;
 *   followingOnly?: boolean | null;
 *   auctionOnly?: boolean | null;
 *   installmentOnly?: boolean | null;
 *   saleOnly?: boolean | null;
 *   rentalOnly?: boolean | null;
 *   affiliateOnly?: boolean | null;
 *   wholesaleOnly?: boolean | null;
 *   buyNFreeOnly?: boolean | null;
 *   originalOnly?: boolean | null;
 *   near?: boolean | null;
 *   flashSaleOnly?: boolean | null;
 *   priceMin?: number | null;
 *   priceMax?: number | null;
 *   delivery?: string | string[] | null;
 *   pickupOnly?: boolean | null;
 *   ratingMin?: number | null;
 *   withReviews?: boolean | null;
 *   returnOnly?: boolean | null;
 *   sellerConfirmed?: boolean | null;
 *   sellerPremium?: boolean | null;
 *   regionCode?: string | null;
 * }} CatalogProductsRequestOptions
 */

/**
 * Query каталога без пагинации — общий для `GET /product` и `GET /product/facets`,
 * чтобы число в окне фильтров считалось по тем же параметрам, что и выдача.
 *
 * @param {CatalogProductsRequestOptions} options
 */
export function buildCatalogProductsRequestParams({
  search,
  productCategory,
  categoryId,
  sellerPersonalCategoryId,
  sort,
  includeHidden = false,
  followingOnly,
  auctionOnly,
  installmentOnly,
  saleOnly,
  rentalOnly,
  affiliateOnly,
  wholesaleOnly,
  buyNFreeOnly,
  originalOnly,
  near,
  flashSaleOnly,
  priceMin,
  priceMax,
  delivery,
  pickupOnly,
  ratingMin,
  withReviews,
  returnOnly,
  sellerConfirmed,
  sellerPremium,
  regionCode,
} = {}) {
  const deliveryValue = Array.isArray(delivery) ? delivery.join(",") : delivery;
  return {
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
    ...(buyNFreeOnly ? { buyNFreeOnly: "true" } : {}),
    ...(originalOnly ? { originalOnly: "true" } : {}),
    ...(near ? { near: "true" } : {}),
    ...(flashSaleOnly ? { flashSaleOnly: "true" } : {}),
    ...(priceMin != null ? { priceMin } : {}),
    ...(priceMax != null ? { priceMax } : {}),
    ...(deliveryValue ? { delivery: deliveryValue } : {}),
    ...(pickupOnly ? { pickupOnly: "true" } : {}),
    ...(ratingMin != null ? { ratingMin } : {}),
    ...(withReviews ? { withReviews: "true" } : {}),
    ...(returnOnly ? { returnOnly: "true" } : {}),
    ...(sellerConfirmed ? { sellerConfirmed: "true" } : {}),
    ...(sellerPremium ? { sellerPremium: "true" } : {}),
    ...(regionCode ? { regionCode } : {}),
  };
}

/**
 * Одна страница `GET /product` (пагинация + поиск + категория на сервере).
 *
 * @param {CatalogProductsRequestOptions & { page?: number; limit?: number }} [options]
 * @returns {Promise<{
 *   products: import('../model/types.js').ProductFromApi[];
 *   pagination: { page: number; limit: number; total: number; totalPages: number };
 * }>}
 */
export async function fetchCatalogProductsPage({
  page = 1,
  limit = CATALOG_PAGE_SIZE,
  ...filters
} = {}) {
  try {
    const { data } = await apiClient.get("/product", {
      params: {
        page,
        limit,
        ...buildCatalogProductsRequestParams(filters),
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
    const error = new Error(
      formatApiErrorMessage(e, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK),
    );
    // Статус нужен повтору запроса: на 429 повторять бессмысленно.
    /** @type {Error & { status?: number }} */ (error).status = e?.response?.status;
    throw error;
  }
}
