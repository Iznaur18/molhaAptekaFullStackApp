import { z } from "zod";

import {
  PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_COORDS_REQUIRED_MESSAGE,
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  assertPickupCoordsPair,
  assertPickupCoordsRequired,
  productPickupAddressFieldSchema,
  productPickupLatFieldSchema,
  productPickupLonFieldSchema,
} from "./productPickup.js";

/** Max pickup/origin points per product (v1). */
export const PRODUCT_PICKUP_LOCATIONS_MAX = 5;
export const PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH = 30;
export const PRODUCT_PICKUP_LOCATION_ID_MAX_LENGTH = 64;

export const PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE =
  "Добавьте хотя бы одну точку самовывоза / отправления";

export const PRODUCT_PICKUP_LOCATION_DEFAULT_REQUIRED_MESSAGE =
  "Укажите одну точку по умолчанию";

export const PRODUCT_PICKUP_SELECTION_INVALID_MESSAGE =
  "Выберите корректную точку самовывоза для товара";

/**
 * @param {string} address
 */
export function productPickupLocationDuplicateKey(address) {
  return String(address ?? "")
    .trim()
    .toLowerCase();
}

export const productPickupLocationItemSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "id точки обязателен")
    .max(
      PRODUCT_PICKUP_LOCATION_ID_MAX_LENGTH,
      `id точки не длиннее ${PRODUCT_PICKUP_LOCATION_ID_MAX_LENGTH} символов`,
    ),
  label: z
    .union([z.string(), z.null(), z.literal("")])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return "";
      }
      return String(value).trim().slice(0, PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH);
    }),
  address: productPickupAddressFieldSchema,
  lat: productPickupLatFieldSchema,
  lon: productPickupLonFieldSchema,
  isDefault: z.boolean(),
});

export const productPickupLocationsFieldSchema = z
  .array(productPickupLocationItemSchema)
  .max(
    PRODUCT_PICKUP_LOCATIONS_MAX,
    `Не больше ${PRODUCT_PICKUP_LOCATIONS_MAX} точек самовывоза`,
  )
  .superRefine((items, ctx) => {
    if (items.length === 0) {
      return;
    }

    const keys = new Set();
    let defaultCount = 0;

    for (const item of items) {
      const key = productPickupLocationDuplicateKey(item.address);
      if (keys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Такой адрес уже добавлен",
        });
      } else {
        keys.add(key);
      }

      if (item.isDefault) {
        defaultCount += 1;
      }
    }

    if (defaultCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: PRODUCT_PICKUP_LOCATION_DEFAULT_REQUIRED_MESSAGE,
      });
    }
  });

/**
 * @param {Array<{ isDefault?: boolean }>} items
 */
export function ensureSingleDefaultProductPickupLocation(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const normalized = items.map((item) => ({
    ...item,
    isDefault: item.isDefault === true,
  }));

  const defaultIndexes = normalized
    .map((item, index) => (item.isDefault ? index : -1))
    .filter((index) => index >= 0);

  const defaultIndex = defaultIndexes[0] ?? 0;

  return normalized.map((item, index) => ({
    ...item,
    isDefault: index === defaultIndex,
  }));
}

/**
 * `Number(null)` и `Number("")` дают 0 — без явной проверки на пустое значение
 * точка без координат читалась как валидная точка 0,0 (Гвинейский залив):
 * такие координаты попадали в снапшот заказа (`pickupLatAtOrder`) и в форму
 * правки товара как «настоящие».
 *
 * @param {unknown} raw
 * @returns {number | null}
 */
