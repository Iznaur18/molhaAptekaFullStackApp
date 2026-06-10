import { z } from "zod";

import { productSaleCityFieldSchema } from "./addressStructured.js";
import { mongoIdSchema } from "./mongoId.js";
import { PRODUCT_MODERATION_STATUSES, productFromApiSchema } from "./productFromApi.js";
import { storedMediaUrlOrEmptySchema, storedMediaUrlSchema } from "./storedMediaUrl.js";

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

export const PRODUCT_IMAGE_URLS_MAX = 5;
export const PRODUCT_DESCRIPTION_MIN_CHARS = 10;
export const PRODUCT_DESCRIPTION_MAX_CHARS = 2000;
export const PRODUCT_PRICE_RUB_MAX = 999_999_999;
export const PRODUCT_STOCK_QUANTITY_MIN = 1;
export const PRODUCT_STOCK_QUANTITY_MAX = 9999;
export const PRODUCT_CHARACTERISTICS_MAX_ITEMS = 10;

const productImageUrlsSchema = z
  .array(storedMediaUrlSchema)
  .max(PRODUCT_IMAGE_URLS_MAX)
  .optional();

const productCharacteristicSchema = z.object({
  key: z.string().trim().min(1).max(50),
  value: z.string().trim().min(1).max(200),
});

const legacyCategorySchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Некорректный slug категории");

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
    productName: z.string().trim().min(3),
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
    productSaleCity: productSaleCityFieldSchema,
  })
  .superRefine(assertCategoryIdOrLegacy)
  .superRefine((body, ctx) => assertOldPricePair(body, ctx, true));

const patchFieldShape = {
  productName: z.string().trim().min(3).optional(),
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
  productSaleCity: productSaleCityFieldSchema,
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
  );

export const productModerationFromApiSchema = productFromApiSchema.extend({
  productModerationStatus: z.enum(PRODUCT_MODERATION_STATUSES),
  productModerationComment: z.string().optional(),
});

/** `data` ответа `POST /product` и `PATCH /product/:id`. */
export const productWriteDataSchema = z.object({
  message: z.string(),
  product: productModerationFromApiSchema,
});
