import {
  PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
  PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
} from "@molha/api-contract";
import {
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
import {
  attachProductSellerClosedState,
  stripProductSellerClosedState,
} from "./attachProductSellerClosedState.js";
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
import { resolveCatalogNearContext } from "./resolveCatalogNearContext.js";
import { resolveOptionalViewerCatalogGeo } from "./resolveOptionalViewerCatalogGeo.js";
import { attachCatalogDistanceMeters } from "./attachCatalogDistanceMeters.js";

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
  const { expireProductFlashSales } = await import("./productFlashSaleExpiry.js");
  await expireProductFlashSales();

  const includeHidden = String(query.includeHidden).toLowerCase() === "true";
  const nearEnabled = parseTruthyQueryFlag(query.near);
  const nearContext = nearEnabled
    ? await resolveCatalogNearContext(userId)
    : null;
  const viewerGeo =
    nearContext ?? (await resolveOptionalViewerCatalogGeo(userId));
  const cacheKey = buildCatalogProductsCacheKey({
    userId,
    query,
    nearPoint: viewerGeo
      ? `${viewerGeo.lat.toFixed(5)},${viewerGeo.lon.toFixed(5)}`
      : null,
  });

  if (!includeHidden) {
    const cached = getCachedCatalogProducts(cacheKey);
    if (cached) {
      return {
        ...cached,
        products: await attachProductSellerClosedState(cached.products, userId ?? null),
      };
    }
  }

  const result = await loadCatalogProducts({
    userId,
    query,
    nearContext,
    viewerGeo,
  });

  if (!includeHidden) {
    setCachedCatalogProducts(cacheKey, {
      ...result,
      products: stripProductSellerClosedState(result.products),
    });
  }

  return {
    ...result,
    products: await attachProductSellerClosedState(result.products, userId ?? null),
  };
}

/**
 * @param {{
 *   userId?: string;
 *   query: Record<string, unknown>;
 *   nearContext?: { lat: number; lon: number; maxDistanceMeters: number } | null;
 *   viewerGeo?: { lat: number; lon: number } | null;
 * }} input
 */
async function loadCatalogProducts({
  userId,
  query,
  nearContext = null,
  viewerGeo = null,
}) {
  const { page, limit, skip } = parsePagination(query);
  const category = categoryFromQuery(query);
  const categoryId = parseCategoryIdFromQuery(query.categoryId);
  const sellerPersonalCategoryId = parseCategoryIdFromQuery(
    query.sellerPersonalCategoryId,
  );
  const premiumOnly = query.sort === PRODUCT_SORT_PREMIUM;
  const confirmedOnly = query.sort === PRODUCT_SORT_CONFIRMED;
  const reviewsOnly = query.sort === PRODUCT_SORT_REVIEWS;
  const sort = parseProductSortFromQuery(query);
  const followingOnly = parseTruthyQueryFlag(query.followingOnly);
  const auctionOnly = parseTruthyQueryFlag(query.auctionOnly);
  const installmentOnly = parseTruthyQueryFlag(query.installmentOnly);
  const saleOnly = parseTruthyQueryFlag(query.saleOnly);
  const rentalOnly = parseTruthyQueryFlag(query.rentalOnly);
  const affiliateOnly = parseTruthyQueryFlag(query.affiliateOnly);
  const wholesaleOnly = parseTruthyQueryFlag(query.wholesaleOnly);
  const buyNFreeOnly = parseTruthyQueryFlag(query.buyNFreeOnly);
  const originalOnly = parseTruthyQueryFlag(query.originalOnly);
  const nearEnabled = parseTruthyQueryFlag(query.near);
  const flashSaleOnly = parseTruthyQueryFlag(query.flashSaleOnly);

  if (followingOnly && !userId) {
    throw new AppError(401, USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE);
  }

  const resolvedNearContext = nearEnabled
    ? nearContext ?? (await resolveCatalogNearContext(userId))
    : null;

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
  if (rentalOnly) {
    catalogBaseQuery.productRentalEnabled = true;
  }
  if (affiliateOnly) {
    catalogBaseQuery.affiliateEnabled = true;
  }
  if (wholesaleOnly) {
    catalogBaseQuery.productWholesaleEnabled = true;
  }
  if (buyNFreeOnly) {
    catalogBaseQuery.productBuyNFreeEnabled = true;
    catalogBaseQuery.productBuyNFreeThreshold = {
      $gte: PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
      $lte: PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
    };
  }
  if (originalOnly) {
    catalogBaseQuery.productIsOriginal = true;
  }
  if (flashSaleOnly) {
    const { buildProductFlashSaleActiveCatalogMatch } = await import(
      "./productFlashSaleExpiry.js"
    );
    Object.assign(catalogBaseQuery, buildProductFlashSaleActiveCatalogMatch());
  }
  if (reviewsOnly) {
    catalogBaseQuery.reviewCount = { $gte: PRODUCT_CATALOG_REVIEWS_MIN_REVIEW_COUNT };
  }
  if (!includeHiddenStaff) {
    catalogBaseQuery.productIsAvailable = { $ne: false };
    catalogBaseQuery.$and = [
      ...(Array.isArray(catalogBaseQuery.$and) ? catalogBaseQuery.$and : []),
      { $or: [{ productOutOfStock: true }, { productStockQuantity: { $gt: 0 } }] },
    ];
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
    { preferAtlas: isProductAtlasSearchEnabled() && !nearEnabled },
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
      resolvedNearContext,
    ),
    countCatalogProducts(
      catalogSearchResult,
      resolvedNearContext,
      viewerRegionCode,
    ),
  ]);

  let productsPayload = await attachProductAvailablePurchaseQuantity(products);
  if (!nearEnabled) {
    productsPayload = attachCatalogDistanceMeters(
      productsPayload,
      viewerGeo ?? nearContext,
    );
  }
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
