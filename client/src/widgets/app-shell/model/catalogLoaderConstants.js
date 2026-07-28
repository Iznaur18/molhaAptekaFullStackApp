import { CATALOG_SORT_NEWEST } from "../../../entities/product/model/productConstants.js";

/** @type {ReturnType<typeof import('../../../entities/product/lib/catalogCatalogQuery.js').parseCatalogQueryFromSearchParams>} */
export const CATALOG_LANDING_QUERY = {
  sort: CATALOG_SORT_NEWEST,
  category: null,
  categoryId: null,
  sellerPersonalCategoryId: null,
  followingOnly: false,
  auctionOnly: false,
  installmentOnly: false,
  saleOnly: false,
};
