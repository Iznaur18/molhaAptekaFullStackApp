import { CATALOG_SORT_NEWEST } from "../../../entities/product/model/productConstants.js";

/** @type {import('../lib/catalogCatalogQuery.js').ReturnType<typeof import('../lib/catalogCatalogQuery.js').parseCatalogQueryFromSearchParams>} */
export const CATALOG_LANDING_QUERY = {
  sort: CATALOG_SORT_NEWEST,
  category: null,
  categoryId: null,
  followingOnly: false,
  auctionOnly: false,
  installmentOnly: false,
  saleOnly: false,
};