function toStoredCoord(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * @param {unknown} item
 */
function normalizeStoredProductPickupLocation(item) {
  const address = String(item?.address ?? item?.line ?? "").trim();
  return {
    id: String(item?.id ?? "").trim() || "legacy-default",
    label: String(item?.label ?? "")
      .trim()
      .slice(0, PRODUCT_PICKUP_LOCATION_LABEL_MAX_LENGTH),
    address,
    lat: toStoredCoord(item?.lat),
    lon: toStoredCoord(item?.lon),
    isDefault: item?.isDefault === true,
  };
}

/**
 * Read locations from product: array or legacy single address.
 *
 * @param {unknown} product
 * @returns {Array<{
 *   id: string;
 *   label: string;
 *   address: string;
 *   lat: number | null;
 *   lon: number | null;
 *   isDefault: boolean;
 * }>}
 */
export function productPickupLocationsFromProduct(product) {
  const list = Array.isArray(product?.productPickupLocations)
    ? product.productPickupLocations
    : [];

  if (list.length > 0) {
    return ensureSingleDefaultProductPickupLocation(
      list
        .map((item) => normalizeStoredProductPickupLocation(item))
        .filter((item) => item.address.length >= PRODUCT_PICKUP_ADDRESS_MIN_LENGTH)
        .slice(0, PRODUCT_PICKUP_LOCATIONS_MAX),
    );
  }

  const address = String(product?.productPickupAddress ?? "").trim();
  if (address.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
    return [];
  }

  return [
    {
      id: "legacy-default",
      label: "",
      address,
      lat: toStoredCoord(product?.productPickupLat),
      lon: toStoredCoord(product?.productPickupLon),
      isDefault: true,
    },
  ];
}

/**
 * @param {Array<{ address?: string; lat?: number | null; lon?: number | null; isDefault?: boolean }>} locations
 */
export function syncLegacyPickupFieldsFromLocations(locations) {
  const list = ensureSingleDefaultProductPickupLocation(
    Array.isArray(locations) ? locations : [],
  );
  const defaultItem = list.find((item) => item.isDefault) ?? list[0] ?? null;
  if (!defaultItem) {
    return {
      productPickupAddress: "",
      productPickupLat: null,
      productPickupLon: null,
    };
  }

  return {
    productPickupAddress: String(defaultItem.address ?? "").trim(),
    productPickupLat:
      defaultItem.lat != null && Number.isFinite(Number(defaultItem.lat))
        ? Number(defaultItem.lat)
        : null,
    productPickupLon:
      defaultItem.lon != null && Number.isFinite(Number(defaultItem.lon))
        ? Number(defaultItem.lon)
        : null,
  };
}

/**
 * @param {{
 *   productPickupLocations?: unknown;
 *   productPickupAddress?: unknown;
 *   productPickupLat?: unknown;
 *   productPickupLon?: unknown;
 * }} body
 * @param {import('zod').RefinementCtx} ctx
 */
export function assertCreateProductPickupLocationsOrLegacy(body, ctx) {
  const hasLocations =
    Array.isArray(body.productPickupLocations) &&
    body.productPickupLocations.length > 0;

  if (hasLocations) {
    return;
  }

  const address = String(body.productPickupAddress ?? "").trim();
  if (address.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["productPickupAddress"],
      message: PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
    });
    return;
  }

  if (address.length > PRODUCT_PICKUP_ADDRESS_MAX_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["productPickupAddress"],
      message: `Адрес самовывоза не длиннее ${PRODUCT_PICKUP_ADDRESS_MAX_LENGTH} символов`,
    });
  }

  assertPickupCoordsRequired(body, ctx);
}

/**
 * Re-export fulfillment assert used by productWrite refine.
 * @param {{ productPickupEnabled?: boolean; productDeliveryEnabled?: boolean }} body
 * @param {import('zod').RefinementCtx} ctx
 */
export function assertProductWriteFulfillmentMethods(body, ctx) {
  const pickupOn = body.productPickupEnabled !== false;
  const deliveryOn =
    body.productDeliveryEnabled === true ||
    body.productCourierDeliveryEnabled === true;
  if (!pickupOn && !deliveryOn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["productPickupEnabled"],
      message: PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
    });
  }
}

export { assertPickupCoordsPair, PRODUCT_PICKUP_COORDS_REQUIRED_MESSAGE };
