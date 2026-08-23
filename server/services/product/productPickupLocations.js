import {
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_SELECTION_INVALID_MESSAGE,
  ensureSingleDefaultProductPickupLocation,
  productPickupLocationDuplicateKey,
  productPickupLocationsFromProduct,
  syncLegacyPickupFieldsFromLocations,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import {
  buildProductPickupLocation,
  normalizeProductPickupAddress,
  normalizeProductPickupCoords,
} from "./productPickup.js";
import { resolveProductSaleLocation } from "./resolveProductSaleLocation.js";

/**
 * @param {unknown} raw
 * @returns {Array<{
 *   id: string;
 *   label: string;
 *   address: string;
 *   lat: number;
 *   lon: number;
 *   isDefault: boolean;
 * }>}
 */
export function normalizeProductPickupLocationsInput(raw) {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new AppError(400, PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE);
  }

  const normalized = raw.map((item) => {
    const id = String(item?.id ?? "").trim();
    if (!id) {
      throw new AppError(400, "id точки обязателен");
    }
    const address = normalizeProductPickupAddress(item?.address);
    const coords = normalizeProductPickupCoords(item?.lat, item?.lon);
    if (coords.productPickupLat == null || coords.productPickupLon == null) {
      throw new AppError(400, PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE);
    }
    return {
      id,
      label: String(item?.label ?? "").trim(),
      address,
      lat: coords.productPickupLat,
      lon: coords.productPickupLon,
      isDefault: item?.isDefault === true,
    };
  });

  return ensureSingleDefaultProductPickupLocation(normalized);
}

/**
 * Resolve body locations or wrap legacy single address.
 *
 * @param {Record<string, unknown>} body
 * @param {{ fallbackRegionCode?: string | null }} [options]
 */
export async function resolveProductPickupWriteFields(body, options = {}) {
  const locationsFromBody = Array.isArray(body?.productPickupLocations)
    ? body.productPickupLocations
    : null;

  let locationsInput =
    locationsFromBody && locationsFromBody.length > 0 ? locationsFromBody : null;

  if (!locationsInput) {
    locationsInput = [
      {
        id: "legacy-default",
        label: "",
        address: body?.productPickupAddress,
        lat: body?.productPickupLat,
        lon: body?.productPickupLon,
        isDefault: true,
      },
    ];
  }

  const locations = normalizeProductPickupLocationsInput(locationsInput);
  const fallbackRegionCode = options.fallbackRegionCode ?? body?.productRegionCode;

  const verifiedLocations = await Promise.all(
    locations.map(async (item) => {
      const saleLocation = await resolveProductSaleLocation({
        address: item.address,
        lat: item.lat,
        lon: item.lon,
        fallbackRegionCode,
      });
      return {
        ...item,
        address: saleLocation.productPickupAddress,
        lat: saleLocation.productPickupLat ?? item.lat,
        lon: saleLocation.productPickupLon ?? item.lon,
      };
    }),
  );

  const synced = syncLegacyPickupFieldsFromLocations(verifiedLocations);
  const defaultLocation =
    verifiedLocations.find((item) => item.isDefault) ?? verifiedLocations[0];
  const defaultSaleLocation = await resolveProductSaleLocation({
    address: synced.productPickupAddress,
    lat: synced.productPickupLat,
    lon: synced.productPickupLon,
    fallbackRegionCode,
  });

  return {
    productPickupLocations: verifiedLocations,
    productPickupAddress: synced.productPickupAddress,
    productPickupLat: synced.productPickupLat,
    productPickupLon: synced.productPickupLon,
    productPickupLocation:
      defaultSaleLocation.productPickupLocation ??
      buildProductPickupLocation(synced.productPickupLat, synced.productPickupLon),
    productRegionCode: defaultSaleLocation.productRegionCode,
  };
}

/**
 * `Number(null)` === 0 — без явной проверки на пустое значение отсутствующая
 * координата превращается в валидный ноль (Гвинейский залив).
 *
 * @param {unknown} raw
 * @returns {number | null}
 */
function toPickupCoord(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

/**
 * Legacy-клиент (мобилка) шлёт только `productPickupAddress/Lat/Lon` и ничего
 * не знает про мультиточки. Безусловная пересборка массива из одного адреса
 * стирала все остальные точки продавца, заведённые в вебе. Здесь правим
 * ТОЛЬКО точку по умолчанию, остальные сохраняем как есть.
 *
 * @param {unknown} existingProduct товар из БД
 * @param {{ address?: unknown; lat?: unknown; lon?: unknown }} legacyPickup
 * @returns {Array<Record<string, unknown>> | null} null — сливать нечего,
 *   обычный legacy-путь (0 или 1 точка).
 */
export function mergeLegacyPickupIntoExistingLocations(existingProduct, legacyPickup) {
  const stored = productPickupLocationsFromProduct(existingProduct);
  if (stored.length < 2) {
    return null;
  }

  const address = String(legacyPickup?.address ?? "").trim();
  if (!address) {
    return null;
  }

  const lat = toPickupCoord(legacyPickup?.lat);
  const lon = toPickupCoord(legacyPickup?.lon);
  const defaultIndex = Math.max(
    0,
    stored.findIndex((item) => item.isDefault),
  );

  const merged = stored.map((item, index) =>
    index === defaultIndex
      ? {
          ...item,
          address,
          lat: lat ?? item.lat,
          lon: lon ?? item.lon,
        }
      : item,
  );

  // Новый адрес точки по умолчанию мог совпасть с другой точкой — две
  // одинаковые точки бессмысленны и не пройдут валидацию, схлопываем.
  const defaultKey = productPickupLocationDuplicateKey(address);
  const deduped = merged.filter(
    (item, index) =>
      index === defaultIndex ||
      productPickupLocationDuplicateKey(item.address) !== defaultKey,
  );

  // Точка без координат не пройдёт normalizeProductPickupLocationsInput и
  // уронила бы весь патч в 400. Такие точки невосстановимы — выкидываем,
  // но если после этого мультиточек не осталось, отдаём обычный legacy-путь.
  const usable = deduped.filter(
    (item) => toPickupCoord(item.lat) != null && toPickupCoord(item.lon) != null,
  );
  if (usable.length < 2 || !usable.some((item) => item.isDefault)) {
    return null;
  }

  return usable;
}

/**
 * @param {unknown} product
 * @param {string | null | undefined} selectedLocationId
 */
export function resolveSelectedProductPickupLocation(product, selectedLocationId) {
  const locations = productPickupLocationsFromProduct(product);
  if (locations.length === 0) {
    throw new AppError(400, PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE);
  }

  const selectedId = String(selectedLocationId ?? "").trim();
  if (selectedId) {
    const matched = locations.find((item) => item.id === selectedId);
    if (!matched) {
      throw new AppError(400, PRODUCT_PICKUP_SELECTION_INVALID_MESSAGE);
    }
    return matched;
  }

  return locations.find((item) => item.isDefault) ?? locations[0];
}
