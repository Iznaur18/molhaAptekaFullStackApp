import {
  buildCatalogBrowserSearchParams,
} from "../../../pages/home/lib/catalogCatalogQuery.js";
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
 */
export function buildCatalogBrowserLocation(query) {
  const params = buildCatalogBrowserSearchParams(query);
  const search = params.toString();
  return `${mainViewToPathname("catalog-browser")}${search ? `?${search}` : ""}`;
}

export { buildCatalogBrowserSearchParams };
