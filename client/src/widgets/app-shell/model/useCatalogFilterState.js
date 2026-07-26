import { useCallback, useEffect, useMemo, useState } from "react";

import { isCatalogBrowserLandingSearch } from "../../../entities/product-category-display/lib/catalogBrowserLanding.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import {
  CATALOG_SORT_CONFIRMED,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_PREMIUM,
  CATALOG_SORT_VIEWS,
  MY_PRODUCTS_MODERATION_FILTER_ALL,
} from "../../../entities/product/model/productConstants.js";
import { parseCatalogQueryFromSearchParams } from "../../../entities/product/lib/catalogCatalogQuery.js";
import {
  readInitialCatalogCategory,
  readInitialCatalogQuery,
} from "../lib/catalogShellConstants.js";

/**
 * @param {object} params
 */
export function useCatalogFilterState({
  location,
  catalogMainView,
  isMyProductsRoute,
  isCatalogBrowserMainViewActive,
  isCatalogShellView,
  submittedProductSearchTerm,
  initialCatalogQuery,
  isAuthorized,
  setIsLoginModalOpen,
  setMyProductsModerationFilter,
}) {
  const [selectedProductCategory, setSelectedProductCategory] = useState(() =>
    readInitialCatalogCategory(),
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => readInitialCatalogQuery()?.categoryId ?? null,
  );
  const [sellerPersonalCategoryId, setSellerPersonalCategoryId] = useState(
    () => readInitialCatalogQuery()?.sellerPersonalCategoryId ?? null,
  );
  const [categoryTreeLabel, setCategoryTreeLabel] = useState(null);
  const [catalogSort, setCatalogSort] = useState(
    () => initialCatalogQuery?.sort ?? CATALOG_SORT_NEWEST,
  );
  const [catalogFollowingOnly, setCatalogFollowingOnly] = useState(
    () => initialCatalogQuery?.followingOnly ?? false,
  );
  const [catalogAuctionOnly, setCatalogAuctionOnly] = useState(
    () => initialCatalogQuery?.auctionOnly ?? false,
  );
  const [catalogInstallmentOnly, setCatalogInstallmentOnly] = useState(
    () => initialCatalogQuery?.installmentOnly ?? false,
  );
  const [catalogSaleOnly, setCatalogSaleOnly] = useState(
    () => initialCatalogQuery?.saleOnly ?? false,
  );

  const catalogQueryFromUrl = useMemo(
    () => parseCatalogQueryFromSearchParams(new URLSearchParams(location.search)),
    [location.search],
  );

  // Каталог фильтруется отправленным запросом («Найти»), а не текстом в поле.
  const appliedProductSearchTerm = submittedProductSearchTerm;
  const hasProductSearchQuery = appliedProductSearchTerm.trim() !== "";
  const isMineMode = isMyProductsRoute;
  const isCatalogUrlFilterSurface =
    catalogMainView === "catalog-browser" || catalogMainView === "catalog";
  const activeCatalogBrowserCategory = isCatalogUrlFilterSurface
    ? catalogQueryFromUrl.category
    : null;
  const activeCatalogBrowserCategoryId =
    isCatalogUrlFilterSurface && IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED
      ? catalogQueryFromUrl.categoryId
      : null;
  const isCatalogBrowserLanding =
    isCatalogBrowserMainViewActive &&
    isCatalogBrowserLandingSearch(location.search, hasProductSearchQuery);
  const isCatalogBrowserProductsView =
    isCatalogBrowserMainViewActive && !isCatalogBrowserLanding;
  const isCatalogProductsView = isCatalogShellView || isCatalogBrowserProductsView;

  const handleCatalogSortChange = useCallback(
    (value) => {
      if (catalogAuctionOnly && value === CATALOG_SORT_VIEWS) {
        setCatalogAuctionOnly(false);
      }
      setCatalogSort(value);
    },
    [catalogAuctionOnly],
  );

  const handleCatalogFollowingOnlyToggle = useCallback(() => {
    if (!isAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }
    setCatalogFollowingOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogAuctionOnly(false);
      }
      return next;
    });
  }, [isAuthorized, setIsLoginModalOpen]);

  const handleCatalogAuctionOnlyToggle = useCallback(() => {
    setCatalogAuctionOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogFollowingOnly(false);
        setCatalogSort((currentSort) =>
          currentSort === CATALOG_SORT_VIEWS ? CATALOG_SORT_NEWEST : currentSort,
        );
      }
      return next;
    });
  }, []);

  const handleCatalogSaleOnlyToggle = useCallback(() => {
    setCatalogSaleOnly((prev) => !prev);
  }, []);

  const handleCatalogInstallmentOnlyToggle = useCallback(() => {
    setCatalogInstallmentOnly((prev) => !prev);
  }, []);

  const applyCatalogQueryState = useCallback(
    ({
      sort,
      category,
      categoryId,
      sellerPersonalCategoryId: nextSellerPersonalCategoryId = null,
      followingOnly,
      auctionOnly,
      installmentOnly,
      saleOnly,
    }) => {
      setCatalogSort(sort);
      setSelectedProductCategory(category);
      setSelectedCategoryId(categoryId);
      setSellerPersonalCategoryId(nextSellerPersonalCategoryId);
      if (!categoryId && !nextSellerPersonalCategoryId) {
        setCategoryTreeLabel(null);
      }
      setCatalogFollowingOnly(followingOnly);
      setCatalogAuctionOnly(auctionOnly);
      setCatalogInstallmentOnly(installmentOnly);
      setCatalogSaleOnly(saleOnly);
    },
    [],
  );

  useEffect(() => {
    if (!isMineMode) {
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
    }
  }, [isMineMode, setMyProductsModerationFilter]);

  useEffect(() => {
    if (
      isMineMode &&
      (catalogSort === CATALOG_SORT_PREMIUM || catalogSort === CATALOG_SORT_CONFIRMED)
    ) {
      setCatalogSort(CATALOG_SORT_NEWEST);
    }
  }, [isMineMode, catalogSort]);

  const resetCatalogFollowingOnLogout = useCallback(() => {
    setCatalogFollowingOnly(false);
  }, []);

  return {
    selectedProductCategory,
    setSelectedProductCategory,
    selectedCategoryId,
    setSelectedCategoryId,
    sellerPersonalCategoryId,
    setSellerPersonalCategoryId,
    categoryTreeLabel,
    setCategoryTreeLabel,
    catalogSort,
    setCatalogSort,
    catalogFollowingOnly,
    setCatalogFollowingOnly,
    catalogAuctionOnly,
    setCatalogAuctionOnly,
    catalogInstallmentOnly,
    setCatalogInstallmentOnly,
    catalogSaleOnly,
    setCatalogSaleOnly,
    appliedProductSearchTerm,
    catalogQueryFromUrl,
    hasProductSearchQuery,
    isMineMode,
    activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId,
    isCatalogBrowserLanding,
    isCatalogBrowserProductsView,
    isCatalogProductsView,
    handleCatalogSortChange,
    handleCatalogFollowingOnlyToggle,
    handleCatalogAuctionOnlyToggle,
    handleCatalogSaleOnlyToggle,
    handleCatalogInstallmentOnlyToggle,
    applyCatalogQueryState,
    resetCatalogFollowingOnLogout,
  };
}
