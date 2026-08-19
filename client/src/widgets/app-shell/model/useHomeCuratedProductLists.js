import { useMemo } from "react";

import { isHomeCuratedProductListsVisible } from "../../../entities/curated-product-list/lib/isHomeCuratedProductListsVisible.js";
import { useHomeCuratedProductListsQuery } from "../../../entities/curated-product-list/model/useHomeCuratedProductListsQuery.js";

/**
 * @param {{
 *   isHomeCatalogMainView: boolean;
 *   isMineMode: boolean;
 *   selectedProductCategory: string | null;
 *   selectedCategoryId: string | null;
 *   sellerPersonalCategoryId?: string | null;
 *   hasProductSearchQuery: boolean;
 *   catalogFollowingOnly: boolean;
 *   catalogAuctionOnly: boolean;
 *   catalogInstallmentOnly: boolean;
 *   catalogSaleOnly: boolean;
 *   catalogRentalOnly?: boolean;
 *   catalogAffiliateOnly?: boolean;
 *   catalogWholesaleOnly?: boolean;
 *   catalogOriginalOnly?: boolean;
 *   catalogNear?: boolean;
 *   catalogFlashSaleOnly?: boolean;
 *   viewerRegionCode: string;
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
  catalogRentalOnly = false,
  catalogAffiliateOnly = false,
  catalogWholesaleOnly = false,
  catalogOriginalOnly = false,
  catalogNear = false,
  catalogFlashSaleOnly = false,
  viewerRegionCode,
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
    catalogRentalOnly,
    catalogAffiliateOnly,
    catalogWholesaleOnly,
    catalogOriginalOnly,
    catalogNear,
    catalogFlashSaleOnly,
  });

  const curatedListsQuery = useHomeCuratedProductListsQuery({
    enabled: showCuratedProductLists,
    regionCode: viewerRegionCode,
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
