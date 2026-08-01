import {
  PRODUCT_DELIVERY_FULFILLMENT_ENABLED,
  PRODUCT_DELIVERY_NOT_AVAILABLE_MESSAGE,
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_ADDRESS_MAX_LENGTH,
  PRODUCT_PICKUP_ADDRESS_MIN_LENGTH,
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";

/**
 * @param {unknown} raw
 * @returns {string}
 */
export const normalizeProductPickupAddress = (raw) => {
  const address = String(raw ?? "").trim();
  if (address.length < PRODUCT_PICKUP_ADDRESS_MIN_LENGTH) {
    throw new Error(PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE);
  }
  if (address.length > PRODUCT_PICKUP_ADDRESS_MAX_LENGTH) {
    throw new Error(
      `Адрес самовывоза не длиннее ${PRODUCT_PICKUP_ADDRESS_MAX_LENGTH} символов`,
    );
  }
  return address;
};

/**
 * @param {unknown} latRaw
 * @param {unknown} lonRaw
 * @returns {{ productPickupLat: number | null; productPickupLon: number | null }}
 */
export const normalizeProductPickupCoords = (latRaw, lonRaw) => {
  const latEmpty = latRaw == null || latRaw === "";
  const lonEmpty = lonRaw == null || lonRaw === "";
  if (latEmpty && lonEmpty) {
    return { productPickupLat: null, productPickupLon: null };
  }
  if (latEmpty || lonEmpty) {
    throw new Error("Укажите и широту, и долготу точки самовывоза");
  }
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error("Некорректная широта");
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error("Некорректная долгота");
  }
  return { productPickupLat: lat, productPickupLon: lon };
};

/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export const resolveProductDeliveryEnabledForWrite = (raw) => {
  if (raw === true && !PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
    throw new AppError(400, PRODUCT_DELIVERY_NOT_AVAILABLE_MESSAGE);
  }
  if (!PRODUCT_DELIVERY_FULFILLMENT_ENABLED) {
    return false;
  }
  return raw === true;
};

/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export const resolveProductPickupEnabledForWrite = (raw) => raw !== false;

/**
 * @param {boolean} pickupEnabled
 * @param {boolean} deliveryEnabled
 */
export const assertProductFulfillmentMethods = (pickupEnabled, deliveryEnabled) => {
  if (!pickupEnabled && !deliveryEnabled) {
    throw new AppError(400, PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE);
  }
};

/**
 * @param {Record<string, unknown>} body
 */
export const resolveCreateProductPickupFields = (body) => {
  try {
    const productPickupAddress = normalizeProductPickupAddress(
      body?.productPickupAddress,
    );
    const coords = normalizeProductPickupCoords(
      body?.productPickupLat,
      body?.productPickupLon,
    );
    const productPickupEnabled = resolveProductPickupEnabledForWrite(
      body?.productPickupEnabled,
    );
    const productDeliveryEnabled = resolveProductDeliveryEnabledForWrite(
      body?.productDeliveryEnabled,
    );
    assertProductFulfillmentMethods(productPickupEnabled, productDeliveryEnabled);
    return {
      productPickupAddress,
      ...coords,
      productPickupEnabled,
      productDeliveryEnabled,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      400,
      error instanceof Error ? error.message : PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
    );
  }
};
