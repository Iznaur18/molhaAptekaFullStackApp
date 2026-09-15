import { z } from "zod";

import { paginationSchema } from "./pagination.js";
import { productFromApiSchema } from "./productFromApi.js";
import { PRODUCT_PRICE_RUB_MAX } from "./productWrite.js";
import { optionalRuRegionCodeFieldSchema } from "./ruRegions.js";

export const PRODUCT_CATALOG_SORT_VALUES = [
  "newest",
  "views",
  "purchases",
  "premium",
  "confirmed",
  "reviews",
  "price_asc",
  "price_desc",
  "rating",
  "discount",
];

/**
 * Каталог «Рядом» (этап A):
 * 1) самовывоз + `productPickupLocation` в радиусе от `userAddressGeo`;
 * 2) секция «В вашем регионе» — самовывоз без точки + `productRegionCode` зрителя.
 */
export const PRODUCT_CATALOG_NEAR_RADIUS_KM = 30;
export const PRODUCT_CATALOG_NEAR_RADIUS_METERS = PRODUCT_CATALOG_NEAR_RADIUS_KM * 1000;
export const PRODUCT_CATALOG_NEAR_AUTH_MESSAGE = "Войдите, чтобы смотреть товары рядом";
export const PRODUCT_CATALOG_NEAR_ADDRESS_REQUIRED_MESSAGE = "Укажите адрес в профиле";

export const PRODUCT_CATALOG_NEAR_REGION_SECTION_TITLE = "В вашем регионе";

/** Макс. длина `search` в каталоге (header / API / mobile). */
export const CATALOG_SEARCH_QUERY_MAX_LENGTH = 200;

/**
 * Способ получения в фильтре каталога: `delivery=seller,courier`.
 * seller — везёт продавец, courier — курьеры Gitorg, carrier — службы
 * доставки (ЛОБО и следующие). Внутри группы варианты складываются через «или».
 */
export const PRODUCT_CATALOG_DELIVERY_FILTER_VALUES = ["seller", "courier", "carrier"];

/** Допустимые пороги `ratingMin`. */
export const PRODUCT_CATALOG_RATING_MIN_VALUES = [3, 4, 5];

export const PRODUCT_CATALOG_PRICE_RANGE_INVALID_MESSAGE =
  "Цена «от» не может быть больше цены «до»";
export const PRODUCT_CATALOG_PRICE_FILTER_INVALID_MESSAGE =
  "Цена фильтра — целое число рублей от 0";
export const PRODUCT_CATALOG_DELIVERY_FILTER_INVALID_MESSAGE =
  "Неизвестный способ получения";
export const PRODUCT_CATALOG_RATING_MIN_INVALID_MESSAGE = "Рейтинг «от» — 3, 4 или 5";

/**
 * Query `moderationStatus` для `GET /product/my` (единый list-фильтр).
 * Синхрон с `server/constants/productModerationConstants.js`.
 */
export const MY_PRODUCTS_LIST_FILTER_VALUES = [
  "pending",
  "approved",
  "rejected",
  "hidden",
  "promoted",
  "not_promoted",
];

export const MY_PRODUCTS_LIST_FILTER_INVALID_MESSAGE =
  "Некорректный фильтр списка товаров";

/**
 * Подпись дистанции для каталога «Рядом».
 * &lt;10 км → `~1.2 км` (1 знак, мин. 0.1); ≥10 → `~12 км`.
 *
 * @param {unknown} distanceMeters
 * @returns {string | null}
 */
export function formatCatalogNearDistanceLabel(distanceMeters) {
  if (distanceMeters == null || distanceMeters === "") {
    return null;
  }
  const meters = Number(distanceMeters);
  if (!Number.isFinite(meters) || meters < 0) {
    return null;
  }
  const km = meters / 1000;
  if (km < 10) {
    const tenths = Math.max(1, Math.round(km * 10));
    return `~${(tenths / 10).toFixed(1)} км`;
  }
  return `~${Math.round(km)} км`;
}

/**
 * @template T
 * @param {T[]} products
 * @returns {{ withDistance: T[]; withoutDistance: T[] }}
 */
export function splitCatalogNearProducts(products) {
  /** @type {T[]} */
  const withDistance = [];
  /** @type {T[]} */
  const withoutDistance = [];
  if (!Array.isArray(products)) {
    return { withDistance, withoutDistance };
  }
  for (const product of products) {
    const raw =
      product && typeof product === "object"
        ? /** @type {{ distanceMeters?: unknown }} */ (product).distanceMeters
        : undefined;
    if (raw == null || raw === "") {
      withoutDistance.push(product);
      continue;
    }
    const meters = Number(raw);
    if (Number.isFinite(meters)) {
      withDistance.push(product);
    } else {
      withoutDistance.push(product);
    }
  }
  return { withDistance, withoutDistance };
}

