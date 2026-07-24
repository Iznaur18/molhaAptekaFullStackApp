import { useMemo } from "react";

import { isHomeCuratedProductListsVisible } from "../../../entities/curated-product-list/lib/isHomeCuratedProductListsVisible.js";
import { useHomeCuratedProductListsQuery } from "../../../entities/curated-product-list/model/useHomeCuratedProductListsQuery.js";

/**
 * @param {{
 *   isHomeCatalogMainView: boolean;
 *   isMineMode: boolean;
 *   selectedProductCategory: string | null;
 *   selectedCategoryId: string | null;
 *   hasProductSearchQuery: boolean;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogInstallmentOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   showHiddenCatalogProducts: boolean;
 *   catalogAllCities: boolean;
 * }} params
 */
export function useHomeCuratedProductLists({
  isHomeCatalogMainView,
  isMineMode,
  selectedProductCategory,
  selectedCategoryId,
  sellerPersonalCategoryId = null,
  hasProductSearchQuery,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  showHiddenCatalogProducts,
  catalogAllCities,
}) {
  const showCuratedProductLists = isHomeCuratedProductListsVisible({
    isHomeCatalogMainView,
    isMineMode,
    selectedProductCategory,
    selectedCategoryId,
    sellerPersonalCategoryId,
    hasProductSearchQuery,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    showHiddenCatalogProducts,
  });

  const curatedListsQuery = useHomeCuratedProductListsQuery({
    enabled: showCuratedProductLists,
    allCities: catalogAllCities,
  });

  const homeCuratedProductLists = useMemo(
    () => (showCuratedProductLists ? (curatedListsQuery.data ?? []) : []),
    [curatedListsQuery.data, showCuratedProductLists],
  );

  return {
    showCuratedProductLists,
    homeCuratedProductLists,
    curatedListsQuery,
  };
}
