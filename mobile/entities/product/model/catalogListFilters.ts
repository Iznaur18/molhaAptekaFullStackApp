import { PRODUCT_CATALOG_SORT_VALUES } from "@molha/api-contract";

export type CatalogSort = (typeof PRODUCT_CATALOG_SORT_VALUES)[number];

export type CatalogListFilters = {
  view: "main";
  search?: string;
  productCategory?: string;
  categoryId?: string;
  sellerPersonalCategoryId?: string;
  sort?: CatalogSort;
  followingOnly?: boolean;
  auctionOnly?: boolean;
  installmentOnly?: boolean;
  saleOnly?: boolean;
  allCities?: boolean;
};

export const buildCatalogListQueryKey = (filters: CatalogListFilters) => ({
  view: filters.view,
  search: filters.search?.trim() || undefined,
  productCategory: filters.productCategory?.trim() || undefined,
  categoryId: filters.categoryId?.trim() || undefined,
  sellerPersonalCategoryId: filters.sellerPersonalCategoryId?.trim() || undefined,
  sort: filters.sort || undefined,
  followingOnly: filters.followingOnly === true ? true : undefined,
  auctionOnly: filters.auctionOnly === true ? true : undefined,
  installmentOnly: filters.installmentOnly === true ? true : undefined,
  saleOnly: filters.saleOnly === true ? true : undefined,
  allCities: filters.allCities === true ? true : undefined,
});
