import { useEffect } from "react";

import { isExplicitCatalogNewestFeedSearch } from "../../../entities/product-category-display/lib/catalogBrowserLanding.js";
import { findCategoryRootIdForLegacySlug } from "../../../entities/product-category-tree/lib/findCategoryRootIdForLegacySlug.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import { CATALOG_SORT_NEWEST } from "../../../entities/product/model/productConstants.js";
import { catalogMainViewToPathname } from "../../../shared/lib/catalogMainViewPaths.js";
import {
  areCatalogSearchParamsEqual,
  buildCatalogBrowserSearchParams,
  buildCatalogSearchParams,
  parseCatalogQueryFromSearchParams,
} from "../../../entities/product/lib/catalogCatalogQuery.js";

/**
 * @param {object} params
 */
export function useCatalogQuerySync({
  catalogMainView,
  location,
  navigate,
  isCompactLayout,
  catalogSort,
  selectedProductCategory,
  selectedCategoryId,
  sellerPersonalCategoryId,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  catalogRentalOnly,
  catalogAffiliateOnly,
  catalogWholesaleOnly,
  catalogOriginalOnly,
  catalogNear,
  catalogQueryFromUrl,
  setCatalogSort,
  setSelectedProductCategory,
  setSelectedCategoryId,
  setSellerPersonalCategoryId,
  setCategoryTreeLabel,
  setCatalogFollowingOnly,
  setCatalogAuctionOnly,
  setCatalogInstallmentOnly,
  setCatalogSaleOnly,
  setCatalogRentalOnly,
  setCatalogAffiliateOnly,
  setCatalogWholesaleOnly,
  setCatalogOriginalOnly,
  setCatalogNear,
  categoryRootsRef,
}) {
  useEffect(() => {
    if (catalogMainView !== "catalog" || isCompactLayout) {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(
      new URLSearchParams(location.search),
    );
    const hasScopedProductFilters =
      Boolean(parsed.category) ||
      Boolean(parsed.categoryId) ||
      Boolean(parsed.sellerPersonalCategoryId);
    if (!hasScopedProductFilters) {
      return;
    }
    const built = buildCatalogBrowserSearchParams(parsed);
    const search = built.toString();
    navigate(
      `${catalogMainViewToPathname("catalog-browser")}${search ? `?${search}` : ""}`,
      { replace: true },
    );
  }, [catalogMainView, isCompactLayout, location.search, navigate]);

  useEffect(() => {
    if (catalogMainView !== "catalog" && catalogMainView !== "catalog-browser") {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(
      new URLSearchParams(location.search),
    );
    setCatalogSort((prev) => (prev === parsed.sort ? prev : parsed.sort));
    const applyScopedFilters =
      catalogMainView === "catalog-browser" || isCompactLayout;
    if (applyScopedFilters) {
      setSelectedProductCategory((prev) =>
        prev === parsed.category ? prev : parsed.category,
      );
      setSelectedCategoryId((prev) => {
        const nextId = IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED
          ? parsed.categoryId
          : null;
        return prev === nextId ? prev : nextId;
      });
      setSellerPersonalCategoryId((prev) =>
        prev === parsed.sellerPersonalCategoryId
          ? prev
          : parsed.sellerPersonalCategoryId,
      );
    } else {
      setSelectedProductCategory(null);
      setSelectedCategoryId(null);
      setSellerPersonalCategoryId(null);
      setCategoryTreeLabel(null);
    }
    setCatalogFollowingOnly((prev) =>
      prev === parsed.followingOnly ? prev : parsed.followingOnly,
    );
    setCatalogAuctionOnly((prev) =>
      prev === parsed.auctionOnly ? prev : parsed.auctionOnly,
    );
    setCatalogInstallmentOnly((prev) =>
      prev === parsed.installmentOnly ? prev : parsed.installmentOnly,
    );
    setCatalogSaleOnly((prev) => (prev === parsed.saleOnly ? prev : parsed.saleOnly));
    setCatalogRentalOnly((prev) =>
      prev === parsed.rentalOnly ? prev : parsed.rentalOnly,
    );
    setCatalogAffiliateOnly((prev) =>
      prev === parsed.affiliateOnly ? prev : parsed.affiliateOnly,
    );
    setCatalogWholesaleOnly((prev) =>
      prev === parsed.wholesaleOnly ? prev : parsed.wholesaleOnly,
    );
    setCatalogOriginalOnly((prev) =>
      prev === parsed.originalOnly ? prev : parsed.originalOnly,
    );
    setCatalogNear((prev) => (prev === parsed.near ? prev : parsed.near));
  }, [
    location.search,
    catalogMainView,
    isCompactLayout,
    setCatalogAuctionOnly,
    setCatalogFollowingOnly,
    setCatalogInstallmentOnly,
    setCatalogSaleOnly,
    setCatalogRentalOnly,
    setCatalogAffiliateOnly,
    setCatalogWholesaleOnly,
    setCatalogOriginalOnly,
    setCatalogNear,
    setCatalogSort,
    setCategoryTreeLabel,
    setSelectedCategoryId,
    setSelectedProductCategory,
    setSellerPersonalCategoryId,
  ]);

  useEffect(() => {
    if (catalogMainView !== "catalog" && catalogMainView !== "catalog-browser") {
      return;
    }
    const scopedOnHome = catalogMainView === "catalog" && isCompactLayout;
    const writeScopedFilters =
      catalogMainView === "catalog-browser" || scopedOnHome;
    const nextCategory = writeScopedFilters ? selectedProductCategory : null;
    const nextCategoryId = writeScopedFilters ? selectedCategoryId : null;
    const nextSellerPersonalCategoryId = writeScopedFilters
      ? sellerPersonalCategoryId
      : null;
    const isDefaultNewestFeed =
      catalogSort === CATALOG_SORT_NEWEST &&
      !nextCategory &&
      !nextCategoryId &&
      !nextSellerPersonalCategoryId &&
      !catalogFollowingOnly &&
      !catalogAuctionOnly &&
      !catalogInstallmentOnly &&
      !catalogSaleOnly &&
      !catalogRentalOnly &&
      !catalogAffiliateOnly &&
      !catalogWholesaleOnly &&
      !catalogOriginalOnly &&
      !catalogNear;
    const omitDefaultSort =
      isDefaultNewestFeed && !isExplicitCatalogNewestFeedSearch(location.search);
    const queryPayload = {
      sort: catalogSort,
      category: nextCategory,
      categoryId: nextCategoryId,
      sellerPersonalCategoryId: nextSellerPersonalCategoryId,
      followingOnly: catalogFollowingOnly,
      auctionOnly: catalogAuctionOnly,
      installmentOnly: catalogInstallmentOnly,
      saleOnly: catalogSaleOnly,
      rentalOnly: catalogRentalOnly,
      affiliateOnly: catalogAffiliateOnly,
      wholesaleOnly: catalogWholesaleOnly,
      originalOnly: catalogOriginalOnly,
      near: catalogNear,
    };
    const built =
      catalogMainView === "catalog-browser"
        ? buildCatalogBrowserSearchParams(queryPayload, { omitDefaultSort })
        : buildCatalogSearchParams(queryPayload);
    const current = new URLSearchParams(location.search);
    if (areCatalogSearchParamsEqual(built, current)) {
      return;
    }
    const search = built.toString();
    navigate(
      {
        pathname: catalogMainViewToPathname(catalogMainView),
        search: search ? `?${search}` : "",
      },
      { replace: true },
    );
  }, [
    catalogMainView,
    isCompactLayout,
    catalogSort,
    selectedProductCategory,
    selectedCategoryId,
    sellerPersonalCategoryId,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    catalogRentalOnly,
    catalogAffiliateOnly,
    catalogWholesaleOnly,
    catalogOriginalOnly,
    catalogNear,
    navigate,
  ]);

  useEffect(() => {
    if (catalogMainView !== "catalog-browser" && !(catalogMainView === "catalog" && isCompactLayout)) {
      return;
    }
    const parsed = catalogQueryFromUrl;
    if (parsed.categoryId) {
      if (IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED) {
        return;
      }
      const nextQuery = { ...parsed, categoryId: null };
      const built = buildCatalogBrowserSearchParams(nextQuery, {
        omitDefaultSort: false,
      });
      const current = new URLSearchParams(location.search);
      if (areCatalogSearchParamsEqual(built, current)) {
        return;
      }
      navigate(
        {
          pathname: catalogMainViewToPathname(catalogMainView),
          search: `?${built.toString()}`,
        },
        { replace: true },
      );
      return;
    }
    if (!IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED || !parsed.category) {
      return;
    }
    const rootId = findCategoryRootIdForLegacySlug(
      categoryRootsRef.current,
      parsed.category,
    );
    if (!rootId) {
      return;
    }
    const nextQuery = {
      ...parsed,
      category: null,
      categoryId: rootId,
    };
    const built = buildCatalogBrowserSearchParams(nextQuery, {
      omitDefaultSort: false,
    });
    const current = new URLSearchParams(location.search);
    if (areCatalogSearchParamsEqual(built, current)) {
      return;
    }
    navigate(
      {
        pathname: catalogMainViewToPathname(catalogMainView),
        search: `?${built.toString()}`,
      },
      { replace: true },
    );
  }, [
    catalogMainView,
    isCompactLayout,
    catalogQueryFromUrl,
    location.search,
    navigate,
    categoryRootsRef,
  ]);
}
