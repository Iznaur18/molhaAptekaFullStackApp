import {
  PRODUCT_CATALOG_DELIVERY_FILTER_VALUES,
  PRODUCT_CATALOG_RATING_MIN_VALUES,
  PRODUCT_PRICE_RUB_MAX,
} from "@molha/api-contract";

/**
 * Окно фильтров каталога (web и приложение): черновик внутри окна,
 * применённые фильтры — снаружи (адрес страницы на web, состояние экрана в приложении).
 */

/** Порядок по умолчанию: «Новинки». */
export const CATALOG_FILTERS_DEFAULT_SORT = "newest";
const CATALOG_SORT_NEWEST = CATALOG_FILTERS_DEFAULT_SORT;

/** Сортировки окна фильтров («По просмотрам» осталась только в адресе web). */
export const CATALOG_FILTERS_SHEET_SORTS = [
  CATALOG_SORT_NEWEST,
  "purchases",
  "price_asc",
  "price_desc",
  "rating",
  "discount",
] as const;

/** Переключатели окна: ключ совпадает с параметром запроса и счётчиком фасетов. */
export const CATALOG_FILTERS_DRAFT_FLAG_KEYS = [
  "pickupOnly",
  "near",
  "withReviews",
  "saleOnly",
  "flashSaleOnly",
  "installmentOnly",
  "wholesaleOnly",
  "buyNFreeOnly",
  "pointsSaleOnly",
  "sellerConfirmed",
  "sellerPremium",
  "followingOnly",
  "originalOnly",
  "returnOnly",
  "auctionOnly",
  "rentalOnly",
  "affiliateOnly",
] as const;

export type CatalogFiltersFlagKey = (typeof CATALOG_FILTERS_DRAFT_FLAG_KEYS)[number];

/** Разделы окна, в порядке показа. */
export const CATALOG_FILTERS_BENEFIT_FLAGS: readonly CatalogFiltersFlagKey[] = [
  "saleOnly",
  "flashSaleOnly",
  "installmentOnly",
  "wholesaleOnly",
  "buyNFreeOnly",
  "pointsSaleOnly",
];
export const CATALOG_FILTERS_SELLER_FLAGS: readonly CatalogFiltersFlagKey[] = [
  "sellerConfirmed",
  "sellerPremium",
];
export const CATALOG_FILTERS_MORE_FLAGS: readonly CatalogFiltersFlagKey[] = [
  "originalOnly",
  "returnOnly",
  "auctionOnly",
  "rentalOnly",
  "affiliateOnly",
];

/** Порог рейтинга, который включает вариант «Рейтинг 4 и выше». */
export const CATALOG_FILTERS_RATING_MIN = 4;

export type CatalogExtraFilters = {
  priceMin: number | null;
  priceMax: number | null;
  delivery: string[];
  pickupOnly: boolean;
  ratingMin: number | null;
  withReviews: boolean;
  returnOnly: boolean;
  pointsSaleOnly: boolean;
  sellerConfirmed: boolean;
  sellerPremium: boolean;
};

export const EMPTY_CATALOG_EXTRA_FILTERS: Readonly<CatalogExtraFilters> = Object.freeze(
  {
    priceMin: null,
    priceMax: null,
    delivery: Object.freeze([]) as unknown as string[],
    pickupOnly: false,
    ratingMin: null,
    withReviews: false,
    returnOnly: false,
    pointsSaleOnly: false,
    sellerConfirmed: false,
    sellerPremium: false,
  },
);

const toCatalogPriceFilter = (value: unknown): number | null =>
  Number.isInteger(value) &&
  (value as number) >= 0 &&
  (value as number) <= PRODUCT_PRICE_RUB_MAX
    ? (value as number)
    : null;

/** «От» больше «до» — меняем местами: сервер на такой диапазон отвечает 400. */
export function normalizeCatalogPriceRange(
  priceMin: number | null,
  priceMax: number | null,
): [number | null, number | null] {
  if (priceMin != null && priceMax != null && priceMin > priceMax) {
    return [priceMax, priceMin];
  }
  return [priceMin, priceMax];
}

/**
 * Без дублей и неизвестных значений, в порядке контракта — чтобы адрес
 * и ключ запроса не зависели от порядка нажатий.
 */
export function normalizeCatalogDeliveryFilter(values: readonly unknown[]): string[] {
  return PRODUCT_CATALOG_DELIVERY_FILTER_VALUES.filter((value) =>
    values.includes(value),
  );
}

type CatalogExtraFiltersSource = {
  priceMin?: unknown;
  priceMax?: unknown;
  delivery?: unknown;
  pickupOnly?: unknown;
  ratingMin?: unknown;
  withReviews?: unknown;
  returnOnly?: unknown;
  pointsSaleOnly?: unknown;
  sellerConfirmed?: unknown;
  sellerPremium?: unknown;
};

