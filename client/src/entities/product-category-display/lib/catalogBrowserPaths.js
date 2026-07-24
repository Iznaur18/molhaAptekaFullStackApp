import { buildCatalogBrowserSearchParams } from "../../product/lib/catalogCatalogQuery.js";
import { mainViewToPathname } from "../../../shared/lib/homeMainViewPaths.js";

/**
 * @param {{
 *   sort: string;
 *   category: import("../../product/model/types.js").ProductCategory | null;
 *   categoryId?: string | null;
 *   sellerPersonalCategoryId?: string | null;
 *   followingOnly: boolean;
 *   auctionOnly: boolean;
 *   installmentOnly?: boolean;
 *   saleOnly: boolean;
 * }} query
 * @param {{ omitDefaultSort?: boolean; compact?: boolean }} [options]
 *   compact: ≤640 — выдача на `/` (как app); иначе `/catalog`.
 */
export function buildCatalogProductsLocation(query, options = {}) {
  const { compact = false, omitDefaultSort = true } = options;
  const params = buildCatalogBrowserSearchParams(query, { omitDefaultSort });
  const search = params.toString();
  const pathname = compact
    ? mainViewToPathname("catalog")
    : mainViewToPathname("catalog-browser");
  return `${pathname}${search ? `?${search}` : ""}`;
}

/**
 * @param {Parameters<typeof buildCatalogProductsLocation>[0]} query
 * @param {{ omitDefaultSort?: boolean }} [options]
 */
export function buildCatalogBrowserLocation(query, options) {
  return buildCatalogProductsLocation(query, { ...options, compact: false });
}

export { buildCatalogBrowserSearchParams };
