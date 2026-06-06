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
  CATALOG_QUERY_PARAM_CATEGORY,
  parseCatalogQueryFromSearchParams,
} from "../lib/catalogCatalogQuery.js";

/**
 * @param {object} params
 */
export function useCatalogQuerySync({
  catalogMainView,
  location,
  navigate,
  catalogSort,
  selectedProductCategory,
  selectedCategoryId,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  catalogQueryFromUrl,
  setCatalogSort,
  setSelectedProductCategory,
  setSelectedCategoryId,
  setCategoryTreeLabel,
  setCatalogFollowingOnly,
  setCatalogAuctionOnly,
  setCatalogInstallmentOnly,
  setCatalogSaleOnly,
  categoryRootsRef,
}) {
  useEffect(() => {
    if (catalogMainView !== "catalog") {
      return;
    }
    const params = new URLSearchParams(location.search);
    if (!params.has(CATALOG_QUERY_PARAM_CATEGORY)) {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(params);
    const built = buildCatalogBrowserSearchParams(parsed);
    const search = built.toString();
    navigate(
      `${catalogMainViewToPathname("catalog-browser")}${search ? `?${search}` : ""}`,
      { replace: true },
    );
  }, [catalogMainView, location.search, navigate]);

  useEffect(() => {
    if (catalogMainView !== "catalog" && catalogMainView !== "catalog-browser") {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(
      new URLSearchParams(location.search),
    );
    setCatalogSort((prev) => (prev === parsed.sort ? prev : parsed.sort));
    if (catalogMainView === "catalog-browser") {
      setSelectedProductCategory((prev) =>
        prev === parsed.category ? prev : parsed.category,
      );
      setSelectedCategoryId((prev) => {
        const nextId = IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED
          ? parsed.categoryId
          : null;
        return prev === nextId ? prev : nextId;
      });
    } else {
      setSelectedProductCategory(null);
      setSelectedCategoryId(null);
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
  }, [
    location.search,
    catalogMainView,
    setCatalogAuctionOnly,
    setCatalogFollowingOnly,
    setCatalogInstallmentOnly,
    setCatalogSaleOnly,
    setCatalogSort,
    setCategoryTreeLabel,
    setSelectedCategoryId,
    setSelectedProductCategory,
  ]);

  useEffect(() => {
    if (catalogMainView !== "catalog" && catalogMainView !== "catalog-browser") {
      return;
    }
    const isDefaultNewestFeed =
      catalogSort === CATALOG_SORT_NEWEST &&
      !selectedProductCategory &&
      !selectedCategoryId &&
      !catalogFollowingOnly &&
      !catalogAuctionOnly &&
      !catalogInstallmentOnly &&
      !catalogSaleOnly;
    const omitDefaultSort =
      isDefaultNewestFeed &&
      !isExplicitCatalogNewestFeedSearch(location.search);
    const built =
      catalogMainView === "catalog-browser"
        ? buildCatalogBrowserSearchParams(
            {
              sort: catalogSort,
              category: selectedProductCategory,
              categoryId: selectedCategoryId,
              followingOnly: catalogFollowingOnly,
              auctionOnly: catalogAuctionOnly,
              installmentOnly: catalogInstallmentOnly,
              saleOnly: catalogSaleOnly,
            },
            { omitDefaultSort },
          )
        : buildCatalogSearchParams({
            sort: catalogSort,
            category: null,
            followingOnly: catalogFollowingOnly,
            auctionOnly: catalogAuctionOnly,
            installmentOnly: catalogInstallmentOnly,
            saleOnly: catalogSaleOnly,
          });
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
    catalogSort,
    selectedProductCategory,
    selectedCategoryId,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    navigate,
    location.search,
  ]);

  useEffect(() => {
    if (catalogMainView !== "catalog-browser") {
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
          pathname: catalogMainViewToPathname("catalog-browser"),
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
        pathname: catalogMainViewToPathname("catalog-browser"),
        search: `?${built.toString()}`,
      },
      { replace: true },
    );
  }, [
    catalogMainView,
    catalogQueryFromUrl,
    location.search,
    navigate,
    categoryRootsRef,
  ]);
}
