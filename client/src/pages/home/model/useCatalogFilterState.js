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
import { PRODUCT_SEARCH_UI } from "../../../shared/config/appUiCopy.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import { parseCatalogQueryFromSearchParams } from "../lib/catalogCatalogQuery.js";
import {
  readInitialCatalogCategory,
  readInitialCatalogQuery,
} from "../lib/homePageConstants.js";

/**
 * @param {object} params
 */
export function useCatalogFilterState({
  location,
  catalogMainView,
  isMyProductsRoute,
  isCatalogBrowserMainViewActive,
  isCatalogShellView,
  productSearchTerm,
  initialCatalogQuery,
  isAuthorized,
  setIsLoginModalOpen,
  canModerateProducts,
  setMyProductsModerationFilter,
}) {
  const [selectedProductCategory, setSelectedProductCategory] = useState(() =>
    readInitialCatalogCategory(),
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    () => readInitialCatalogQuery()?.categoryId ?? null,
  );
  const [categoryTreeLabel, setCategoryTreeLabel] = useState(null);
  const [catalogSort, setCatalogSort] = useState(
    () => initialCatalogQuery?.sort ?? CATALOG_SORT_NEWEST,
  );
  const [showHiddenCatalogProducts, setShowHiddenCatalogProducts] = useState(false);
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

  const debouncedProductSearchTerm = useDebouncedValue(
    productSearchTerm,
    PRODUCT_SEARCH_UI.DEBOUNCE_MS,
  );

  const catalogQueryFromUrl = useMemo(
    () => parseCatalogQueryFromSearchParams(new URLSearchParams(location.search)),
    [location.search],
  );

  const isProductSearchPending = productSearchTerm !== debouncedProductSearchTerm;
  const hasProductSearchQuery = debouncedProductSearchTerm.trim() !== "";
  const isMineMode = isMyProductsRoute;
  const activeCatalogBrowserCategory =
    catalogMainView === "catalog-browser" ? catalogQueryFromUrl.category : null;
  const activeCatalogBrowserCategoryId =
    catalogMainView === "catalog-browser" &&
    IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED
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

  const handleShowHiddenCatalogProductsToggle = useCallback(() => {
    setShowHiddenCatalogProducts((prev) => !prev);
  }, []);

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
      followingOnly,
      auctionOnly,
      installmentOnly,
      saleOnly,
    }) => {
      setCatalogSort(sort);
      setSelectedProductCategory(category);
      setSelectedCategoryId(categoryId);
      if (!categoryId) {
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

  useEffect(() => {
    if (!canModerateProducts) {
      setShowHiddenCatalogProducts(false);
    }
  }, [canModerateProducts]);

  const resetCatalogFollowingOnLogout = useCallback(() => {
    setCatalogFollowingOnly(false);
  }, []);

  return {
    selectedProductCategory,
    setSelectedProductCategory,
    selectedCategoryId,
    setSelectedCategoryId,
    categoryTreeLabel,
    setCategoryTreeLabel,
    catalogSort,
    setCatalogSort,
    showHiddenCatalogProducts,
    catalogFollowingOnly,
    setCatalogFollowingOnly,
    catalogAuctionOnly,
    setCatalogAuctionOnly,
    catalogInstallmentOnly,
    setCatalogInstallmentOnly,
    catalogSaleOnly,
    setCatalogSaleOnly,
    debouncedProductSearchTerm,
    catalogQueryFromUrl,
    isProductSearchPending,
    hasProductSearchQuery,
    isMineMode,
    activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId,
    isCatalogBrowserLanding,
    isCatalogBrowserProductsView,
    isCatalogProductsView,
    handleCatalogSortChange,
    handleShowHiddenCatalogProductsToggle,
    handleCatalogFollowingOnlyToggle,
    handleCatalogAuctionOnlyToggle,
    handleCatalogSaleOnlyToggle,
    handleCatalogInstallmentOnlyToggle,
    applyCatalogQueryState,
    resetCatalogFollowingOnLogout,
  };
}
