import { useCallback } from "react";

import { CATALOG_SORT_NEWEST } from "../../../entities/product/model/productConstants.js";
import { buildCatalogSearchParams } from "../../../entities/product/lib/catalogCatalogQuery.js";
import { catalogMainViewToPathname } from "../../../shared/lib/catalogMainViewPaths.js";

/**
 * @param {{
 *   applyCatalogQueryState: (query: object) => void;
 *   navigate: import('react-router-dom').NavigateFunction;
 *   setCategoryTreeLabel: (label: string | null) => void;
 * }} params
 */
export function useHomeCuratedCategoryClick({
  applyCatalogQueryState,
  navigate,
  setCategoryTreeLabel,
}) {
  return useCallback(
    (category) => {
      const nextQuery = {
        sort: CATALOG_SORT_NEWEST,
        category: null,
        categoryId: category.kind === "tree" ? category.refId : null,
        sellerPersonalCategoryId: category.kind === "personal" ? category.refId : null,
        followingOnly: false,
        auctionOnly: false,
        installmentOnly: false,
        saleOnly: false,
        rentalOnly: false,
        affiliateOnly: false,
        wholesaleOnly: false,
        originalOnly: false,
        near: false,
        flashSaleOnly: false,
      };

      applyCatalogQueryState(nextQuery);
      setCategoryTreeLabel(category.label);

      const search = buildCatalogSearchParams(nextQuery).toString();
      navigate({
        pathname: catalogMainViewToPathname("catalog"),
        search: search ? `?${search}` : "",
      });
    },
    [applyCatalogQueryState, navigate, setCategoryTreeLabel],
  );
}