/**
 * Fallback-slug для товара, которому не досталось узла дерева (в основном —
 * импорт из 1С). Каталожной категорией не является: в `roots` и меню не
 * попадает, поэтому в `PRODUCT_CATEGORY_SLUGS` его нет. Но в товарах он лежит
 * как настоящее значение `productCategory`, и фильтровать по нему можно —
 * иначе карточка такого товара не может запросить «похожие».
 */
export const UNCATEGORIZED_PRODUCT_CATEGORY_SLUG = "uncategorized";

/** Slug категории — синхрон с `server/constants/productConstants.js`. */
export const PRODUCT_CATEGORY_SLUGS = [
  "grocery",
  "electronics",
  "clothing",
  "footwear",
  "home_garden",
  "kids",
  "beauty_health",
  "appliances",
  "sport_leisure",
  "construction",
  "pharmacy",
  "pets",
  "books",
  "tourism_outdoors",
  "auto_parts",
  "hobby_crafts",
  "accessories",
  "jewelry",
  "music_video",
  "stationery",
  "antiques",
  "digital",
  "household_care",
  "games",
  "automobiles",
  "travel_services",
  "food",
];

const optionalTruthyFlag = z.preprocess((value) => {
  if (value == null || value === "") {
    return undefined;
  }
  return String(value).trim().toLowerCase() === "true";
}, z.boolean().optional());

