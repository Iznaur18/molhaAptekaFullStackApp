import { MY_PRODUCTS_MODERATION_FILTER_VALUES } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT,
  PRODUCT_SORT_REVIEWS,
} from "../../constants/productCatalogSort.js";
import { getProductIdsWithOpenSales } from "./productOrderLocks.js";
import { buildProductCatalogSearchQuery } from "./buildProductCatalogSearchQuery.js";
import {
  countProducts,
  findProductsPage,
  parseProductSortFromQuery,
} from "./productCatalogQuery.js";
import { attachProductAvailablePurchaseQuantity } from "./productStock.js";
import {
  mergeProductCatalogCategoryFilter,
  parseCategoryIdFromQuery,
} from "./mergeProductCatalogCategoryFilter.js";

import {
  buildPagination,
  categoryFromQuery,
  parsePagination,
} from "./productListQueryHelpers.js";

const moderationStatusFromQuery = (query) => {
  const raw = query?.moderationStatus;
  if (raw == null || String(raw).trim() === "") {
    return null;
  }
  const value = String(raw).trim();
  return MY_PRODUCTS_MODERATION_FILTER_VALUES.includes(value) ? value : null;
};

/**
 * @param {{
 *   userId: string;
 *   query: Record<string, unknown>;
 * }} input
 */
export async function getMyProducts({ userId, query }) {
  const { page, limit, skip } = parsePagination(query);
  const category = categoryFromQuery(query);
  const reviewsOnly = query.sort === PRODUCT_SORT_REVIEWS;
  const sort = parseProductSortFromQuery(query);
  const moderationStatus = moderationStatusFromQuery(query);

  const myProductsBaseQuery = await mergeProductCatalogCategoryFilter(
    {
      productSeller: userId,
      ...(moderationStatus ? { productModerationStatus: moderationStatus } : {}),
    },
    {
      categoryId: parseCategoryIdFromQuery(query.categoryId),
      productCategory: category,
    },
  );

  if (reviewsOnly) {
    myProductsBaseQuery.reviewCount = { $gte: PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT };
  }

  const { query: productsQuery, searchRank } = await buildProductCatalogSearchQuery(
    query.search,
    myProductsBaseQuery,
  );

  const [products, total] = await Promise.all([
    findProductsPage(productsQuery, sort, skip, limit, searchRank),
    countProducts(productsQuery),
  ]);

  const openSalesIds = await getProductIdsWithOpenSales(
    products.map((p) => String(p._id)),
  );
  const productsWithSalesFlags = await attachProductAvailablePurchaseQuantity(
    products.map((product) => ({
      ...product,
      hasOpenSales: openSalesIds.has(String(product._id)),
    })),
  );

  return {
    products: productsWithSalesFlags,
    pagination: buildPagination(page, limit, total),
  };
}
