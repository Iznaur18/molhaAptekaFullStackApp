import {
  MY_PRODUCTS_MODERATION_FILTER_VALUES,
  PRODUCT_MODERATION_APPROVED,
} from "../../constants/productModerationConstants.js";
import {
  PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT,
  PRODUCT_SORT_CONFIRMED,
  PRODUCT_SORT_PREMIUM,
  PRODUCT_SORT_REVIEWS,
} from "../../constants/productCatalogSort.js";
import { resolveViewerRegionCodeForRequest } from "../user/userRegionCatalogFilter.js";
import { getHiddenSellerIds, isUserStaff } from "../access/adminUserGuard.js";
import { getConfirmedSellerIds } from "./confirmedSellerCatalog.js";
import {
  filterSellerIdsExcludingHidden,
  getPremiumSellerIds,
} from "./premiumSellerCatalog.js";
import { getProductIdsWithOpenSales } from "./productOrderLocks.js";
import { buildProductCatalogSearchQuery } from "./buildProductCatalogSearchQuery.js";
import {
  countCatalogProducts,
  findCatalogProductsPage,
} from "./findCatalogProductsPage.js";
import { isProductAtlasSearchEnabled } from "./isProductAtlasSearchEnabled.js";
import { parseProductSortFromQuery } from "./productCatalogQuery.js";
import { USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE } from "../../constants/userFollowConstants.js";
import { getVisibleFollowingSellerIds } from "../user/userFollowHelpers.js";
import { attachProductAvailablePurchaseQuantity } from "./productStock.js";
import { buildProductSaleOnlyMatch } from "./productDiscount.js";
import {
  mergeProductCatalogCategoryFilter,
  parseCategoryIdFromQuery,
} from "./mergeProductCatalogCategoryFilter.js";
import { SellerPersonalCategoryModel } from "../../models/index.js";
import mongoose from "mongoose";
import { AppError } from "../../errors/AppError.js";
import {
  buildCatalogProductsCacheKey,
  getCachedCatalogProducts,
  setCachedCatalogProducts,
} from "./catalogProductsResponseCache.js";

import {
  buildPagination,
  categoryFromQuery,
  parsePagination,
  parseTruthyQueryFlag,
} from "./productListQueryHelpers.js";

const emptyCatalogPage = (page, limit) => ({
  products: [],
  pagination: buildPagination(page, limit, 0),
});

/**
 * @param {{
 *   userId?: string;
 *   query: Record<string, unknown>;
 * }} input
 */
