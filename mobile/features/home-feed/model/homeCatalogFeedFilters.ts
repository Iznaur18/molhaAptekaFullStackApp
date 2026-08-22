import type { CatalogListFilters } from "@/entities/product/model/catalogListFilters";

export type HomeCatalogFeedFiltersState = Pick<
  CatalogListFilters,
  | "sort"
  | "followingOnly"
  | "auctionOnly"
  | "installmentOnly"
  | "saleOnly"
  | "rentalOnly"
  | "affiliateOnly"
  | "wholesaleOnly"
  | "buyNFreeOnly"
  | "originalOnly"
  | "near"
>;

export const EMPTY_HOME_CATALOG_FEED_FILTERS: HomeCatalogFeedFiltersState = {
  sort: undefined,
  followingOnly: false,
  auctionOnly: false,
  installmentOnly: false,
  saleOnly: false,
  rentalOnly: false,
  affiliateOnly: false,
  wholesaleOnly: false,
  buyNFreeOnly: false,
  originalOnly: false,
  near: false,
};
