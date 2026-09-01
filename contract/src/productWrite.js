import { z } from "zod";

import {
  requiredRuRegionCodeFieldSchema,
} from "./ruRegions.js";
import { mongoIdSchema } from "./mongoId.js";
import { PRODUCT_MODERATION_STATUSES, productFromApiSchema } from "./productFromApi.js";
import { storedMediaUrlOrEmptySchema, storedMediaUrlSchema } from "./storedMediaUrl.js";
import {
  assertPickupCoordsPair,
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_COURIER_DELIVERY_CONFLICT_MESSAGE,
  productPickupAddressFieldSchema,
  productPickupLatFieldSchema,
  productPickupLonFieldSchema,
} from "./productPickup.js";
import {
  assertCreateProductPickupLocationsOrLegacy,
  productPickupLocationsFieldSchema,
} from "./productPickupLocations.js";
import { productBuyNFreePatchFieldsShape } from "./productBuyNFree.js";
import { productWholesalePatchFieldsShape } from "./productWholesale.js";
import { productRentalPatchFieldsShape } from "./productRental.js";
import {
  assertAffiliatePatchPair,
  productAffiliatePatchFieldsShape,
} from "./productAffiliate.js";
import { productFlashSalePatchFieldsShape } from "./productFlashSale.js";
import { productOutOfStockLabelFieldSchema } from "./productOutOfStockLabel.js";

/** SSOT category slug list — client/mobile/server re-export отсюда. */
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

/** SSOT product-write лимитов — client/mobile/server re-export отсюда. */
export const PRODUCT_IMAGE_URLS_MAX = 10;
export const PRODUCT_IMAGE_REQUIRED_MESSAGE =
  "Добавьте хотя бы одно фото товара";
export const PRODUCT_NAME_MIN_LENGTH = 3;
export const PRODUCT_NAME_MAX_LENGTH = 100;
export const PRODUCT_DESCRIPTION_MIN_CHARS = 10;
export const PRODUCT_DESCRIPTION_MAX_CHARS = 2000;
export const PRODUCT_PRICE_RUB_MAX = 999_999_999;
export const PRODUCT_STOCK_QUANTITY_MIN = 1;
export const PRODUCT_STOCK_QUANTITY_MAX = 9999;
export const PRODUCT_CHARACTERISTICS_MAX_ITEMS = 20;
export const PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS = 50;
export const PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS = 200;
export const PRODUCT_RETURN_TERMS_MAX_ITEMS = 5;
export const PRODUCT_RETURN_TERM_KEY_MAX_CHARS = 50;
export const PRODUCT_RETURN_TERM_VALUE_MAX_CHARS = 200;

/** Лимит активных товаров продавца. */
export const SELLER_PRODUCTS_LIMIT_REGULAR = 50;
export const SELLER_PRODUCTS_LIMIT_PREMIUM = 100;
export const SELLER_PRODUCTS_LIMIT_ERROR_MESSAGE = `Достигнут лимит товаров: ${SELLER_PRODUCTS_LIMIT_REGULAR} для обычных пользователей, ${SELLER_PRODUCTS_LIMIT_PREMIUM} для премиум.`;

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
  key: z.string().trim().min(1).max(PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS),
  value: z.string().trim().min(1).max(PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS),
});