const optionalTrimmedString = z.preprocess((value) => {
  if (value == null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

/** Цена фильтра из адреса: строка → целые рубли. */
const optionalPriceRubFilter = z.preprocess(
  (value) => (value == null || String(value).trim() === "" ? undefined : Number(value)),
  z
    .number({ invalid_type_error: PRODUCT_CATALOG_PRICE_FILTER_INVALID_MESSAGE })
    .int(PRODUCT_CATALOG_PRICE_FILTER_INVALID_MESSAGE)
    .min(0, PRODUCT_CATALOG_PRICE_FILTER_INVALID_MESSAGE)
    .max(PRODUCT_PRICE_RUB_MAX, PRODUCT_CATALOG_PRICE_FILTER_INVALID_MESSAGE)
    .optional(),
);

/** `delivery=seller,courier` или повтор параметра → массив без дублей. */
const optionalDeliveryFilter = z.preprocess(
  (value) => {
    if (value == null) {
      return undefined;
    }
    const parts = (Array.isArray(value) ? value : [value])
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter(Boolean);
    return parts.length > 0 ? [...new Set(parts)] : undefined;
  },
  z
    .array(
      z.enum(PRODUCT_CATALOG_DELIVERY_FILTER_VALUES, {
        errorMap: () => ({ message: PRODUCT_CATALOG_DELIVERY_FILTER_INVALID_MESSAGE }),
      }),
    )
    .optional(),
);

const optionalRatingMin = z.preprocess(
  (value) => (value == null || String(value).trim() === "" ? undefined : Number(value)),
  z
    .number({ invalid_type_error: PRODUCT_CATALOG_RATING_MIN_INVALID_MESSAGE })
    .refine((rating) => PRODUCT_CATALOG_RATING_MIN_VALUES.includes(rating), {
      message: PRODUCT_CATALOG_RATING_MIN_INVALID_MESSAGE,
    })
    .optional(),
);

/** Query `GET /product`, `GET /product/facets`, `GET /product/my` (после express query parser). */
export const catalogProductsQuerySchema = z
  .object({
    search: optionalTrimmedString.refine(
      (value) => value === undefined || value.length <= CATALOG_SEARCH_QUERY_MAX_LENGTH,
      { message: `search не более ${CATALOG_SEARCH_QUERY_MAX_LENGTH} символов` },
    ),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    productCategory: optionalTrimmedString.refine(
      (slug) =>
        slug === undefined ||
        slug === UNCATEGORIZED_PRODUCT_CATEGORY_SLUG ||
        PRODUCT_CATEGORY_SLUGS.includes(
          /** @type {(typeof PRODUCT_CATEGORY_SLUGS)[number]} */ (slug),
        ),
      { message: "Указана неизвестная категория" },
    ),
    categoryId: optionalTrimmedString.refine(
      (id) => id === undefined || /^[a-f\d]{24}$/i.test(id),
      { message: "categoryId должен быть валидным ObjectId" },
    ),
    sellerPersonalCategoryId: optionalTrimmedString.refine(
      (id) => id === undefined || /^[a-f\d]{24}$/i.test(id),
      { message: "sellerPersonalCategoryId должен быть валидным ObjectId" },
    ),
    sort: z.enum(PRODUCT_CATALOG_SORT_VALUES).optional(),
    includeHidden: optionalTruthyFlag,
    followingOnly: optionalTruthyFlag,
    auctionOnly: optionalTruthyFlag,
    installmentOnly: optionalTruthyFlag,
    saleOnly: optionalTruthyFlag,
    rentalOnly: optionalTruthyFlag,
    affiliateOnly: optionalTruthyFlag,
    wholesaleOnly: optionalTruthyFlag,
    buyNFreeOnly: optionalTruthyFlag,
    originalOnly: optionalTruthyFlag,
    /** Товары рядом с адресом профиля (см. PRODUCT_CATALOG_NEAR_RADIUS_KM). */
    near: optionalTruthyFlag,
    /** Только активные горящие скидки. */
    flashSaleOnly: optionalTruthyFlag,
    /** Цена «от» / «до», целые рубли по `productPrice`. */
    priceMin: optionalPriceRubFilter,
    priceMax: optionalPriceRubFilter,
    /** Способы получения, см. PRODUCT_CATALOG_DELIVERY_FILTER_VALUES. */
    delivery: optionalDeliveryFilter,
    /** Самовывоз. */
    pickupOnly: optionalTruthyFlag,
    /** Рейтинг не ниже порога и хотя бы один отзыв. */
    ratingMin: optionalRatingMin,
    /** Хотя бы один отзыв. */
    withReviews: optionalTruthyFlag,
    /** Продавец принимает возврат. */
    returnOnly: optionalTruthyFlag,
    /** Продавцы с подтверждёнными данными (раньше `sort=confirmed`). */
    sellerConfirmed: optionalTruthyFlag,
    /** Премиум-продавцы (раньше `sort=premium`). */
    sellerPremium: optionalTruthyFlag,
    moderationStatus: z
      .enum(MY_PRODUCTS_LIST_FILTER_VALUES, {
        errorMap: () => ({ message: MY_PRODUCTS_LIST_FILTER_INVALID_MESSAGE }),
      })
      .optional(),
    regionCode: optionalRuRegionCodeFieldSchema,
  })
  .superRefine((query, ctx) => {
    if (
      query.priceMin != null &&
      query.priceMax != null &&
      query.priceMin > query.priceMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["priceMin"],
        message: PRODUCT_CATALOG_PRICE_RANGE_INVALID_MESSAGE,
      });
    }
  });

export const catalogProductsPageDataSchema = z.object({
  products: z.array(productFromApiSchema),
  pagination: paginationSchema,
});

const facetCountSchema = z.number().int().nonnegative();

/**
 * `GET /product/facets`: сколько товаров останется при каждом варианте фильтра.
 * Счётчик варианта — если добавить его к текущим фильтрам; способы получения
 * внутри группы складываются через «или». `total` совпадает с
 * `pagination.total` у `GET /product` с теми же параметрами.
 */
export const catalogProductFacetsDataSchema = z.object({
  total: facetCountSchema,
  /** Цены текущей выдачи без фильтра цены — для быстрых вариантов «до …». */
  price: z
    .object({
      min: z.number(),
      p25: z.number(),
      p50: z.number(),
      p75: z.number(),
      p90: z.number(),
      max: z.number(),
    })
    .nullable(),
  categories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      count: facetCountSchema,
    }),
  ),
  options: z.object({
    delivery: z.object({
      seller: facetCountSchema,
      courier: facetCountSchema,
      carrier: facetCountSchema,
    }),
    pickupOnly: facetCountSchema,
    ratingMin4: facetCountSchema,
    withReviews: facetCountSchema,
    saleOnly: facetCountSchema,
    flashSaleOnly: facetCountSchema,
    installmentOnly: facetCountSchema,
    wholesaleOnly: facetCountSchema,
    buyNFreeOnly: facetCountSchema,
    rentalOnly: facetCountSchema,
    auctionOnly: facetCountSchema,
    affiliateOnly: facetCountSchema,
    originalOnly: facetCountSchema,
    returnOnly: facetCountSchema,
    sellerConfirmed: facetCountSchema,
    sellerPremium: facetCountSchema,
    /** null — гость: подписок нет. */
    followingOnly: facetCountSchema.nullable(),
    /** null — не вошёл или нет адреса в профиле. */
    near: facetCountSchema.nullable(),
  }),
});
