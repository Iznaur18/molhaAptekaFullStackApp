import { z } from "zod";

import { paginationSchema } from "./pagination.js";
import { productFromApiSchema } from "./productFromApi.js";
import { optionalRuRegionCodeFieldSchema } from "./ruRegions.js";

export const PRODUCT_CATALOG_SORT_VALUES = [
  "newest",
  "views",
  "purchases",
  "premium",
  "confirmed",
  "reviews",
];

/**
 * Каталог «Рядом» (этап A):
 * 1) самовывоз + `productPickupLocation` в радиусе от `userAddressGeo`;
 * 2) секция «В вашем регионе» — самовывоз без точки + `productRegionCode` зрителя.
 */
export const PRODUCT_CATALOG_NEAR_RADIUS_KM = 30;
export const PRODUCT_CATALOG_NEAR_RADIUS_METERS =
  PRODUCT_CATALOG_NEAR_RADIUS_KM * 1000;
export const PRODUCT_CATALOG_NEAR_AUTH_MESSAGE =
  "Войдите, чтобы смотреть товары рядом";
export const PRODUCT_CATALOG_NEAR_ADDRESS_REQUIRED_MESSAGE =
  "Укажите адрес в профиле";

export const PRODUCT_CATALOG_NEAR_REGION_SECTION_TITLE = "В вашем регионе";

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

/** Query `GET /product`, `GET /product/my` (после express query parser). */
export const catalogProductsQuerySchema = z.object({
  search: optionalTrimmedString.refine(
    (value) => value === undefined || value.length <= 50,
    { message: "search не более 50 символов" },
  ),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  productCategory: optionalTrimmedString.refine(
    (slug) =>
      slug === undefined ||
      PRODUCT_CATEGORY_SLUGS.includes(/** @type {(typeof PRODUCT_CATEGORY_SLUGS)[number]} */ (slug)),
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
  originalOnly: optionalTruthyFlag,
  /** Товары рядом с адресом профиля (см. PRODUCT_CATALOG_NEAR_RADIUS_KM). */
  near: optionalTruthyFlag,
  moderationStatus: z.enum(["pending", "rejected"]).optional(),
  regionCode: optionalRuRegionCodeFieldSchema,
});

export const catalogProductsPageDataSchema = z.object({
  products: z.array(productFromApiSchema),
  pagination: paginationSchema,
});
