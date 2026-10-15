import {
  CATALOG_FILTERS_DEFAULT_SORT,
  CATALOG_FILTERS_DRAFT_FLAG_KEYS,
  createCatalogFiltersDraft,
  EMPTY_CATALOG_EXTRA_FILTERS,
  normalizeCatalogPriceRange,
  pickCatalogExtraFilters,
  type CatalogFiltersDraft,
} from "@izibuy/shared-lib";
import { PRODUCT_CATALOG_SORT_VALUES } from "@molha/api-contract";

import type {
  CatalogListFilters,
  CatalogSort,
} from "@/entities/product/model/catalogListFilters";

const CATALOG_SORT_NEWEST = CATALOG_FILTERS_DEFAULT_SORT;

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
  | "flashSaleOnly"
  | "near"
  | "priceMin"
  | "priceMax"
  | "delivery"
  | "pickupOnly"
  | "ratingMin"
  | "withReviews"
  | "returnOnly"
  | "sellerConfirmed"
  | "sellerPremium"
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
  flashSaleOnly: false,
  near: false,
  priceMin: undefined,
  priceMax: undefined,
  delivery: undefined,
  pickupOnly: false,
  ratingMin: undefined,
  withReviews: false,
  returnOnly: false,
  sellerConfirmed: false,
  sellerPremium: false,
};

const isCatalogSort = (value: unknown): value is CatalogSort =>
  typeof value === "string" &&
  (PRODUCT_CATALOG_SORT_VALUES as readonly string[]).includes(value);

/** Фильтры ленты из того, что передала плитка каталога (лишнее отбрасываем). */
export const pickHomeCatalogFeedFilters = (
  filters: Partial<CatalogListFilters>,
): HomeCatalogFeedFiltersState => {
  const extra = pickCatalogExtraFilters(filters);
  return {
    sort: isCatalogSort(filters.sort) ? filters.sort : undefined,
    followingOnly: filters.followingOnly === true,
    auctionOnly: filters.auctionOnly === true,
    installmentOnly: filters.installmentOnly === true,
    saleOnly: filters.saleOnly === true,
    rentalOnly: filters.rentalOnly === true,
    affiliateOnly: filters.affiliateOnly === true,
    wholesaleOnly: filters.wholesaleOnly === true,
    buyNFreeOnly: filters.buyNFreeOnly === true,
    originalOnly: filters.originalOnly === true,
    flashSaleOnly: filters.flashSaleOnly === true,
    near: filters.near === true,
    priceMin: extra.priceMin ?? undefined,
    priceMax: extra.priceMax ?? undefined,
    delivery: extra.delivery.length > 0 ? extra.delivery : undefined,
    pickupOnly: extra.pickupOnly,
    ratingMin: extra.ratingMin ?? undefined,
    withReviews: extra.withReviews,
    returnOnly: extra.returnOnly,
    sellerConfirmed: extra.sellerConfirmed,
    sellerPremium: extra.sellerPremium,
  };
};

/** Включён ли хоть один фильтр окна, которого нет у плиток (цена, получение, …). */
export const hasHomeCatalogFeedExtraFilters = (
  filters: HomeCatalogFeedFiltersState,
): boolean => {
  const extra = pickCatalogExtraFilters(filters);
  return (
    extra.priceMin !== EMPTY_CATALOG_EXTRA_FILTERS.priceMin ||
    extra.priceMax !== EMPTY_CATALOG_EXTRA_FILTERS.priceMax ||
    extra.delivery.length > 0 ||
    extra.pickupOnly ||
    extra.ratingMin !== EMPTY_CATALOG_EXTRA_FILTERS.ratingMin ||
    extra.withReviews ||
    extra.returnOnly ||
    extra.sellerConfirmed ||
    extra.sellerPremium
  );
};

/** Черновик окна фильтров из применённых фильтров ленты. */
export const homeCatalogFeedFiltersToDraft = (
  filters: HomeCatalogFeedFiltersState,
): CatalogFiltersDraft =>
  createCatalogFiltersDraft({
    ...filters,
    sort: filters.sort ?? CATALOG_SORT_NEWEST,
  });

/**
 * «Показать»: черновик → фильтры ленты. «Новинки» — порядок по умолчанию,
 * как на web без `sort` в адресе: лента без фильтров остаётся главной.
 * Явные «Новинки» от плитки каталога сохраняем, если их не меняли.
 */
export const homeCatalogFeedFiltersFromDraft = (
  draft: CatalogFiltersDraft,
  applied: HomeCatalogFeedFiltersState,
): HomeCatalogFeedFiltersState => {
  const [priceMin, priceMax] = normalizeCatalogPriceRange(
    draft.priceMin,
    draft.priceMax,
  );
  const sort =
    draft.sort === CATALOG_SORT_NEWEST
      ? applied.sort === CATALOG_SORT_NEWEST
        ? applied.sort
        : undefined
      : draft.sort;
  const next = pickHomeCatalogFeedFilters({
    sort: isCatalogSort(sort) ? sort : undefined,
    priceMin: priceMin ?? undefined,
    priceMax: priceMax ?? undefined,
    delivery: draft.delivery,
    ratingMin: draft.ratingMin ?? undefined,
  });
  for (const key of CATALOG_FILTERS_DRAFT_FLAG_KEYS) {
    next[key] = draft[key] === true;
  }
  return next;
};