const productReturnTermSchema = z.object({
  key: z.string().trim().min(1).max(PRODUCT_RETURN_TERM_KEY_MAX_CHARS),
  value: z.string().trim().min(1).max(PRODUCT_RETURN_TERM_VALUE_MAX_CHARS),
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
    productQaEnabled: z.coerce.boolean().optional(),
    loyaltyPointsPerUnit: z.coerce.number().int().min(0).optional(),
    productCharacteristics: z
      .array(productCharacteristicSchema)
      .max(PRODUCT_CHARACTERISTICS_MAX_ITEMS)
      .optional(),
    productListingOrigin: productListingOriginSchema,
    productIsOriginal: z.coerce.boolean().optional().default(false),
    productOutOfStock: z.coerce.boolean().optional().default(false),
    productOutOfStockLabel: productOutOfStockLabelFieldSchema.optional().default("out_of_stock"),
    productReturnEnabled: z.coerce.boolean().optional(),
    productReturnTerms: z
      .array(productReturnTermSchema)
      .max(PRODUCT_RETURN_TERMS_MAX_ITEMS)
      .optional(),
    /** Опционально: сервер пересчитает из адреса. Клиент может прислать preview. */
    productRegionCode: requiredRuRegionCodeFieldSchema.optional(),
    /** Предпочтительно: несколько точек; иначе legacy single address. */
    productPickupLocations: productPickupLocationsFieldSchema.optional(),
    productPickupAddress: productPickupAddressFieldSchema.optional(),
    productPickupLat: productPickupLatFieldSchema.nullable().optional(),
    productPickupLon: productPickupLonFieldSchema.nullable().optional(),
    productPickupEnabled: z.coerce.boolean().optional(),
    productDeliveryEnabled: z.coerce.boolean().optional(),
    productCourierDeliveryEnabled: z.coerce.boolean().optional(),
    productArticle: z.string().trim().max(64).optional(),
  })
  .superRefine(assertCreateProductRequiresPhoto)
  .superRefine((body, ctx) => assertOldPricePair(body, ctx, true))
  .superRefine(assertReturnPolicy)
  .superRefine(assertCreateProductPickupLocationsOrLegacy)
  .superRefine((body, ctx) => {
    const pickupOn = body.productPickupEnabled !== false;
    const deliveryOn = body.productDeliveryEnabled === true;
    const courierOn = body.productCourierDeliveryEnabled === true;

    // Либо продавец везёт сам, либо отдаёт курьеру: смешение сделало бы
    // непонятным, кому предлагать отправление в «Обзоре».
    if (deliveryOn && courierOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productCourierDeliveryEnabled"],
        message: PRODUCT_COURIER_DELIVERY_CONFLICT_MESSAGE,
      });
    }
    if (!pickupOn && !deliveryOn && !courierOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productPickupEnabled"],
        message: PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
      });
    }
  });

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
  productQaEnabled: z.coerce.boolean().optional(),
  ...productWholesalePatchFieldsShape,
  ...productBuyNFreePatchFieldsShape,
  ...productRentalPatchFieldsShape,
  ...productAffiliatePatchFieldsShape,
  ...productFlashSalePatchFieldsShape,
  loyaltyPointsPerUnit: z.coerce.number().int().min(0).optional(),
  productCharacteristics: z
    .array(productCharacteristicSchema)
    .max(PRODUCT_CHARACTERISTICS_MAX_ITEMS)
    .optional(),
  productListingOrigin: productListingOriginSchema.optional(),
  productIsOriginal: z.coerce.boolean().optional(),
  productOutOfStock: z.coerce.boolean().optional(),
  productOutOfStockLabel: productOutOfStockLabelFieldSchema.optional(),
  productReturnEnabled: z.coerce.boolean().optional(),
  productReturnTerms: z
    .array(productReturnTermSchema)
    .max(PRODUCT_RETURN_TERMS_MAX_ITEMS)
    .optional(),
  productRegionCode: requiredRuRegionCodeFieldSchema.optional(),
  productPickupLocations: productPickupLocationsFieldSchema.optional(),
  productPickupAddress: productPickupAddressFieldSchema.optional(),
  productPickupLat: productPickupLatFieldSchema.nullable().optional(),
  productPickupLon: productPickupLonFieldSchema.nullable().optional(),
  productPickupEnabled: z.coerce.boolean().optional(),
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
  })
  .superRefine((body, ctx) => assertAffiliatePatchPair(body, ctx));

export const productModerationFromApiSchema = productFromApiSchema
  .extend({
    productModerationStatus: z.enum(PRODUCT_MODERATION_STATUSES),
    productModerationComment: z.string().nullish(),
  })
  .passthrough();

/** `data` ответа `POST /product` и `PATCH /product/:id`. */
export const productWriteDataSchema = z.object({
  message: z.string(),
  product: productModerationFromApiSchema,
});
