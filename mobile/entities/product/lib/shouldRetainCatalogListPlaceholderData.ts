import {
  buildCatalogListQueryKey,
  type CatalogListFilters,
} from "@/entities/product/model/catalogListFilters";

export type CatalogListQueryKeyParams = ReturnType<typeof buildCatalogListQueryKey>;

const PLACEHOLDER_SCOPE_KEYS: Array<keyof CatalogListQueryKeyParams> = [
  "search",
  "productCategory",
  "categoryId",
  "sellerPersonalCategoryId",
  "followingOnly",
  "auctionOnly",
  "installmentOnly",
  "saleOnly",
  "regionCode",
];

/** Держим предыдущие плитки только при смене сортировки в том же scope (без смены категории/поиска). */
export const shouldRetainCatalogListPlaceholderData = (
  previous: CatalogListQueryKeyParams | undefined,
  next: CatalogListQueryKeyParams,
): boolean => {
  if (!previous) {
    return false;
  }

  return PLACEHOLDER_SCOPE_KEYS.every((key) => previous[key] === next[key]);
};

export const buildCatalogListScopeKey = (filters: CatalogListFilters): string =>
  JSON.stringify(buildCatalogListQueryKey(filters));
