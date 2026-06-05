import {
  MY_PRODUCTS_MODERATION_FILTER_VALUES,
  PRODUCT_MODERATION_APPROVED,
} from "../../constants/productModerationConstants.js";
import {
  PRODUCT_SORT_CONFIRMED,
  PRODUCT_SORT_PREMIUM,
} from "../../constants/productCatalogSort.js";
import { getHiddenSellerIds, isUserStaff } from "../../utils/adminUserGuard.js";
import { getConfirmedSellerIds } from "../../utils/confirmedSellerCatalog.js";
import {
  filterSellerIdsExcludingHidden,
  getPremiumSellerIds,
} from "../../utils/premiumSellerCatalog.js";
import { getProductIdsWithOpenSales } from "../../utils/productOrderLocks.js";
import { buildProductCatalogSearchQuery } from "../../utils/buildProductCatalogSearchQuery.js";
import {
  countCatalogProducts,
  findCatalogProductsPage,
} from "../../utils/findCatalogProductsPage.js";
import { isProductAtlasSearchEnabled } from "../../utils/isProductAtlasSearchEnabled.js";
import {
  countProducts,
  findProductsPage,
  parseProductSortFromQuery,
} from "../../utils/productCatalogQuery.js";
import { USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE } from "../../constants/userFollowConstants.js";
import { getVisibleFollowingSellerIds } from "../../utils/userFollowHelpers.js";
import { attachProductAvailablePurchaseQuantity } from "../../utils/productStock.js";
import { buildProductSaleOnlyMatch } from "../../utils/productDiscount.js";
import {
  mergeProductCatalogCategoryFilter,
  parseCategoryIdFromQuery,
} from "../../utils/mergeProductCatalogCategoryFilter.js";
import { errorRes, successRes } from "../../utils/index.js";

const parseTruthyQueryFlag = (raw) =>
  raw != null && String(raw).trim().toLowerCase() === "true";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const categoryFromQuery = (query) => {
  const raw = query?.productCategory;
  if (raw == null || String(raw).trim() === "") return null;
  return String(raw).trim();
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const getProductsController = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const category = categoryFromQuery(req.query);
    const categoryId = parseCategoryIdFromQuery(req.query.categoryId);
    const premiumOnly = req.query.sort === PRODUCT_SORT_PREMIUM;
    const confirmedOnly = req.query.sort === PRODUCT_SORT_CONFIRMED;
    const sort = parseProductSortFromQuery(req.query);
    const followingOnly = parseTruthyQueryFlag(req.query.followingOnly);
    const auctionOnly = parseTruthyQueryFlag(req.query.auctionOnly);
    const installmentOnly = parseTruthyQueryFlag(req.query.installmentOnly);
    const saleOnly = parseTruthyQueryFlag(req.query.saleOnly);

    if (followingOnly && !req.userId) {
      return errorRes(res, 401, USER_FOLLOW_FOLLOWING_ONLY_AUTH_MESSAGE);
    }

    const hiddenSellerIds = await getHiddenSellerIds();
    const isStaff = await isUserStaff(req.userId);
    const includeHidden =
      isStaff && String(req.query.includeHidden).toLowerCase() === "true";

    const catalogBaseQuery = await mergeProductCatalogCategoryFilter(
      {
        productModerationStatus: PRODUCT_MODERATION_APPROVED,
      },
      { categoryId, productCategory: category },
    );

    if (auctionOnly) {
      catalogBaseQuery.productAuctionEnabled = true;
    }
    if (installmentOnly) {
      catalogBaseQuery.productInstallmentEnabled = true;
    }
    if (saleOnly) {
      Object.assign(catalogBaseQuery, buildProductSaleOnlyMatch());
    }
    if (!includeHidden) {
      catalogBaseQuery.productIsAvailable = { $ne: false };
      catalogBaseQuery.productStockQuantity = { $gt: 0 };
    }

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
      const followingSellerIds = await getVisibleFollowingSellerIds(String(req.userId));
      if (followingSellerIds.length === 0) {
        return successRes(res, {
          products: [],
          pagination: buildPagination(page, limit, 0),
        });
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
      req.query.search,
      catalogBaseQuery,
      { preferAtlas: isProductAtlasSearchEnabled() },
    );

    if (followingOnly && catalogBaseQuery.productSeller?.$in?.length === 0) {
      return successRes(res, {
        products: [],
        pagination: buildPagination(page, limit, 0),
      });
    }

    if (
      (premiumOnly || confirmedOnly) &&
      catalogBaseQuery.productSeller?.$in?.length === 0
    ) {
      return successRes(res, {
        products: [],
        pagination: buildPagination(page, limit, 0),
      });
    }

    const [products, total] = await Promise.all([
      findCatalogProductsPage(catalogSearchResult, sort, skip, limit),
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

    return successRes(res, {
      products: productsPayload,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, "Ошибка при получении продуктов");
  }
};

const moderationStatusFromQuery = (query) => {
  const raw = query?.moderationStatus;
  if (raw == null || String(raw).trim() === "") {
    return null;
  }
  const value = String(raw).trim();
  return MY_PRODUCTS_MODERATION_FILTER_VALUES.includes(value) ? value : null;
};

export const getMyProductsController = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const category = categoryFromQuery(req.query);
    const sort = parseProductSortFromQuery(req.query);
    const moderationStatus = moderationStatusFromQuery(req.query);
    const myProductsBaseQuery = await mergeProductCatalogCategoryFilter(
      {
        productSeller: req.userId,
        ...(moderationStatus ? { productModerationStatus: moderationStatus } : {}),
      },
      {
        categoryId: parseCategoryIdFromQuery(req.query.categoryId),
        productCategory: category,
      },
    );

    const { query: productsQuery, searchRank } = await buildProductCatalogSearchQuery(
      req.query.search,
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

    return successRes(res, {
      products: productsWithSalesFlags,
      pagination: buildPagination(page, limit, total),
    });
  } catch (error) {
    console.error(error);
    return errorRes(res, 500, "Ошибка при получении своих продуктов");
  }
};
