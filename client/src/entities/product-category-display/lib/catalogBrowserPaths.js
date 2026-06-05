import { buildCatalogBrowserSearchParams } from "../../../pages/home/lib/catalogCatalogQuery.js";
import { mainViewToPathname } from "../../../shared/lib/homeMainViewPaths.js";

/**
 * @param {{
 *   sort: string;
 *   category: import("../../product/model/types.js").ProductCategory | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly?: boolean;
 *   saleOnly: boolean;
 * }} query
 * @param {{ omitDefaultSort?: boolean }} [options]
 */
export function buildCatalogBrowserLocation(query, options) {
  const params = buildCatalogBrowserSearchParams(query, options);
  const search = params.toString();
  return `${mainViewToPathname("catalog-browser")}${search ? `?${search}` : ""}`;
}

export { buildCatalogBrowserSearchParams };
