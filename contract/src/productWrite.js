import { z } from "zod";

import {
  requiredRuRegionCodeFieldSchema,
} from "./ruRegions.js";
import { mongoIdSchema } from "./mongoId.js";
import { PRODUCT_MODERATION_STATUSES, productFromApiSchema } from "./productFromApi.js";
import { storedMediaUrlOrEmptySchema, storedMediaUrlSchema } from "./storedMediaUrl.js";
import {
  assertPickupCoordsPair,
  productPickupAddressFieldSchema,
  productPickupLatFieldSchema,
  productPickupLonFieldSchema,
} from "./productPickup.js";

/** Синхрон с `server/constants/productConstants.js` (legacy slug). */
export const PRODUCT_CATEGORY_VALUES = [
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

export const PRODUCT_IMAGE_URLS_MAX = 5;
export const PRODUCT_IMAGE_REQUIRED_MESSAGE =
  "Добавьте хотя бы одно фото товара";
export const PRODUCT_NAME_MIN_LENGTH = 3;
export const PRODUCT_NAME_MAX_LENGTH = 100;
export const PRODUCT_DESCRIPTION_MIN_CHARS = 10;
export const PRODUCT_DESCRIPTION_MAX_CHARS = 2000;
export const PRODUCT_PRICE_RUB_MAX = 999_999_999;
export const PRODUCT_STOCK_QUANTITY_MIN = 1;
export const PRODUCT_STOCK_QUANTITY_MAX = 9999;
export const PRODUCT_CHARACTERISTICS_MAX_ITEMS = 10;
export const PRODUCT_RETURN_TERMS_MAX_ITEMS = 5;

export const PRODUCT_LISTING_ORIGIN_OWN = "own";
export const PRODUCT_LISTING_ORIGIN_RESALE = "resale";
export const PRODUCT_LISTING_ORIGIN_MANUFACTURER = "manufacturer";

/** @type {readonly ["own", "resale", "manufacturer"]} */
export const PRODUCT_LISTING_ORIGIN_VALUES = [
  PRODUCT_LISTING_ORIGIN_OWN,
  PRODUCT_LISTING_ORIGIN_RESALE,
  PRODUCT_LISTING_ORIGIN_MANUFACTURER,
];

export const PRODUCT_PRICE_MARKET_STATUS_ABOVE = "above_market";
export const PRODUCT_PRICE_MARKET_STATUS_AT = "at_market";
export const PRODUCT_PRICE_MARKET_STATUS_BELOW = "below_market";
export const PRODUCT_PRICE_MARKET_STATUS_UNKNOWN = "unknown";

/** @type {readonly ["above_market", "at_market", "below_market", "unknown"]} */
export const PRODUCT_PRICE_MARKET_STATUS_VALUES = [
  PRODUCT_PRICE_MARKET_STATUS_ABOVE,
  PRODUCT_PRICE_MARKET_STATUS_AT,
  PRODUCT_PRICE_MARKET_STATUS_BELOW,
  PRODUCT_PRICE_MARKET_STATUS_UNKNOWN,
];

export const PRODUCT_PRICE_MARKET_STATUS_DEFAULT = PRODUCT_PRICE_MARKET_STATUS_UNKNOWN;

const productListingOriginSchema = z.enum(PRODUCT_LISTING_ORIGIN_VALUES);

const productNameFieldSchema = z
  .string()
  .trim()
  .min(
    PRODUCT_NAME_MIN_LENGTH,
    `productName не короче ${PRODUCT_NAME_MIN_LENGTH} символов`,
  )
  .max(
    PRODUCT_NAME_MAX_LENGTH,
    `productName не длиннее ${PRODUCT_NAME_MAX_LENGTH} символов`,
  );

const productImageUrlsSchema = z
  .array(storedMediaUrlSchema)
  .max(PRODUCT_IMAGE_URLS_MAX)
  .optional();

const productCharacteristicSchema = z.object({
  key: z.string().trim().min(1).max(50),
  value: z.string().trim().min(1).max(200),
});

const productReturnTermSchema = z.object({
  key: z.string().trim().min(1).max(50),
  value: z.string().trim().min(1).max(200),
});

const assertReturnPolicy = (body, ctx) => {
  if (body.productReturnEnabled !== true) {
    return;
  }
  const terms = Array.isArray(body.productReturnTerms) ? body.productReturnTerms : [];
  const valid = terms.filter(
    (row) =>
      row != null &&
      String(row.key ?? "").trim().length > 0 &&
      String(row.value ?? "").trim().length > 0,
  );
  if (valid.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["productReturnTerms"],
      message: "При возврате укажите условие (ключ и значение)",
    });
  }
};

