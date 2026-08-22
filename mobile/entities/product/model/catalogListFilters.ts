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
  rentalOnly?: boolean;
  affiliateOnly?: boolean;
  wholesaleOnly?: boolean;
  buyNFreeOnly?: boolean;
  originalOnly?: boolean;
  near?: boolean;
  regionCode?: string;
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
  rentalOnly: filters.rentalOnly === true ? true : undefined,
  affiliateOnly: filters.affiliateOnly === true ? true : undefined,
  wholesaleOnly: filters.wholesaleOnly === true ? true : undefined,
  buyNFreeOnly: filters.buyNFreeOnly === true ? true : undefined,
  originalOnly: filters.originalOnly === true ? true : undefined,
  near: filters.near === true ? true : undefined,
  regionCode: filters.regionCode?.trim() || undefined,
});
