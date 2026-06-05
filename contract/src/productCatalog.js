import { z } from "zod";

import { paginationSchema } from "./pagination.js";
import { productFromApiSchema } from "./productFromApi.js";

export const PRODUCT_CATALOG_SORT_VALUES = [
  "newest",
  "views",
  "purchases",
  "premium",
  "confirmed",
];

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
  "furniture",
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
  "figures",
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
    (slug) => slug === undefined || PRODUCT_CATEGORY_SLUGS.includes(slug),
    { message: "Указана неизвестная категория" },
  ),
  categoryId: optionalTrimmedString.refine(
    (id) => id === undefined || /^[a-f\d]{24}$/i.test(id),
    { message: "categoryId должен быть валидным ObjectId" },
  ),
  sort: z.enum(PRODUCT_CATALOG_SORT_VALUES).optional(),
  includeHidden: optionalTruthyFlag,
  followingOnly: optionalTruthyFlag,
  auctionOnly: optionalTruthyFlag,
  installmentOnly: optionalTruthyFlag,
  saleOnly: optionalTruthyFlag,
  moderationStatus: z.enum(["pending", "rejected"]).optional(),
});

export const catalogProductsPageDataSchema = z.object({
  products: z.array(productFromApiSchema),
  pagination: paginationSchema,
});