const legacyCategorySchema = z
  .string()
  .trim()
  .refine(
    (value) => PRODUCT_CATEGORY_VALUES.includes(value),
    "Некорректный slug категории",
  );

const assertCategoryIdOrLegacy = (body, ctx) => {
  const hasId =
    body.productCategoryId != null && String(body.productCategoryId).trim() !== "";
  const hasLegacy =
    body.productCategory != null && String(body.productCategory).trim() !== "";
  if (!hasId && !hasLegacy) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Укажите productCategoryId (лист дерева) или productCategory",
    });
  }
};

const assertCreateProductRequiresPhoto = (body, ctx) => {
  const fromArray = Array.isArray(body.productImageUrls)
    ? body.productImageUrls.filter((url) => String(url ?? "").trim().length > 0)
    : [];
  const hasLegacy =
    typeof body.productImageUrl === "string" &&
    body.productImageUrl.trim().length > 0;
  if (fromArray.length === 0 && !hasLegacy) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["productImageUrls"],
      message: PRODUCT_IMAGE_REQUIRED_MESSAGE,
    });
  }
};

const assertOldPricePair = (body, ctx, requireProductPrice) => {
  if (body.productOldPrice == null) {
    return;
  }
  if (requireProductPrice && body.productPrice == null) {
    return;
  }
  const oldPrice = Number(body.productOldPrice);
  const price = Number(body.productPrice);
  if (!Number.isFinite(oldPrice) || !Number.isFinite(price)) {
    return;
  }
  if (oldPrice <= price) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["productOldPrice"],
      message: "Старая цена должна быть больше текущей",
    });
  }
};

/** Тело `POST /product`. */
export const createProductBodySchema = z
  .object({
    productName: productNameFieldSchema,
    productDescription: z
      .string()
      .trim()
      .min(PRODUCT_DESCRIPTION_MIN_CHARS)
      .max(PRODUCT_DESCRIPTION_MAX_CHARS),
    productImageUrls: productImageUrlsSchema,
    productImageUrl: storedMediaUrlSchema.optional(),
    productPreviewVideoUrl: storedMediaUrlOrEmptySchema.optional(),
    productPrice: z.coerce.number().int().min(0).max(PRODUCT_PRICE_RUB_MAX),
    productOldPrice: z.coerce.number().int().min(0).nullable().optional(),
    productCategoryId: mongoIdSchema.optional(),
    productCategory: legacyCategorySchema.optional(),
    productIsAvailable: z.coerce.boolean(),
    productStockQuantity: z.coerce
      .number()
      .int()
      .min(PRODUCT_STOCK_QUANTITY_MIN)
      .max(PRODUCT_STOCK_QUANTITY_MAX)
      .optional(),
    productAuctionEnabled: z.coerce.boolean().optional(),
    loyaltyPointsPerUnit: z.coerce.number().int().min(0).optional(),
    productCharacteristics: z
      .array(productCharacteristicSchema)
      .max(PRODUCT_CHARACTERISTICS_MAX_ITEMS)
      .optional(),
    productListingOrigin: productListingOriginSchema,
    productIsOriginal: z.coerce.boolean(),
    productReturnEnabled: z.coerce.boolean().optional(),
    productReturnTerms: z
      .array(productReturnTermSchema)
      .max(PRODUCT_RETURN_TERMS_MAX_ITEMS)
      .optional(),
    productRegionCode: requiredRuRegionCodeFieldSchema,
    productPickupAddress: productPickupAddressFieldSchema,
    productPickupLat: productPickupLatFieldSchema.nullable().optional(),
    productPickupLon: productPickupLonFieldSchema.nullable().optional(),
    productDeliveryEnabled: z.coerce.boolean().optional(),
  })
  .superRefine(assertCategoryIdOrLegacy)
  .superRefine(assertCreateProductRequiresPhoto)
  .superRefine((body, ctx) => assertOldPricePair(body, ctx, true))
  .superRefine(assertReturnPolicy)
  .superRefine((body, ctx) => assertPickupCoordsPair(body, ctx));

