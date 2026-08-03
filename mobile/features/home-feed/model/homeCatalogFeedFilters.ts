import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";

export type HomeCatalogFeedFiltersState = Pick<
  CatalogListFilters,
  "sort" | "followingOnly" | "auctionOnly" | "installmentOnly" | "saleOnly" | "near"
>;

export const EMPTY_HOME_CATALOG_FEED_FILTERS: HomeCatalogFeedFiltersState = {
  sort: undefined,
  followingOnly: false,
  auctionOnly: false,
  installmentOnly: false,
  saleOnly: false,
  near: false,
};