export function pickCatalogExtraFilters(
  query: CatalogExtraFiltersSource | null | undefined,
): CatalogExtraFilters {
  const [priceMin, priceMax] = normalizeCatalogPriceRange(
    toCatalogPriceFilter(query?.priceMin),
    toCatalogPriceFilter(query?.priceMax),
  );
  const ratingMin = Number(query?.ratingMin);
  return {
    priceMin,
    priceMax,
    delivery: normalizeCatalogDeliveryFilter(
      Array.isArray(query?.delivery) ? query.delivery : [],
    ),
    pickupOnly: query?.pickupOnly === true,
    ratingMin:
      query?.ratingMin != null && PRODUCT_CATALOG_RATING_MIN_VALUES.includes(ratingMin)
        ? ratingMin
        : null,
    withReviews: query?.withReviews === true,
    returnOnly: query?.returnOnly === true,
    pointsSaleOnly: query?.pointsSaleOnly === true,
    sellerConfirmed: query?.sellerConfirmed === true,
    sellerPremium: query?.sellerPremium === true,
  };
}

export type CatalogFiltersDraft = {
  sort: string;
  priceMin: number | null;
  priceMax: number | null;
  delivery: string[];
  ratingMin: number | null;
} & Record<CatalogFiltersFlagKey, boolean>;

/** Черновик окна из применённого запроса. */
export function createCatalogFiltersDraft(
  query: Record<string, unknown>,
): CatalogFiltersDraft {
  const extra = pickCatalogExtraFilters(query);
  const draft = {
    sort: typeof query.sort === "string" ? query.sort : CATALOG_SORT_NEWEST,
    priceMin: extra.priceMin,
    priceMax: extra.priceMax,
    delivery: extra.delivery,
    ratingMin: extra.ratingMin,
  } as CatalogFiltersDraft;
  for (const key of CATALOG_FILTERS_DRAFT_FLAG_KEYS) {
    draft[key] = query[key] === true;
  }
  return draft;
}

/** «Сбросить»: всё по умолчанию. Поиск и категория в окне не хранятся. */
export function createEmptyCatalogFiltersDraft(): CatalogFiltersDraft {
  return createCatalogFiltersDraft({ sort: CATALOG_SORT_NEWEST });
}

export function areCatalogFiltersDraftsEqual(
  a: CatalogFiltersDraft,
  b: CatalogFiltersDraft,
): boolean {
  return (
    a.sort === b.sort &&
    a.priceMin === b.priceMin &&
    a.priceMax === b.priceMax &&
    a.ratingMin === b.ratingMin &&
    a.delivery.join(",") === b.delivery.join(",") &&
    CATALOG_FILTERS_DRAFT_FLAG_KEYS.every((key) => a[key] === b[key])
  );
}

export function isCatalogFiltersDraftEmpty(draft: CatalogFiltersDraft): boolean {
  return areCatalogFiltersDraftsEqual(draft, createEmptyCatalogFiltersDraft());
}

/**
 * Черновик поверх применённого запроса: то, чего в окне нет (категория,
 * поиск), сохраняется как было.
 */
export function applyCatalogFiltersDraft<TQuery extends Record<string, unknown>>(
  query: TQuery,
  draft: CatalogFiltersDraft,
): TQuery & CatalogFiltersDraft {
  const [priceMin, priceMax] = normalizeCatalogPriceRange(
    draft.priceMin,
    draft.priceMax,
  );
  const next: Record<string, unknown> = {
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
  return next as TQuery & CatalogFiltersDraft;
}

export function toggleCatalogFiltersDelivery(
  delivery: readonly string[],
  value: string,
): string[] {
  return normalizeCatalogDeliveryFilter(
    delivery.includes(value)
      ? delivery.filter((item) => item !== value)
      : [...delivery, value],
  );
}

export type CatalogFacetsPrice = {
  min: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  max: number;
};

/**
 * Быстрые варианты цены — «до p25», «до p75», «до p90» текущей выдачи.
 * Вариант не меньше максимума ничего не отсекает — его не показываем.
 */
export function buildCatalogPricePresets(price: CatalogFacetsPrice | null): number[] {
  if (!price) {
    return [];
  }
  const max = Math.ceil(price.max);
  const presets: number[] = [];
  for (const value of [price.p25, price.p75, price.p90].map((item) =>
    Math.ceil(item),
  )) {
    if (value < max && !presets.includes(value)) {
      presets.push(value);
    }
  }
  return presets;
}

/** Выбран ли быстрый вариант «до N» (а не диапазон, набранный руками). */
export function isCatalogPricePresetSelected(
  draft: Pick<CatalogFiltersDraft, "priceMin" | "priceMax">,
  value: number,
): boolean {
  return draft.priceMin == null && draft.priceMax === value;
}

/** Нажатие на «до N»: повторное снимает, иначе заменяет диапазон. */
export function toggleCatalogPricePreset(
  draft: CatalogFiltersDraft,
  value: number,
): CatalogFiltersDraft {
  return isCatalogPricePresetSelected(draft, value)
    ? { ...draft, priceMax: null }
    : { ...draft, priceMin: null, priceMax: value };
}

/** «Рейтинг 4 и выше»: включает порог или снимает любой выбранный. */
export function toggleCatalogFiltersRating(
  draft: CatalogFiltersDraft,
): CatalogFiltersDraft {
  return {
    ...draft,
    ratingMin: draft.ratingMin == null ? CATALOG_FILTERS_RATING_MIN : null,
  };
}