const patchFieldShape = {
  productName: productNameFieldSchema.optional(),
  productDescription: z
    .string()
    .trim()
    .min(PRODUCT_DESCRIPTION_MIN_CHARS)
    .max(PRODUCT_DESCRIPTION_MAX_CHARS)
    .optional(),
  productImageUrls: productImageUrlsSchema,
  productImageUrl: storedMediaUrlSchema.optional(),
  productPreviewVideoUrl: storedMediaUrlOrEmptySchema.optional(),
  productPrice: z.coerce.number().int().min(0).max(PRODUCT_PRICE_RUB_MAX).optional(),
  productOldPrice: z.coerce.number().int().min(0).nullable().optional(),
  productCategoryId: mongoIdSchema.optional(),
  productCategory: legacyCategorySchema.optional(),
  productIsAvailable: z.coerce.boolean().optional(),
  productStockQuantity: z.coerce
    .number()
    .int()
    .min(0)
    .max(PRODUCT_STOCK_QUANTITY_MAX)
    .optional(),
  productAuctionEnabled: z.coerce.boolean().optional(),
  loyaltyPointsPerUnit: z.coerce.number().int().min(0).optional(),
  productCharacteristics: z
    .array(productCharacteristicSchema)
    .max(PRODUCT_CHARACTERISTICS_MAX_ITEMS)
    .optional(),
  productListingOrigin: productListingOriginSchema.optional(),
  productIsOriginal: z.coerce.boolean().optional(),
  productReturnEnabled: z.coerce.boolean().optional(),
  productReturnTerms: z
    .array(productReturnTermSchema)
    .max(PRODUCT_RETURN_TERMS_MAX_ITEMS)
    .optional(),
  productRegionCode: requiredRuRegionCodeFieldSchema.optional(),
  productPickupAddress: productPickupAddressFieldSchema.optional(),
  productPickupLat: productPickupLatFieldSchema.nullable().optional(),
  productPickupLon: productPickupLonFieldSchema.nullable().optional(),
  productDeliveryEnabled: z.coerce.boolean().optional(),
};

const PATCH_BODY_KEYS = Object.keys(patchFieldShape);

/** Тело `PATCH /product/:productId` — хотя бы одно поле. */
export const patchMyProductBodySchema = z
  .object(patchFieldShape)
  .superRefine((body, ctx) => {
    const hasField = PATCH_BODY_KEYS.some((key) =>
      Object.prototype.hasOwnProperty.call(body, key),
    );
    if (!hasField) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите хотя бы одно поле для обновления",
      });
    }
  })
  .superRefine((body, ctx) =>
    assertOldPricePair(body, ctx, Object.hasOwn(body, "productPrice")),
  )
  .superRefine(assertReturnPolicy)
  .superRefine((body, ctx) => {
    if (
      Object.prototype.hasOwnProperty.call(body, "productPickupLat") ||
      Object.prototype.hasOwnProperty.call(body, "productPickupLon")
    ) {
      assertPickupCoordsPair(body, ctx);
    }
  });

export const productModerationFromApiSchema = productFromApiSchema.extend({
  productModerationStatus: z.enum(PRODUCT_MODERATION_STATUSES),
  productModerationComment: z.string().nullish(),
});

/** `data` ответа `POST /product` и `PATCH /product/:id`. */
export const productWriteDataSchema = z.object({
  message: z.string(),
  product: productModerationFromApiSchema,
});
