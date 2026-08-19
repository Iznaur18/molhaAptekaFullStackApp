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
import { userHasCatalogNearGeo } from "../../../entities/product/lib/userHasCatalogNearGeo.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { mainViewToPathname } from "../../../shared/lib/homeMainViewPaths.js";
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
  authUser = null,
  isAuthorized,
  isSessionReady = true,
  setIsLoginModalOpen,
  setMyProductsModerationFilter,
  navigate,
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
  const [catalogRentalOnly, setCatalogRentalOnly] = useState(
    () => initialCatalogQuery?.rentalOnly ?? false,
  );
  const [catalogAffiliateOnly, setCatalogAffiliateOnly] = useState(
    () => initialCatalogQuery?.affiliateOnly ?? false,
  );
  const [catalogWholesaleOnly, setCatalogWholesaleOnly] = useState(
    () => initialCatalogQuery?.wholesaleOnly ?? false,
  );
  const [catalogOriginalOnly, setCatalogOriginalOnly] = useState(
    () => initialCatalogQuery?.originalOnly ?? false,
  );
  const [catalogNear, setCatalogNear] = useState(
    () => initialCatalogQuery?.near ?? false,
  );
  const [catalogFlashSaleOnly, setCatalogFlashSaleOnly] = useState(
    () => initialCatalogQuery?.flashSaleOnly ?? false,
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
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
      }
      return next;
    });
  }, [isAuthorized, setIsLoginModalOpen]);

  const handleCatalogAuctionOnlyToggle = useCallback(() => {
    setCatalogAuctionOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogFollowingOnly(false);
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
        setCatalogSort((currentSort) =>
          currentSort === CATALOG_SORT_VIEWS ? CATALOG_SORT_NEWEST : currentSort,
        );
      }
      return next;
    });
  }, []);

  const handleCatalogSaleOnlyToggle = useCallback(() => {
    setCatalogSaleOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
      }
      return next;
    });
  }, []);

  const handleCatalogInstallmentOnlyToggle = useCallback(() => {
    setCatalogInstallmentOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
      }
      return next;
    });
  }, []);

  const handleCatalogRentalOnlyToggle = useCallback(() => {
    setCatalogRentalOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
      }
      return next;
    });
  }, []);

  const handleCatalogAffiliateOnlyToggle = useCallback(() => {
    setCatalogAffiliateOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
      }
      return next;
    });
  }, []);

  const handleCatalogWholesaleOnlyToggle = useCallback(() => {
    setCatalogWholesaleOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
      }
      return next;
    });
  }, []);

  const handleCatalogOriginalOnlyToggle = useCallback(() => {
    setCatalogOriginalOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogNear(false);
        setCatalogFlashSaleOnly(false);
      }
      return next;
    });
  }, []);

  const handleCatalogNearToggle = useCallback(() => {
    if (!isAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }
    if (catalogNear) {
      setCatalogNear(false);
      return;
    }
    if (!userHasCatalogNearGeo(authUser)) {
      const openProfile = window.confirm(
        `${HOME_PAGE_UI.NEAR_ADDRESS_REQUIRED}\n\n${HOME_PAGE_UI.NEAR_ADDRESS_REQUIRED_CONFIRM}`,
      );
      if (openProfile && typeof navigate === "function") {
        navigate(mainViewToPathname("edit-profile"));
      }
      return;
    }
    setCatalogFollowingOnly(false);
    setCatalogAuctionOnly(false);
    setCatalogInstallmentOnly(false);
    setCatalogSaleOnly(false);
    setCatalogRentalOnly(false);
    setCatalogAffiliateOnly(false);
    setCatalogWholesaleOnly(false);
    setCatalogOriginalOnly(false);
    setCatalogFlashSaleOnly(false);
    setCatalogNear(true);
  }, [authUser, catalogNear, isAuthorized, navigate, setIsLoginModalOpen]);

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
      rentalOnly = false,
      affiliateOnly = false,
      wholesaleOnly = false,
      originalOnly = false,
      near = false,
      flashSaleOnly = false,
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
      setCatalogRentalOnly(rentalOnly);
      setCatalogAffiliateOnly(affiliateOnly);
      setCatalogWholesaleOnly(wholesaleOnly);
      setCatalogOriginalOnly(originalOnly);
      setCatalogNear(near);
      setCatalogFlashSaleOnly(flashSaleOnly);
    },
    [],
  );

  useEffect(() => {
    if (!isMineMode) {
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
    }
  }, [isMineMode, setMyProductsModerationFilter]);

  useEffect(() => {
    if (!isSessionReady || !catalogNear) {
      return;
    }
    if (!isAuthorized || !userHasCatalogNearGeo(authUser)) {
      setCatalogNear(false);
    }
  }, [authUser, catalogNear, isAuthorized, isSessionReady]);

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
    setCatalogNear(false);
    setCatalogFlashSaleOnly(false);
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
    catalogRentalOnly,
    setCatalogRentalOnly,
    catalogAffiliateOnly,
    setCatalogAffiliateOnly,
    catalogWholesaleOnly,
    setCatalogWholesaleOnly,
    catalogOriginalOnly,
    setCatalogOriginalOnly,
    catalogNear,
    setCatalogNear,
    catalogFlashSaleOnly,
    setCatalogFlashSaleOnly,
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
    handleCatalogRentalOnlyToggle,
    handleCatalogAffiliateOnlyToggle,
    handleCatalogWholesaleOnlyToggle,
    handleCatalogOriginalOnlyToggle,
    handleCatalogNearToggle,
    applyCatalogQueryState,
    resetCatalogFollowingOnLogout,
  };
}
