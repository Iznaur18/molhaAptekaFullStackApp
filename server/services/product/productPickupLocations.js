import {
  PRODUCT_PICKUP_ADDRESS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE,
  PRODUCT_PICKUP_SELECTION_INVALID_MESSAGE,
  ensureSingleDefaultProductPickupLocation,
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
  const legacy = syncLegacyPickupFieldsFromLocations(locations);

  const saleLocation = await resolveProductSaleLocation({
    address: legacy.productPickupAddress,
    lat: legacy.productPickupLat,
    lon: legacy.productPickupLon,
    fallbackRegionCode: options.fallbackRegionCode ?? body?.productRegionCode,
  });

  const productPickupLocations = locations.map((item) => {
    if (item.isDefault) {
      return {
        ...item,
        address: saleLocation.productPickupAddress,
        lat: saleLocation.productPickupLat ?? item.lat,
        lon: saleLocation.productPickupLon ?? item.lon,
      };
    }
    return item;
  });

  const synced = syncLegacyPickupFieldsFromLocations(productPickupLocations);

  return {
    productPickupLocations,
    productPickupAddress: synced.productPickupAddress,
    productPickupLat: synced.productPickupLat,
    productPickupLon: synced.productPickupLon,
    productPickupLocation:
      saleLocation.productPickupLocation ??
      buildProductPickupLocation(synced.productPickupLat, synced.productPickupLon),
    productRegionCode: saleLocation.productRegionCode,
  };
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
