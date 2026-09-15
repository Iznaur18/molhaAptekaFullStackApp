import { USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE } from "../../constants/userFollowConstants.js";
import { AppError } from "../../errors/AppError.js";
import { resolveViewerRegionCodeForRequest } from "../user/userRegionCatalogFilter.js";
import { attachCatalogDistanceMeters } from "./attachCatalogDistanceMeters.js";
import {
  attachProductSellerClosedState,
  stripProductSellerClosedState,
} from "./attachProductSellerClosedState.js";
import { buildProductCatalogSearchQuery } from "./buildProductCatalogSearchQuery.js";
import {
  buildCatalogFilterClauses,
  isCatalogSellerSetEmpty,
  loadCatalogFilterContext,
  mergeCatalogFilterClauses,
  parseCatalogFilters,
} from "./catalogProductFilters.js";
import {
  buildCatalogProductsCacheKey,
  getCachedCatalogProducts,
  setCachedCatalogProducts,
} from "./catalogProductsResponseCache.js";
import {
  countCatalogProducts,
  findCatalogProductsPage,
} from "./findCatalogProductsPage.js";
import { isProductAtlasSearchEnabled } from "./isProductAtlasSearchEnabled.js";
import { parseProductSortFromQuery } from "./productCatalogQuery.js";
import { buildPagination, parsePagination } from "./productListQueryHelpers.js";
import { getProductIdsWithOpenSales } from "./productOrderLocks.js";
import { attachProductAvailablePurchaseQuantity } from "./productStock.js";
import { resolveCatalogNearContext } from "./resolveCatalogNearContext.js";
import { resolveOptionalViewerCatalogGeo } from "./resolveOptionalViewerCatalogGeo.js";

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
  const nearEnabled = String(query.near).toLowerCase() === "true";
  const nearContext = nearEnabled ? await resolveCatalogNearContext(userId) : null;
  const viewerGeo = nearContext ?? (await resolveOptionalViewerCatalogGeo(userId));
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
  const sort = parseProductSortFromQuery(query);
  const filters = parseCatalogFilters(query);

  if (filters.followingOnly && !userId) {
    throw new AppError(401, USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE);
  }

  const resolvedNearContext = filters.near
    ? (nearContext ?? (await resolveCatalogNearContext(userId)))
    : null;

  const filterContext = await loadCatalogFilterContext({ userId, filters });
  const clauses = buildCatalogFilterClauses(filters, filterContext);
  if (!clauses || isCatalogSellerSetEmpty(filters, filterContext)) {
    return emptyCatalogPage(page, limit);
  }

  const viewerRegionCode = await resolveViewerRegionCodeForRequest({
    userId,
    queryRegionCode: query.regionCode,
  });

  const catalogSearchResult = await buildProductCatalogSearchQuery(
    query.search,
    mergeCatalogFilterClauses(clauses),
    { preferAtlas: isProductAtlasSearchEnabled() && !filters.near },
  );

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
    countCatalogProducts(catalogSearchResult, resolvedNearContext, viewerRegionCode),
  ]);

  let productsPayload = await attachProductAvailablePurchaseQuantity(products);
  if (!filters.near) {
    productsPayload = attachCatalogDistanceMeters(
      productsPayload,
      viewerGeo ?? nearContext,
    );
  }
  if (filterContext.isStaff) {
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