export async function getCatalogProducts({ userId, query }) {
  const includeHidden =
    String(query.includeHidden).toLowerCase() === "true";
  const cacheKey = buildCatalogProductsCacheKey({ userId, query });

  if (!includeHidden) {
    const cached = getCachedCatalogProducts(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const result = await loadCatalogProducts({ userId, query });

  if (!includeHidden) {
    setCachedCatalogProducts(cacheKey, result);
  }

  return result;
}

/**
 * @param {{
 *   userId?: string;
 *   query: Record<string, unknown>;
 * }} input
 */
async function loadCatalogProducts({ userId, query }) {
  const { page, limit, skip } = parsePagination(query);
  const category = categoryFromQuery(query);
  const categoryId = parseCategoryIdFromQuery(query.categoryId);
  const sellerPersonalCategoryId = parseCategoryIdFromQuery(query.sellerPersonalCategoryId);
  const premiumOnly = query.sort === PRODUCT_SORT_PREMIUM;
  const confirmedOnly = query.sort === PRODUCT_SORT_CONFIRMED;
  const reviewsOnly = query.sort === PRODUCT_SORT_REVIEWS;
  const sort = parseProductSortFromQuery(query);
  const followingOnly = parseTruthyQueryFlag(query.followingOnly);
  const auctionOnly = parseTruthyQueryFlag(query.auctionOnly);
  const installmentOnly = parseTruthyQueryFlag(query.installmentOnly);
  const saleOnly = parseTruthyQueryFlag(query.saleOnly);

  if (followingOnly && !userId) {
    throw new AppError(401, USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE);
  }

  const hiddenSellerIds = await getHiddenSellerIds();
  const isStaff = await isUserStaff(userId);
  const includeHiddenStaff =
    isStaff && String(query.includeHidden).toLowerCase() === "true";

  if (sellerPersonalCategoryId) {
    const personalCategory = await SellerPersonalCategoryModel.findById(
      sellerPersonalCategoryId,
    )
      .select("activeUntil")
      .lean();
    if (
      !personalCategory?.activeUntil ||
      new Date(personalCategory.activeUntil).getTime() <= Date.now()
    ) {
      return emptyCatalogPage(page, limit);
    }
  }

  const catalogBaseQuery = await mergeProductCatalogCategoryFilter(
    {
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
    },
    { categoryId, productCategory: category },
  );

  if (sellerPersonalCategoryId) {
    catalogBaseQuery.sellerPersonalCategoryId = new mongoose.Types.ObjectId(
      sellerPersonalCategoryId,
    );
  }

  if (auctionOnly) {
    catalogBaseQuery.productAuctionEnabled = true;
  }
  if (installmentOnly) {
    catalogBaseQuery.productInstallmentEnabled = true;
  }
  if (saleOnly) {
    Object.assign(catalogBaseQuery, buildProductSaleOnlyMatch());
  }
  if (reviewsOnly) {
    catalogBaseQuery.reviewCount = { $gte: PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT };
  }
  if (!includeHiddenStaff) {
    catalogBaseQuery.productIsAvailable = { $ne: false };
    catalogBaseQuery.productStockQuantity = { $gt: 0 };
  }

  const viewerRegionCode = await resolveViewerRegionCodeForRequest({
    userId,
    queryRegionCode: query.regionCode,
  });

  if (premiumOnly) {
    const premiumSellerIds = filterSellerIdsExcludingHidden(
      await getPremiumSellerIds(),
      hiddenSellerIds,
    );
    catalogBaseQuery.productSeller = { $in: premiumSellerIds };
  } else if (confirmedOnly) {
    const confirmedSellerIds = filterSellerIdsExcludingHidden(
      await getConfirmedSellerIds(),
      hiddenSellerIds,
    );
    catalogBaseQuery.productSeller = { $in: confirmedSellerIds };
  } else if (hiddenSellerIds.length > 0) {
    catalogBaseQuery.productSeller = { $nin: hiddenSellerIds };
  }

  if (followingOnly) {
    const followingSellerIds = await getVisibleFollowingSellerIds(String(userId));
    if (followingSellerIds.length === 0) {
      return emptyCatalogPage(page, limit);
    }
    const existingSellerFilter = catalogBaseQuery.productSeller;
    if (existingSellerFilter?.$in) {
      const allowed = new Set(existingSellerFilter.$in.map((id) => String(id)));
      const intersection = followingSellerIds.filter((id) => allowed.has(String(id)));
      catalogBaseQuery.productSeller = { $in: intersection };
    } else {
      catalogBaseQuery.productSeller = { $in: followingSellerIds };
    }
  }

  const catalogSearchResult = await buildProductCatalogSearchQuery(
    query.search,
    catalogBaseQuery,
    { preferAtlas: isProductAtlasSearchEnabled() },
  );

  if (followingOnly && catalogBaseQuery.productSeller?.$in?.length === 0) {
    return emptyCatalogPage(page, limit);
  }

  if (
    (premiumOnly || confirmedOnly) &&
    catalogBaseQuery.productSeller?.$in?.length === 0
  ) {
    return emptyCatalogPage(page, limit);
  }

  const catalogSortBuyerCity = null;

  const [products, total] = await Promise.all([
    findCatalogProductsPage(
      catalogSearchResult,
      sort,
      skip,
      limit,
      catalogSortBuyerCity,
      viewerRegionCode,
    ),
    countCatalogProducts(catalogSearchResult),
  ]);

  let productsPayload = await attachProductAvailablePurchaseQuantity(products);
  if (isStaff) {
    const openSalesIds = await getProductIdsWithOpenSales(
      products.map((p) => String(p._id)),
    );
    productsPayload = productsPayload.map((product) => ({
      ...product,
      hasOpenSales: openSalesIds.has(String(product._id)),
    }));
  }

  return {
    products: productsPayload,
    pagination: buildPagination(page, limit, total),
  };
}
