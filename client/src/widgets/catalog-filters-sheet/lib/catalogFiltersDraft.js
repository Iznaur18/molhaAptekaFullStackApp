import { buildCatalogListQueryParams } from "../../../entities/product/lib/buildCatalogListQueryParams.js";
import {
  normalizeCatalogDeliveryFilter,
  normalizeCatalogPriceRange,
  pickCatalogExtraFilters,
} from "../../../entities/product/lib/catalogCatalogQuery.js";
import {
  CATALOG_SORT_DISCOUNT,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_PRICE_ASC,
  CATALOG_SORT_PRICE_DESC,
  CATALOG_SORT_PURCHASES,
  CATALOG_SORT_RATING,
} from "../../../entities/product/model/productConstants.js";

/** Сортировки окна фильтров («По просмотрам» осталась только в адресе). */
export const CATALOG_FILTERS_SHEET_SORTS = [
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_PURCHASES,
  CATALOG_SORT_PRICE_ASC,
  CATALOG_SORT_PRICE_DESC,
  CATALOG_SORT_RATING,
  CATALOG_SORT_DISCOUNT,
];

/** Переключатели окна: ключ совпадает с параметром адреса и счётчиком фасетов. */
export const CATALOG_FILTERS_DRAFT_FLAG_KEYS = [
  "pickupOnly",
  "near",
  "withReviews",
  "saleOnly",
  "flashSaleOnly",
  "installmentOnly",
  "wholesaleOnly",
  "buyNFreeOnly",
  "sellerConfirmed",
  "sellerPremium",
  "followingOnly",
  "originalOnly",
  "returnOnly",
  "auctionOnly",
  "rentalOnly",
  "affiliateOnly",
];

/** Порог рейтинга, который включает вариант «Рейтинг 4 и выше». */
export const CATALOG_FILTERS_RATING_MIN = 4;

/**
 * @typedef {{
 *   sort: string;
 *   priceMin: number | null;
 *   priceMax: number | null;
 *   delivery: string[];
 *   ratingMin: number | null;
 * } & Record<string, unknown>} CatalogFiltersDraft
 */

/**
 * Черновик окна из применённого запроса (адреса страницы).
 *
 * @param {Record<string, unknown>} query
 * @returns {CatalogFiltersDraft}
 */
export function createCatalogFiltersDraft(query) {
  const extra = pickCatalogExtraFilters(query);
  /** @type {CatalogFiltersDraft} */
  const draft = {
    sort: typeof query.sort === "string" ? query.sort : CATALOG_SORT_NEWEST,
    priceMin: extra.priceMin,
    priceMax: extra.priceMax,
    delivery: extra.delivery,
    ratingMin: extra.ratingMin,
  };
  for (const key of CATALOG_FILTERS_DRAFT_FLAG_KEYS) {
    draft[key] = query[key] === true;
  }
  return draft;
}

/** «Сбросить»: всё по умолчанию. Поиск и категория в окне не хранятся. */
export function createEmptyCatalogFiltersDraft() {
  return createCatalogFiltersDraft({ sort: CATALOG_SORT_NEWEST });
}

/**
 * @param {CatalogFiltersDraft} a
 * @param {CatalogFiltersDraft} b
 */
export function areCatalogFiltersDraftsEqual(a, b) {
  return (
    a.sort === b.sort &&
    a.priceMin === b.priceMin &&
    a.priceMax === b.priceMax &&
    a.ratingMin === b.ratingMin &&
    a.delivery.join(",") === b.delivery.join(",") &&
    CATALOG_FILTERS_DRAFT_FLAG_KEYS.every((key) => a[key] === b[key])
  );
}

/**
 * @param {CatalogFiltersDraft} draft
 */
export function isCatalogFiltersDraftEmpty(draft) {
  return areCatalogFiltersDraftsEqual(draft, createEmptyCatalogFiltersDraft());
}

/**
 * Черновик поверх применённого запроса: то, чего в окне нет (категория),
 * сохраняется как было.
 *
 * @template {Record<string, unknown>} TQuery
 * @param {TQuery} query
 * @param {CatalogFiltersDraft} draft
 */
export function applyCatalogFiltersDraft(query, draft) {
  const [priceMin, priceMax] = normalizeCatalogPriceRange(
    draft.priceMin,
    draft.priceMax,
  );
  /** @type {Record<string, unknown>} */
  const next = {
    ...query,
    sort: draft.sort,
    priceMin,
    priceMax,
    delivery: normalizeCatalogDeliveryFilter(draft.delivery),
    ratingMin: draft.ratingMin,
  };
  for (const key of CATALOG_FILTERS_DRAFT_FLAG_KEYS) {
    next[key] = draft[key] === true;
  }
  return /** @type {TQuery & CatalogFiltersDraft} */ (next);
}

/**
 * @param {readonly string[]} delivery
 * @param {string} value
 */
export function toggleCatalogFiltersDelivery(delivery, value) {
  return normalizeCatalogDeliveryFilter(
    delivery.includes(value)
      ? delivery.filter((item) => item !== value)
      : [...delivery, value],
  );
}

/**
 * Параметры `GET /product/facets` для черновика — через тот же построитель,
 * что и выдача, чтобы число на кнопке совпало с тем, что покажет лента.
 *
 * @param {{
 *   query: Record<string, unknown>;
 *   draft: CatalogFiltersDraft;
 *   searchTerm: string;
 *   viewerRegionCode?: string | null;
 *   isCatalogBrowserMainViewActive: boolean;
 *   isSubcategoryFilterEnabled: boolean;
 * }} input
 */
export function buildCatalogFiltersFacetsParams({
  query,
  draft,
  searchTerm,
  viewerRegionCode = null,
  isCatalogBrowserMainViewActive,
  isSubcategoryFilterEnabled,
}) {
  const nextQuery = applyCatalogFiltersDraft(query, draft);
  const {
    scope: _scope,
    moderationStatus: _moderationStatus,
    // Порядок выдачи на счётчики не влияет — смена сортировки не перезапрашивает фасеты.
    sort: _sort,
    ...params
  } = buildCatalogListQueryParams({
    isMineMode: false,
    isCatalogBrowserMainViewActive,
    activeCatalogBrowserCategory: nextQuery.category ?? null,
    activeCatalogBrowserCategoryId: isSubcategoryFilterEnabled
      ? (nextQuery.categoryId ?? null)
      : null,
    catalogQueryFromUrl: nextQuery,
    appliedProductSearchTerm: searchTerm,
    selectedProductCategory: null,
    catalogSort: null,
    myProductsModerationFilter: null,
    viewerRegionCode: viewerRegionCode || null,
  });
  return params;
}

/**
 * Быстрые варианты цены — «до p25», «до p75», «до p90» текущей выдачи.
 * Вариант не меньше максимума ничего не отсекает — его не показываем.
 *
 * @param {{ min: number; p25: number; p50: number; p75: number; p90: number; max: number } | null} price
 * @returns {number[]}
 */
export function buildCatalogPricePresets(price) {
  if (!price) {
    return [];
  }
  const max = Math.ceil(price.max);
  /** @type {number[]} */
  const presets = [];
  for (const value of [price.p25, price.p75, price.p90].map((item) =>
    Math.ceil(item),
  )) {
    if (value < max && !presets.includes(value)) {
      presets.push(value);
    }
  }
  return presets;
}
